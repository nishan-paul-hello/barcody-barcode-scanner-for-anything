'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Shield, Zap, Smartphone, Heart } from 'lucide-react';
import { Header } from '@/components/common/Header';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  const landingNavItems = [{ href: '#features', label: 'Features' }];

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <Header navItems={landingNavItems} />

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
                  <Link href={isAuthenticated ? '/history' : '/login'}>
                    Get Started
                  </Link>
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

      <footer className="relative border-t border-white/5 bg-black/40 py-12 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm font-medium text-white/40"
            >
              © {new Date().getFullYear()} Barcody. All rights reserved.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group flex items-center gap-2 text-sm font-medium text-white/40"
            >
              <span>Built with</span>
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              <span>by</span>
              <Link
                href="https://kaiverse.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="group/kai flex items-center gap-2 transition-all"
              >
                <div className="relative h-8 w-8 transition-transform duration-300 group-hover/kai:scale-110">
                  <Image
                    src="/company-logo.svg"
                    alt="KAI Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="font-bold tracking-tight text-white/90 transition-colors duration-300 group-hover/kai:text-[#00F07C]">
                  KAI
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
}
