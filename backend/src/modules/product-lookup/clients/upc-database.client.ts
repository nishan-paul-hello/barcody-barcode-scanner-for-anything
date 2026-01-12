import axios, { AxiosInstance } from 'axios';
import { ProductInfo } from '../interfaces/product-info.interface';

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

      const item = data.items[0];

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
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return null;
        }
        if (error.response?.status === 429) {
          // Rate limit exceeded
          throw new Error('UPC Database rate limit exceeded');
        }
      }
      throw error;
    }
  }
}
