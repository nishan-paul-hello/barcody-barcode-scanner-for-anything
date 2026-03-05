import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Scanner',
};

export default function ScanLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
