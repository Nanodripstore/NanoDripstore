"use client"

import { useCartStore } from '@/lib/cart-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function CartPage() {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    getTotalPrice, 
    getTotalItems,
    clearCart 
  } = useCartStore()

  const total = getTotalPrice()
  const itemCount = getTotalItems()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-24 w-24 text-gray-300 mb-4" />
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link href="/shop">
            <Button size="lg">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <div className="text-sm text-gray-600">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={`${item.id}-${item.color}-${item.size}`}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="relative h-20 w-20 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {item.name}
                    </h3>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Color: {item.color}</p>
                      <p>Size: {item.size}</p>
                      <p>Type: {item.type}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id, item.color, item.size)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({itemCount} items)</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-medium">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button className="w-full" size="lg">
                  Proceed to Checkout
                </Button>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
