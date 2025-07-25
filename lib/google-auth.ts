// Simple Google OAuth without NextAuth
export class GoogleAuth {
  private clientId: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
    this.redirectUri = `${window.location.origin}/auth/callback`;
  }

  // Generate Google OAuth URL
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/oauth2/auth?${params.toString()}`;
  }

  // Exchange code for tokens
  async exchangeCodeForTokens(code: string) {
    const response = await fetch('/api/auth/google-exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    return response.json();
  }

  // Get user info from Google
  async getUserInfo(accessToken: string) {
    const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`);
    return response.json();
  }
}

// Usage in components:
// const auth = new GoogleAuth();
// window.location.href = auth.getAuthUrl();
