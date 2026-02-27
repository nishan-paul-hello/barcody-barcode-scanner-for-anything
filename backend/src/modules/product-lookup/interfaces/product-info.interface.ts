export interface ProductAttribute {
  group: string;
  label: string;
  value: string | number;
  unit?: string;
}

export interface ProductInfo {
  barcode: string;
  name?: string;
  brand?: string;
  category?: string;
  description?: string;
  manufacturer?: string;
  images?: string[];

  // Flexible attributes (Nutrition, Specs, Details, etc.)
  attributes?: ProductAttribute[];

  // Keep nutrition for legacy/UI convenience if needed, but primarily use attributes
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
