"use client";

import { motion } from 'framer-motion';
import SignUpForm from "@/components/form/sign-up-form";

const SignUpPage = () => {
  return (
    <div className='w-full'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-center"
      >
        <h1 className="text-2xl font-bold">Create Your Account</h1>
        <p className="text-muted-foreground mt-2">Join NanoDrip today</p>
      </motion.div>
      <SignUpForm />
    </div>
  );
};

export default SignUpPage;