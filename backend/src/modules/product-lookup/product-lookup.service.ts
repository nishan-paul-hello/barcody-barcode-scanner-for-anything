import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { OpenFoodFactsClient } from './clients/open-food-facts.client';
import { UpcDatabaseClient } from './clients/upc-database.client';
import { BarcodeLookupClient } from './clients/barcode-lookup.client';
import { ProductInfo } from './interfaces/product-info.interface';

@Injectable()
export class ProductLookupService {
  private readonly logger = new Logger(ProductLookupService.name);
  private readonly openFoodFactsClient: OpenFoodFactsClient;
  private readonly upcDatabaseClient: UpcDatabaseClient;
  private readonly barcodeLookupClient: BarcodeLookupClient;

  // TTL constants (in seconds)
  private readonly PRODUCT_CACHE_TTL = 2592000; // 30 days
  private readonly NOT_FOUND_CACHE_TTL = 86400; // 24 hours

  // API Limits
  private readonly UPC_LIMIT = 100;
  private readonly BARCODE_LOOKUP_LIMIT = 50;

  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
  ) {
    this.openFoodFactsClient = new OpenFoodFactsClient();

    this.upcDatabaseClient = new UpcDatabaseClient(
      this.configService.get<string>('UPC_DATABASE_API_KEY') || '',
    );

    this.barcodeLookupClient = new BarcodeLookupClient(
      this.configService.get<string>('BARCODE_LOOKUP_API_KEY') || '',
    );
  }

  async lookup(
    barcode: string,
  ): Promise<{ data: ProductInfo | null; cacheStatus: 'hit' | 'miss' }> {
    this.logger.log(`Looking up barcode: ${barcode}`);

    // 1. Check Caches
    const cached = await this.checkCaches(barcode);
    if (cached !== undefined) {
      return { data: cached, cacheStatus: 'hit' };
    }

    await this.incrementStat('cache_miss');

    // 2. Cascade Fallback
    const result = await this.performCascadeLookup(barcode);

    // 3. Cache result or Not Found
    if (result) {
      await this.cacheProduct(barcode, result);
    } else {
      await this.cacheNotFound(barcode);
    }

    return { data: result, cacheStatus: 'miss' };
  }

  private async checkCaches(barcode: string): Promise<ProductInfo | null | undefined> {
    const cachedProduct = await this.redisService.get<ProductInfo>(`product:${barcode}`);
    if (cachedProduct) {
      this.logger.log(`Cache hit for ${barcode}`);
      await this.incrementStat('cache_hit');
      return cachedProduct;
    }

    const notFound = await this.redisService.get<string>(`product:notfound:${barcode}`);
    if (notFound === 'NOT_FOUND') {
      this.logger.log(`Cache hit (NOT_FOUND) for ${barcode}`);
      await this.incrementStat('cache_hit');
      return null;
    }

    return undefined;
  }

  private async performCascadeLookup(barcode: string): Promise<ProductInfo | null> {
    // Step 1: Open Food Facts (Free, Unlimited)
    const offResult = await this.tryOpenFoodFacts(barcode);
    if (offResult) return offResult;

    // Step 2: UPC Database
    const upcResult = await this.tryUpcDatabase(barcode);
    if (upcResult) return upcResult;

    // Step 3: Barcode Lookup
    const blResult = await this.tryBarcodeLookup(barcode);
    if (blResult) return blResult;

    return null;
  }

  private async tryOpenFoodFacts(barcode: string): Promise<ProductInfo | null> {
    try {
      const result = await this.openFoodFactsClient.lookup(barcode);
      if (result) {
        this.logger.log(`Found ${barcode} on Open Food Facts`);
        return result;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Open Food Facts lookup failed: ${message}`);
    }
    return null;
  }

  private async tryUpcDatabase(barcode: string): Promise<ProductInfo | null> {
    if (!(await this.checkLimit('upc', this.UPC_LIMIT))) {
      this.logger.warn(`UPC Database limit reached for today`);
      return null;
    }

    try {
      const result = await this.upcDatabaseClient.lookup(barcode);
      await this.incrementUsage('upc');
      if (result) {
        this.logger.log(`Found ${barcode} on UPC Database`);
        return result;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`UPC Database lookup failed: ${message}`);
    }
    return null;
  }

  private async tryBarcodeLookup(barcode: string): Promise<ProductInfo | null> {
    if (!(await this.checkLimit('barcode', this.BARCODE_LOOKUP_LIMIT))) {
      this.logger.warn(`Barcode Lookup limit reached for today`);
      return null;
    }

    try {
      const result = await this.barcodeLookupClient.lookup(barcode);
      await this.incrementUsage('barcode');
      if (result) {
        this.logger.log(`Found ${barcode} on Barcode Lookup`);
        return result;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Barcode Lookup failed: ${message}`);
    }
    return null;
  }

  private async cacheProduct(barcode: string, product: ProductInfo): Promise<void> {
    await this.redisService.set(`product:${barcode}`, product, this.PRODUCT_CACHE_TTL);
  }

  private async cacheNotFound(barcode: string): Promise<void> {
    this.logger.warn(`Product not found for barcode: ${barcode}`);
    await this.redisService.set(
      `product:notfound:${barcode}`,
      'NOT_FOUND',
      this.NOT_FOUND_CACHE_TTL,
    );
  }

  private async checkLimit(api: string, limit: number): Promise<boolean> {
    const today = new Date().toISOString().split('T', 1)[0] || '';
    const key = `api:usage:${api}:${today}`;
    const usage = (await this.redisService.get<number>(key)) || 0;
    return usage < limit;
  }

  private async incrementUsage(api: string): Promise<void> {
    const today = new Date().toISOString().split('T', 1)[0] || '';
    const key = `api:usage:${api}:${today}`;
    const newValue = await this.redisService.increment(key);

    if (newValue === 1) {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setUTCHours(24, 0, 0, 0);
      const ttlSeconds = Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
      await this.redisService.set(key, newValue, ttlSeconds);
    }

    await this.incrementStat(`api_call:${api}`);
  }

  private async incrementStat(stat: string): Promise<void> {
    const today = new Date().toISOString().split('T', 1)[0] || '';
    const key = `stats:${stat}:${today}`;
    const newValue = await this.redisService.increment(key);
    if (newValue === 1) {
      await this.redisService.set(key, newValue, 86400 * 7); // Keep stats for 7 days
    }
  }

  async getStats(): Promise<{
    today: string;
    cacheHits: number;
    cacheMisses: number;
    hitRate: string;
    apiUsage: { upc: number; barcode: number };
    apiLimits: { upc: number; barcode: number };
  }> {
    const today = new Date().toISOString().split('T', 1)[0] || '';
    const cacheHits = (await this.redisService.get<number>(`stats:cache_hit:${today}`)) || 0;
    const cacheMisses = (await this.redisService.get<number>(`stats:cache_miss:${today}`)) || 0;
    const upcCalls = (await this.redisService.get<number>(`api:usage:upc:${today}`)) || 0;
    const barcodeCalls = (await this.redisService.get<number>(`api:usage:barcode:${today}`)) || 0;

    const total = cacheHits + cacheMisses;
    const hitRateValue = total > 0 ? (cacheHits / total) * 100 : 0;

    return {
      today,
      cacheHits,
      cacheMisses,
      hitRate: `${hitRateValue.toFixed(2)}%`,
      apiUsage: {
        upc: upcCalls,
        barcode: barcodeCalls,
      },
      apiLimits: {
        upc: this.UPC_LIMIT,
        barcode: this.BARCODE_LOOKUP_LIMIT,
      },
    };
  }
}
