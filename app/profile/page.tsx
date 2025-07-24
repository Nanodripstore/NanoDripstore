"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  MapPin, 
  Package, 
  Activity, 
  Edit2, 
  Plus, 
  ShoppingBag, 
  Heart, 
  Calendar,
  Phone,
  Mail,
  Save,
  Loader2
} from 'lucide-react'
import Header from '@/components/header'

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

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  })

  useEffect(() => {
    if (session?.user?.email) {
      // Add timeout to prevent loading flash for fast responses
      const loadingTimeout = setTimeout(() => setLoading(true), 100)
      
      fetchUserData().then(() => {
        clearTimeout(loadingTimeout)
      })
      
      return () => clearTimeout(loadingTimeout)
    }
  }, [session])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      
      // Check for cached data first
      const cacheKey = `userData_${session?.user?.email}`
      const cached = sessionStorage.getItem(cacheKey)
      
      if (cached) {
        const cachedData = JSON.parse(cached)
        // Use cached data if it's less than 5 minutes old
        if (Date.now() - cachedData.timestamp < 5 * 60 * 1000) {
          setUserData(cachedData.data)
          setFormData({
            name: cachedData.data.name || '',
            phone: cachedData.data.phone || ''
          })
          setLoading(false)
          return
        }
      }
      
      const response = await fetch('/api/user', {
        cache: 'no-store'
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
        setFormData({
          name: data.name || '',
          phone: data.phone || ''
        })
        
        // Cache the data
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data,
          timestamp: Date.now()
        }))
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)

    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUserData(prev => prev ? { ...prev, ...updatedUser } : null)
        
        // Clear cache after update
        const cacheKey = `userData_${session?.user?.email}`
        sessionStorage.removeItem(cacheKey)
        
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
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Skeleton className="h-10 w-64 mb-3" />
              <Skeleton className="h-5 w-96" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
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
            </motion.div>
          </div>
        </div>
      </>
    )
  }

  if (!session) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8"
          >
            <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground">Please sign in to view your profile</p>
          </motion.div>
        </div>
      </>
    )
  }

  if (!userData) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8"
          >
            <Package className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h2 className="text-2xl font-semibold mb-2">Error Loading Profile</h2>
            <p className="text-muted-foreground">Unable to load your profile data</p>
          </motion.div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-20">
        <div className="container mx-auto p-6 max-w-6xl">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  My Profile
                </h1>
                <p className="text-lg text-muted-foreground">Manage your account and preferences</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                    <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {userData.cart.reduce((total, item) => total + item.quantity, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Cart Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
                    <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{userData.wishlistCount || 0}</p>
                    <p className="text-sm text-muted-foreground">Wishlist</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                    <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{userData.orders.length}</p>
                    <p className="text-sm text-muted-foreground">Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
                    <MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{userData.addresses.length}</p>
                    <p className="text-sm text-muted-foreground">Addresses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 h-14 bg-muted/50 backdrop-blur-sm">
                <TabsTrigger value="profile" className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="addresses" className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Addresses</span>
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Orders</span>
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Activity</span>
                </TabsTrigger>
              </TabsList>

        <TabsContent value="profile">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Profile Information</CardTitle>
                      <CardDescription>Update your personal details and contact information</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {/* Profile Header */}
                  <div className="flex items-center gap-8 mb-8 p-6 rounded-2xl bg-gradient-to-r from-muted/30 to-muted/10">
                    <div className="relative">
                      <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
                        <AvatarImage src={userData.image || undefined} />
                        <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-primary to-secondary text-white">
                          {userData.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-background shadow-lg border">
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{userData.name || 'No name set'}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Mail className="h-4 w-4" />
                        <span>{userData.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Member since {new Date(userData.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-8" />

                  {/* Profile Form */}
                  <form onSubmit={updateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-2 font-medium">
                          <User className="h-4 w-4" />
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter your full name"
                          className="h-12 bg-muted/30 border-muted focus:border-primary transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2 font-medium">
                          <Phone className="h-4 w-4" />
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter your phone number"
                          className="h-12 bg-muted/30 border-muted focus:border-primary transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <Button 
                        type="submit" 
                        disabled={updating}
                        className="h-12 px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                      >
                        {updating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Update Profile
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="addresses">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                        <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Shipping Addresses</CardTitle>
                        <CardDescription>Manage your delivery addresses for faster checkout</CardDescription>
                      </div>
                    </div>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Address
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {userData.addresses.length === 0 ? (
                    <div className="text-center py-12">
                      <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="text-lg font-semibold mb-2">No addresses saved</h3>
                      <p className="text-muted-foreground mb-6">Add your first shipping address to speed up checkout</p>
                      <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Address
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {userData.addresses.map((address, index) => (
                        <motion.div
                          key={address.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative group"
                        >
                          <Card className="h-full hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                                    <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-lg">{address.name}</h4>
                                    {address.isDefault && (
                                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                        Default
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="space-y-2 text-sm text-muted-foreground">
                                <p>{address.street}</p>
                                <p>{address.city}, {address.state} {address.zipCode}</p>
                                <p className="font-medium">{address.country}</p>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="orders">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-b">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                      <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Order History</CardTitle>
                      <CardDescription>Track your purchases and order status</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {userData.orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                      <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
                      <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90">
                        Start Shopping
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userData.orders.map((order, index) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                  <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                                    <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-lg mb-1">Order #{order.orderNumber}</h4>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(order.createdAt).toLocaleDateString()}
                                      </div>
                                      <Badge 
                                        variant={order.status === 'DELIVERED' ? 'default' : 'secondary'}
                                        className={
                                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                                          order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' :
                                          order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' :
                                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
                                        }
                                      >
                                        {order.status}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    ${order.total.toFixed(2)}
                                  </p>
                                  <Button variant="outline" size="sm" className="mt-2">
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="activity">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border-b">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                      <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Account Activity</CardTitle>
                      <CardDescription>Overview of your recent shopping activity</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  {/* Enhanced Activity Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Card className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                        <div className="p-4 rounded-full bg-blue-500 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                          {userData.cart.reduce((total, item) => total + item.quantity, 0)}
                        </h3>
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Items in Cart</p>
                        <p className="text-xs text-muted-foreground mt-1">Ready for checkout</p>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
                        <div className="p-4 rounded-full bg-red-500 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <Heart className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                          {userData.wishlistCount || 0}
                        </h3>
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">Wishlist Items</p>
                        <p className="text-xs text-muted-foreground mt-1">Saved for later</p>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Card className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                        <div className="p-4 rounded-full bg-green-500 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <Package className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                          {userData.orders.length}
                        </h3>
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Orders</p>
                        <p className="text-xs text-muted-foreground mt-1">All time purchases</p>
                      </Card>
                    </motion.div>
                  </div>

                  <Separator className="my-8" />

                  {/* Recent Cart Items */}
                  {userData.cart.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" />
                        Recent Cart Items
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userData.cart.slice(0, 3).map((item, index) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className="p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{item.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {item.quantity}x ${item.price}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </motion.div>
        </div>
      </div>
    </>
  )
}
