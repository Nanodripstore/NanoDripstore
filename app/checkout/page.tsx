"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, MapPin, User, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/lib/cart-store';
import { products } from '@/lib/products';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { SimpleProxiedImage } from '@/components/simple-proxied-image';

export default function Checkout() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, getTotalPrice, clearCart, removeItem, forceRefresh } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [directOrderProduct, setDirectOrderProduct] = useState<any>(null);
  const urlParamsProcessed = useRef(false);
  const [cartLoaded, setCartLoaded] = useState(false);

  const [formData, setFormData] = useState({
    email: session?.user?.email || '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });

  useEffect(() => {
    if (!session) {
      router.push('/sign-in?callbackUrl=/checkout');
      return;
    }

    // Force refresh cart when checkout page loads to ensure latest data
    const refreshCart = async () => {
      console.log('Checkout page: Force refreshing cart...');
      await forceRefresh();
      setCartLoaded(true);
      console.log('Checkout page: Cart refreshed, items:', items);
    };
    
    refreshCart();

    // Process URL params only once
    if (!urlParamsProcessed.current) {
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get('product');
      const productName = urlParams.get('name');
      const productPrice = urlParams.get('price');
      const productSku = urlParams.get('sku');
      const productImage = urlParams.get('image');
      const productColor = urlParams.get('color');
      const productSize = urlParams.get('size');

      if (productId && productName && productPrice && productSku) {
        setDirectOrderProduct({
          id: productId,
          name: decodeURIComponent(productName),
          price: parseFloat(productPrice),
          sku: productSku,
          image: productImage ? decodeURIComponent(productImage) : null,
          color: productColor ? decodeURIComponent(productColor) : 'Default',
          size: productSize ? decodeURIComponent(productSize) : 'S'
        });
      }
      urlParamsProcessed.current = true;
    }

    // Don't redirect to cart if order was just completed or if it's a direct order
    if (items.length === 0 && !orderCompleted && !directOrderProduct && cartLoaded) {
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get('product');
      if (!productId) {
        router.push('/cart');
      }
    }
  }, [session, items.length, router, orderCompleted, directOrderProduct, forceRefresh, cartLoaded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (directOrderProduct) {
        // Direct order format for single product
        const orderPayload = {
          "order_number": `${Date.now()}`,
          "qikink_shipping": "1",
          "gateway": "COD",
          "total_order_value": directOrderProduct.price.toString(),
          "line_items": [{
            "search_from_my_products": 1,
            "quantity": "1",
            "price": directOrderProduct.price.toString(),
            "sku": directOrderProduct.sku
          }],
          "shipping_address": {
            "first_name": formData.firstName,
            "last_name": formData.lastName,
            "address1": formData.address,
            "phone": formData.phone,
            "email": formData.email,
            "city": formData.city,
            "zip": formData.zipCode,
            "province": "State", // You may want to add state field to form
            "country_code": "IN"
          }
        };

        console.log('Creating Qikink order with payload:', orderPayload);

        // Call the Qikink API through our backend
        const response = await fetch('/api/qikink/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderPayload }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to create order');
        }

        console.log('Qikink order created successfully:', result);

        // Save order to local database for backup/tracking
        try {
          await fetch('/api/user/orders/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              qikinkOrderData: {
                order_number: orderPayload.order_number,
                status: result.status || 'pending',
                total_order_value: orderPayload.total_order_value,
                shipping_address: orderPayload.shipping_address,
                line_items: orderPayload.line_items,
                ...result
              }
            }),
          });
        } catch (error) {
          console.error('Failed to save order locally:', error);
          // Don't fail the checkout if local saving fails
        }

        toast.success(`Order placed successfully! Order ID: ${orderPayload.order_number}. Your order is being processed.`);
      } else {
        // Cart order - create individual orders for each product
        const successfulOrders = [];
        const failedOrders = [];

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          
          try {
            // Show progress for multiple items
            if (items.length > 1) {
              toast.loading(`Processing order ${i + 1} of ${items.length}: ${item.name}`, {
                id: `order-${i}`,
                duration: 2000
              });
            }

            // First, get the product SKU from variant or fallback methods
            let productSku = '';
            
            // Priority 1: Use SKU from cart item if available (from variant)
            if (item.sku) {
              productSku = item.sku;
              console.log(`Using cart item SKU for ${item.name}: ${productSku}`);
            } else {
              // Priority 2: Fetch product with variants and find matching color
              try {
                const productResponse = await fetch(`/api/products/${item.id}`);
                if (productResponse.ok) {
                  const productData = await productResponse.json();
                  
                  // Look for variant with matching color
                  const matchingVariant = productData.variants?.find(
                    (variant: any) => variant.colorName.toLowerCase() === item.color.toLowerCase()
                  );
                  
                  if (matchingVariant) {
                    productSku = matchingVariant.sku;
                    console.log(`Using variant SKU for ${item.name} (${item.color}): ${productSku}`);
                  } else if (productData.sku) {
                    productSku = productData.sku;
                    console.log(`Using base product SKU for ${item.name}: ${productSku}`);
                  }
                } else {
                  console.warn(`API fetch failed for product ${item.id}, status: ${productResponse.status}`);
                }
              } catch (apiError) {
                console.warn(`API call failed for product ${item.id}:`, apiError);
              }
              
              // Priority 3: Try static products as fallback
              if (!productSku) {
                const staticProduct = products.find(p => p.id === item.id);
                if (staticProduct?.sku) {
                  productSku = staticProduct.sku;
                  console.log(`Using static product SKU for ${item.name}: ${productSku}`);
                }
              }
            }

            // If still no SKU, create a fallback
            if (!productSku) {
              productSku = `FALLBACK-${item.id}-${item.color?.substring(0, 3).toUpperCase() || 'DEF'}-${item.type?.toUpperCase() || 'ITEM'}`;
              console.warn(`No SKU found for ${item.name} (ID: ${item.id}, Color: ${item.color}), using fallback: ${productSku}`);
            }

            // Create individual order for each cart item
            const itemOrderPayload = {
              "order_number": `${Date.now()}${i}`, // Unique order number for each item (no special characters)
              "qikink_shipping": "1",
              "gateway": "COD",
              "total_order_value": (item.price * item.quantity).toString(),
              "line_items": [{
                "search_from_my_products": 1,
                "quantity": item.quantity.toString(),
                "price": item.price.toString(),
                "sku": productSku
              }],
              "shipping_address": {
                "first_name": formData.firstName,
                "last_name": formData.lastName,
                "address1": formData.address,
                "phone": formData.phone,
                "email": formData.email,
                "city": formData.city,
                "zip": formData.zipCode,
                "province": "State",
                "country_code": "IN"
              }
            };

            console.log(`Creating Qikink order ${i + 1}/${items.length} with payload:`, itemOrderPayload);

            // Call the Qikink API through our backend for each item
            const response = await fetch('/api/qikink/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderPayload: itemOrderPayload }),
            });

            const result = await response.json();

            if (!response.ok) {
              throw new Error(result.error || `Failed to create order for ${item.name}`);
            }

            console.log(`Qikink order ${i + 1} created successfully:`, result);

            // Save order to local database for backup/tracking
            try {
              await fetch('/api/user/orders/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  qikinkOrderData: {
                    order_number: itemOrderPayload.order_number,
                    status: result.status || 'pending',
                    total_order_value: itemOrderPayload.total_order_value,
                    shipping_address: itemOrderPayload.shipping_address,
                    line_items: itemOrderPayload.line_items,
                    ...result
                  }
                }),
              });
            } catch (error) {
              console.error(`Failed to save order ${i + 1} locally:`, error);
              // Don't fail the checkout if local saving fails
            }

            successfulOrders.push({
              orderNumber: itemOrderPayload.order_number,
              itemName: item.name,
              quantity: item.quantity,
              itemIndex: i,
              item: item // Store the entire item for removal
            });

            // Dismiss the loading toast for this item
            if (items.length > 1) {
              toast.dismiss(`order-${i}`);
            }

            // Add a small delay between orders to avoid overwhelming the API
            if (i < items.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
            }

          } catch (error) {
            console.error(`Error creating order for item ${item.name}:`, error);
            
            // Dismiss the loading toast for this item
            if (items.length > 1) {
              toast.dismiss(`order-${i}`);
            }
            
            failedOrders.push({
              itemName: item.name,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }

        // Show results summary
        if (successfulOrders.length > 0) {
          const orderNumbers = successfulOrders.map(order => order.orderNumber).join(', ');
          toast.success(`${successfulOrders.length} order(s) placed successfully! Order IDs: ${orderNumbers}`);
          
          // Remove only successfully ordered items from cart
          for (const order of successfulOrders) {
            const item = order.item;
            if (item) {
              await removeItem(item.id, item.color, item.size);
            }
          }
        }

        if (failedOrders.length > 0) {
          const failedItems = failedOrders.map(order => order.itemName).join(', ');
          toast.error(`Failed to place orders for: ${failedItems}. Please try again or contact support.`);
        }

        // If at least one order was successful, proceed
        if (successfulOrders.length > 0) {
          // Only show the overall success message if all orders succeeded
          if (failedOrders.length === 0) {
            toast.success('All orders placed successfully! Your orders are being processed.');
          }
        } else {
          // All orders failed
          throw new Error('Failed to place any orders. Please try again.');
        }
      }

      // Set flag to prevent cart redirect, then redirect to orders
      setOrderCompleted(true);
      router.push('/orders');
    } catch (error) {
      console.error('Order creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process order. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything if session is missing or cart is empty (unless order was just completed or it's a direct order)
  if (!session || (items.length === 0 && !orderCompleted && !directOrderProduct)) {
    return null;
  }

  // Show loading state if order is completed
  if (orderCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Redirecting to your orders...</p>
        </div>
      </div>
    );
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
              onClick={() => router.back()}
              className="rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="9876543210"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Information */}
                {/* <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="nameOnCard">Name on Card</Label>
                      <Input
                        id="nameOnCard"
                        name="nameOnCard"
                        value={formData.nameOnCard}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          placeholder="MM/YY"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          placeholder="123"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card> */}

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {directOrderProduct ? 'Processing Order...' : `Processing ${items.length} Order${items.length > 1 ? 's' : ''}...`}
                    </div>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      {directOrderProduct ? 'Place Order' : `Place ${items.length} Order${items.length > 1 ? 's' : ''}`}
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  {!directOrderProduct && items.length > 1 && (
                    <p className="text-sm text-muted-foreground">
                      Each item will be placed as a separate order for faster processing
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {directOrderProduct ? (
                      // Direct order display
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                          <SimpleProxiedImage
                            src={directOrderProduct.image || '/placeholder.jpg'}
                            alt={`${directOrderProduct.name} - ${directOrderProduct.color}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{directOrderProduct.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {directOrderProduct.color} • {directOrderProduct.size} • Qty: 1
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{directOrderProduct.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ) : (
                      // Cart items display
                      items.map((item) => (
                        <div key={`${item.id}-${item.color}-${item.size}`} className="flex items-center gap-3">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                            <SimpleProxiedImage
                              src={item.image}
                              alt={`${item.name} - ${item.color}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {item.color} • {item.size} • Qty: {item.quantity}
                            </p>
                            {/* Debug info */}
                            <p className="text-xs ">
                              Qty={item.quantity} 
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{directOrderProduct ? directOrderProduct.price.toFixed(2) : getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>₹{directOrderProduct ? (directOrderProduct.price * 0.1).toFixed(2) : (getTotalPrice() * 0.1).toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>₹{directOrderProduct ? (directOrderProduct.price * 1.1).toFixed(2) : (getTotalPrice() * 1.1).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
