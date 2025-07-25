'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const [status, setStatus] = useState('Processing...');
  const [user, setUser] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus(`Error: ${error}`);
      return;
    }

    if (code) {
      handleGoogleCallback(code);
    } else {
      setStatus('No authorization code received');
    }
  }, [searchParams]);

  const handleGoogleCallback = async (code: string) => {
    try {
      setStatus('Exchanging code for tokens...');
      
      const response = await fetch('/api/auth/google-exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('Login successful!');
        setUser(data.user);
        
        // Store user in localStorage or your state management
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('tokens', JSON.stringify(data.tokens));
        
        // Redirect to dashboard or home
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setStatus(`Error: ${data.error}`);
        console.error('Auth error:', data);
      }
    } catch (error) {
      setStatus('Network error occurred');
      console.error('Network error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Authenticating...
          </h2>
          <p className="mt-2 text-sm text-gray-600">{status}</p>
          
          {user && (
            <div className="mt-4 p-4 bg-green-100 rounded-md">
              <p className="text-green-800">Welcome, {(user as any).name}!</p>
              <p className="text-green-600 text-sm">{(user as any).email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
