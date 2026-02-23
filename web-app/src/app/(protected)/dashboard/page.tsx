'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Camera, Loader2 } from 'lucide-react';
import { api } from '@/lib/api/client';
import type { ScanResponseDto } from '@/lib/api/types';

interface DashboardStats {
  totalScans: number;
  activeProducts: number;
  recentActivity: ScanResponseDto | null;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalScans: 0,
    activeProducts: 0,
    recentActivity: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.scans
      .getStats()
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to fetch stats:', err))
      .finally(() => setLoading(false));
  }, []);

  const formatActivity = (scan: ScanResponseDto | null) => {
    if (!scan) return 'No recent activity';

    const date = new Date(scan.scannedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    let timeAgo = '';
    if (diffMins < 1) timeAgo = 'Just now';
    else if (diffMins < 60) timeAgo = `${diffMins} mins ago`;
    else if (diffHours < 24) timeAgo = `${diffHours} hours ago`;
    else timeAgo = `${diffDays} days ago`;

    return `Scanned "${scan.product?.name || scan.barcodeData}" ${timeAgo}`;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your protected dashboard!
          </p>
        </div>
        <Link href="/scan">
          <Button
            size="lg"
            className="gap-2 rounded-full bg-cyan-600 transition-all hover:bg-cyan-500"
          >
            <Camera className="h-5 w-5" />
            Start Scanning
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="mt-8 flex justify-center py-12">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-card rounded-xl border p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">Total Scans</h2>
            <p className="text-4xl font-bold">{stats.totalScans}</p>
          </div>
          <div className="bg-card rounded-xl border p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">Active Products</h2>
            <p className="text-4xl font-bold">{stats.activeProducts}</p>
          </div>
          <div className="bg-card rounded-xl border p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">Recent Activity</h2>
            <p className="text-muted-foreground text-sm">
              {formatActivity(stats.recentActivity)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
