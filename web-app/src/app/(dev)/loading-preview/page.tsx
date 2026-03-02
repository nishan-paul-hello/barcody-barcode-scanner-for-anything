import { LoadingScreen } from '@/components/common/loading-screen';
import { notFound } from 'next/navigation';

export default function TempLoadingPage() {
  // 🔒 THE SAFETY LOCK: Only works in development mode
  if (process.env.NODE_ENV === 'production') {
    return notFound();
  }

  return (
    <div className="relative min-h-screen bg-[#050505]">
      <LoadingScreen />
    </div>
  );
}
