'use client';

import { LoadingScreen } from '@/components/common/LoadingScreen';
import { notFound } from 'next/navigation';

export default function LoadingPreviewPage() {
  // 🔒 THE SAFETY LOCK: Hidden in Production
  if (process.env.NODE_ENV === 'production') {
    return notFound();
  }

  return <LoadingScreen />;
}
