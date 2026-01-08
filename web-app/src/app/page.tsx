'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Barcode, ArrowRight, Shield, Zap, Smartphone } from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="bg-card/50 flex h-16 items-center border-b px-4 backdrop-blur lg:px-6">
        <Link className="flex items-center justify-center" href="/">
          <Barcode className="text-primary h-6 w-6" />
          <span className="ml-2 text-xl font-bold tracking-tight">Barcody</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium underline-offset-4 hover:underline"
            href="#features"
          >
            Features
          </Link>
          <Link
            className="text-sm font-medium underline-offset-4 hover:underline"
            href="/about"
          >
            About
          </Link>
          {isAuthenticated ? (
            <Button asChild size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="flex w-full justify-center py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Barcode Scanner for Everything
                </h1>
                <p className="text-muted-foreground mx-auto max-w-[700px] md:text-xl">
                  Scan, track, and manage any barcode with ease. The ultimate
                  tool for inventory, personal collections, and more.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link href={isAuthenticated ? '/dashboard' : '/login'}>
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="bg-muted/50 flex w-full justify-center py-12 md:py-24 lg:py-32"
        >
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="bg-primary/10 rounded-full p-3">
                  <Zap className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Lightning Fast</h3>
                <p className="text-muted-foreground">
                  Instant barcode recognition and data retrieval from our global
                  database.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="bg-primary/10 rounded-full p-3">
                  <Shield className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Secure Data</h3>
                <p className="text-muted-foreground">
                  Your scans and inventory are securely stored and synced across
                  your devices.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="bg-primary/10 rounded-full p-3">
                  <Smartphone className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Mobile First</h3>
                <p className="text-muted-foreground">
                  Works seamlessly on your phone, tablet, or desktop. No app
                  install required.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
        <p className="text-muted-foreground text-xs">
          © 2026 Barcody. All rights reserved.
        </p>
        <nav className="flex gap-4 sm:ml-auto sm:gap-6">
          <Link className="text-xs underline-offset-4 hover:underline" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs underline-offset-4 hover:underline" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
