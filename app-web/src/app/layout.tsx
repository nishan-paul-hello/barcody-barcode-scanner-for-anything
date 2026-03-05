import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '@/app/globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Barcody',
    template: 'Barcody - %s',
  },
  description: 'The ultimate barcode scanner for anything',
  icons: {
    icon: '/brand-logo.svg',
  },
};

import { ThemeProvider } from '@/components/theme-provider';
import { GoogleAuthProvider } from '@/components/providers/google-auth-provider';
import { AuthInitializer } from '@/components/auth-initializer';
import { QueryProvider } from '@/components/providers/query-provider';
import { SocketProvider } from '@/components/providers/SocketProvider';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { AnalyticsTracker } from '@/components/analytics-tracker';
import { LoginModal } from '@/components/auth/LoginModal';
import { AuthRedirectHandler } from '@/components/auth/AuthRedirectHandler';

import { LoadingProvider } from '@/components/providers/loading-provider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <GoogleAuthProvider>
            <AuthInitializer />
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <SocketProvider>
                <AnalyticsTracker />
                <LoginModal />
                <AuthRedirectHandler />
                <LoadingProvider>
                  <ErrorBoundary>{children}</ErrorBoundary>
                </LoadingProvider>
              </SocketProvider>
            </ThemeProvider>
          </GoogleAuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
