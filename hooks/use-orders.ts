import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface QikinkOrder {
  id: string;
  order_number: string;
  status: string;
  total_order_value: string;
  created_at: string;
  shipping_address: {
    first_name: string;
    last_name: string;
    address1: string;
    city: string;
    zip: string;
    phone: string;
  };
  line_items: Array<{
    quantity: string;
    price: string;
    sku: string;
    designs: Array<{
      design_code: string;
      design_link: string;
      mockup_link: string;
    }>;
  }>;
}

interface UseOrdersReturn {
  orders: QikinkOrder[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useOrders(): UseOrdersReturn {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<QikinkOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!session?.user?.email) {
      setOrders([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/qikink/orders');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }

      // The Qikink API might return orders in different formats
      // Assuming it returns an array of orders or an object with orders property
      const ordersArray = Array.isArray(data) ? data : (data.orders || data.data || []);
      setOrders(ordersArray);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [session?.user?.email]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
  };
}
