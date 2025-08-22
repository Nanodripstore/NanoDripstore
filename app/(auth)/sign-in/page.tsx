"use client";

import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import SignInForm from "@/components/form/sign-in-form";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";

const SignInContent = () => {
  const { status } = useAuthRedirect();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  // Show loading while checking auth status
  if (status === "loading") {
    return (
      <div className="w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'email_taken':
        return 'An account with this email already exists. Please sign in instead or use a different email.';
      case 'username_taken':
        return 'This username is already taken. Please choose a different username.';
      case 'DuplicateEmail':
        return 'An account with this email already exists. Please sign in instead.';
      case 'DuplicateUsername':
        return 'This username is already taken. Please choose a different username.';
      case 'OAuthAccountNotLinked':
        return 'This email is already registered. Please sign in with your email and password.';
      case 'Configuration':
        return 'There was a problem with the authentication configuration. Please try again later.';
      case 'Verification':
        return 'There was a problem verifying your account. Please try again.';
      default:
        return 'An error occurred during sign-in. Please try again.';
    }
  };

  // Only show the sign-in form if user is not authenticated
  if (status === "unauthenticated") {
    return (
      <div className='w-full'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 text-center"
        >
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your NanoDrip account</p>
        </motion.div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {getErrorMessage(error)}
            </AlertDescription>
          </Alert>
        )}
        
        <SignInForm />
      </div>
    );
  }

  // Return empty div if authenticated (redirect will happen)
  return <div></div>;
};

const SignInPage = () => {
  return (
    <Suspense fallback={
      <div className="w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
};

export default SignInPage;