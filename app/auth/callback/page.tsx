'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

function AuthCallbackContent() {
  const [status, setStatus] = useState('Checking authentication...');
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    if (sessionStatus === 'loading') {
      setStatus('Verifying your authentication...');
      return;
    }

    if (sessionStatus === 'authenticated' && session?.user) {
      setStatus('Authentication successful! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      return;
    }

    if (sessionStatus === 'unauthenticated') {
      setStatus('Authentication failed. Redirecting to home...');
      setTimeout(() => {
        router.push('/');
      }, 2000);
      return;
    }
  }, [sessionStatus, session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Completing Sign In
          </h2>
          <p className="mt-2 text-sm text-gray-600">{status}</p>
          
          {session?.user && (
            <div className="mt-4 p-4 bg-green-100 rounded-md">
              <p className="text-green-800">Welcome back, {session.user.name}!</p>
              <p className="text-green-600 text-sm">{session.user.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Loading...
          </h2>
          <p className="mt-2 text-sm text-gray-600">Please wait while we verify your authentication...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
