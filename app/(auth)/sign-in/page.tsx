"use client";

import { motion } from 'framer-motion';
import SignInForm from "@/components/form/sign-in-form";

const SignInPage = () => {
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
};

export default SignInPage;