"use client"

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from '@/components/ui/use-toast'
import { useWishlistUpdate } from '@/contexts/wishlist-update-context'

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string
}

export interface WishlistItem {
  id: string
  productId: number
  userId: string
  products: Product
  createdAt: string
  updatedAt: string
}

export function useWishlist() {
  const [loading, setLoading] = useState(false)
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const { data: session } = useSession()
  const { triggerUpdate } = useWishlistUpdate()

  const fetchWishlist = useCallback(async () => {
    if (!session) return []
    
    try {
      setLoading(true)
      const response = await fetch('/api/user/wishlist')
      
      if (!response.ok) {
        throw new Error('Failed to fetch wishlist')
      }
      
      const data = await response.json()
      setWishlistItems(data)
      return data
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      toast({
        title: "Error",
        description: "Failed to load your wishlist",
        variant: "destructive"
      })
      return []
    } finally {
      setLoading(false)
    }
  }, [session])

  const addToWishlist = useCallback(async (productId: string) => {
    if (!session) {
      toast({
        title: "Not signed in",
        description: "Please sign in to add items to your wishlist",
        variant: "destructive"
      })
      return null
    }

    try {
      setLoading(true)
      
      const response = await fetch('/api/user/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        
        if (response.status === 409) {
          toast({
            title: "Already in wishlist",
            description: "This item is already in your wishlist"
          })
          return null
        }
        
        toast({
          title: "Error",
          description: errorData.error || "Failed to add item to wishlist",
          variant: "destructive"
        })
        
        return null
      }
      
      const addedItem = await response.json()
      
      setWishlistItems(prev => [...prev, addedItem])
      
      // Trigger update for other components (like profile page)
      triggerUpdate()
      
      // Dispatch custom event to notify other components
      const event = new CustomEvent('wishlistChanged', { 
        detail: { action: 'added', item: addedItem } 
      })
      console.log('Dispatching wishlistChanged event (added):', event.detail)
      window.dispatchEvent(event)
      
      // Also trigger a storage event for cross-tab communication
      if (typeof window !== 'undefined') {
        localStorage.setItem('wishlistLastUpdate', Date.now().toString())
        setTimeout(() => localStorage.removeItem('wishlistLastUpdate'), 100)
      }
      
      toast({
        title: "Added to wishlist",
        description: `${addedItem.products.name} added to your wishlist`
      })
      
      return addedItem
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      toast({
        title: "Error",
        description: "Failed to add item to wishlist",
        variant: "destructive"
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [session])

  const removeFromWishlist = useCallback(async (wishlistItemId: string) => {
    if (!session) return false
    
    try {
      setLoading(true)
      
      const response = await fetch(`/api/user/wishlist/${wishlistItemId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to remove item from wishlist')
      }
      
      setWishlistItems(prev => prev.filter(item => item.id !== wishlistItemId))
      
      // Trigger update for other components (like profile page)
      triggerUpdate()
      
      // Dispatch custom event to notify other components
      const event = new CustomEvent('wishlistChanged', { 
        detail: { action: 'removed', itemId: wishlistItemId } 
      })
      console.log('Dispatching wishlistChanged event (removed):', event.detail)
      window.dispatchEvent(event)
      
      // Also trigger a storage event for cross-tab communication
      if (typeof window !== 'undefined') {
        localStorage.setItem('wishlistLastUpdate', Date.now().toString())
        setTimeout(() => localStorage.removeItem('wishlistLastUpdate'), 100)
      }
      
      toast({
        title: "Removed from wishlist",
        description: "Item removed from your wishlist"
      })
      
      return true
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist",
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [session])

  const isInWishlist = useCallback((productId: string) => {
    return wishlistItems.some(item => item.productId.toString() === productId)
  }, [wishlistItems])

  const getWishlistItemId = useCallback((productId: string) => {
    const item = wishlistItems.find(item => item.productId.toString() === productId)
    return item?.id || null
  }, [wishlistItems])

  const removeFromWishlistByProductId = useCallback(async (productId: string) => {
    const wishlistItemId = getWishlistItemId(productId)
    if (!wishlistItemId) {
      toast({
        title: "Error",
        description: "Item not found in wishlist",
        variant: "destructive"
      })
      return false
    }
    return await removeFromWishlist(wishlistItemId)
  }, [getWishlistItemId, removeFromWishlist])

  return {
    wishlist: wishlistItems,
    loading,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    removeFromWishlistByProductId,
    isInWishlist
  }
}
