import axios, { AxiosInstance } from 'axios';
import {
  ProductInfo,
  ProductAttribute,
} from '@modules/product-lookup/interfaces/product-info.interface';

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

  async lookupRaw(barcode: string): Promise<unknown> {
    const response = await this.axiosInstance.get(`/v3/products`, {
      params: {
        barcode,
        key: this.apiKey,
      },
    });
    return response.data;
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
      attributes: this.mapAttributes(product),
      source: 'barcodelookup',
      lastUpdated: new Date(),
    };
  }

  private mapAttributes(product: BarcodeLookupProduct): ProductAttribute[] {
    const attrs: ProductAttribute[] = [];
    if (product.manufacturer) {
      attrs.push({ group: 'Manufacturer', label: 'Company', value: product.manufacturer });
    }
    if (product.category) {
      attrs.push({ group: 'Classification', label: 'Category', value: product.category });
    }
    // Barcode Lookup often has multiple images, store them in details if needed
    if (product.images && product.images.length > 1) {
      attrs.push({ group: 'Media', label: 'Image Count', value: product.images.length });
    }
    return attrs;
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
