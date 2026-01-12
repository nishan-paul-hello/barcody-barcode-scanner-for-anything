import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

  constructor(private configService: ConfigService) {
    this.openFoodFactsClient = new OpenFoodFactsClient();

    this.upcDatabaseClient = new UpcDatabaseClient(
      this.configService.get<string>('UPC_DATABASE_API_KEY') || '',
    );

    this.barcodeLookupClient = new BarcodeLookupClient(
      this.configService.get<string>('BARCODE_LOOKUP_API_KEY') || '',
    );
  }

  async lookup(barcode: string): Promise<ProductInfo | null> {
    this.logger.log(`Looking up barcode: ${barcode}`);

    // Order of lookup: Open Food Facts -> UPC Database -> Barcode Lookup

    try {
      const offResult = await this.openFoodFactsClient.lookup(barcode);
      if (offResult) {
        this.logger.log(`Found ${barcode} on Open Food Facts`);
        return offResult;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Open Food Facts lookup failed: ${message}`);
    }

    try {
      const upcResult = await this.upcDatabaseClient.lookup(barcode);
      if (upcResult) {
        this.logger.log(`Found ${barcode} on UPC Database`);
        return upcResult;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`UPC Database lookup failed: ${message}`);
    }

    try {
      const blResult = await this.barcodeLookupClient.lookup(barcode);
      if (blResult) {
        this.logger.log(`Found ${barcode} on Barcode Lookup`);
        return blResult;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Barcode Lookup failed: ${message}`);
    }

    this.logger.warn(`Product not found for barcode: ${barcode}`);
    return null;
  }
}
