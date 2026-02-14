'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { SocketStatusIndicator } from './SocketStatusIndicator';
import { cn } from '@/lib/utils';
import { LayoutDashboard, History, Camera, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/history', label: 'History', icon: History },
    { href: '/scan', label: 'Scanner', icon: Camera },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-2xl transition-all duration-300">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-12">
          <Link
            href="/dashboard"
            className="group flex items-center space-x-3 transition-all"
          >
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 transition-transform group-hover:scale-110">
              <div className="flex h-full w-full items-center justify-center rounded-[9px] bg-black/20 backdrop-blur-sm">
                <span className="text-xl font-black text-white italic">B</span>
              </div>
              <motion.div
                animate={{
                  rotate: [0, 90, 180, 270, 360],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,white,transparent)] opacity-20"
              />
            </div>
            <span className="hidden text-2xl font-black tracking-tighter sm:inline-block">
              BARCODY<span className="text-cyan-400">.</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex h-10 items-center gap-2 px-4 text-xs font-bold tracking-widest uppercase transition-all hover:text-white',
                    isActive ? 'text-white' : 'text-white/40'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-4 w-4 transition-transform',
                      isActive && 'text-cyan-400'
                    )}
                  />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 -z-10 rounded-full bg-white/5 ring-1 ring-white/10"
                      transition={{
                        type: 'spring',
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:block">
            <SocketStatusIndicator />
          </div>

          <div className="h-4 w-[1px] bg-white/10" />

          {user && (
            <div className="flex items-center gap-6">
              <div className="hidden flex-col items-end lg:flex">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-tight text-white/90">
                    {user.email.split('@')[0]}
                  </span>
                  <div className="rounded-full bg-cyan-500/10 p-1 ring-1 ring-cyan-500/20">
                    <User className="h-3 w-3 text-cyan-400" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-white/20">
                  {user.email}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="group h-10 rounded-full border border-white/5 bg-white/5 px-4 text-[10px] font-black tracking-widest uppercase transition-all hover:bg-red-500/10 hover:text-red-500 hover:ring-1 hover:ring-red-500/20"
              >
                <LogOut className="mr-2 h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
