import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import * as z from "zod";
import { sendVerificationEmail } from "@/lib/email";
import { randomUUID } from "crypto";
import { normalizeEmail } from "@/lib/utils";
import { authRateLimit, createRateLimitResponse } from '@/lib/rate-limit';
import { NextRequest } from 'next/server';

//Define a schema for input validation
const userSchema = z
  .object({
    username: z.string().min(1, 'Username is required').max(100),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must have than 8 characters')
  })

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting for user registration
    const rateLimitResult = await authRateLimit(req);
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    console.log('📝 Starting user registration process...');
    const body = await req.json();
    console.log('📨 Received body:', { email: body.email, username: body.username });
    const { email, username, password } = userSchema.parse(body);
    console.log('✅ Schema validation passed');

    // Normalize the email to prevent duplicate accounts (especially for Gmail)
    const normalizedEmail = normalizeEmail(email);
    console.log('🔄 Email normalized:', { original: email, normalized: normalizedEmail });

    //check if email already exists in users table (using normalized email)
    const existingUserByEmail = await db.user.findUnique({
      where: { email: normalizedEmail }
    });
    if (existingUserByEmail) {
      return Response.json({ 
        user: null, 
        message: "An account with this email address already exists. Please use a different email or try signing in.",
        field: "email"
      }, { status: 409 });
    }

    //check if email already exists in pending users table (using normalized email)
    const existingPendingUserByEmail = await db.pendingUser.findUnique({
      where: { email: normalizedEmail }
    });
    if (existingPendingUserByEmail) {
      // Delete the old pending registration and create a new one
      await db.pendingUser.delete({
        where: { email: normalizedEmail }
      });
    }

    //check if username already exists in users table
    const existingUserByUsername = await db.user.findUnique({
      where: { name: username }
    });
    if (existingUserByUsername) {
      return Response.json({ 
        user: null, 
        message: "This username is already taken. Please choose a different username.",
        field: "username"
      }, { status: 409 });
    }

    //check if username already exists in pending users table
    const existingPendingUserByUsername = await db.pendingUser.findFirst({
      where: { name: username }
    });
    if (existingPendingUserByUsername) {
      return Response.json({ 
        user: null, 
        message: "This username is already taken. Please choose a different username.",
        field: "username"
      }, { status: 409 });
    }

    const hashedPassword = await hash(password, 10);
    
    // Generate verification token
    const verificationToken = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Store user data in pending users table (not in main users table yet)
    const pendingUser = await db.pendingUser.create({
      data: {
        email: normalizedEmail, // Use normalized email for storage
        name: username,
        password: hashedPassword,
        token: verificationToken,
        expires: expiresAt,
      },
    });

    // Create verification URL (use original email for display purposes)
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(normalizedEmail)}`;

    // Send verification email to the original email address (where user will actually receive it)
    console.log('📧 Sending verification email to:', email);
    try {
      await sendVerificationEmail(email, verificationUrl);
      console.log('✅ Verification email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError);
      // If email fails, delete the pending user
      await db.pendingUser.delete({
        where: { id: pendingUser.id }
      });
      return Response.json({ 
        user: null, 
        message: "Failed to send verification email. Please try again." 
      }, { status: 500 });
    }

    return Response.json({
      user: { email, name: username }, 
      message: "Account registration initiated! Please check your email to verify your account and complete the registration.",
      requiresVerification: true
    }, {status: 201});
  } catch (error) {
    console.error('❌ User registration failed:', error);
    return Response.json({ user: null, message: "Something went wrong" }, { status: 500 });
  }
}
