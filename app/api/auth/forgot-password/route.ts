import { db } from '@/lib/db';
import { randomUUID } from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return Response.json({ 
        message: 'If an account with that email exists, we have sent a password reset link.' 
      });
    }

    // Generate reset token
    const resetToken = randomUUID();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save reset token to database
    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Generate reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    // Send password reset email
    try {
      console.log('📧 Attempting to send password reset email...');
      const emailResult = await sendPasswordResetEmail(email, resetUrl);
      
      console.log('📬 Email result:', emailResult);
      
      if (emailResult.success) {
        if (emailResult.messageId) {
          console.log('✅ Email sent successfully with ID:', emailResult.messageId);
        }
        
        // Production mode - email sent successfully
        return Response.json({ 
          message: 'If an account with that email exists, we have sent a password reset link to your email address.'
        });
      } else {
        // Email failed
        console.error('❌ Email sending failed:', emailResult.error);
        
        // In development, show more details
        if (process.env.NODE_ENV === 'development') {
          return Response.json({ 
            message: 'If an account with that email exists, we have sent a password reset link.',
            development: true,
            token: resetToken,
            resetUrl: resetUrl,
            emailError: emailResult.error || 'Failed to send email - check console for reset link'
          });
        }
        
        // In production, act as if email was sent successfully (for security)
        return Response.json({ 
          message: 'If an account with that email exists, we have sent a password reset link.' 
        });
      }
    } catch (emailError) {
      console.error('❌ Unexpected error sending password reset email:', emailError);
      
      // Email failed, but don't reveal this to the user for security
      // In development, show more details
      if (process.env.NODE_ENV === 'development') {
        return Response.json({ 
          message: 'If an account with that email exists, we have sent a password reset link.',
          development: true,
          token: resetToken,
          resetUrl: resetUrl,
          emailError: 'Unexpected error - check console for reset link'
        });
      }
      
      // In production, act as if email was sent successfully
      return Response.json({ 
        message: 'If an account with that email exists, we have sent a password reset link.' 
      });
    }

  } catch (error) {
    console.error('Error in forgot password:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
