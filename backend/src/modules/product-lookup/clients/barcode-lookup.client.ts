import axios, { AxiosInstance } from 'axios';
import { ProductInfo } from '@modules/product-lookup/interfaces/product-info.interface';

interface BarcodeLookupProduct {
  product_name?: string;
  title?: string;
  brand?: string;
  category?: string;
  description?: string;
  manufacturer?: string;
  images?: string[];
}

export class BarcodeLookupClient {
  private axiosInstance: AxiosInstance;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.axiosInstance = axios.create({
      baseURL: 'https://api.barcodelookup.com',
      timeout: 5000,
    });
  }

  async lookup(barcode: string): Promise<ProductInfo | null> {
    try {
      const response = await this.axiosInstance.get(`/v3/products`, {
        params: {
          barcode,
          key: this.apiKey,
        },
      });

      const data = response.data;

      if (!data.products || data.products.length === 0) {
        return null;
      }

      return this.mapToProductInfo(barcode, data.products[0]);
    } catch (error) {
      return this.handleError(error);
    }
  }

  private mapToProductInfo(barcode: string, product: BarcodeLookupProduct): ProductInfo {
    return {
      barcode,
      name: product.product_name || product.title,
      brand: product.brand,
      category: product.category,
      description: product.description,
      manufacturer: product.manufacturer,
      images: product.images || [],
      source: 'barcodelookup',
      lastUpdated: new Date(),
    };
  }

  private handleError(error: unknown): never | null {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 404) {
        return null;
      }
      if (status === 429) {
        throw new Error('Barcode Lookup rate limit exceeded');
      }
    }
    throw error;
  }
}
