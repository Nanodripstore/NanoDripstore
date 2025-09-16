import * as crypto from 'crypto'
import { db } from '@/lib/db'
import { webhookRateLimit, createRateLimitResponse } from '@/lib/rate-limit';

export async function POST(req: Request) {
  console.log('🚀 WEBHOOK STARTED - Razorpay webhook received at:', new Date().toISOString())
  
  try {
    // Apply rate limiting for webhook
    const rateLimitResult = await webhookRateLimit(req);
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')
    
    console.log('📋 Webhook body length:', body.length)
    console.log('🔐 Webhook signature present:', !!signature)
    
    if (!signature) {
      console.log('❌ No signature found in webhook')
      return Response.json({ error: 'No signature found' }, { status: 400 })
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!
    console.log('🔑 Using webhook secret:', webhookSecret ? 'Present' : 'Missing')
    
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex')

    console.log('🔍 Expected signature:', expectedSignature)
    console.log('🔍 Received signature:', signature)

    if (signature !== expectedSignature) {
      console.log('❌ Invalid signature - webhook rejected')
      return Response.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('✅ Webhook signature verified successfully')
    
    const event = JSON.parse(body)
    
    console.log('📨 Razorpay webhook event:', event.event)
    console.log('💳 Payment data:', JSON.stringify(event.payload.payment?.entity, null, 2))
    console.log('🆔 Order ID from webhook:', event.payload.payment?.entity?.order_id)

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        const paymentId = event.payload.payment.entity.id
        const orderId = event.payload.payment.entity.order_id
        const amount = event.payload.payment.entity.amount / 100 // Convert paise to rupees
        
        console.log('🎉 Payment captured:', paymentId, 'for order:', orderId)
        
        try {
          // Find order by Razorpay order ID in the notes field (since we store simple numbers as orderNumber)
          // Add retry mechanism since webhook might arrive before verify-payment creates the order
          console.log('🔍 Looking for Razorpay order with ID:', orderId)
          
          let order = null;
          let retryCount = 0;
          const maxRetries = 10; // Increased from 5 to 10 retries
          
          while (!order && retryCount < maxRetries) {
            order = await db.orders.findFirst({
              where: {
                AND: [
                  { paymentMethod: 'razorpay' }, // Only look for Razorpay orders
                  { 
                    OR: [
                      { notes: { contains: orderId } }, // Search in notes JSON
                      { notes: { contains: `"razorpay_order_id":"${orderId}"` } } // More specific JSON search
                    ]
                  }
                ]
              }
            });
            
            if (!order && retryCount < maxRetries - 1) {
              console.log(`⏳ Order not found yet, retrying in 3 seconds... (${retryCount + 1}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, 3000)); // Increased to 3 seconds
              retryCount++;
            } else if (!order) {
              console.log(`⚠️ Order still not found after all retries (waited ${maxRetries * 3} seconds total)`);
              break;
            }
          }
          
          console.log('📋 Found order:', order ? `${order.orderNumber} (Razorpay: ${orderId})` : 'Not found after retries')

          if (order) {
            // Update order status to paid/confirmed
            // Update order with proper JSON structure
            let updatedNotes = order.notes;
            try {
              const existingData = JSON.parse(order.notes || '{}');
              existingData.payment_captured = {
                payment_id: paymentId,
                captured_at: new Date().toISOString(),
                webhook_processed: true
              };
              updatedNotes = JSON.stringify(existingData);
            } catch (e) {
              console.warn('⚠️ Could not parse existing notes as JSON for payment capture update');
              // Keep original notes if JSON parsing fails
              updatedNotes = order.notes;
            }
            
            await db.orders.update({
              where: { id: order.id },
              data: {
                status: 'paid',
                paymentStatus: 'paid',
                paymentMethod: 'razorpay',
                notes: updatedNotes,
                updatedAt: new Date()
              }
            })
            
            console.log('✅ Order status updated to paid for order:', order.orderNumber)
            
            // Now create the Qikink order since payment is confirmed
            try {
              const orderNotes = order.notes ? JSON.parse(order.notes) : {}
              console.log('📦 Creating Qikink order with data:', orderNotes)
              
              if (orderNotes.line_items && orderNotes.shipping_address) {
                const qikinkOrderPayload = {
                  order_number: order.orderNumber, // Use the simple numeric order number (already clean)
                  qikink_shipping: "1",
                  gateway: "Prepaid", // Fixed: Use "Prepaid" as per Qikink API docs (not "PREPAID")
                  total_order_value: order.total.toString(),
                  line_items: orderNotes.line_items,
                  shipping_address: orderNotes.shipping_address
                }
                
                console.log('🚀 Sending to Qikink:', JSON.stringify(qikinkOrderPayload, null, 2))
                
                // Call our internal Qikink API endpoint
                const qikinkResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/qikink/create-order`, {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'User-Agent': 'NanoDrip-Webhook/1.0'
                  },
                  body: JSON.stringify({ orderPayload: qikinkOrderPayload }),
                })
                
                const responseText = await qikinkResponse.text()
                console.log('📄 Qikink API Response Status:', qikinkResponse.status)
                console.log('📄 Qikink API Response:', responseText)
                
                if (qikinkResponse.ok) {
                  const qikinkResult = JSON.parse(responseText)
                  console.log('✅ Qikink order created successfully:', qikinkResult)
                  
                  // Update order with Qikink order details - ALWAYS maintain JSON structure
                  let updatedNotes = order.notes
                  try {
                    // Try to parse existing JSON first
                    let existingData: any = {};
                    if (order.notes) {
                      // Handle potentially corrupted JSON by extracting clean JSON part
                      let cleanNotes = order.notes;
                      if (cleanNotes.includes('\n\n')) {
                        cleanNotes = cleanNotes.substring(0, cleanNotes.indexOf('\n\n'));
                      }
                      existingData = JSON.parse(cleanNotes);
                    }
                    
                    existingData.qikink_order = {
                      ...qikinkResult,
                      created_at: new Date().toISOString(),
                      created_via: 'webhook'
                    };
                    updatedNotes = JSON.stringify(existingData, null, 2);
                  } catch (e) {
                    console.warn('⚠️ Could not parse existing notes as JSON, creating new JSON structure');
                    // Create fresh JSON structure if parsing fails completely
                    updatedNotes = JSON.stringify({
                      qikink_order: {
                        ...qikinkResult,
                        created_at: new Date().toISOString(),
                        created_via: 'webhook_fallback'
                      },
                      webhook_note: 'Original notes could not be parsed as JSON'
                    }, null, 2);
                  }
                  
                  await db.orders.update({
                    where: { id: order.id },
                    data: {
                      status: 'confirmed',
                      notes: updatedNotes
                    }
                  })
                  
                  console.log('✅ Order fully confirmed and sent to Qikink')
                } else {
                  console.error('❌ Failed to create Qikink order. Status:', qikinkResponse.status)
                  console.error('❌ Response:', responseText)
                  
                  // Still mark as paid but note the Qikink failure - maintain JSON structure
                  let failureNotes = order.notes;
                  try {
                    let existingData: any = {};
                    if (order.notes) {
                      let cleanNotes = order.notes;
                      if (cleanNotes.includes('\n\n')) {
                        cleanNotes = cleanNotes.substring(0, cleanNotes.indexOf('\n\n'));
                      }
                      existingData = JSON.parse(cleanNotes);
                    }
                    
                    existingData.qikink_error = {
                      error: responseText,
                      failed_at: new Date().toISOString(),
                      status: qikinkResponse.status
                    };
                    failureNotes = JSON.stringify(existingData, null, 2);
                  } catch (e) {
                    console.warn('⚠️ Could not parse notes for failure update, creating new structure');
                    failureNotes = JSON.stringify({
                      qikink_error: {
                        error: responseText,
                        failed_at: new Date().toISOString(),
                        status: qikinkResponse.status
                      }
                    }, null, 2);
                  }
                  
                  await db.orders.update({
                    where: { id: order.id },
                    data: {
                      status: 'paid_qikink_failed',
                      notes: failureNotes
                    }
                  })
                }
              } else {
                console.error('❌ Missing required order data for Qikink')
                console.error('❌ Available data:', Object.keys(orderNotes))
              }
            } catch (qikinkError) {
              console.error('❌ Error creating Qikink order:', qikinkError)
              // Don't fail the webhook if Qikink order creation fails
              try {
                // Maintain JSON structure for error updates too
                let errorNotes = order.notes;
                try {
                  let existingData: any = {};
                  if (order.notes) {
                    let cleanNotes = order.notes;
                    if (cleanNotes.includes('\n\n')) {
                      cleanNotes = cleanNotes.substring(0, cleanNotes.indexOf('\n\n'));
                    }
                    existingData = JSON.parse(cleanNotes);
                  }
                  
                  existingData.qikink_processing_error = {
                    error: qikinkError instanceof Error ? qikinkError.message : 'Unknown error',
                    error_at: new Date().toISOString()
                  };
                  errorNotes = JSON.stringify(existingData, null, 2);
                } catch (e) {
                  errorNotes = JSON.stringify({
                    qikink_processing_error: {
                      error: qikinkError instanceof Error ? qikinkError.message : 'Unknown error',
                      error_at: new Date().toISOString()
                    }
                  }, null, 2);
                }
                
                await db.orders.update({
                  where: { id: order.id },
                  data: {
                    status: 'paid_qikink_error',
                    notes: errorNotes
                  }
                })
              } catch (dbUpdateError) {
                console.error('❌ Failed to update order with error status:', dbUpdateError)
              }
            }
          } else {
            console.warn('⚠️ No order found for Razorpay order ID:', orderId)
          }
        } catch (dbError) {
          console.error('❌ Database error updating order:', dbError)
        }
        break
        
      case 'payment.failed':
        const failedPaymentId = event.payload.payment.entity.id
        const failedOrderId = event.payload.payment.entity.order_id
        
        console.log('❌ Payment failed:', failedPaymentId, 'for order:', failedOrderId)
        
        try {
          const failedOrder = await db.orders.findFirst({
            where: {
              AND: [
                { paymentMethod: 'razorpay' },
                { notes: { contains: failedOrderId } }
              ]
            }
          })

          if (failedOrder) {
            // Update failed order with proper JSON structure
            let failedNotes = failedOrder.notes;
            try {
              let existingData: any = {};
              if (failedOrder.notes) {
                let cleanNotes = failedOrder.notes;
                if (cleanNotes.includes('\n\n')) {
                  cleanNotes = cleanNotes.substring(0, cleanNotes.indexOf('\n\n'));
                }
                existingData = JSON.parse(cleanNotes);
              }
              
              existingData.payment_failed = {
                payment_id: failedPaymentId,
                failed_at: new Date().toISOString()
              };
              failedNotes = JSON.stringify(existingData, null, 2);
            } catch (e) {
              failedNotes = JSON.stringify({
                payment_failed: {
                  payment_id: failedPaymentId,
                  failed_at: new Date().toISOString()
                }
              }, null, 2);
            }
            
            await db.orders.update({
              where: { id: failedOrder.id },
              data: {
                status: 'failed',
                paymentStatus: 'failed',
                notes: failedNotes,
                updatedAt: new Date()
              }
            })
            
            console.log('✅ Order status updated to failed for order:', failedOrder.orderNumber)
          }
        } catch (dbError) {
          console.error('❌ Database error updating failed order:', dbError)
        }
        break
        
      default:
        console.log('🔄 Unhandled event:', event.event)
    }

    console.log('✅ WEBHOOK COMPLETED SUCCESSFULLY at:', new Date().toISOString())
    return Response.json({ success: true })
  } catch (error) {
    console.error('🚨 WEBHOOK ERROR:', error)
    console.error('🚨 Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}