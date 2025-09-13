import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  // Security: Restrict test endpoints to authenticated users
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    console.log('🔧 Manual Qikink order creation triggered')
    
    const { orderNumber } = await request.json()
    
    if (!orderNumber) {
      return NextResponse.json({ error: 'Order number required' }, { status: 400 })
    }
    
    // Find the order
    const order = await db.orders.findFirst({
      where: { orderNumber: orderNumber }
    })
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    console.log('📋 Found order:', order.orderNumber)
    console.log('💰 Order total:', order.total)
    console.log('📋 Order status:', order.status)
    
    // Parse order data from notes
    let orderData
    try {
      orderData = JSON.parse(order.notes || '{}')
    } catch (e) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 })
    }
    
    // Create Qikink order with correct payload structure (same format as webhook)
    const orderPayload = {
      order_number: order.orderNumber,
      qikink_shipping: "1",
      gateway: "Prepaid", 
      total_order_value: order.total.toString(),
      line_items: orderData.line_items || [],
      shipping_address: orderData.shipping_address || {}
    }
    
    console.log('📦 Qikink order payload:', JSON.stringify(orderPayload, null, 2))
    
    const qikinkResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/qikink/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderPayload })
    })
    
    const qikinkResult = await qikinkResponse.json()
    console.log('🎯 Qikink API response:', qikinkResult)
    
    if (qikinkResult.success) {
      // Update order status
      await db.orders.update({
        where: { id: order.id },
        data: { 
          status: 'confirmed',
          updatedAt: new Date()
        }
      })
      
      console.log('✅ Order status updated to confirmed')
    }
    
    return NextResponse.json({
      success: true,
      message: 'Manual Qikink order creation completed',
      orderNumber: order.orderNumber,
      qikinkResult
    })
    
  } catch (error) {
    console.error('❌ Manual Qikink order creation failed:', error)
    return NextResponse.json({ 
      error: 'Failed to create manual Qikink order',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}