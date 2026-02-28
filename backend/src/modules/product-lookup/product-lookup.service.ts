import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { RedisService } from '@modules/redis/redis.service';
import { OpenFoodFactsClient } from '@modules/product-lookup/clients/open-food-facts.client';
import { UpcDatabaseClient } from '@modules/product-lookup/clients/upc-database.client';
import { BarcodeLookupClient } from '@modules/product-lookup/clients/barcode-lookup.client';
import { UsdaFoodDataClient } from '@modules/product-lookup/clients/usda-food-data.client';
import { GoUpcClient } from '@modules/product-lookup/clients/go-upc.client';
import { SearchUpcClient } from '@modules/product-lookup/clients/search-upc.client';
import { OpenBeautyFactsClient } from '@modules/product-lookup/clients/open-beauty-facts.client';
import { ProductInfo } from '@modules/product-lookup/interfaces/product-info.interface';
import { UsersService } from '@modules/users/users.service';
import { ProductComparisonService, ProductComparison } from './comparison.service';

@Injectable()
export class ProductLookupService {
  private readonly logger = new Logger(ProductLookupService.name);
  private readonly openFoodFactsClient: OpenFoodFactsClient;
  private readonly openBeautyFactsClient: OpenBeautyFactsClient;

  // TTL constants (in seconds)
  private readonly PRODUCT_CACHE_TTL = 2592000; // 30 days
  private readonly NOT_FOUND_CACHE_TTL = 86400; // 24 hours

  // API Limits
  private readonly UPC_LIMIT = 100;
  private readonly BARCODE_LOOKUP_LIMIT = 50;

  constructor(
    private redisService: RedisService,
    private usersService: UsersService,
    private comparisonService: ProductComparisonService,
  ) {
    this.openFoodFactsClient = new OpenFoodFactsClient();
    this.openBeautyFactsClient = new OpenBeautyFactsClient();
  }

  async lookup(
    barcode: string,
    userId: string,
  ): Promise<{ data: ProductInfo | null; cacheStatus: 'hit' | 'miss' }> {
    this.logger.log(`Looking up barcode: ${barcode} for user ${userId}`);

    const cached = await this.checkCaches(barcode);
    if (cached !== undefined) return { data: cached, cacheStatus: 'hit' };

    await this.incrementStat('cache_miss');
    const result = await this.performCascadeLookup(barcode, userId);

    if (result) {
      await this.cacheProduct(barcode, result);
    } else {
      await this.cacheNotFound(barcode);
    }

    return { data: result, cacheStatus: 'miss' };
  }

  async globalRawLookup(barcode: string, source: string, userId: string): Promise<unknown> {
    const keys = await this.usersService.getApiKeys(userId);

    switch (source) {
      case 'off':
        return this.openFoodFactsClient.lookupRaw(barcode);
      case 'obf':
        return this.openBeautyFactsClient.lookupRaw(barcode);
      case 'usda':
        return this.proxyUsda(barcode, keys.usdaFoodDataApiKey);
      case 'upcitemdb':
        return new UpcDatabaseClient(keys.upcDatabaseApiKey || 'trial').lookupRaw(barcode);
      case 'barcodeLookup':
        return this.proxyBarcodeLookup(barcode, keys.barcodeLookupApiKey);
      case 'goUpc':
        return this.proxyGoUpc(barcode, keys.goUpcApiKey);
      case 'searchUpc':
        return this.proxySearchUpc(barcode, keys.searchUpcApiKey);
      default:
        throw new BadRequestException(`Unknown source: ${source}`);
    }
  }

  async compare(
    barcodes: string[],
    userId: string,
  ): Promise<{ products: ProductInfo[]; comparison: ProductComparison }> {
    this.logger.log(`Comparing barcodes: ${barcodes.join(', ')}`);

    const productsData = await Promise.all(
      barcodes.map(async (barcode) => {
        const { data } = await this.lookup(barcode, userId);
        return data;
      }),
    );

    const products = productsData.filter((p): p is ProductInfo => p !== null);

    if (products.length < 2) {
      throw new BadRequestException('At least 2 valid products are required for comparison');
    }

    return {
      products,
      comparison: this.comparisonService.compare(products),
    };
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
      apiUsage: { upc: upcCalls, barcode: barcodeCalls },
      apiLimits: { upc: this.UPC_LIMIT, barcode: this.BARCODE_LOOKUP_LIMIT },
    };
  }

  private async proxyUsda(barcode: string, key?: string | null) {
    if (!key) throw new BadRequestException('USDA API key not configured');
    return new UsdaFoodDataClient(key).lookupRaw(barcode);
  }

  private async proxyBarcodeLookup(barcode: string, key?: string | null) {
    if (!key) throw new BadRequestException('Barcode Lookup API key not configured');
    return new BarcodeLookupClient(key).lookupRaw(barcode);
  }

  private async proxyGoUpc(barcode: string, key?: string | null) {
    if (!key) throw new BadRequestException('Go-UPC API key not configured');
    return new GoUpcClient(key).lookupRaw(barcode);
  }

  private async proxySearchUpc(barcode: string, key?: string | null) {
    if (!key) throw new BadRequestException('SearchUPC API key not configured');
    return new SearchUpcClient(key).lookupRaw(barcode);
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

  private async performCascadeLookup(barcode: string, userId: string): Promise<ProductInfo | null> {
    const offResult = await this.tryOpenFoodFacts(barcode);
    if (offResult) return offResult;

    const upcResult = await this.tryUpcDatabase(barcode, userId);
    if (upcResult) return upcResult;

    const blResult = await this.tryBarcodeLookup(barcode, userId);
    if (blResult) return blResult;

    return null;
  }

  private async tryOpenFoodFacts(barcode: string): Promise<ProductInfo | null> {
    try {
      const result = await this.openFoodFactsClient.lookup(barcode);
      if (result) return result;
    } catch (error: unknown) {
      this.logger.error(`Open Food Facts lookup failed: ${error}`);
    }
    return null;
  }

  private async tryUpcDatabase(barcode: string, userId: string): Promise<ProductInfo | null> {
    if (!(await this.checkLimit('upc', this.UPC_LIMIT))) return null;

    const { upcDatabaseApiKey } = await this.usersService.getApiKeys(userId);
    if (!upcDatabaseApiKey) return null;

    try {
      const client = new UpcDatabaseClient(upcDatabaseApiKey);
      const result = await client.lookup(barcode);
      await this.incrementUsage('upc');
      return result;
    } catch (error: unknown) {
      this.logger.error(`UPC Database lookup failed: ${error}`);
    }
    return null;
  }

  private async tryBarcodeLookup(barcode: string, userId: string): Promise<ProductInfo | null> {
    if (!(await this.checkLimit('barcode', this.BARCODE_LOOKUP_LIMIT))) return null;

    const { barcodeLookupApiKey } = await this.usersService.getApiKeys(userId);
    if (!barcodeLookupApiKey) return null;

    const client = new BarcodeLookupClient(barcodeLookupApiKey);
    try {
      const result = await client.lookup(barcode);
      await this.incrementUsage('barcode');
      return result;
    } catch (error: unknown) {
      this.logger.error(`Barcode Lookup failed: ${error}`);
    }
    return null;
  }

  private async cacheProduct(barcode: string, product: ProductInfo): Promise<void> {
    await this.redisService.set(`product:${barcode}`, product, this.PRODUCT_CACHE_TTL);
  }

  private async cacheNotFound(barcode: string): Promise<void> {
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
    if (newValue === 1) await this.redisService.set(key, newValue, 86400 * 7);
  }
}
