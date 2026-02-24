'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import {
  BarChart3,
  Users,
  ShieldAlert,
  Settings,
  Activity,
  Database,
  Lock,
  Zap,
  ChevronRight,
  TrendingUp,
  Fingerprint,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

const fadeIn = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-[#030303] text-zinc-100 selection:bg-[#00ffe7]/30 selection:text-[#00ffe7]"
    >
      {/* Dynamic Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute top-0 right-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#00ffe7]/30 to-transparent" />

        {/* Animated Orbs */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-[20%] -right-[10%] h-[70vw] w-[70vw] rounded-full bg-[#00ffe7]/[0.03] blur-[150px]"
        />
        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-[20%] -left-[10%] h-[60vw] w-[60vw] rounded-full bg-[#00ffe7]/[0.02] blur-[150px]"
        />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:64px_64px]" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 flex min-h-[90vh] flex-col items-center justify-center px-4 pt-20 text-center">
        <motion.div
          style={{ opacity, scale }}
          className="flex flex-col items-center space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'backOut' }}
            className="inline-flex items-center gap-2 rounded-full border border-[#00ffe7]/20 bg-[#00ffe7]/10 px-4 py-1.5 text-sm font-medium text-[#00ffe7] backdrop-blur-md"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>RESTRICTED ACCESS: ADMINSTRATORS ONLY</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-5xl text-6xl leading-[1.1] font-black tracking-tighter md:text-8xl"
          >
            ABSOLUTE <br className="hidden md:block" />
            <span className="bg-gradient-to-br from-white via-[#00ffe7] to-[#00ffe7]/40 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,255,231,0.2)]">
              CONTROL
            </span>
            <span className="text-[#00ffe7]">.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-2xl text-lg font-medium text-zinc-400 md:text-xl md:leading-relaxed"
          >
            The executive command center for your Barcody ecosystem. Govern
            users, monitor live data pipelines, and enforce system-wide security
            policies from a single, omnipotent dashboard.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col gap-4 pt-4 sm:flex-row"
          >
            <Button
              size="lg"
              className="group h-14 overflow-hidden rounded-full bg-[#00ffe7] px-8 font-bold text-black shadow-[0_0_20px_rgba(0,255,231,0.3)] transition-all hover:bg-[#00ffe7]/90 hover:ring-4 hover:ring-[#00ffe7]/20"
              asChild
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                Initialize Dashboard
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.span>
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 rounded-full border border-zinc-700 bg-zinc-900/50 px-8 font-bold text-zinc-300 backdrop-blur-xl transition-all hover:border-[#00ffe7]/50 hover:bg-[#00ffe7]/5 hover:text-white"
              asChild
            >
              <Link href="#overview">System Overview</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Functionality & Purpose Matrix */}
      <section id="overview" className="relative z-10 px-4 py-32">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="mb-20 space-y-4 md:w-2/3"
          >
            <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              System Architecture
            </h2>
            <p className="text-xl text-zinc-400">
              This environment is intentionally isolated. It provides the
              overarching infrastructure required to manage the entire
              application state.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {[
              {
                icon: Database,
                title: 'Centralized Oversight',
                desc: 'Aggregate data from all scanning nodes in real-time. Understand the heartbeat of your operations at a glance.',
              },
              {
                icon: Fingerprint,
                title: 'Identity & Access',
                desc: 'Granular control over who can do what. Create roles, revoke access, and maintain strict environmental security.',
              },
              {
                icon: Activity,
                title: 'Live Telemetry',
                desc: 'Watch the system breathe. Live logs, scan rates, and error tracking to proactively resolve bottlenecks.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/30 p-8 backdrop-blur-sm transition-colors hover:border-[#00ffe7]/20 hover:bg-zinc-900/60"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#00ffe7]/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-[#00ffe7] shadow-inner shadow-[#00ffe7]/10 transition-transform duration-300 group-hover:scale-110">
                    <item.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-zinc-100">
                    {item.title}
                  </h3>
                  <p className="leading-relaxed text-zinc-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Deep Dive Features with Parallax Images */}
      <section className="relative z-10 overflow-hidden py-32">
        <div className="container mx-auto flex max-w-7xl flex-col gap-32 px-4 text-white">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 rounded-lg border border-[#00ffe7]/20 bg-[#00ffe7]/10 px-3 py-1 font-mono text-sm text-[#00ffe7]">
                <Settings className="h-4 w-4" /> FEATURE 01
              </div>
              <h2 className="text-4xl leading-tight font-black tracking-tight lg:text-5xl">
                Macroscopic Analytics Engine
              </h2>
              <p className="text-xl leading-relaxed text-zinc-400">
                Stop guessing. Start knowing. Our analytics engine ingests
                millions of events per second, presenting them in actionable,
                beautiful visualizations. Track user engagement, scan velocity,
                and system health instantly.
              </p>
              <ul className="space-y-4 text-zinc-300">
                <li className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-[#00ffe7]" /> Real-time data
                  streams
                </li>
                <li className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-[#00ffe7]" /> Predictive
                  trend analysis
                </li>
                <li className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-[#00ffe7]" /> Custom
                  report generation
                </li>
              </ul>
            </motion.div>

            <motion.div
              style={{ y: y1 }}
              className="relative aspect-square w-full rounded-full bg-gradient-to-br from-[#00ffe7]/20 to-transparent p-1 backdrop-blur-3xl"
            >
              <div className="absolute inset-4 rounded-full border border-[#00ffe7]/20 bg-zinc-950 shadow-[0_0_50px_rgba(0,255,231,0.05)]">
                {/* Abstract UI representation */}
                <div className="flex h-full flex-col p-8">
                  <div className="flex items-end gap-2 px-4 pt-8 pb-12 opacity-70">
                    {[40, 70, 45, 90, 65, 80, 50, 100, 60].map((h, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [`${h}%`, `${h * 0.8}%`, `${h}%`] }}
                        transition={{
                          duration: 2 + (i % 4) * 0.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="w-1/12 rounded-t-sm bg-gradient-to-t from-[#00ffe7] to-[#00ffe7]/20"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-[#00ffe7]/40 to-transparent" />
                  <div className="mt-8 flex justify-between px-8 font-mono text-xs text-zinc-500">
                    <span>LIVE</span>
                    <span className="animate-pulse text-[#00ffe7] drop-shadow-[0_0_8px_rgba(0,255,231,0.8)]">
                      REC O
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              style={{ y: y2 }}
              className="relative order-2 aspect-square w-full rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl transition-colors hover:border-[#00ffe7]/10 lg:order-1"
            >
              <div className="flex flex-col gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full border border-[#00ffe7]/10 bg-zinc-800" />
                      <div className="space-y-2">
                        <div className="h-2 w-24 rounded bg-zinc-700" />
                        <div className="h-2 w-16 rounded bg-zinc-800" />
                      </div>
                    </div>
                    <div className="h-6 w-20 rounded-full border border-[#00ffe7]/20 bg-[#00ffe7]/10" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              className="order-1 space-y-8 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 rounded-lg border border-[#00ffe7]/20 bg-[#00ffe7]/10 px-3 py-1 font-mono text-sm text-[#00ffe7]">
                <Users className="h-4 w-4" /> FEATURE 02
              </div>
              <h2 className="text-4xl leading-tight font-black tracking-tight lg:text-5xl">
                Global Workforce Management
              </h2>
              <p className="text-xl leading-relaxed text-zinc-400">
                A birds-eye view of your entire organization. Add, remove, or
                modify user permissions instantly. Enforce security policies
                across teams and geographical locations with absolute precision.
              </p>
              <ul className="space-y-4 text-zinc-300">
                <li className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-[#00ffe7]" /> Role-Based Access
                  Control
                </li>
                <li className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-[#00ffe7]" /> Detailed Audit
                  Logs
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Admin Benefits / Value Proposition */}
      <section className="relative z-10 border-t border-zinc-800/50 bg-black/50 py-32 backdrop-blur-2xl">
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 text-4xl font-black md:text-5xl"
          >
            Why Use the Admin Portal?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-16 max-w-2xl text-lg text-zinc-400"
          >
            The difference between chaos and strategy is visibility. This
            dashboard equips you with the leverage needed to turn data into
            operational excellence.
          </motion.p>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: 'Maximize Efficiency',
                desc: 'Automate oversight. Identify bottlenecks in scanning workflows and optimize them before they impact the bottom line.',
              },
              {
                title: 'Prevent Fraud',
                desc: 'Detect anomalies in scanning behavior. Set alerts for unexpected activity spikes or unauthorized access attempts.',
              },
              {
                title: 'Strategic Scaling',
                desc: 'Make decisions based on hard data, not intuition. Scale your infrastructure confidently armed with historical trends.',
              },
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="space-y-4 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#00ffe7]/20 bg-[#00ffe7]/10 text-xl font-black text-[#00ffe7] shadow-[0_0_15px_rgba(0,255,231,0.15)]">
                  0{i + 1}
                </div>
                <h3 className="text-xl font-bold text-white">
                  {benefit.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-400">
                  {benefit.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-32">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative mx-auto max-w-4xl overflow-hidden rounded-[3rem] border border-[#00ffe7]/20 bg-gradient-to-b from-[#00ffe7]/10 to-transparent p-12 backdrop-blur-xl md:p-20"
          >
            {/* Inner glow effect */}
            <div className="absolute top-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#00ffe7]/50 to-transparent" />

            <h2 className="mb-6 text-4xl font-black text-white md:text-6xl">
              Take Command.
            </h2>
            <p className="mb-10 text-lg text-zinc-400 md:text-xl">
              Your empire awaits its architect. Initialize your session and
              begin managing your operations.
            </p>
            <Button
              size="lg"
              className="h-16 rounded-full bg-white px-10 text-lg font-black text-black transition-all hover:scale-105 hover:bg-[#00ffe7] hover:shadow-[0_0_20px_rgba(0,255,231,0.4)]"
              asChild
            >
              <Link href="/dashboard">Access Dashboard</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
