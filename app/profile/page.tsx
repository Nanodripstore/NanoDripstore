"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Address } from '@/hooks/use-addresses'
import { useWishlistUpdate } from '@/contexts/wishlist-update-context'
import { useWishlist } from '@/hooks/use-wishlist'
import { 
  User, 
  MapPin, 
  Package, 
  Edit2, 
  Plus, 
  ShoppingBag, 
  Heart, 
  Calendar,
  Phone,
  Mail,
  Save,
  Loader2,
  Trash2
} from 'lucide-react'
import Header from '@/components/header'
import AddressBook from '@/components/address-book'

// Define interfaces
interface UserData {
  id: string
  name: string | null
  email: string
  phone: string | null
  image: string | null
  createdAt?: string
  addresses: Address[]
  cart: CartItem[]
  cartCount: number
  wishlist: WishlistItem[]
  wishlistCount: number
  orders: Order[]
}

// We'll use the Address type from the hook via component props

interface CartItem {
  id: string
  name: string
  price: number
  color: string
  size: string
  image: string
  quantity: number
}

interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
}

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  createdAt: string
}

// Default empty user state
const emptyUser: UserData = {
  id: '',
  name: '',
  email: '',
  phone: null,
  image: null,
  addresses: [],
  cart: [],
  cartCount: 0,
  wishlist: [],
  wishlistCount: 0,
  orders: []
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const { updateCounter } = useWishlistUpdate()
  const { removeFromWishlist } = useWishlist()
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  })

  const fetchUserData = useCallback(async (forceRefresh = false) => {
    if (status === 'unauthenticated') {
      setLoading(false)
      return
    }
    
    if (status === 'loading') {
      return
    }
    
    try {
      setLoading(true)
      
      const response = await fetch('/api/user/profile', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
        setFormData({
          name: data.name || '',
          phone: data.phone || ''
        })
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.email, status])

  // Initial data fetch
  useEffect(() => {
    fetchUserData()
  }, [session?.user?.email, fetchUserData])

  // Refetch when wishlist is updated (via context)
  useEffect(() => {
    if (updateCounter > 0) {
      console.log('Wishlist update detected, refreshing profile data...')
      fetchUserData(true)
    }
  }, [updateCounter, fetchUserData])

  // Handle tab change with immediate refresh for wishlist
  const handleTabChange = useCallback((newTab: string) => {
    setActiveTab(newTab)
    if (newTab === 'wishlist') {
      console.log('Switching to wishlist tab, refreshing data...')
      fetchUserData(true)
    }
  }, [fetchUserData])

  const handleAddressChange = useCallback(async () => {
    // Refresh data when addresses change
    await fetchUserData(true)
  }, [fetchUserData])

  // Helper to clear cached user data
  const clearUserDataCache = () => {
    if (typeof window !== 'undefined' && session?.user?.email) {
      const cacheKey = `userData_${session.user.email}`
      sessionStorage.removeItem(cacheKey)
    }
  }

  // Handle removing item from wishlist
  const handleRemoveFromWishlist = async (wishlistItemId: string) => {
    try {
      const success = await removeFromWishlist(wishlistItemId)
      if (success) {
        // Refresh the profile data to update the wishlist display
        await fetchUserData(true)
      }
    } catch (error) {
      console.error('Error removing item from wishlist:', error)
    }
  }

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      return
    }
    
    try {
      setUpdating(true)
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        const updatedUser = await response.json()
        
        // Clear cache and refetch to ensure consistency
        clearUserDataCache()
        await fetchUserData(true)
        
        alert('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile')
    } finally {
      setUpdating(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-20">
          <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-8">
              <Skeleton className="h-10 w-64 mb-3" />
              <Skeleton className="h-5 w-96" />
            </div>

            <div>
              <div className="grid w-full grid-cols-4 gap-2 mb-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-lg" />
                ))}
              </div>

              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                  <Skeleton className="h-7 w-48 mb-2" />
                  <Skeleton className="h-4 w-72" />
                </CardHeader>
                <CardContent className="p-8">
                  <div className="flex items-center space-x-6 mb-8">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-3">
                      <Skeleton className="h-8 w-48" />
                      <Skeleton className="h-5 w-64" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="space-y-3">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ))}
                  </div>
                  
                  <Skeleton className="h-12 w-40 mt-8" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Show sign-in prompt for unauthenticated users
  if (status === 'unauthenticated') {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center pt-20">
          <div className="text-center p-8 max-w-md mx-auto">
            <div className="bg-primary/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <User className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Please sign in to view and manage your profile, orders, and wishlist.
            </p>
            <div className="space-y-4">
              <Button 
                onClick={() => router.push('/sign-in')}
                className="w-full py-3 text-lg"
                size="lg"
              >
                Sign In
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/sign-up')}
                className="w-full py-3 text-lg"
                size="lg"
              >
                Create Account
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => router.push('/')}
                className="w-full py-2"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  // TEMPORARILY DISABLED AUTHENTICATION CHECK
  // if (!session) {
  //   return (
  //     <>
  //       <Header />
  //       <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
  //         <div className="text-center p-8">
  //           <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
  //           <h2 className="text-2xl font-semibold mb-2">Sign In Required</h2>
  //           <p className="text-muted-foreground">Please sign in to view your profile</p>
  //         </div>
  //       </div>
  //     </>
  //   )
  // }

  if (!userData) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
          <div className="text-center p-8">
            <Package className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h2 className="text-2xl font-semibold mb-2">Error Loading Profile</h2>
            <p className="text-muted-foreground">Unable to load your profile data</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-20">
        <div className="container mx-auto p-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-4 border-background">
                  <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || 'User'} />
                  <AvatarFallback className="text-2xl">
                    {session?.user?.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold mb-1">My Account</h1>
                  <p className="text-muted-foreground">{session?.user?.email}</p>
                </div>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="profile">
                  <User size={18} className="mr-2" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="addresses">
                  <MapPin size={18} className="mr-2" />
                  <span className="hidden sm:inline">Addresses</span>
                </TabsTrigger>
                <TabsTrigger value="orders">
                  <Package size={18} className="mr-2" />
                  <span className="hidden sm:inline">Orders</span>
                </TabsTrigger>
                <TabsTrigger value="wishlist">
                  <Heart size={18} className="mr-2" />
                  <span className="hidden sm:inline">Wishlist</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details here.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={updateProfile} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Username</Label>
                          <Input
                            id="name"
                            placeholder="Your username"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            placeholder="Your phone number"
                            value={formData.phone || ''}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={userData?.email || ''}
                            disabled
                            readOnly
                          />
                          <p className="text-sm text-muted-foreground">Email cannot be changed</p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" disabled={updating}>
                          {updating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <span>Member Since</span>
                        </div>
                        <span>{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : '-'}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                          <span>Orders</span>
                        </div>
                        <Badge variant="outline">{userData?.orders?.length || 0}</Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Heart className="h-5 w-5 text-muted-foreground" />
                          <span>Wishlist Items</span>
                        </div>
                        <Badge variant="outline">{userData?.wishlistCount || 0}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="addresses" className="mt-6">
                {userData && (
                  <AddressBook 
                    addresses={userData.addresses || []} 
                    onAddressChange={handleAddressChange}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="orders" className="mt-6">
                {userData?.orders && userData.orders.length > 0 ? (
                  <div className="space-y-4">
                    {userData.orders.map((order) => (
                      <Card key={order.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <h3 className="font-medium">Order #{order.orderNumber}</h3>
                              <p className="text-sm text-muted-foreground">
                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="text-sm font-medium">Status</p>
                                <Badge variant={
                                  order.status === 'completed' ? 'default' :
                                  order.status === 'processing' ? 'secondary' :
                                  order.status === 'cancelled' ? 'destructive' : 'outline'
                                }>
                                  {order.status}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Total</p>
                                <p>₹{order.total.toFixed(2)}</p>
                              </div>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 border border-dashed rounded-md">
                    <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="font-medium text-lg mb-2">No Orders Yet</h3>
                    <p className="text-gray-500 mb-4">
                      You haven't placed any orders yet.
                    </p>
                    <Button asChild>
                      <Link href="/shop">Shop Now</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="wishlist" className="mt-6">
                {userData?.wishlist && Array.isArray(userData.wishlist) && userData.wishlist.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {userData.wishlist.map((item, index) => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="relative h-48 w-full mb-4">
                            <Image
                              src={item.image || '/placeholder.png'}
                              alt={item.name}
                              fill
                              className="object-cover rounded-md"
                            />
                            <Button 
                              size="icon" 
                              variant="destructive" 
                              className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-90"
                              onClick={() => handleRemoveFromWishlist(item.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                          <h3 className="font-medium line-clamp-1">{item.name}</h3>
                          <p className="font-medium text-lg mt-1">₹{item.price.toFixed(2)}</p>
                          <Button className="w-full mt-3" size="sm">
                            Add to Cart
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 border border-dashed rounded-md">
                    <Heart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="font-medium text-lg mb-2">Your Wishlist is Empty</h3>
                    <p className="text-gray-500 mb-4">
                      Save items you love to your wishlist.
                    </p>
                    <Button asChild>
                      <Link href="/shop">Continue Shopping</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </>
  )
}
