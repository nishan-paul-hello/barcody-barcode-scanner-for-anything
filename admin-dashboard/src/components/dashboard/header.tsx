'use client';

import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { googleLogout } from '@react-oauth/google';
import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    googleLogout();
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-2xl transition-all duration-300">
      <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="outline-none">
          <div className="group flex cursor-pointer items-center space-x-3 transition-all">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/admin/brand-logo.svg"
                alt="Barcody Logo"
                width={40}
                height={40}
                className="h-full w-full object-contain"
              />
            </div>
            <span className="hidden text-2xl font-black tracking-tighter transition-colors group-hover:text-cyan-400 sm:inline-block">
              Barcody Admin
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          {user && (
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
                        {(user.name || user.email)?.charAt(0).toUpperCase()}
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
                      {user.name || 'Admin User'}
                    </p>
                    <p className="truncate text-xs font-medium text-white/50">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="p-2">
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="group flex cursor-pointer items-center gap-3 rounded-xl p-3 text-red-400 transition-all hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white"
                  >
                    <LogOut className="h-4 w-4 transition-colors group-hover:text-white" />
                    <span className="text-sm font-bold">Sign out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
