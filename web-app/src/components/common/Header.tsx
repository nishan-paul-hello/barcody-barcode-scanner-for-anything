'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { LayoutDashboard, History, Camera, LogOut } from 'lucide-react';
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
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-12">
          <Link href="/" className="outline-none">
            <motion.div
              className="group flex items-center space-x-3 transition-all"
              whileHover="hover"
              initial="initial"
            >
              <motion.div
                variants={{
                  initial: { scale: 1 },
                  hover: { scale: 1.1 },
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl"
              >
                <Image
                  src="/brand-logo.svg"
                  alt="Barcody Logo"
                  width={40}
                  height={40}
                  className="h-full w-full object-contain"
                />
              </motion.div>
              <span className="hidden text-2xl font-black tracking-tighter transition-colors group-hover:text-cyan-400 sm:inline-block">
                Barcody
              </span>
            </motion.div>
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
          <div className="h-4 w-[1px] bg-white/10" />

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 overflow-hidden rounded-full p-0 ring-2 ring-white/10 transition-all hover:ring-cyan-400/50"
                >
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500/20 to-blue-600/20">
                    <span className="text-sm font-bold text-cyan-400">
                      {user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-medium">
                      {user.email.split('@')[0]}
                    </p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};
