'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
import {
  History,
  Camera,
  LogOut,
  Fingerprint,
  KeyRound,
  Trash2,
  Search,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useUIStore } from '@/store/useUIStore';
import { ApiKeysModal } from '@/components/settings/ApiKeysModal';

interface NavItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface HeaderProps {
  navItems?: NavItem[];
}

export const Header: React.FC<HeaderProps> = ({ navItems: customNavItems }) => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { openLoginModal, isApiKeysModalOpen, setApiKeysModalOpen } =
    useUIStore();
  const pathname = usePathname();
  const router = useRouter();

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push(href);
    } else {
      openLoginModal(href);
    }
  };

  const handleLogout = () => {
    sessionStorage.setItem('is_logout_redirect', 'true');
    logout();
    router.push('/');
  };

  const defaultNavItems = [
    { href: '/history', label: 'History', icon: History },
    { href: '/scan', label: 'Scanner', icon: Camera },
    { href: '/lookup', label: 'Lookup', icon: Search },
  ];

  const navItems = customNavItems || defaultNavItems;

  return (
    <header
      className={cn(
        pathname === '/' ? 'fixed inset-x-0 top-6' : 'relative mt-6',
        'z-50 mx-auto flex h-16 w-[95%] max-w-7xl items-center justify-between',
        'rounded-2xl border border-white/10 bg-black/40 px-4 backdrop-blur-xl transition-all duration-300',
        'shadow-2xl shadow-black/50 hover:border-white/20 hover:bg-black/50 sm:px-8'
      )}
    >
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
            className="relative flex h-9 w-9 items-center justify-center"
          >
            <Image
              src="/brand-logo.svg"
              alt="Barcody Logo"
              width={36}
              height={36}
              className="h-full w-full object-contain"
            />
          </motion.div>
          <span
            className={cn(
              'hidden text-xl font-black tracking-tighter transition-all group-hover:text-cyan-400 sm:inline-block',
              pathname === '/' ? 'text-cyan-400' : 'text-white'
            )}
          >
            Barcody
          </span>
        </motion.div>
      </Link>

      <div className="flex items-center gap-4 sm:gap-8">
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={cn(
                  'relative flex h-9 cursor-pointer items-center gap-2 rounded-full px-4 text-[13px] font-bold tracking-widest uppercase transition-all hover:text-white',
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
                    className="absolute inset-0 -z-10 rounded-full bg-white/5 shadow-[0_0_20px_rgba(255,255,255,0.05)] ring-1 ring-white/10"
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

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 cursor-pointer overflow-hidden rounded-full p-0 ring-1 ring-white/10 transition-all hover:ring-cyan-400/50 data-[state=open]:ring-cyan-400"
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
                        <span className="text-xs font-bold text-cyan-400">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="mt-4 w-72 overflow-hidden rounded-[2rem] border border-white/10 bg-black/60 p-2 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 backdrop-blur-3xl"
                  align="end"
                  forceMount
                >
                  <div className="relative mb-2 overflow-hidden rounded-2xl bg-white/5 p-4">
                    <div className="flex flex-col gap-0.5">
                      <p className="truncate text-base font-bold tracking-tight text-white/90">
                        {user.name || 'User'}
                      </p>
                      <p className="truncate text-[11px] font-medium tracking-wider text-white/40">
                        {user.email}
                      </p>
                    </div>
                    <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-cyan-500/10 blur-2xl" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <DropdownMenuItem
                      onClick={() => setApiKeysModalOpen(true)}
                      className="group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-xl p-3 text-sm transition-all duration-300 hover:bg-white/10 focus:bg-white/10"
                    >
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-600/20 ring-1 ring-white/10 transition-all duration-300 group-hover:scale-110 group-hover:ring-violet-400/50">
                        <KeyRound className="h-5 w-5 text-violet-400 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-violet-400 opacity-0 blur-xl transition-opacity group-hover:opacity-20" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[14px] font-semibold tracking-tight text-white/70 transition-colors group-hover:text-white">
                          Personal API Keys
                        </span>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem className="group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-xl p-3 text-sm transition-all duration-300 hover:bg-red-500/5 focus:bg-red-500/5">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-red-500/30 to-rose-500/20 ring-1 ring-white/10 transition-all duration-300 group-hover:scale-110 group-hover:ring-red-400/50">
                        <Trash2 className="h-5 w-5 text-red-400 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-red-400 opacity-0 blur-xl transition-opacity group-hover:opacity-30" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[14px] font-semibold tracking-tight text-white/70 transition-colors group-hover:text-red-400">
                          Delete Account
                        </span>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-xl p-3 text-sm transition-all duration-300 hover:bg-white/10 focus:bg-white/10"
                    >
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-600/20 ring-1 ring-white/10 transition-all duration-300 group-hover:scale-110 group-hover:ring-blue-400/50">
                        <LogOut className="h-5 w-5 text-blue-400 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-blue-400 opacity-0 blur-xl transition-opacity group-hover:opacity-10" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[14px] font-semibold tracking-tight text-white/70 transition-colors group-hover:text-white">
                          Log out
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <ApiKeysModal
                open={isApiKeysModalOpen}
                onOpenChange={setApiKeysModalOpen}
              />
            </>
          ) : (
            <Button
              onClick={() => openLoginModal()}
              className="group relative flex h-9 cursor-pointer items-center gap-2 overflow-hidden rounded-full bg-cyan-500 px-6 font-bold text-black transition-all hover:scale-105 hover:bg-cyan-400 active:scale-95"
            >
              <Fingerprint className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span className="text-sm">Get Started</span>
              <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
