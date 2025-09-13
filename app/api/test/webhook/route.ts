import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  // Security: Restrict test endpoints to authenticated users
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  console.log('🧪 TEST WEBHOOK RECEIVED at:', new Date().toISOString());
  
  try {
    const body = await req.text();
    const headers = Object.fromEntries(req.headers.entries());
    
    console.log('📋 Test webhook headers:', JSON.stringify(headers, null, 2));
    console.log('📋 Test webhook body:', body);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test webhook received successfully',
      timestamp: new Date().toISOString(),
      bodyLength: body.length
    });
  } catch (error) {
    console.error('❌ Test webhook error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    message: 'Test webhook endpoint is active',
    timestamp: new Date().toISOString(),
    url: req.url
  });
}