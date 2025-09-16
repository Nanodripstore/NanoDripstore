import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// Shared auth function for Qikink API
async function getAuthData() {
  const CLIENT_ID = process.env.QIKINK_CLIENT_ID;
  const CLIENT_SECRET = process.env.QIKINK_CLIENT_SECRET;
  const TOKEN_URL = `${process.env.QIKINK_API_URL}/api/token`;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Qikink credentials not configured in .env.local');
  }

  const body = new URLSearchParams();
  body.append('ClientId', CLIENT_ID);
  body.append('client_secret', CLIENT_SECRET);

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body,
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("Failed to get auth data:", data);
    throw new Error('Could not authenticate with Qikink.');
  }
  
  return data; 
}

export async function GET() {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's orders from local database (these are saved when orders are created)
    const userOrders = await db.orders.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        order_items: {
          include: {
            products: {
              select: {
                name: true,
                description: true,
                images: true,
                price: true
              }
            }
          }
        }
      }
    });

    // Transform the local orders to match the expected format
    const transformedOrders = userOrders.map(order => {
      // Parse the Qikink data from notes field if it exists
      let qikinkData: any = {};
      try {
        if (order.notes) {
          // Handle corrupted JSON by extracting the JSON part before any appended text
          let cleanNotes = order.notes;
          
          // If notes contain appended text (indicated by newlines after JSON), extract just the JSON part
          if (cleanNotes.includes('\n\n')) {
            const jsonEnd = cleanNotes.indexOf('\n\n');
            cleanNotes = cleanNotes.substring(0, jsonEnd);
          }
          
          qikinkData = JSON.parse(cleanNotes);
        }
      } catch (error) {
        console.error('Error parsing order notes for order', order.orderNumber, ':', error);
        console.log('Raw notes:', order.notes?.substring(0, 200) + '...');
        
        // Try to extract JSON from corrupted notes as fallback
        try {
          if (order.notes) {
            // Find the first { and try to extract valid JSON up to the first \n\n
            const firstBrace = order.notes.indexOf('{');
            if (firstBrace !== -1) {
              let jsonCandidate = order.notes.substring(firstBrace);
              
              // If there's a double newline, cut at that point
              const doubleNewline = jsonCandidate.indexOf('\n\n');
              if (doubleNewline !== -1) {
                jsonCandidate = jsonCandidate.substring(0, doubleNewline);
              }
              
              qikinkData = JSON.parse(jsonCandidate);
              console.log('✅ Recovered JSON from corrupted notes');
            }
          }
        } catch (recoveryError) {
          console.error('❌ Could not recover JSON from corrupted notes');
          qikinkData = {}; // Use empty object as fallback
        }
      }

      return {
        id: order.id,
        order_number: order.orderNumber,
        status: order.status,
        total_order_value: order.total.toString(),
        created_at: order.createdAt.toISOString(),
        // If we have qikink data, use it, otherwise construct from local data
        shipping_address: qikinkData.shipping_address || {
          first_name: 'Customer',
          last_name: '',
          address1: 'Address not available',
          city: 'City',
          zip: '00000',
          phone: ''
        },
        line_items: qikinkData.line_items || order.order_items.map(item => ({
          quantity: '1',
          price: item.products?.price?.toString() || '0',
          sku: 'LOCAL-SKU',
          designs: [{
            design_code: 'local_design',
            design_link: item.products?.images?.[0] || '',
            mockup_link: item.products?.images?.[0] || ''
          }]
        }))
      };
    });

    return Response.json(transformedOrders);
  } catch (error: any) {
    console.error('Get Orders Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
