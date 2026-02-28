'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export const Footer: React.FC = () => {
  return (
    <footer className="relative mx-auto mb-8 w-[95%] max-w-7xl rounded-2xl border border-white/10 bg-black/40 py-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <p className="text-sm font-medium text-white/60">
            © {new Date().getFullYear()} Barcody. All rights reserved.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group flex items-center gap-2 text-sm font-medium text-white/60"
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
              <span className="font-bold tracking-tight text-white transition-colors duration-300 group-hover/kai:text-[#00F07C]">
                KAI
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};
