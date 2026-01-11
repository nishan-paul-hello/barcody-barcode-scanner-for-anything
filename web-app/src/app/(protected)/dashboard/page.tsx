import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Camera } from 'lucide-react';

export default function DashboardPage() {
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
            className="gap-2 rounded-full bg-cyan-600 shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-500"
          >
            <Camera className="h-5 w-5" />
            Start Scanning
          </Button>
        </Link>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold">Total Scans</h2>
          <p className="text-4xl font-bold">1,234</p>
        </div>
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold">Active Products</h2>
          <p className="text-4xl font-bold">56</p>
        </div>
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold">Recent Activity</h2>
          <p className="text-muted-foreground text-sm">
            Scanned &quot;Coffee beans&quot; 2 mins ago
          </p>
        </div>
      </div>
    </div>
  );
}
