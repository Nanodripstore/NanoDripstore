import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google
  ],
  trustHost: true,  // Trust the host for production deployment
  callbacks: {
    async signIn({ user, account, profile }) {
      // Always allow sign in - we'll handle database operations later
      console.log("User signing in:", user.email)
      return true
    },
    async jwt({ token, user, account }) {
      // Store basic user info in token
      if (account && user) {
        token.email = user.email
        token.name = user.name
        token.image = user.image
      }
      return token
    },
    async session({ session, token }) {
      // Only add basic info from token
      if (session.user && token) {
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.image as string
      }
      return session
    }
  }
})