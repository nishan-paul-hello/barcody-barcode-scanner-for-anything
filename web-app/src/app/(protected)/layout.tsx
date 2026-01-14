'use client';

import { Suspense } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Header } from '@/components/common/Header';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <ProtectedRoute>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
        </div>
      </ProtectedRoute>
    </Suspense>
  );
}
