"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface WishlistUpdateContextType {
  triggerUpdate: () => void
  updateCounter: number
}

const WishlistUpdateContext = createContext<WishlistUpdateContextType | undefined>(undefined)

export function WishlistUpdateProvider({ children }: { children: ReactNode }) {
  const [updateCounter, setUpdateCounter] = useState(0)

  const triggerUpdate = () => {
    setUpdateCounter(prev => prev + 1)
    // Also update localStorage to trigger storage events in other components
    localStorage.setItem('wishlistUpdateTrigger', Date.now().toString())
  }

  // Listen for storage changes from other tabs/components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'wishlistUpdateTrigger') {
        setUpdateCounter(prev => prev + 1)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return (
    <WishlistUpdateContext.Provider value={{ triggerUpdate, updateCounter }}>
      {children}
    </WishlistUpdateContext.Provider>
  )
}

export function useWishlistUpdate() {
  const context = useContext(WishlistUpdateContext)
  if (context === undefined) {
    throw new Error('useWishlistUpdate must be used within a WishlistUpdateProvider')
  }
  return context
}
