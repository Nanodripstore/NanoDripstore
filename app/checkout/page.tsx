"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { useCartStore } from '@/lib/cart-store'
import { 
  Loader2, 
  CreditCard, 
  CheckCircle2,
  ArrowLeft,
  ChevronRight
} from 'lucide-react'
import Header from '@/components/header'

interface Address {
  id: string
  name: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const { items, getTotalPrice } = useCartStore()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [loading, setLoading] = useState(true)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const { toast } = useToast()

  const subtotal = getTotalPrice()
  const shippingFee = 0 // Free shipping
  const tax = subtotal * 0.07 // 7% tax
  const total = subtotal + shippingFee + tax

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAddresses()
    } else {
      setLoading(false)
    }
  }, [status])

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/user/address')
      
      if (response.ok) {
        const data = await response.json()
        setAddresses(data)
        
        // Select default address if available
        const defaultAddress = data.find((addr: Address) => addr.isDefault)
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id)
        } else if (data.length > 0) {
          setSelectedAddressId(data[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast({
        title: "Address Required",
        description: "Please select a shipping address",
        variant: "destructive"
      })
      return
    }

    if (items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty",
        variant: "destructive"
      })
      return
    }

    try {
      setPlacingOrder(true)
      
      // Here you would normally make an API call to create the order
      // For demo purposes, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Set order complete state
      setOrderComplete(true)
      
      // Clear cart after successful order
      // useCartStore.getState().clearCart()
    } catch (error) {
      console.error('Error placing order:', error)
      toast({
        title: "Error",
        description: "Failed to place your order. Please try again.",
        variant: "destructive"
      })
    } finally {
      setPlacingOrder(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header />
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg">Loading checkout...</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header />
        <div className="flex flex-col items-center justify-center py-16">
          <h1 className="text-2xl font-bold mb-4">Sign in to checkout</h1>
          <p className="text-muted-foreground mb-6">You need to be signed in to complete your purchase</p>
          <Button asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header />
        <div className="flex flex-col items-center justify-center py-16">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some products to your cart before checking out</p>
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header />
        <div className="max-w-2xl mx-auto mt-10">
          <Card className="border-green-200">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Order Successful!</h2>
              <p className="text-gray-600 mb-6">
                Thank you for your purchase. We've received your order and will process it shortly.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-md text-left mb-6">
                <p className="font-medium mb-2">Order Summary</p>
                <p className="text-sm text-gray-600">Order Number: #{Math.floor(100000 + Math.random() * 900000)}</p>
                <p className="text-sm text-gray-600">Total: ${total.toFixed(2)}</p>
              </div>
              
              <div className="flex gap-4">
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/profile">
                    View Orders
                  </Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/shop">
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
        <p className="text-muted-foreground">Complete your order</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
              <CardDescription>Select where you want your order to be delivered</CardDescription>
            </CardHeader>
            <CardContent>
              {addresses.length > 0 ? (
                <RadioGroup 
                  value={selectedAddressId} 
                  onValueChange={setSelectedAddressId}
                  className="space-y-4"
                >
                  {addresses.map((address) => (
                    <div key={address.id} className="flex items-start space-x-3">
                      <RadioGroupItem value={address.id} id={`address-${address.id}`} className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor={`address-${address.id}`} className="flex items-center">
                          <span className="font-medium">{address.name}</span>
                          {address.isDefault && (
                            <span className="ml-2 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                              Default
                            </span>
                          )}
                        </Label>
                        <div className="text-sm text-muted-foreground mt-1">
                          <p>{address.street}</p>
                          <p>{address.city}, {address.state} {address.zipCode}</p>
                          <p>{address.country}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">You don't have any saved addresses</p>
                  <Link href="/profile?tab=addresses">
                    <Button variant="outline">
                      Add New Address
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Select how you want to pay</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs 
                value={paymentMethod} 
                onValueChange={setPaymentMethod} 
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="card">Credit/Debit Card</TabsTrigger>
                  <TabsTrigger value="paypal">PayPal</TabsTrigger>
                </TabsList>
                
                <TabsContent value="card" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="card-name">Cardholder Name</Label>
                    <Input id="card-name" placeholder="John Doe" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input id="card-number" placeholder="1234 5678 9012 3456" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="save-card" />
                    <Label htmlFor="save-card">Save this card for future purchases</Label>
                  </div>
                </TabsContent>
                
                <TabsContent value="paypal" className="mt-4">
                  <div className="p-6 text-center">
                    <p className="mb-4">
                      You will be redirected to PayPal to complete your purchase securely.
                    </p>
                    <Button className="w-full" size="lg">
                      Continue with PayPal
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items List */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={`${item.id}-${item.color}-${item.size}`} className="flex items-center space-x-3">
                    <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.color}, {item.size} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              {/* Totals */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-sm">Subtotal</span>
                  <span className="text-sm">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Shipping</span>
                  <span className="text-sm">${shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tax (7%)</span>
                  <span className="text-sm">${tax.toFixed(2)}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button 
                onClick={handlePlaceOrder}
                className="w-full" 
                size="lg"
                disabled={placingOrder || !selectedAddressId}
              >
                {placingOrder ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Place Order
                  </>
                )}
              </Button>
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link href="/cart">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Cart
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
