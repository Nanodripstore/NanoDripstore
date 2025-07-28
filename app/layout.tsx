import '@/style/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster"
import Navbar from '@/components/navbar';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Next.js Forms',
  description: 'A tutorial project for Next.js forms with shadcn/ui',
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
          <main className="h-screen flex flex-col justify-center items-center">
            <Navbar />
            {children}
          </main>
          <Toaster />
        </Providers>
      </body>
    </html >
  );
}