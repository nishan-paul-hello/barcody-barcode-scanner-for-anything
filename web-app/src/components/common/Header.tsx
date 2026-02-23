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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { LayoutDashboard, History, Camera, Search, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface HeaderProps {
  navItems?: NavItem[];
}

export const Header: React.FC<HeaderProps> = ({ navItems: customNavItems }) => {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();

  const defaultNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/history', label: 'History', icon: History },
    { href: '/lookup', label: 'Lookup', icon: Search },
    { href: '/scan', label: 'Scanner', icon: Camera },
  ];

  const navItems = customNavItems || defaultNavItems;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-2xl transition-all duration-300">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="outline-none">
          <motion.div
            className="group flex cursor-pointer items-center space-x-3 transition-all"
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

        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex h-10 cursor-pointer items-center gap-2 px-4 text-xs font-bold tracking-widest uppercase transition-all hover:text-white',
                    isActive ? 'text-white' : 'text-white/40'
                  )}
                >
                  {item.icon && (
                    <item.icon
                      className={cn(
                        'h-4 w-4 transition-transform',
                        isActive && 'text-cyan-400'
                      )}
                    />
                  )}
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

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 cursor-pointer overflow-hidden rounded-full p-0 ring-2 ring-white/10 transition-all hover:ring-cyan-400 data-[state=open]:ring-cyan-400"
                >
                  {user.picture ? (
                    <Image
                      src={user.picture}
                      alt={user.name || 'User Profile'}
                      fill
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500/20 to-blue-600/20">
                      <span className="text-sm font-bold text-cyan-400">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="mt-4 w-64 overflow-hidden rounded-3xl border border-white/5 bg-[#1a1a1a] p-0 text-white shadow-xl"
                align="end"
                forceMount
              >
                <div className="p-5">
                  <div className="flex flex-col gap-1">
                    <p className="truncate text-base font-bold tracking-tight text-white">
                      {user.name || 'User'}
                    </p>
                    <p className="truncate text-xs font-medium text-white/50">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="p-2">
                  <DropdownMenuItem
                    onClick={logout}
                    className="group flex cursor-pointer items-center gap-3 rounded-xl p-3 text-red-400 transition-all hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white"
                  >
                    <LogOut className="h-4 w-4 transition-colors group-hover:text-white" />
                    <span className="text-sm font-bold">Log out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              className="rounded-full bg-cyan-500 font-bold hover:bg-cyan-600"
            >
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
