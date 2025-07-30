"use client";

import { motion } from 'framer-motion';
import SignInForm from "@/components/form/sign-in-form";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";

const SignInPage = () => {
  const { status } = useAuthRedirect();

  // Show loading while checking auth status
  if (status === "loading") {
    return (
      <div className="w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
        <SignInForm />
      </div>
    );
  }

  // Return empty div if authenticated (redirect will happen)
  return <div></div>;
};

export default SignInPage;