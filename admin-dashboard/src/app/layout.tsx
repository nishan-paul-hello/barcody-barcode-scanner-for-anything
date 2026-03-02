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
