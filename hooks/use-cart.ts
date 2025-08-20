"use client"

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from '@/hooks/use-toast'

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  stock: number
}

export interface CartItem {
  id: string
  productId: string
  quantity: number
  size?: string
  color?: string
  userId: string
  product: Product
  createdAt: string
  updatedAt: string
}

export interface CartData {
  items: CartItem[]
  subtotal: number
  count: number
}

export function useCart() {
  const [loading, setLoading] = useState(false)
  const [cartData, setCartData] = useState<CartData | null>(null)
  const { data: session } = useSession()

  const fetchCart = useCallback(async () => {
    if (!session) return null
    
    try {
      setLoading(true)
      const response = await fetch('/api/user/cart')
      
      if (response.status === 401) {
        // User is not authenticated, return null silently
        setCartData(null)
        return null
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart')
      }
      
      const data = await response.json()
      setCartData(data)
      return data
    } catch (error) {
      console.error('Error fetching cart:', error)
      setCartData(null)
      // Only show error toast for non-auth errors
      if (error instanceof Error && !error.message.includes('401')) {
        toast({
          title: "Error",
          description: "Failed to load your cart",
          variant: "destructive"
        })
      }
      return null
    } finally {
      setLoading(false)
    }
  }, [session])

  const addToCart = useCallback(async (
    productId: string, 
    quantity: number = 1, 
    options?: { size?: string, color?: string }
  ) => {
    if (!session) {
      toast({
        title: "Not signed in",
        description: "Please sign in to add items to your cart",
        variant: "destructive"
      })
      return null
    }
    
    try {
      setLoading(true)
      
      const response = await fetch('/api/user/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          quantity,
          ...options
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        
        if (errorData.availableStock !== undefined) {
          toast({
            title: "Limited Stock",
            description: `Only ${errorData.availableStock} items available`,
            variant: "destructive"
          })
        } else {
          toast({
            title: "Error",
            description: errorData.error || "Failed to add item to cart",
            variant: "destructive"
          })
        }
        
        return null
      }
      
      const addedItem = await response.json()
      
      toast({
        title: "Added to cart",
        description: `${addedItem.product.name} added to your cart`
      })
      
      // Refresh cart data
      await fetchCart()
      
      return addedItem
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [session, fetchCart])

  const updateCartItem = useCallback(async (
    cartItemId: string, 
    quantity: number
  ) => {
    if (!session) return null
    
    try {
      setLoading(true)
      
      const response = await fetch(`/api/user/cart/${cartItemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        
        if (errorData.availableStock !== undefined) {
          toast({
            title: "Limited Stock",
            description: `Only ${errorData.availableStock} items available`,
            variant: "destructive"
          })
        } else {
          toast({
            title: "Error",
            description: errorData.error || "Failed to update cart item",
            variant: "destructive"
          })
        }
        
        return null
      }
      
      const updatedItem = await response.json()
      
      // Update cart data locally
      if (cartData) {
        const updatedItems = cartData.items.map(item => 
          item.id === cartItemId ? updatedItem : item
        )
        
        const newSubtotal = updatedItems.reduce((sum, item) => 
          sum + (item.product.price * item.quantity), 0
        )
        
        setCartData({
          ...cartData,
          items: updatedItems,
          subtotal: newSubtotal
        })
      }
      
      return updatedItem
    } catch (error) {
      console.error('Error updating cart item:', error)
      toast({
        title: "Error",
        description: "Failed to update cart item",
        variant: "destructive"
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [session, cartData])

  const removeCartItem = useCallback(async (cartItemId: string) => {
    if (!session) return false
    
    try {
      setLoading(true)
      
      const response = await fetch(`/api/user/cart/${cartItemId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to remove item from cart')
      }
      
      // Update cart data locally
      if (cartData) {
        const updatedItems = cartData.items.filter(item => item.id !== cartItemId)
        
        const newSubtotal = updatedItems.reduce((sum, item) => 
          sum + (item.product.price * item.quantity), 0
        )
        
        setCartData({
          items: updatedItems,
          subtotal: newSubtotal,
          count: updatedItems.length
        })
      }
      
      toast({
        title: "Item removed",
        description: "Item removed from cart"
      })
      
      return true
    } catch (error) {
      console.error('Error removing cart item:', error)
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [session, cartData])

  const clearCart = useCallback(async () => {
    if (!session) return false
    
    try {
      setLoading(true)
      
      const response = await fetch('/api/user/cart', {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to clear cart')
      }
      
      setCartData({
        items: [],
        subtotal: 0,
        count: 0
      })
      
      toast({
        title: "Cart cleared",
        description: "Your cart has been cleared"
      })
      
      return true
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast({
        title: "Error",
        description: "Failed to clear your cart",
        variant: "destructive"
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [session])

  return {
    cart: cartData,
    loading,
    fetchCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
  }
}
