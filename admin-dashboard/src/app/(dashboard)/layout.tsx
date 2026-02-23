import { Header } from '@/components/dashboard/header';
import { Footer } from '@/components/dashboard/footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-[#0a0a0a]">
        <Header />
        <div className="flex flex-1 flex-col">
          <main className="flex-1 p-6">{children}</main>
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
}
