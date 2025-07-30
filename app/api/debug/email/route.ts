import { sendPasswordResetEmail } from '@/lib/email';

export async function GET(request: Request) {
  try {
    console.log('🔧 Email Debug Starting...');
    
    // Check environment variables
    const envCheck = {
      GMAIL_USER: process.env.GMAIL_USER ? 'SET' : 'MISSING',
      GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? 'SET' : 'MISSING',
      EMAIL_FROM: process.env.EMAIL_FROM ? 'SET' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV,
      GMAIL_USER_VALUE: process.env.GMAIL_USER || 'NOT SET',
      EMAIL_FROM_VALUE: process.env.EMAIL_FROM || 'NOT SET',
    };
    
    console.log('📊 Environment Variables:', envCheck);
    
    // Test email send
    const testEmail = 'abhishekp2k6@gmail.com'; // Your email
    const testResetUrl = 'https://your-site.netlify.app/reset-password?token=test-token-123';
    
    console.log('📤 Attempting to send test email...');
    const result = await sendPasswordResetEmail(testEmail, testResetUrl);
    
    console.log('📧 Email send result:', result);
    
    return Response.json({
      success: true,
      environment: envCheck,
      emailResult: result,
      timestamp: new Date().toISOString(),
      message: 'Check your email inbox for the test message'
    });
    
  } catch (error) {
    console.error('❌ Debug email failed:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
