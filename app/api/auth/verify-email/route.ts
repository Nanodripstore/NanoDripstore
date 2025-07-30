import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return Response.json({ 
        error: 'Missing verification token or email' 
      }, { status: 400 });
    }

    console.log('🔍 Verifying email for:', email, 'with token:', token);

    // Find pending user with matching token and email
    const pendingUser = await db.pendingUser.findFirst({
      where: {
        token: token,
        email: email,
        expires: {
          gt: new Date(), // Token not expired
        },
      },
    });

    if (!pendingUser) {
      console.log('❌ Invalid or expired verification token');
      return Response.json({ 
        error: 'Invalid or expired verification token' 
      }, { status: 400 });
    }

    // Check if user already exists (shouldn't happen, but just in case)
    const existingUser = await db.user.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      console.log('✅ User already exists, cleaning up pending record');
      // Clean up the pending user record
      await db.pendingUser.delete({
        where: { id: pendingUser.id }
      });
      return Response.json({ 
        message: 'Email already verified and account created. You can now sign in.' 
      }, { status: 200 });
    }

    // Create the actual user account from pending user data
    const newUser = await db.user.create({
      data: {
        email: pendingUser.email,
        name: pendingUser.name,
        password: pendingUser.password,
        emailVerified: new Date(), // Mark email as verified
      }
    });

    // Clean up the pending user record
    await db.pendingUser.delete({
      where: { id: pendingUser.id }
    });

    console.log(`✅ User account created successfully for ${email}`);
    
    return Response.json({ 
      message: 'Email verified successfully! Your account has been created and you can now sign in.',
      accountCreated: true
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Email verification failed:', error);
    return Response.json({ 
      error: 'Something went wrong during email verification' 
    }, { status: 500 });
  }
}
