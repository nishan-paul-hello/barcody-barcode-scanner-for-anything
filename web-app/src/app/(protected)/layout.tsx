'use client';

import { Suspense } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <ProtectedRoute>{children}</ProtectedRoute>
    </Suspense>
  );
}
