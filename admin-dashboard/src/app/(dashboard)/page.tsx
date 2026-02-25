'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  BarChart3,
  Users,
  Settings,
  Activity,
  Database,
  Lock,
  Zap,
  TrendingUp,
  Fingerprint,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useRouter } from 'next/navigation';

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

  const rawY1 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const rawY2 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const y1 = useSpring(rawY1, { stiffness: 80, damping: 20 });
  const y2 = useSpring(rawY2, { stiffness: 80, damping: 20 });
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const { isAuthenticated, isAdmin } = useAuthStore();
  const { openLoginModal } = useUIStore();
  const router = useRouter();

  const handleLaunchDashboard = () => {
    if (isAuthenticated && isAdmin) {
      router.push('/dashboard');
    } else {
      openLoginModal('/dashboard');
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-[#030303] text-zinc-100 selection:bg-[#00ffe7]/30 selection:text-[#00ffe7]"
    >
      {/* Static Background — no blur on animated elements for GPU performance */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
        <div className="absolute top-0 right-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#00ffe7]/30 to-transparent" />

        {/* Static gradient orbs — radial-gradient instead of blur on animated elements */}
        <div
          className="absolute -top-[20%] -right-[10%] h-[70vw] w-[70vw] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(0,255,231,0.07) 0%, transparent 70%)',
            willChange: 'transform',
          }}
        />
        <div
          className="absolute -bottom-[20%] -left-[10%] h-[60vw] w-[60vw] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(0,255,231,0.045) 0%, transparent 70%)',
            willChange: 'transform',
          }}
        />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:64px_64px]" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 flex min-h-[75vh] flex-col items-center justify-start px-4 pt-16 text-center md:pt-24">
        <motion.div
          style={{ opacity, scale }}
          className="flex flex-col items-center space-y-8"
        >
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
              onClick={handleLaunchDashboard}
              className="group h-14 overflow-hidden rounded-full bg-[#00ffe7] px-8 font-bold text-black shadow-[0_0_20px_rgba(0,255,231,0.3)] transition-all hover:bg-[#00ffe7]/90 hover:ring-4 hover:ring-[#00ffe7]/20"
            >
              Initialize Dashboard
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
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
      <section
        id="overview"
        className="relative z-10 px-4 pt-10 pb-20 md:pt-16"
      >
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
      <section className="relative z-10 overflow-hidden pt-20 pb-32">
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
                Real-time Scanning Intelligence
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
              <div className="absolute inset-2 overflow-hidden rounded-full border border-[#00ffe7]/30 bg-[#050505] shadow-[inset_0_0_60px_rgba(0,255,231,0.05)]">
                {/* Central Atmosphere */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,231,0.08)_0%,transparent_70%)]" />

                <div className="relative flex h-full flex-col items-center justify-between px-12 py-12">
                  {/* Header Metrics - Narrowed container to avoid circular cropping */}
                  <div className="flex w-full max-w-[240px] items-start justify-between pt-4">
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
                        Velocity
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono text-2xl font-black text-white">
                          12.8
                        </span>
                        <span className="text-[10px] font-bold text-[#00ffe7]">
                          M
                        </span>
                      </div>
                      <div className="text-[9px] font-medium text-[#00ffe7]/80">
                        ↑ 24%
                      </div>
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
                        Force
                      </div>
                      <div className="flex items-baseline justify-end gap-1">
                        <span className="font-mono text-2xl font-black text-white">
                          1.4
                        </span>
                        <span className="text-[10px] font-bold text-zinc-400">
                          K
                        </span>
                      </div>
                      <div className="text-[9px] font-medium text-green-400/80">
                        98% Live
                      </div>
                    </div>
                  </div>

                  {/* Visual Centerpiece: Dynamic Activity Ring */}
                  <div className="relative flex h-32 w-full items-end justify-center gap-[3px] px-10">
                    {[35, 60, 45, 85, 70, 95, 50, 100, 75, 55, 80, 40].map(
                      (h, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            height: [`${h * 0.7}%`, `${h}%`, `${h * 0.8}%`],
                            opacity: [0.4, 0.8, 0.4],
                          }}
                          transition={{
                            duration: 3 + (i % 5) * 0.6,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="w-full rounded-full bg-gradient-to-t from-[#00ffe7] to-[#00ffe7]/20"
                          style={{
                            minWidth: '4px',
                            willChange: 'height, opacity',
                          }}
                        />
                      )
                    )}
                  </div>

                  {/* Bottom Stats & Status */}
                  <div className="w-full space-y-6 pb-2">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-[#00ffe7]/30 to-transparent" />

                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center gap-6 font-mono text-[9px] tracking-widest text-zinc-500">
                        <span className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#00ffe7] shadow-[0_0_8px_#00ffe7]" />
                          MQTT EDGE
                        </span>
                        <span className="flex items-center gap-2 opacity-50">
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                          AUTH SYNC
                        </span>
                      </div>

                      <div className="rounded-full border border-[#00ffe7]/20 bg-[#00ffe7]/5 px-4 py-1">
                        <span className="animate-pulse text-[10px] font-black tracking-[0.3em] text-[#00ffe7] uppercase">
                          System Active • Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              style={{ y: y2 }}
              className="relative order-2 flex aspect-square w-full flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-2xl backdrop-blur-xl transition-colors hover:border-[#00ffe7]/10 lg:order-1"
            >
              <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Active Personnel
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Currently authenticated sessions
                  </p>
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((j) => (
                    <div
                      key={j}
                      className="h-8 w-8 rounded-full border-2 border-zinc-900 bg-zinc-800"
                    />
                  ))}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-zinc-900 bg-[#00ffe7]/10 text-xs font-bold text-[#00ffe7]">
                    +42
                  </div>
                </div>
              </div>

              <div className="no-scrollbar flex flex-col gap-3 overflow-x-hidden overflow-y-auto pb-2">
                {[
                  {
                    name: 'Sarah Jenkins',
                    role: 'Super Admin',
                    dept: 'Global Operations',
                    status: 'online',
                    color: 'bg-[#00ffe7]',
                  },
                  {
                    name: 'Marcus Chen',
                    role: 'Auditor',
                    dept: 'Inventory Integrity',
                    status: 'away',
                    color: 'bg-yellow-400',
                  },
                  {
                    name: 'Elena Rostova',
                    role: 'Manager',
                    dept: 'South-East Logistics',
                    status: 'online',
                    color: 'bg-[#00ffe7]',
                  },
                  {
                    name: 'David Kim',
                    role: 'Analyst',
                    dept: 'Metric Intelligence',
                    status: 'offline',
                    color: 'bg-zinc-600',
                  },
                  {
                    name: 'Priya Patel',
                    role: 'Developer',
                    dept: 'Edge Infrastructure',
                    status: 'online',
                    color: 'bg-[#00ffe7]',
                  },
                ].map((user, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-3 transition-colors hover:border-white/10 hover:bg-black/60"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-zinc-800 text-sm font-bold text-zinc-300">
                          {user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div
                          className={`absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-black ${user.color}`}
                        />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white transition-colors group-hover:text-[#00ffe7]">
                          {user.name}
                        </div>
                        <div className="text-xs text-zinc-500">{user.dept}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium text-zinc-300 sm:block">
                        {user.role}
                      </div>
                      <Settings className="h-4 w-4 cursor-pointer text-zinc-600 transition-colors hover:text-white" />
                    </div>
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
                Dynamic Workforce Governance
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
    </div>
  );
}
