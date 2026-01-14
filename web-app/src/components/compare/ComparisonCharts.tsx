'use client';

import type {
  ProductComparisonResponse,
  ProductResponseDto,
} from '@/lib/api/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ComparisonChartsProps {
  data: ProductComparisonResponse['comparison'];
  products: ProductResponseDto[];
}

export function ComparisonCharts({ products }: ComparisonChartsProps) {
  // We'll show macronutrients: Protein, Carbs, Fat
  const chartData = [
    {
      name: 'Protein',
      ...products.reduce(
        (acc, p) => ({
          ...acc,
          [p.name || p.barcode]: p.nutrition?.protein || 0,
        }),
        {}
      ),
    },
    {
      name: 'Carbs',
      ...products.reduce(
        (acc, p) => ({
          ...acc,
          [p.name || p.barcode]: p.nutrition?.carbs || 0,
        }),
        {}
      ),
    },
    {
      name: 'Fat',
      ...products.reduce(
        (acc, p) => ({
          ...acc,
          [p.name || p.barcode]: p.nutrition?.fat || 0,
        }),
        {}
      ),
    },
    {
      name: 'Sugar',
      ...products.reduce(
        (acc, p) => ({
          ...acc,
          [p.name || p.barcode]: p.nutrition?.sugar || 0,
        }),
        {}
      ),
    },
  ];

  const colors = ['#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#7c3aed'];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
        <XAxis dataKey="name" />
        <YAxis label={{ value: 'grams', angle: -90, position: 'insideLeft' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Legend />
        {products.map((p, index) => (
          <Bar
            key={p.barcode}
            dataKey={p.name || p.barcode}
            fill={colors[index % colors.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
