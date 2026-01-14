'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { SocketStatusIndicator } from './SocketStatusIndicator';
import { cn } from '@/lib/utils';
import { LayoutDashboard, History, Camera, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/history', label: 'History', icon: History },
    { href: '/scan', label: 'Scanner', icon: Camera },
  ];

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600">
              <span className="text-lg font-bold text-white">B</span>
            </div>
            <span className="hidden text-xl font-bold tracking-tight sm:inline-block">
              Barcody
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <SocketStatusIndicator />
          <div className="bg-border mx-2 hidden h-4 w-[1px] sm:block" />
          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden flex-col items-end lg:flex">
                <span className="text-xs leading-none font-semibold">
                  {user.email.split('@')[0]}
                </span>
                <span className="text-muted-foreground text-[10px]">
                  {user.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-muted-foreground gap-2 transition-colors hover:bg-red-500/10 hover:text-red-500"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
