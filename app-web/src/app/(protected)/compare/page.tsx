'use client';

import { useSearchParams } from 'next/navigation';
import { useCompareProducts } from '@/hooks/use-products';
import { CompareTable } from '@/components/compare/CompareTable';
import { ComparisonCharts } from '@/components/compare/ComparisonCharts';
import { AllergenMatrix } from '@/components/compare/AllergenMatrix';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ComparePage() {
  const searchParams = useSearchParams();
  const barcodesParam = searchParams.get('barcodes');
  const barcodes = barcodesParam ? barcodesParam.split(',') : [];

  const { data, isLoading, isError, error } = useCompareProducts(barcodes);

  if (!barcodesParam || barcodes.length < 2) {
    return (
      <div className="container mx-auto flex h-[60vh] flex-col items-center justify-center space-y-4 py-8">
        <h1 className="text-2xl font-bold">Not enough products to compare</h1>
        <p className="text-muted-foreground">
          Please select at least 2 products from your history to compare.
        </p>
        <Button asChild>
          <Link href="/history">Back to History</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-[60vh] flex-col items-center justify-center space-y-4 py-8">
        <Loader2 className="text-primary size-8 animate-spin" />
        <p className="text-lg font-medium">Generating comparison...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto flex h-[60vh] flex-col items-center justify-center space-y-4 py-8">
        <div className="bg-destructive/10 text-destructive rounded-lg border p-6 text-center">
          <h2 className="text-xl font-bold">Comparison Failed</h2>
          <p className="mt-2">
            {error instanceof Error
              ? error.message
              : 'An error occurred while comparing products.'}
          </p>
          <Button asChild className="mt-4">
            <Link href="/history">Back to History</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Product Comparison - Barcody',
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      void navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (!data) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-8 pt-0 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="-ml-2">
              <Link href="/history">
                <ArrowLeft className="mr-2 size-4" />
                History
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Product Comparison
          </h1>
          <p className="text-muted-foreground">
            Comparing {data.products.length} products to help you make a better
            choice.
          </p>
        </div>
        <Button onClick={handleShare} variant="outline" className="sm:w-auto">
          <Share2 className="mr-2 size-4" />
          Share Results
        </Button>
      </div>

      <div className="grid gap-8">
        {/* Product Summary Grid */}
        <CompareTable products={data.products} comparison={data.comparison} />

        {/* Visual Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Nutrient Comparison</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ComparisonCharts
                data={data.comparison}
                products={data.products}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Allergen Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <AllergenMatrix data={data.comparison} products={data.products} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
