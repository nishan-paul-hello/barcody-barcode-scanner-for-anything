'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Zap,
  Smartphone,
  History,
  Camera,
  Layout,
  Globe,
  Code,
  Layers,
} from 'lucide-react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useRouter } from 'next/navigation';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <motion.div
    variants={fadeInUp}
    whileHover={{ y: -10, transition: { duration: 0.2 } }}
    className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-xl"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    <div className="relative z-10">
      <div className="mb-4 inline-flex rounded-2xl bg-cyan-500/10 p-3 text-cyan-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-3 text-xl font-bold text-white">{title}</h3>
      <p className="leading-relaxed text-white/60">{description}</p>
    </div>
  </motion.div>
);

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const { openLoginModal } = useUIStore();
  const router = useRouter();
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <div className="min-h-screen bg-[#050505] pb-8 text-white selection:bg-cyan-500/30">
      <Header />

      <main>
        {/* Animated Background Orbs */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-cyan-500/10 blur-[120px]"
          />
          <motion.div
            animate={{
              x: [0, -80, 0],
              y: [0, 100, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute top-[20%] -right-[10%] h-[40%] w-[40%] rounded-full bg-blue-600/10 blur-[120px]"
          />
          <div className="pointer-events-none absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
        </div>

        {/* Hero Section */}
        <section
          ref={targetRef}
          className="relative flex h-screen flex-col items-center justify-start overflow-hidden px-4 pt-[136px]"
        >
          <motion.div
            style={{ y: smoothY, opacity, scale }}
            className="z-10 container mx-auto flex max-w-6xl flex-col items-center text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8 text-5xl leading-[0.9] font-black tracking-tighter md:text-8xl"
            >
              SCAN <span className="text-cyan-400">EVERYTHING</span> <br />
              MANAGE ANYTHING
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-12 max-w-2xl text-lg leading-relaxed text-white/50 md:text-xl"
            >
              The ultimate precision tool for inventory tracking, asset
              management, and instant data retrieval. Built for professionals,
              loved by everyone.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col gap-4 sm:flex-row"
            >
              <Button
                size="lg"
                onClick={() => {
                  if (isAuthenticated) {
                    router.push('/scanner');
                  } else {
                    openLoginModal('/scanner');
                  }
                }}
                className="group h-14 cursor-pointer rounded-full bg-cyan-500 px-10 font-bold text-black transition-all hover:scale-105 hover:bg-cyan-400"
              >
                Launch Scanner
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 cursor-pointer rounded-full border-white/10 bg-white/5 px-10 font-bold backdrop-blur-md transition-all hover:bg-white/10"
              >
                <Link href="#features">Explore Features</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Scanner Visualizer in Hero */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.6 }}
            className="pointer-events-none absolute bottom-0 left-1/2 h-[40vh] w-full max-w-4xl -translate-x-1/2 rounded-t-[3rem] border-x border-t border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl"
          >
            <div className="animate-scan-line absolute top-0 left-0 h-1 w-full bg-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.5)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-64 w-64 items-center justify-center rounded-2xl border border-cyan-500/20">
                <Camera className="h-12 w-12 animate-pulse text-cyan-500/30" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative z-10 px-4 py-32">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-20 flex flex-col items-center text-center">
              <h2 className="mb-6 text-3xl font-bold md:text-5xl">
                Powerful Capabilities
              </h2>
              <div className="mb-8 h-1.5 w-20 rounded-full bg-cyan-500" />
              <p className="max-w-xl text-lg text-white/50">
                Engineered for speed, accuracy, and reliability. Barcody
                transforms your device into a professional-grade scanner.
              </p>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-100px' }}
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              <FeatureCard
                icon={Zap}
                title="Hyper-Fast Scanning"
                description="Proprietary algorithms deliver sub-millisecond recognition for QR codes, UPC, EAN, and more."
              />
              <FeatureCard
                icon={History}
                title="Smart History"
                description="Your scan history is indexed, searchable, and synced across all your devices in real-time."
              />
              <FeatureCard
                icon={Shield}
                title="Enterprise Security"
                description="End-to-end encryption for your private inventory data and secure authentication."
              />
              <FeatureCard
                icon={Layout}
                title="Asset Insights"
                description="Detailed product information, pricing, and category tracking for every item you scan."
              />
              <FeatureCard
                icon={Globe}
                title="Global Database"
                description="Instant access to millions of products with automated lookup and data enrichment."
              />
              <FeatureCard
                icon={Smartphone}
                title="Progressive Web App"
                description="Zero installation required. Works offline and provides a native feel on any platform."
              />
            </motion.div>
          </div>
        </section>

        {/* Visual Demo Section */}
        <section className="relative overflow-hidden px-4 py-32">
          <div className="container mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-4xl leading-tight font-black md:text-6xl">
                THE FUTURE OF <br />
                <span className="text-cyan-400">INVENTORY LOGISTICS</span>
              </h2>
              <p className="text-xl leading-relaxed text-white/60">
                Whether you&apos;re managing a warehouse or a comic book
                collection, Barcody provides the precision required to keep your
                data organized.
              </p>

              <ul className="space-y-4">
                {[
                  { icon: Code, text: 'Developer-friendly API integration' },
                  { icon: Layers, text: 'Custom tagging & categorization' },
                  { icon: Zap, text: 'Real-time pricing comparison' },
                ].map((item, i) => (
                  <motion.li
                    key={item.text}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 text-white/80"
                  >
                    <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium">{item.text}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-[3rem] border border-white/5 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 p-8 backdrop-blur-2xl"
            >
              <div className="absolute inset-0 bg-cyan-500/5 opacity-20 transition-opacity group-hover:opacity-40" />
              {/* Mock App UI */}
              <div className="relative h-[90%] w-[80%] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0a0a] shadow-2xl">
                <div className="flex h-12 items-center justify-between border-b border-white/5 px-6">
                  <div className="h-3 w-3 rounded-full bg-red-500/50" />
                  <div className="flex gap-1.5">
                    <div className="h-2 w-12 rounded-full bg-white/10" />
                  </div>
                </div>
                <div className="space-y-4 p-6">
                  <div className="flex h-32 w-full flex-col items-center justify-center space-y-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
                    <Camera className="h-6 w-6 text-cyan-400" />
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-cyan-400/20">
                      <motion.div
                        animate={{ x: [-100, 100] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        className="h-full w-1/2 bg-cyan-400"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex h-20 w-full gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="h-12 w-12 rounded-lg bg-white/5" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-2 w-3/4 rounded-full bg-white/20" />
                        <div className="h-1.5 w-1/2 rounded-full bg-white/10" />
                      </div>
                    </div>
                    <div className="flex h-20 w-full gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="h-12 w-12 rounded-lg bg-white/5" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-2 w-2/3 rounded-full bg-white/20" />
                        <div className="h-1.5 w-1/3 rounded-full bg-white/10" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Orbs in Background */}
              <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />
              <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
