import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    console.log('🧪 Testing email send to:', email);
    
    // Create a test verification URL
    const testVerificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=test-token&email=${encodeURIComponent(email)}`;
    
    // Send test verification email
    const result = await sendVerificationEmail(email, testVerificationUrl);
    
    return Response.json({ 
      success: result.success,
      message: result.success ? 'Test email sent successfully!' : 'Failed to send test email',
      error: result.error,
      messageId: result.messageId 
    });
    
  } catch (error) {
    console.error('❌ Test email failed:', error);
    return Response.json({ 
      error: "Failed to send test email",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
