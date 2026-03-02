'use client';

import NotFound from '@/app/not-found';
import { notFound } from 'next/navigation';

export default function Preview404() {
  // 🔒 THE SAFETY LOCK: Only works in development mode
  if (process.env.NODE_ENV === 'production') {
    return notFound();
  }

  return <NotFound />;
}
