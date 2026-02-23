'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-black/40 py-8 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <p className="text-sm font-medium text-zinc-500">
            © {new Date().getFullYear()} Barcody. All rights reserved.
          </p>

          <div className="group flex items-center gap-2 text-sm font-medium text-zinc-500">
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
                  src="/admin/company-logo.svg"
                  alt="KAI Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-bold tracking-tight text-zinc-200 transition-colors duration-300 group-hover/kai:text-[#00F07C]">
                KAI
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
