import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // or local font
import '@/app/globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: 'Barcody - %s',
    default: 'Barcody - Dashboard',
  },
  description: 'Admin Dashboard for Barcody',
  icons: {
    icon: '/admin/brand-logo.svg?v=1',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
