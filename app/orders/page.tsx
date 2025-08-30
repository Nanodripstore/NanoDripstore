"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Package, RefreshCw, ArrowLeft, Calendar, MapPin } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrders } from '@/hooks/use-orders';

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { orders, loading, error, refetch } = useOrders();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Redirect if not authenticated
    if (mounted && status === 'unauthenticated') {
      router.push('/sign-in?callbackUrl=/orders');
    }
  }, [mounted, status, router]);

  // Helper function to format order status
  const getStatusBadgeVariant = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('delivered') || statusLower.includes('completed')) {
      return 'default';
    } else if (statusLower.includes('shipped') || statusLower.includes('dispatch')) {
      return 'secondary';
    } else if (statusLower.includes('processing') || statusLower.includes('pending')) {
      return 'outline';
    } else if (statusLower.includes('cancelled')) {
      return 'destructive';
    }
    return 'outline';
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">My Orders</h1>
              <p className="text-muted-foreground">View and manage your orders</p>
            </div>
            <Button
              variant="outline"
              onClick={refetch}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Orders Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {loading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Loading orders...</span>
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Failed to load orders</h3>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button onClick={refetch}>
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                  <p className="text-muted-foreground mb-4">Your orders will appear here once you make a purchase</p>
                  <Button onClick={() => router.push('/shop')}>
                    Start Shopping
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <Card key={order.id || order.order_number}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{order.order_number}</CardTitle>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(order.created_at)}
                            </div>
                            <Badge variant={getStatusBadgeVariant(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">₹{order.total_order_value}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.line_items?.length || 0} items
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Shipping Address */}
                      {order.shipping_address && (
                        <div className="bg-muted/50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4" />
                            <h4 className="font-medium">Shipping Address</h4>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p className="font-medium text-foreground">
                              {order.shipping_address.first_name} {order.shipping_address.last_name}
                            </p>
                            <p>{order.shipping_address.address1}</p>
                            <p>
                              {order.shipping_address.city}, {order.shipping_address.zip}
                            </p>
                            {order.shipping_address.phone && (
                              <p>Phone: {order.shipping_address.phone}</p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Order Items */}
                      {order.line_items && order.line_items.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-4">Order Items</h4>
                          <div className="space-y-4">
                            {order.line_items.map((item, index) => (
                              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                                {item.designs?.[0]?.mockup_link && (
                                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                                    <img
                                      src={item.designs[0].mockup_link}
                                      alt="Product"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/placeholder-product.png';
                                      }}
                                    />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <p className="font-medium">Product Design</p>
                                  <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                                  <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">₹{item.price}</p>
                                  <p className="text-sm text-muted-foreground">
                                    ₹{(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)} total
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
