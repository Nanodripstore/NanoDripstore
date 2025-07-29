"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import { User, Package, ShoppingCart, LogOut, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/cart-store'
import Link from 'next/link'

interface UserDropdownProps {
  isHomepage: boolean
  scrolled: boolean
  getTextColor: () => string
}

export default function UserDropdown({ isHomepage, scrolled, getTextColor }: UserDropdownProps) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { getTotalItems } = useCartStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleDropdown = () => setIsOpen(!isOpen)
  const closeDropdown = () => setIsOpen(false)

  if (!session?.user || !mounted) return null

  const menuItems = [
    {
      icon: User,
      label: 'Profile',
      href: '/profile',
      description: 'Manage your account'
    },
    {
      icon: Package,
      label: 'Orders',
      href: '/profile',
      description: 'View order history'
    },
    {
      icon: ShoppingCart,
      label: `Cart (${getTotalItems()})`,
      href: '/cart',
      description: 'View cart items'
    }
  ]

  return (
    <>
      {/* User Button */}
      <div className="relative">
        <Button
          variant="ghost"
          onClick={toggleDropdown}
          className={`flex items-center gap-2 text-sm ${getTextColor()} ${
            isHomepage && !scrolled ? 'text-white hover:text-white hover:bg-white/10' : ''
          } ${isOpen ? 'bg-background/10' : ''}`}
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={session.user.image || undefined} />
            <AvatarFallback className="text-xs">
              {session.user.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:block">{session.user.name || 'User'}</span>
        </Button>
      </div>

      {/* Portal-rendered Sidebar and Backdrop */}
      {isOpen && createPortal(
        <>
          {/* Backdrop */}
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
              onClick={closeDropdown}
            />
          </AnimatePresence>

          {/* Dropdown Sidebar */}
          <AnimatePresence>
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-background border-l shadow-2xl z-[110] overflow-y-auto"
              style={{ 
                height: '100vh', 
                minHeight: '100vh',
                maxHeight: '100vh',
                position: 'fixed',
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: 'auto',
                width: '320px'
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={session.user.image || undefined} />
                    <AvatarFallback>
                      {session.user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{session.user.name || 'User'}</h3>
                    <p className="text-sm text-muted-foreground">{session.user.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeDropdown}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Menu Items */}
              <div className="p-4 space-y-2">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={item.href} onClick={closeDropdown}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-auto p-4 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <item.icon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </Button>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Sign Out */}
              <div className="p-4 border-t mt-4">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    variant="ghost"
                    onClick={() => {
                      signOut({callbackUrl: '/'})
                      closeDropdown()
                    }}
                    className="w-full justify-start h-auto p-4 text-left text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-100">
                        <LogOut className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium">Sign Out</div>
                        <div className="text-sm text-muted-foreground">
                          Sign out of your account
                        </div>
                      </div>
                    </div>
                  </Button>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t mt-auto">
                <p className="text-xs text-muted-foreground text-center">
                  NanoDrip Store © 2025
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </>,
        document.body
      )}
    </>
  )
}
