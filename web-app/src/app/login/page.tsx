'use client';

import { useState, Suspense, useEffect } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { toast } from 'sonner';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  useEffect(() => {
    // Simple client-side check for existing session
    // Task 4.5 will implement robust middleware protection
    const token = localStorage.getItem('accessToken');
    if (token) {
      router.replace(callbackUrl);
    }
  }, [router, callbackUrl]);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      // Send the token to the backend
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
        {
          token: credentialResponse.credential,
        }
      );

      const { accessToken, refreshToken, user } = response.data;

      // TODO: Store tokens securely (Task 4.2 will handle state management)
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      toast.success(`Welcome back, ${user?.email || 'User'}!`);

      // Redirect to dashboard
      router.push(callbackUrl);
    } catch (error: unknown) {
      console.error('Login Error:', error);
      let message = 'Failed to authenticate with Google';

      if (axios.isAxiosError(error) && error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    toast.error('Google Sign-In was unsuccessful. Please try again.');
    setIsLoading(false);
  };

  return (
    <Card className="border-border/50 bg-card/95 w-full max-w-md shadow-xl backdrop-blur">
      <CardHeader className="space-y-1 text-center">
        <div className="mb-4 flex justify-center">
          <div className="bg-primary/10 ring-primary/20 rounded-full p-3 ring-1">
            {/* Simple Barcody Icon Placeholder */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary h-8 w-8"
            >
              <path d="M3 5v14" />
              <path d="M8 5v14" />
              <path d="M12 5v14" />
              <path d="M17 5v14" />
              <path d="M21 5v14" />
            </svg>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Welcome to Barcody
        </CardTitle>
        <CardDescription>
          Sign in to access your barcode scanner dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
              <p className="text-muted-foreground text-sm">Authenticating...</p>
            </div>
          ) : (
            <div className="flex w-full justify-center">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                theme="filled_black"
                shape="pill"
                size="large"
                width="100%"
                text="continue_with"
              />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-muted-foreground flex flex-col space-y-2 text-center text-sm">
        <p>
          By clicking continue, you agree to our{' '}
          <a
            href="#"
            className="hover:text-primary underline underline-offset-4"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="#"
            className="hover:text-primary underline underline-offset-4"
          >
            Privacy Policy
          </a>
          .
        </p>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="from-primary/20 via-background to-background absolute top-0 left-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]" />
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center space-y-2">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </div>
  );
}
