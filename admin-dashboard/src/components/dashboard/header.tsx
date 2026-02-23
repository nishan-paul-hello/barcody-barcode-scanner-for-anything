'use client';

import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { googleLogout } from '@react-oauth/google';

export function Header() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    googleLogout();
    logout();
    router.push('/login');
  };

  return (
    <header className="border-b border-zinc-800 bg-[#0f0f0f]">
      <div className="flex h-16 items-center px-4">
        <div className="mr-8 bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-xl font-bold text-transparent">
          Barcody Admin
        </div>
        <div className="ml-auto flex items-center space-x-4">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full ring-1 ring-white/10 hover:ring-white/20"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.picture} alt={user.name || 'User'} />
                    <AvatarFallback className="bg-blue-600/10 text-blue-500">
                      {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 border-zinc-800 bg-[#0f0f0f] text-zinc-200"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-medium text-white">
                      {user.name || 'Admin User'}
                    </p>
                    <p className="text-xs leading-none text-zinc-400">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white">
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
