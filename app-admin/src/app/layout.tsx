import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // or local font
import '@/app/globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: 'Barcody - %s',
    default: 'Barcody',
  },
  description: 'Admin Dashboard for Barcody',
  icons: {
    icon: '/brand-logo.svg?v=1',
  },
};

import { LoginModal } from '@/components/auth/LoginModal';
import { AuthRedirectHandler } from '@/components/auth/AuthRedirectHandler';
import { AuthSyncHandler } from '@/components/auth/AuthSyncHandler';
import { AuthInitializer } from '@/components/auth/AuthInitializer';

import { LoadingProvider } from '@/components/common/LoadingProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {/*
            AuthInitializer MUST be the first child of Providers so that
            checkAuthStatus() runs (and resolves isLoading) before any
            ProtectedRoute downstream has a chance to render content.
            AuthSyncHandler is now redundant — its cross-tab logic lives
            inside AuthInitializer — but is kept for backward-compat.
          */}
          <AuthInitializer />
          <LoadingProvider>
            {children}
            <LoginModal />
            <AuthRedirectHandler />
            <AuthSyncHandler />
          </LoadingProvider>
        </Providers>
      </body>
    </html>
  );
}
