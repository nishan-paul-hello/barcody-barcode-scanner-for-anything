import { Injectable } from '@nestjs/common';
import { ProductInfo } from './interfaces/product-info.interface';

export interface ProductComparison {
  nutrients: Record<
    string,
    {
      min: number;
      max: number;
      values: Record<string, number>;
      best: string[];
      worst: string[];
    }
  >;
  allergens: {
    common: string[];
    byProduct: Record<string, string[]>;
  };
  nutritionGrades: Record<string, string | undefined>;
  nutritionGradesSummary?: {
    best: string[];
  };
}

@Injectable()
export class ProductComparisonService {
  compare(products: ProductInfo[]): ProductComparison {
    const nutrientsToCompare = ['calories', 'fat', 'carbs', 'protein', 'sugar', 'fiber', 'salt'];

    const comparison: ProductComparison = {
      nutrients: {},
      allergens: {
        common: [],
        byProduct: {},
      },
      nutritionGrades: {},
    };

    // 1. Compare Nutrients
    for (const nutrient of nutrientsToCompare) {
      const values = products
        .map((p) => ({
          barcode: p.barcode,
          value: p.nutrition?.[nutrient as keyof typeof p.nutrition] as number | undefined,
        }))
        .filter((v): v is { barcode: string; value: number } => v.value !== undefined);

      if (values.length > 0) {
        const numericValues = values.map((v) => v.value);
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);

        comparison.nutrients[nutrient] = {
          min,
          max,
          values: values.reduce(
            (acc: Record<string, number>, v) => ({ ...acc, [v.barcode]: v.value }),
            {},
          ),
          // For these nutrients, lower is generally better
          best: ['calories', 'fat', 'sugar', 'salt'].includes(nutrient)
            ? values.filter((v) => v.value === min).map((v) => v.barcode)
            : values.filter((v) => v.value === max).map((v) => v.barcode),
          worst: ['calories', 'fat', 'sugar', 'salt'].includes(nutrient)
            ? values.filter((v) => v.value === max).map((v) => v.barcode)
            : values.filter((v) => v.value === min).map((v) => v.barcode),
        };
      }
    }

    // 2. Compare Allergens
    const allAllergenSets = products.map((p) => new Set<string>(p.nutrition?.allergens || []));

    if (allAllergenSets.length > 0) {
      const commonAllergens = Array.from(allAllergenSets[0]!).filter((a) =>
        allAllergenSets.every((set) => set.has(a)),
      );
      comparison.allergens.common = commonAllergens;
    }

    products.forEach((p) => {
      comparison.allergens.byProduct[p.barcode] = p.nutrition?.allergens || [];
    });

    // 3. Compare Nutrition Grades
    const gradeScores = { A: 5, B: 4, C: 3, D: 2, E: 1 };
    products.forEach((p) => {
      comparison.nutritionGrades[p.barcode] = p.nutrition?.grade;
    });

    const gradeValues = products
      .map((p) => ({
        barcode: p.barcode,
        grade: p.nutrition?.grade,
        score: gradeScores[(p.nutrition?.grade as keyof typeof gradeScores) || 'C'] || 0,
      }))
      .filter((v) => v.grade);

    if (gradeValues.length > 0) {
      const maxScore = Math.max(...gradeValues.map((v) => v.score));
      comparison.nutritionGradesSummary = {
        best: gradeValues.filter((v) => v.score === maxScore).map((v) => v.barcode),
      };
    }

    return comparison;
  }
}
