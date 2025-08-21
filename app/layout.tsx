import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from '@/components/providers';
import { WishlistUpdateProvider } from '@/contexts/wishlist-update-context';
import CartSidebar from '@/components/cart-sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NanoDrip Store - Premium Streetwear',
  description: 'Premium streetwear clothing for the modern urban lifestyle. Discover our collection of trendy t-shirts, hoodies, and accessories.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <WishlistUpdateProvider>
            <div className="flex flex-col min-h-screen">
              {children}
            </div>
            <CartSidebar />
            <Toaster />
            <SonnerToaster position="top-center" />
          </WishlistUpdateProvider>
        </Providers>
      </body>
    </html>
  );
}