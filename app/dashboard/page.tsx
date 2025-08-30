"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Heart, 
  Package, 
  Settings, 
  User, 
  CreditCard, 
  MapPin, 
  Bell,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCartStore } from '@/lib/cart-store';
import { useOrders } from '@/hooks/use-orders';
import { toast } from 'sonner';
import Image from 'next/image';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, getTotalItems, getTotalPrice } = useCartStore();
  const { orders, loading: ordersLoading, error: ordersError, refetch: refetchOrders } = useOrders();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Redirect if not authenticated
    if (mounted && status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [mounted, status, router]);

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Use NextAuth session data
  const userData = session?.user ? { 
    name: session.user.name || 'User', 
    email: session.user.email || 'No email',
    image: session.user.image || 'https://via.placeholder.com/150'
  } : { 
    name: "Guest User", 
    email: "Not signed in", 
    image: "https://via.placeholder.com/150" 
  };

  const wishlistItems = [
    {
      id: 1,
      name: 'Premium Oversized Hoodie',
      price: 99.99,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    },
    {
      id: 2,
      name: 'Vintage Washed Hoodie',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=400&h=400&fit=crop',
    },
  ];

  // Helper function to format order status
  const getStatusBadgeVariant = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('delivered') || statusLower.includes('completed')) {
      return 'default';
    } else if (statusLower.includes('shipped') || statusLower.includes('dispatch')) {
      return 'secondary';
    } else if (statusLower.includes('processing') || statusLower.includes('pending')) {
      return 'outline';
    }
    return 'outline';
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-background"
    >
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {userData.name?.split(' ')[0]}!
              </h1>
              <p className="text-muted-foreground">
                Manage your orders, wishlist, and account settings
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cart Items</p>
                  <p className="text-2xl font-bold">{getTotalItems()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wishlist</p>
                  <p className="text-2xl font-bold">{wishlistItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cart Value</p>
                  <p className="text-2xl font-bold">₹{getTotalPrice().toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="cart">Cart</TabsTrigger>
              <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Order History
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refetchOrders}
                      disabled={ordersLoading}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${ordersLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-2">Loading orders...</span>
                    </div>
                  ) : ordersError ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">Failed to load orders</p>
                      <p className="text-sm text-red-500">{ordersError}</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={refetchOrders}
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">No orders found</p>
                      <p className="text-sm text-muted-foreground">Your orders will appear here once you make a purchase</p>
                      <Button className="mt-4" onClick={() => router.push('/shop')}>
                        Start Shopping
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id || order.order_number} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="font-semibold">{order.order_number}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(order.created_at)}
                                </p>
                              </div>
                              <Badge variant={getStatusBadgeVariant(order.status)}>
                                {order.status}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">₹{order.total_order_value}</p>
                              <p className="text-sm text-muted-foreground">
                                {order.line_items?.length || 0} items
                              </p>
                            </div>
                          </div>
                          
                          {/* Shipping Address */}
                          {order.shipping_address && (
                            <div className="text-sm text-muted-foreground border-t pt-2">
                              <p className="font-medium">Shipping to:</p>
                              <p>
                                {order.shipping_address.first_name} {order.shipping_address.last_name}
                              </p>
                              <p>{order.shipping_address.address1}</p>
                              <p>
                                {order.shipping_address.city}, {order.shipping_address.zip}
                              </p>
                            </div>
                          )}
                          
                          {/* Order Items */}
                          {order.line_items && order.line_items.length > 0 && (
                            <div className="border-t pt-2">
                              <p className="text-sm font-medium mb-2">Items:</p>
                              <div className="space-y-2">
                                {order.line_items.map((item, index) => (
                                  <div key={index} className="flex items-center gap-3 text-sm">
                                    {item.designs?.[0]?.mockup_link && (
                                      <img
                                        src={item.designs[0].mockup_link}
                                        alt="Product"
                                        className="w-10 h-10 object-cover rounded"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                    )}
                                    <div className="flex-1">
                                      <p className="text-muted-foreground">
                                        SKU: {item.sku} • Qty: {item.quantity}
                                      </p>
                                      <p className="font-medium">₹{item.price}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cart Tab */}
            <TabsContent value="cart" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Shopping Cart ({getTotalItems()} items)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Your cart is empty</p>
                      <Button className="mt-4" onClick={() => router.push('/shop')}>
                        Start Shopping
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={`${item.id}-${item.color}-${item.size}`} className="flex items-center gap-4 p-4 border rounded-lg">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">No image</span>
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {item.color} • {item.size}
                            </p>
                          </div>
                          <p className="font-semibold">₹{item.price}</p>
                        </div>
                      ))}
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">Total: ₹{getTotalPrice().toFixed(2)}</span>
                          <Button>Proceed to Checkout</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wishlist Tab */}
            <TabsContent value="wishlist" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Wishlist ({wishlistItems.length} items)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlistItems.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-48 object-cover rounded mb-4"
                          />
                        ) : (
                          <div className="w-full h-48 bg-muted rounded mb-4 flex items-center justify-center">
                            <span className="text-sm text-muted-foreground">No image</span>
                          </div>
                        )}
                        <h3 className="font-semibold mb-2">{item.name}</h3>
                        <p className="text-lg font-bold mb-4">₹{item.price}</p>
                        <Button className="w-full">Add to Cart</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={userData.image || '/default-avatar.png'}
                      alt={userData.name || 'User'}
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <h3 className="text-lg font-semibold">{userData.name}</h3>
                      <p className="text-muted-foreground">{userData.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Full Name</label>
                      <p className="mt-1 p-2 border rounded">{userData.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <p className="mt-1 p-2 border rounded">{userData.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <p className="mt-1 p-2 border rounded">+1 (555) 123-4567</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Member Since</label>
                      <p className="mt-1 p-2 border rounded">January 2024</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Addresses
                    </h4>
                    <div className="p-4 border rounded-lg">
                      <p className="font-medium">Default Shipping Address</p>
                      <p className="text-sm text-muted-foreground">
                        123 Main Street<br />
                        New York, NY 10001<br />
                        United States
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Notifications
                    </h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">Order updates</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span className="text-sm">New product announcements</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" />
                        <span className="text-sm">Marketing emails</span>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <Footer />
    </motion.main>
  );
}
