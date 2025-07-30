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
      const emailResult = await sendPasswordResetEmail(email, resetUrl);
      
      if (emailResult.development) {
        // Development mode - show token info
        return Response.json({ 
          message: 'If an account with that email exists, we have sent a password reset link.',
          development: true,
          token: resetToken,
          resetUrl: resetUrl,
          notice: 'Email service not configured. Check console for reset link.'
        });
      } else {
        // Production mode - email sent successfully
        return Response.json({ 
          message: 'If an account with that email exists, we have sent a password reset link to your email address.'
        });
      }
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      
      // Email failed, but don't reveal this to the user for security
      // In development, show more details
      if (process.env.NODE_ENV === 'development') {
        return Response.json({ 
          message: 'If an account with that email exists, we have sent a password reset link.',
          development: true,
          token: resetToken,
          resetUrl: resetUrl,
          emailError: 'Failed to send email - check console for reset link'
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
