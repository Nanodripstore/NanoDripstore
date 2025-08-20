// This function will now return the full authentication object
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
  
  // Return the entire object containing both ClientId and Accesstoken
  return data; 
}


// The main API handler, updated to use the new headers
export async function POST(req: Request) {
  try {
    const { orderPayload } = await req.json();
    if (!orderPayload) {
      return Response.json({ error: 'Order payload is missing.' }, { status: 400 });
    }

    const CREATE_ORDER_URL = `${process.env.QIKINK_API_URL}/api/order/create`;

    // Step 1: Get the full authentication object
    const authData = await getAuthData();

    // Step 2: Create the order using custom headers
    const orderResponse = await fetch(CREATE_ORDER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add the two required custom headers
        'ClientId': authData.ClientId.toString(), // Convert number to string
        'Accesstoken': authData.Accesstoken,
      },
      body: JSON.stringify(orderPayload),
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      console.error("Qikink API Error:", orderData);
      return Response.json({ error: orderData.error || 'Failed to create order.' }, { status: orderResponse.status });
    }
    
    return Response.json(orderData);
  } catch (error: any) {
    console.error('Internal Server Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}