'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { type ReactNode } from 'react';

interface GoogleAuthProviderProps {
  children: ReactNode;
}

export function GoogleAuthProvider({ children }: GoogleAuthProviderProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    console.error(
      'Google Client ID is missing. Please check your environment variables.'
    );
    // In development, we might want to render children anyway so the app doesn't crash completely,
    // but the Google login buttons won't work.
    // For now, let's wrap it anyway, but it will likely error internally if we try to use it.
    // However, GoogleOAuthProvider might throw if clientId is empty.
    // Let's provide an empty string to avoid immediate crash if env is missing, but log error.
  }

  return (
    <GoogleOAuthProvider clientId={clientId || ''}>
      {children}
    </GoogleOAuthProvider>
  );
}
