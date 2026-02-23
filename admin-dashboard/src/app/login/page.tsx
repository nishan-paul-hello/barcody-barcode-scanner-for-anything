'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/api/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, BarChart3, ShieldCheck, Loader2 } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, isAuthenticated, isAdmin, setError, error, setLoading } =
    useAuthStore();
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, router]);

  const handleSuccess = async (response: { credential?: string }) => {
    setLoading(true);
    setError(null);
    try {
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }
      const data = await authApi.loginWithGoogle(response.credential);

      if (!data.isAdmin) {
        setError(
          'Access denied. You must be an administrator to access this dashboard.'
        );
        return;
      }

      setAuth(data.user, data.accessToken, data.refreshToken, data.isAdmin);
      router.push('/');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const message =
        axiosError.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    setError('Google authentication failed.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-2xl bg-blue-600/10 p-4 ring-1 ring-blue-500/20">
              <BarChart3 className="h-10 w-10 text-blue-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Barcody Admin
          </h1>
          <p className="mt-2 text-zinc-400">Management Panel and Analytics</p>
        </div>

        <Card className="border-zinc-800 bg-[#0f0f0f] shadow-2xl ring-1 ring-white/5">
          <CardHeader>
            <CardTitle className="text-xl text-white">Authentication</CardTitle>
            <CardDescription className="text-zinc-400">
              Sign in with your administrator Gmail account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(error || errorParam === 'unauthorized') && (
              <Alert
                variant="destructive"
                className="border-red-500/50 bg-red-500/10 text-red-200"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Restricted Access</AlertTitle>
                <AlertDescription>
                  {error || 'You must be an administrator to access this area.'}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center py-4">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                theme="filled_black"
                shape="pill"
                size="large"
                text="signin_with"
              />
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-lg bg-zinc-900/50 p-3 text-xs text-zinc-500 ring-1 ring-zinc-800">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              <span>Secure access reserved for authorized administrators.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
