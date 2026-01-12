import axios, { AxiosInstance } from 'axios';
import { ProductInfo } from '@modules/product-lookup/interfaces/product-info.interface';

interface OFFProduct {
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  categories?: string;
  generic_name?: string;
  manufacturing_places?: string;
  image_front_url?: string;
  nutrition_grade_fr?: string;
  nutriments?: Record<string, number | string | undefined>;
  allergens_tags?: string[];
  ingredients_text?: string;
}

interface OFFResponse {
  status: number;
  product?: OFFProduct;
}

export class OpenFoodFactsClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'https://world.openfoodfacts.org',
      timeout: 5000,
      headers: {
        'User-Agent':
          'Barcody - Android/iOS - Version 1.0 - https://github.com/nishan-paul-2022/barcody-barcode-scanner-for-anything',
      },
    });
  }

  async lookup(barcode: string): Promise<ProductInfo | null> {
    try {
      const response = await this.axiosInstance.get<OFFResponse>(`/api/v0/product/${barcode}.json`);
      const { status, product } = response.data;

      if (status === 0 || !product) {
        return null;
      }

      return this.mapToProductInfo(barcode, product);
    } catch (error) {
      return this.handleError(error);
    }
  }

  private mapToProductInfo(barcode: string, product: OFFProduct): ProductInfo {
    return {
      barcode,
      name: product.product_name || product.product_name_en || 'Unknown Product',
      brand: product.brands,
      category: product.categories,
      description: product.generic_name,
      manufacturer: product.manufacturing_places,
      images: product.image_front_url ? [product.image_front_url] : [],
      nutrition: this.mapNutrition(product),
      source: 'openfoodfacts',
      lastUpdated: new Date(),
    };
  }

  private mapNutrition(product: OFFProduct) {
    const nutriments = product.nutriments || {};
    const grade = product.nutrition_grade_fr?.toUpperCase();
    const validGrades = ['A', 'B', 'C', 'D', 'E'];

    return {
      grade: validGrades.includes(grade || '') ? (grade as 'A' | 'B' | 'C' | 'D' | 'E') : undefined,
      calories: this.toNumber(nutriments['energy-kcal_100g']),
      fat: this.toNumber(nutriments.fat_100g),
      carbs: this.toNumber(nutriments.carbohydrates_100g),
      protein: this.toNumber(nutriments.proteins_100g),
      sugar: this.toNumber(nutriments.sugars_100g),
      fiber: this.toNumber(nutriments.fiber_100g),
      salt: this.toNumber(nutriments.salt_100g),
      allergens: product.allergens_tags || [],
      ingredients: product.ingredients_text,
    };
  }

  private toNumber(value: unknown): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }

  private handleError(error: unknown): null {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}
