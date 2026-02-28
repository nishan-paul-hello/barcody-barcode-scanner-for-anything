'use client';

import { Header } from '@/components/dashboard/header';
import { Footer } from '@/components/dashboard/footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { usePathname } from 'next/navigation';

/**
 * Thin client wrapper for the dashboard shell.
 * Keeps 'use client' out of the layout.tsx so the layout itself is an RSC.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a]">
      <Header />
      <div className="flex flex-1 flex-col">
        <main className="container mx-auto flex-1 px-4 pt-12 pb-8 sm:px-6 lg:px-8">
          {isHomePage ? children : <ProtectedRoute>{children}</ProtectedRoute>}
        </main>
        {isHomePage && <Footer />}
      </div>
    </div>
  );
}
