"use client"

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from '@/hooks/use-toast'
import { useWishlistUpdate } from '@/contexts/wishlist-update-context'

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  sku?: string // SKU field for Qikink integration
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
      
      if (response.status === 401) {
        // User is not authenticated, return empty array silently
        setWishlistItems([])
        return []
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch wishlist')
      }
      
      const data = await response.json()
      setWishlistItems(data)
      return data
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      setWishlistItems([])
      // Only show error toast for non-auth errors
      if (error instanceof Error && !error.message.includes('401')) {
        toast({
          title: "Error",
          description: "Failed to load your wishlist",
          variant: "destructive"
        })
      }
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

    // Create optimistic item for immediate UI update
    const optimisticItem = {
      id: `temp-${Date.now()}`,
      productId: parseInt(productId),
      userId: session.user?.id || '',
      products: {
        id: productId,
        name: 'Loading...',
        description: '',
        price: 0,
        imageUrl: ''
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Optimistically add to wishlist for immediate UI feedback
    setWishlistItems(prev => [...prev, optimisticItem])

    try {
      const response = await fetch('/api/user/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId })
      })
      
      if (!response.ok) {
        // Revert optimistic update on error
        setWishlistItems(prev => prev.filter(item => item.id !== optimisticItem.id))
        
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
      
      // Replace optimistic item with real item
      setWishlistItems(prev => prev.map(item => 
        item.id === optimisticItem.id ? addedItem : item
      ))
      
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
      // Remove setLoading(false) since we're not setting loading to true
    }
  }, [session])

  const removeFromWishlist = useCallback(async (wishlistItemId: string) => {
    if (!session) return false
    
    // Store the item for potential restoration
    const itemToRemove = wishlistItems.find(item => item.id === wishlistItemId)
    
    // Optimistically remove from wishlist for immediate UI feedback
    setWishlistItems(prev => prev.filter(item => item.id !== wishlistItemId))
    
    try {
      const response = await fetch(`/api/user/wishlist/${wishlistItemId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        // Restore item on error
        if (itemToRemove) {
          setWishlistItems(prev => [...prev, itemToRemove])
        }
        throw new Error('Failed to remove item from wishlist')
      }
      
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
      // Remove setLoading(false) since we're not setting loading to true
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
