import axios, { AxiosInstance } from 'axios';
import { ProductInfo } from '@modules/product-lookup/interfaces/product-info.interface';

interface UpcDatabaseItem {
  title: string;
  brand: string;
  category: string;
  description: string;
  publisher?: string;
  images?: string[];
}

export class UpcDatabaseClient {
  private axiosInstance: AxiosInstance;

  constructor(apiKey: string) {
    this.axiosInstance = axios.create({
      baseURL: 'https://api.upcitemdb.com',
      timeout: 5000,
      headers: {
        user_key: apiKey,
        Accept: 'application/json',
      },
    });
  }

  async lookup(barcode: string): Promise<ProductInfo | null> {
    try {
      const response = await this.axiosInstance.get(`/prod/trial/lookup?upc=${barcode}`);
      const data = response.data;

      if (!data.items || data.items.length === 0) {
        return null;
      }

      return this.mapToProductInfo(barcode, data.items[0]);
    } catch (error) {
      return this.handleLookupError(error);
    }
  }

  private mapToProductInfo(barcode: string, item: UpcDatabaseItem): ProductInfo {
    return {
      barcode,
      name: item.title,
      brand: item.brand,
      category: item.category,
      description: item.description,
      manufacturer: item.publisher || item.brand,
      images: item.images || [],
      source: 'upcdatabase',
      lastUpdated: new Date(),
    };
  }

  private handleLookupError(error: unknown): never | null {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 404) {
        return null;
      }
      if (status === 429) {
        throw new Error('UPC Database rate limit exceeded');
      }
    }
    throw error;
  }
}
