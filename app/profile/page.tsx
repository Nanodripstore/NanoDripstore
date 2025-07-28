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

// Mock user for authentication bypass
const MOCK_USER = { 
  email: "test@example.com",
  name: "Test User",
  image: "https://via.placeholder.com/150" 
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
    // Add timeout to prevent loading flash for fast responses
    const loadingTimeout = setTimeout(() => setLoading(true), 100)
    
    fetchUserData().then(() => {
      clearTimeout(loadingTimeout)
    })
    
    return () => clearTimeout(loadingTimeout)
  }, [session?.user?.email])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      
      // Check for cached data first
      const cacheKey = `userData_${session?.user?.email || MOCK_USER.email}`
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
        const cacheKey = `userData_${session?.user?.email || MOCK_USER.email}`
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

  // Use data from session or mock user
  const displayUser = session?.user || MOCK_USER;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-20">
        <div className="container mx-auto p-6 max-w-6xl">
          {/* Profile content here - omitted for brevity */}
          <h1 className="text-3xl font-bold">Profile</h1>
          <p>Welcome, {displayUser.name}</p>
          <p>Email: {displayUser.email}</p>
          
          {/* Display data from API */}
          {userData && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold">Your Data:</h2>
              <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md mt-2 overflow-auto">
                {JSON.stringify(userData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
