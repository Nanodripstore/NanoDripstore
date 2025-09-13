import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import type { RazorpayOptions, RazorpayResponse } from '@/lib/razorpay';

interface UseRazorpayProps {
  onSuccess?: (response: RazorpayResponse) => void;
  onFailure?: (error: any) => void;
  onDismiss?: () => void;
}

interface PaymentData {
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, any>;
  customerData?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export const useRazorpay = ({ onSuccess, onFailure, onDismiss }: UseRazorpayProps = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const initiatePayment = useCallback(async (paymentData: PaymentData) => {
    if (!session?.user?.email) {
      setError('Please login to continue');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        await loadRazorpayScript();
      }

      // Create order on server
      const orderResponse = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: paymentData.amount,
          currency: paymentData.currency || 'INR',
          metadata: paymentData.metadata,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await orderResponse.json();

      // Configure Razorpay options
      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'NanoDrip Store',
        description: paymentData.description || 'Payment for your order',
        order_id: orderData.orderId,
        image: '/logo.png', // Add your logo URL here
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment on server
            const verifyResponse = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: paymentData.metadata,
              }),
            });

            if (!verifyResponse.ok) {
              const errorData = await verifyResponse.json();
              throw new Error(errorData.error || 'Payment verification failed');
            }

            const verificationData = await verifyResponse.json();
            onSuccess?.(response);
          } catch (error) {
            console.error('Payment verification failed:', error);
            onFailure?.(error);
          }
        },
        prefill: {
          name: paymentData.customerData?.name || session.user.name || '',
          email: paymentData.customerData?.email || session.user.email,
          contact: paymentData.customerData?.phone || '+919999999999', // Ensure +91 format for Indian number
        },
        notes: {
          user_id: session.user.email,
          order_metadata: JSON.stringify(paymentData.metadata || {}),
        },
        theme: {
          color: '#000000', // Your brand color
        },
        modal: {
          ondismiss: () => {
            console.log('Razorpay payment modal dismissed');
            onDismiss?.();
          },
          escape: true,
          backdropclose: false,
        },
        retry: {
          enabled: true,
          max_count: 3,
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment initiation failed:', error);
      setError(error instanceof Error ? error.message : 'Payment failed');
      onFailure?.(error);
    } finally {
      setLoading(false);
    }
  }, [session, onSuccess, onFailure, onDismiss]);

  return {
    initiatePayment,
    loading,
    error,
  };
};

// Load Razorpay script dynamically
const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.head.appendChild(script);
  });
};
