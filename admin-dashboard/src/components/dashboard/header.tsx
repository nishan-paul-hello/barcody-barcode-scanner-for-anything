'use client';

import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LogOut,
  BarChart,
  Users,
  Scan,
  Shield,
  Fingerprint,
  Trash2,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { googleLogout } from '@react-oauth/google';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';

export function Header() {
  const { user, logout, isAuthenticated, isAdmin } = useAuthStore();
  const { openLoginModal } = useUIStore();
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === '/';

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (isAuthenticated && isAdmin) {
      router.push(href);
    } else {
      openLoginModal(href);
    }
  };

  const handleLogout = () => {
    sessionStorage.setItem('is_logout_redirect', 'true');
    googleLogout();
    logout();
    router.push('/');
  };

  const navItems = [
    { title: 'Dashboard', href: '/dashboard', icon: Shield },
    { title: 'Analytics', href: '/analytics', icon: BarChart },
    { title: 'Users', href: '/users', icon: Users },
    { title: 'Scans', href: '/scans', icon: Scan },
  ];

  return (
    <header
      className={cn(
        isHomePage ? 'fixed inset-x-0 top-6' : 'relative mt-6',
        'z-50 mx-auto flex h-16 w-[95%] max-w-7xl items-center justify-between',
        'rounded-2xl border border-white/10 bg-black/40 px-4 backdrop-blur-xl transition-[border-color,background-color] duration-300',
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
              'hidden text-xl font-black tracking-tighter transition-all group-hover:text-[#ee4b2b] sm:inline-block',
              pathname === '/' ? 'text-[#ee4b2b]' : 'text-white'
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
                <item.icon
                  className={cn(
                    'h-4 w-4 transition-transform',
                    isActive && 'text-cyan-400'
                  )}
                />
                {item.title}
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
            <DropdownMenu key={user.id}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 cursor-pointer overflow-hidden rounded-full p-0 ring-1 ring-white/10 transition-all hover:ring-[#ee4b2b]/50 data-[state=open]:ring-[#ee4b2b]"
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
                        {(user.name || user.email)?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="mt-4 w-64 overflow-hidden rounded-3xl border border-white/5 bg-[#0a0a0a]/90 p-0 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl"
                align="end"
              >
                <div className="bg-white/5 p-5">
                  <div className="flex flex-col gap-1">
                    <p className="truncate text-base font-bold tracking-tight text-white">
                      {user.name || 'Admin User'}
                    </p>
                    <p className="truncate text-xs font-medium text-white/50">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 p-2">
                  <DropdownMenuItem className="group flex cursor-pointer items-center gap-4 rounded-xl p-3 text-zinc-500 transition-all hover:bg-red-600/10 hover:text-red-500 focus:bg-red-600/10 focus:text-red-500">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 ring-1 ring-white/5 transition-all group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white group-hover:ring-red-600">
                      <Trash2 className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold tracking-tight">
                      Delete Account
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="group flex cursor-pointer items-center gap-4 rounded-xl p-3 text-red-400 transition-all hover:bg-red-600/10 hover:text-red-500 focus:bg-red-600/10 focus:text-red-500"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-600/10 text-red-500 ring-1 ring-red-600/20 transition-all group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white group-hover:ring-red-600">
                      <LogOut className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold tracking-tight">
                      Log out
                    </span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
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
}
