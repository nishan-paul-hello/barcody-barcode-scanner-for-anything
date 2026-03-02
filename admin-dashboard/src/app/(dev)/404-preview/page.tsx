'use client';

import NotFound from '@/app/not-found';
import { notFound } from 'next/navigation';

export default function Preview404Admin() {
  // 🔒 THE SAFETY LOCK: Hidden in Production
  if (process.env.NODE_ENV === 'production') {
    return notFound();
  }

  return <NotFound />;
}
