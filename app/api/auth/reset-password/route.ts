import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { authRateLimit, createRateLimitResponse } from '@/lib/rate-limit';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for password reset
    const rateLimitResult = await authRateLimit(request);
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    const { token, password } = await request.json();

    if (!token || !password) {
      return Response.json({ error: 'Token and password are required' }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    if (!/[a-z]/.test(password)) {
      return Response.json({ error: 'Password must contain at least one lowercase letter' }, { status: 400 });
    }

    if (!/[A-Z]/.test(password)) {
      return Response.json({ error: 'Password must contain at least one uppercase letter' }, { status: 400 });
    }

    if (!/[0-9]/.test(password)) {
      return Response.json({ error: 'Password must contain at least one number' }, { status: 400 });
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      return Response.json({ error: 'Password must contain at least one special character' }, { status: 400 });
    }

    // Find user with valid reset token
    const user = await db.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date() // Token must not be expired
        }
      }
    });

    if (!user) {
      return Response.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and clear reset token
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return Response.json({ message: 'Password has been reset successfully' });

  } catch (error) {
    console.error('Error in reset password:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
