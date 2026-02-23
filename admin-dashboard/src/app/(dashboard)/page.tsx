'use client';

import { motion } from 'framer-motion';
import {
  BarChart,
  Users,
  Scan,
  ArrowRight,
  Shield,
  Zap,
  Globe,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const features = [
    {
      title: 'Real-time Analytics',
      description:
        'Monitor scan activity and user behavior as it happens with our advanced tracking system.',
      icon: BarChart,
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10',
    },
    {
      title: 'User Management',
      description:
        'Complete control over user roles, permissions, and activity history in one central place.',
      icon: Users,
      color: 'text-[#ee4b2b]',
      bg: 'bg-[#ee4b2b]/10',
    },
    {
      title: 'Scan Intelligence',
      description:
        'Deep dive into barcode scanning patterns and optimize your operations with data.',
      icon: Scan,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -z-10 h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-cyan-500/10 to-transparent blur-[120px]" />

      <div className="flex flex-col items-center py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-medium text-white/60 backdrop-blur-xl">
            <Shield className="h-3.5 w-3.5 text-cyan-400" />
            <span>Admin Control Center</span>
          </div>

          <h1 className="mb-6 text-5xl font-black tracking-tight text-white sm:text-7xl">
            Everything your{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Business
            </span>{' '}
            needs.
          </h1>

          <p className="mb-10 text-xl leading-relaxed text-zinc-400">
            Welcome to the Barcody Admin Dashboard. Efficiently manage your
            fleet, track scans, and analyze performance with our premium
            management suite.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              className="h-14 rounded-2xl bg-white px-8 text-base font-bold text-black transition-all hover:bg-zinc-200"
              asChild
            >
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 rounded-2xl border-white/10 bg-white/5 px-8 text-base font-bold text-white backdrop-blur-xl transition-all hover:bg-white/10"
              asChild
            >
              <Link href="/analytics">View Analytics</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-32 grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-3"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-3xl border border-white/5 bg-[#0f0f0f] p-8 text-left transition-all hover:border-white/10"
            >
              <div
                className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bg} ${feature.color}`}
              >
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-white">
                {feature.title}
              </h3>
              <p className="leading-relaxed text-zinc-500">
                {feature.description}
              </p>

              <div className="absolute top-0 right-0 p-8 opacity-0 transition-opacity group-hover:opacity-100">
                <ArrowRight className={`h-5 w-5 ${feature.color}`} />
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-32 w-full max-w-5xl overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-12 backdrop-blur-3xl"
        >
          <div className="flex flex-col items-center justify-between gap-12 md:flex-row">
            <div className="max-w-md text-left">
              <h2 className="mb-4 text-3xl font-bold text-white">
                Enterprise Grade Infrastructure
              </h2>
              <p className="mb-6 leading-relaxed text-zinc-500">
                Our systems are built to scale with your business. Supporting
                millions of scans per day with sub-millisecond latency.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span>High Performance</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Globe className="h-4 w-4 text-green-400" />
                  <span>Global Availability</span>
                </div>
              </div>
            </div>
            <div className="relative flex-1">
              <div className="h-64 w-full overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/10">
                <div className="flex gap-2 border-b border-white/5 p-4">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                </div>
                <div className="space-y-4 p-6">
                  <div className="h-4 w-3/4 rounded bg-white/5" />
                  <div className="h-4 w-1/2 rounded bg-white/5" />
                  <div className="h-4 w-2/3 rounded bg-white/5" />
                  <div className="h-32 w-full rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
