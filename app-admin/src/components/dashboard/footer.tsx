'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mx-auto mb-8 flex h-16 w-[95%] max-w-7xl items-center rounded-2xl border border-white/10 bg-black/40 shadow-2xl shadow-black/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <p className="text-sm font-bold text-white/60">
            © {new Date().getFullYear()} Barcody Admin. All rights reserved.
          </p>

          <div className="group flex items-center gap-2 text-sm font-bold text-white/60">
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
              <span className="font-bold tracking-tight text-white transition-colors duration-300 group-hover/kai:text-[#00F07C]">
                KAI
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
