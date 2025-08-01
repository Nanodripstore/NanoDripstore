"use client"

import { motion } from 'framer-motion'
import { useCartStore } from '@/lib/cart-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { useEffect } from 'react'

export default function CartPage() {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    getTotalPrice, 
    getTotalItems,
    clearCart,
    forceRefresh,
    currentUserId
  } = useCartStore()

  // Force refresh cart when page loads
  useEffect(() => {
    if (currentUserId) {
      forceRefresh()
    }
  }, [currentUserId, forceRefresh])

  const total = getTotalPrice()
  const itemCount = getTotalItems()

  if (items.length === 0) {
    return (
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen bg-background"
      >
        <Header />
        <div className="container mx-auto px-4 py-24">
          <motion.div 
            className="text-center max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground mb-6" />
            </motion.div>
            <h1 className="text-4xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8 text-lg">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/shop">
              <Button size="lg" className="px-8">
                Continue Shopping
              </Button>
            </Link>
          </motion.div>
        </div>
        <Footer />
      </motion.main>
    )
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-background"
    >
      <Header />
      <div className="container mx-auto px-4 py-20">
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold">Shopping Cart</h1>
          <div className="text-sm text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Cart Items */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {items.map((item, index) => (
              <motion.div
                key={`${item.id}-${item.color}-${item.size}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="relative h-20 w-20 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="text-lg font-semibold text-foreground">
                          {item.name}
                        </h3>
                        <div className="text-sm text-muted-foreground">
                          <p>Color: <span className="font-medium">{item.color}</span></p>
                          <p>Size: <span className="font-medium">{item.size}</span></p>
                          <p>Type: <span className="font-medium">{item.type}</span></p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto sm:flex-col sm:items-end gap-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-8 w-8"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity + 1)}
                            className="h-8 w-8"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id, item.color, item.size)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Order Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="max-w-md ml-auto">
              <CardHeader>
                <CardTitle className="text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({itemCount} items)</span>
                    <span className="font-semibold">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-green-600 font-semibold">Free</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Link href="/checkout" className="block">
                    <Button className="w-full" size="lg">
                      Proceed to Checkout
                    </Button>
                  </Link>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={clearCart}
                    >
                      Clear Cart
                    </Button>
                    <Link href="/shop">
                      <Button variant="ghost" className="w-full">
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </motion.main>
  )
}