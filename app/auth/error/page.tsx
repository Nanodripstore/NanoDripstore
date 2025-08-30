"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [errorType, setErrorType] = useState<string>("");

  useEffect(() => {
    const errorParam = searchParams.get("error");
    const errorMessage = searchParams.get("message");
    
    if (errorParam) {
      setErrorType(errorParam);
      
      // Handle different error types
      switch (errorParam) {
        case "OAuthCreateAccount":
          setError(errorMessage || "Failed to create account with Google. The email or username may already be in use.");
          break;
        case "OAuthCallback":
          setError("There was a problem with Google authentication. Please try again.");
          break;
        case "Verification":
          setError("Email verification failed. The link may have expired.");
          break;
        default:
          setError(errorMessage || "An authentication error occurred. Please try again.");
      }
    }
  }, [searchParams]);

  const handleRetry = () => {
    router.push("/sign-in");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-lg shadow-xl p-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6"
          >
            <AlertCircle className="w-8 h-8 text-red-600" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-900 mb-4"
          >
            Authentication Error
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 mb-8 text-left"
          >
            {error}
          </motion.p>

          {errorType === "OAuthCreateAccount" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
            >
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Common Solutions:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• Try signing in instead of creating a new account</li>
                <li>• Use a different email address</li>
                <li>• Contact support if the issue persists</li>
              </ul>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <Button 
              onClick={handleRetry}
              className="w-full"
              size="lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>

            <Button 
              onClick={handleGoHome}
              variant="outline"
            className="w-full"
            size="lg"
          >
            Go to Homepage
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xs text-gray-500 mt-6"
        >
          If this problem continues, please contact our support team.
        </motion.p>
      </div>
    </motion.div>
  </div>
);
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}