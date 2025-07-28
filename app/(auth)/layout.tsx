"use client";

import { motion } from 'framer-motion';
import Header from '@/components/header';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from 'next-themes';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'} flex flex-col`}>
      <Header />
      <div className="flex-1 flex items-center justify-center py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4"
        >
          <Card className="max-w-md mx-auto shadow-lg border">
            <CardContent className="p-8">
              {children}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
