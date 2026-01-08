import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Barcode, ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="flex h-16 items-center border-b px-4 lg:px-6">
        <Link className="flex items-center justify-center" href="/">
          <Barcode className="text-primary h-6 w-6" />
          <span className="ml-2 text-xl font-bold tracking-tight">Barcody</span>
        </Link>
      </header>

      <main className="container mx-auto max-w-3xl flex-1 px-4 py-12 md:px-0">
        <div className="space-y-6">
          <Button variant="ghost" asChild className="mb-4 pl-0">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
          </Button>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            About Barcody
          </h1>

          <div className="text-muted-foreground space-y-4 text-lg leading-relaxed">
            <p>
              Barcody was born out of a simple need: a barcode scanner that
              works everywhere, for everything. Whether you&apos;re managing a
              warehouse, track your personal wine collection, or just curious
              about what&apos;s in your pantry, barcode scanning should be fast,
              reliable, and accessible.
            </p>

            <h2 className="text-foreground text-2xl font-bold">Our Mission</h2>
            <p>
              To provide the most versatile and user-friendly barcode scanning
              platform that helps people organize and understand their world
              through data.
            </p>

            <h2 className="text-foreground text-2xl font-bold">How it Works</h2>
            <p>
              We leverage modern web technologies to bring high-performance
              barcode scanning directly to your browser. No downloads, no
              complicated setup—just point and scan.
            </p>
          </div>

          <div className="bg-muted flex flex-col items-center space-y-4 rounded-2xl border p-8 text-center">
            <h3 className="text-xl font-bold">Ready to start scanning?</h3>
            <p className="text-muted-foreground">
              Join thousands of users who trust Barcody for their scanning
              needs.
            </p>
            <Button asChild size="lg">
              <Link href="/login">Create Free Account</Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="flex w-full shrink-0 justify-center border-t py-6">
        <p className="text-muted-foreground text-xs">
          © 2026 Barcody. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
