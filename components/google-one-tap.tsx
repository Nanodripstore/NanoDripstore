'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleOneTap() {
  useEffect(() => {
    // Load Google Identity Services
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleOneTap;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initializeGoogleOneTap = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
      });

      // Render the button
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'outline',
          size: 'large',
          width: 300,
        }
      );

      // Show One Tap prompt
      window.google.accounts.id.prompt();
    }
  };

  const handleCredentialResponse = async (response: any) => {
    try {
      // Send the credential to your backend
      const result = await fetch('/api/auth/google-one-tap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: response.credential,
        }),
      });

      const data = await result.json();
      
      if (data.success) {
        // Store user data
        localStorage.setItem('user', JSON.stringify(data.user));
        // Redirect or update UI
        window.location.href = '/dashboard';
      } else {
        console.error('Authentication failed:', data.error);
      }
    } catch (error) {
      console.error('Error during authentication:', error);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-2xl font-bold">Sign in with Google</h2>
      <div id="google-signin-button"></div>
    </div>
  );
}
