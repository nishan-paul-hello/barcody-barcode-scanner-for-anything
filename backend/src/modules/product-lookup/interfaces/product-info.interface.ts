export interface ProductInfo {
  barcode: string;
  name?: string;
  brand?: string;
  category?: string;
  description?: string;
  manufacturer?: string;
  images?: string[];
  // Nutrition (mostly from Open Food Facts)
  nutrition?: {
    grade?: 'A' | 'B' | 'C' | 'D' | 'E';
    calories?: number;
    fat?: number;
    carbs?: number;
    protein?: number;
    sugar?: number;
    fiber?: number;
    salt?: number;
    allergens?: string[];
    ingredients?: string;
  };

  source: 'openfoodfacts' | 'upcdatabase' | 'barcodelookup';
  lastUpdated: Date;
}
