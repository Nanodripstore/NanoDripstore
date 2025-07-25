import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json();

    // Verify the JWT token from Google
    const decoded = jwt.decode(credential) as any;
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid credential' }, { status: 400 });
    }

    // Verify the token with Google
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    const tokenInfo = await response.json();

    if (!response.ok || tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
      return NextResponse.json({ error: 'Token verification failed' }, { status: 400 });
    }

    // Extract user information
    const user = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      email_verified: decoded.email_verified,
    };

    // Here you can save the user to your database
    // For now, just return the user info
    return NextResponse.json({
      success: true,
      user,
      message: 'Authentication successful'
    });

  } catch (error) {
    console.error('Google One Tap auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
