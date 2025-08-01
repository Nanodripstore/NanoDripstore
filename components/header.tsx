"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { useCartStore } from '@/lib/cart-store';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import CartSidebar from './cart-sidebar';
import UserDropdown from './user-dropdown';
import Link from 'next/link';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { getTotalItems, openCart, setUser } = useCartStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isHomepage = pathname === '/';
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Set user in cart store when session changes
  useEffect(() => {
    const updateUser = async () => {
      if (session?.user?.email) {
        await setUser(session.user.email);
      } else {
        await setUser(null);
      }
    };
    updateUser();
  }, [session?.user?.email, setUser]);

  if (!mounted) return null;

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Category', href: '/category' },
    { name: 'About', href: '/about' },
    { name: 'Reviews', href: '/reviews' },
    { name: 'FAQ', href: '/faq' }
  ];

  // Determine text color based on homepage and scroll state
  const getTextColor = () => {
    if (isHomepage) {
      return scrolled ? 'text-foreground' : 'text-white';
    }
    return 'text-foreground';
  };

  const getTextColorWithOpacity = () => {
    if (isHomepage) {
      return scrolled ? 'text-foreground/80 hover:text-foreground' : 'text-white/80 hover:text-white';
    }
    return 'text-foreground/80 hover:text-foreground';
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-background/80 backdrop-blur-lg'
        : 'bg-transparent'
        }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Menu and Logo Container */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu - Only visible on mobile */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${isHomepage && !scrolled ? 'text-white hover:text-white hover:bg-white/10' : ''}`}
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetTitle>
                  <span className="absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 clip-[rect(0,0,0,0)]">Navigation Menu</span>
                </SheetTitle>
                <div className="flex flex-col space-y-6 mt-8">
                  {navItems.map((item, index) => (
                    <motion.a
                      key={item.name}
                      href={item.href}
                      className="text-base sm:text-lg font-medium text-foreground/80 hover:text-foreground transition-colors"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {item.name}
                    </motion.a>
                  ))}
                  
                  {/* Mobile User Menu */}
                  {session?.user && (
                    <div className="border-t pt-6 mt-6 space-y-4">
                      <motion.a
                        href="/profile"
                        className="text-base font-medium text-foreground/80 hover:text-foreground transition-colors"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: navItems.length * 0.1 }}
                      >
                        Profile
                      </motion.a>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <motion.div
              className={`text-2xl font-bold ${getTextColor()}`}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Link href="/">
                NanoDrip
              </Link>
            </motion.div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                className={`${getTextColorWithOpacity()} transition-colors relative`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
              >
                {item.name}
                <motion.div
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary"
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`relative h-8 w-8 sm:h-10 sm:w-10 ${isHomepage && !scrolled ? 'text-white hover:text-white hover:bg-white/10' : ''}`}
            >
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {theme === 'dark' ? <Sun className="h-3 w-3 sm:h-4 sm:w-4" /> : <Moon className="h-3 w-3 sm:h-4 sm:w-4" />}
              </motion.div>
            </Button>

            {/* Cart and Auth */}
            <div className="flex items-center gap-2">
              {session && session?.user ? (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 sm:h-10 sm:w-10 ${isHomepage && !scrolled ? 'text-white hover:text-white hover:bg-white/10' : ''}`}
                      onClick={openCart}
                    >
                      <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                      {getTotalItems() > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                          {getTotalItems()}
                        </Badge>
                      )}
                    </Button>
                  </motion.div>
                  <CartSidebar />

                  {/* User Dropdown */}
                  <UserDropdown 
                    isHomepage={isHomepage}
                    scrolled={scrolled}
                    getTextColor={getTextColor}
                  />
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/sign-in">
                    <Button
                      variant="ghost"
                      className={`text-sm ${getTextColor()} ${isHomepage && !scrolled ? 'text-white hover:text-white hover:bg-white/10' : ''}`}
                    >
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
