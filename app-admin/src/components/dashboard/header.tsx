'use client';

import { useCallback } from 'react';
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

  const handleNavClick = useCallback(
    (e: React.MouseEvent, href: string) => {
      e.preventDefault();
      if (isAuthenticated && isAdmin) {
        router.push(href);
      } else {
        openLoginModal(href);
      }
    },
    [isAuthenticated, isAdmin, router, openLoginModal]
  );

  const handleLogout = useCallback(() => {
    sessionStorage.setItem('is_logout_redirect', 'true');
    googleLogout();
    logout();
    router.push('/');
  }, [logout, router]);

  const handleLoginClick = useCallback(
    () => openLoginModal(),
    [openLoginModal]
  );

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
          className="group flex cursor-pointer items-center gap-3 transition-all"
          whileHover="hover"
          initial="initial"
        >
          <motion.div
            variants={{
              initial: { scale: 1 },
              hover: { scale: 1.1 },
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            className="relative flex size-9 items-center justify-center"
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
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              title={item.title}
              href={item.href}
              icon={item.icon}
              isActive={pathname === item.href}
              onClick={handleNavClick}
            />
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu key={user.id}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    'relative size-9 cursor-pointer overflow-hidden rounded-full p-0 ring-1 ring-white/10 transition-all',
                    'hover:ring-[#ee4b2b]/50 data-[state=open]:ring-[#ee4b2b]'
                  )}
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
                className={cn(
                  'mt-4 w-72 overflow-hidden rounded-[2rem] border border-white/10 bg-black/60 p-2 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)]',
                  'ring-1 ring-white/10 backdrop-blur-3xl'
                )}
                align="end"
              >
                <div className="relative mb-2 overflow-hidden rounded-2xl bg-white/5 p-4">
                  <div className="flex flex-col gap-0.5">
                    <p className="truncate text-base font-bold tracking-tight text-white/90">
                      {user.name || 'Admin User'}
                    </p>
                    <p className="truncate text-[11px] font-medium tracking-wider text-white/40">
                      {user.email}
                    </p>
                  </div>
                  <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-orange-500/10 blur-2xl" />
                </div>

                <div className="flex flex-col gap-1">
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
          ) : (
            <Button
              onClick={handleLoginClick}
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

function NavLink({
  title,
  href,
  icon: Icon,
  isActive,
  onClick,
}: {
  title: string;
  href: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: (e: React.MouseEvent, href: string) => void;
}) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => onClick(e, href),
    [onClick, href]
  );

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        'relative flex h-9 cursor-pointer items-center gap-2 rounded-full px-4 text-[13px] font-bold tracking-widest uppercase transition-all',
        'hover:text-white',
        isActive ? 'text-white' : 'text-white/40'
      )}
    >
      <Icon
        className={cn(
          'h-4 w-4 transition-transform',
          isActive && 'text-cyan-400'
        )}
      />
      {title}
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
}
