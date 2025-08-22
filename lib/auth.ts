import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "./db";
import { compare } from "bcrypt";
import GoogleProvider from "next-auth/providers/google";
import { normalizeEmail } from "./utils";

// Custom adapter to handle unique constraint errors and enforce validation
function CustomPrismaAdapter(p: typeof db) {
  const adapter = PrismaAdapter(p);
  
  return {
    ...adapter,
    async createUser(data: any) {
      try {
        console.log('🔄 Creating Google OAuth user:', { email: data.email, name: data.name });
        
        // Check if user with this email already exists
        const existingUserByEmail = await p.user.findUnique({
          where: { email: data.email }
        });
        
        if (existingUserByEmail) {
          console.log('❌ Email already exists:', data.email);
          const error = new Error(`OAUTH_EMAIL_EXISTS:${data.email}`);
          error.name = 'OAuthAccountNotLinked';
          throw error;
        }
        
        // Check if user with this username already exists
        const existingUserByName = await p.user.findUnique({
          where: { name: data.name }
        });
        
        if (existingUserByName) {
          console.log('❌ Username already exists:', data.name);
          const error = new Error(`OAUTH_USERNAME_EXISTS:${data.name}`);
          error.name = 'OAuthAccountNotLinked';
          throw error;
        }
        
        // If no conflicts, create the new user
        const newUser = await p.user.create({
          data: {
            ...data,
            emailVerified: new Date(), // Google users are pre-verified
          }
        });
        
        console.log('✅ Google OAuth user created successfully:', newUser.id);
        return newUser;
        
      } catch (error: any) {
        console.error('❌ Failed to create Google OAuth user:', error.message);
        
        // Re-throw our custom errors with specific types
        if (error.message.includes('OAUTH_EMAIL_EXISTS') || error.message.includes('OAUTH_USERNAME_EXISTS')) {
          throw error;
        }
        
        // Handle Prisma unique constraint errors
        if (error.code === 'P2002') {
          const failedFields = error.meta?.target || [];
          
          if (failedFields.includes('email')) {
            const customError = new Error(`OAUTH_EMAIL_EXISTS:${data.email}`);
            customError.name = 'OAuthAccountNotLinked';
            throw customError;
          }
          
          if (failedFields.includes('name')) {
            const customError = new Error(`OAUTH_USERNAME_EXISTS:${data.name}`);
            customError.name = 'OAuthAccountNotLinked';
            throw customError;
          }
          
          const customError = new Error('OAUTH_GENERAL_CONFLICT');
          customError.name = 'OAuthAccountNotLinked';
          throw customError;
        }
        
        // For other errors, throw a generic OAuth error
        const customError = new Error('OAUTH_CREATE_FAILED');
        customError.name = 'OAuthCreateAccount';
        throw customError;
      }
    }
  };
}

export const authOptions: NextAuthOptions = {
  adapter: CustomPrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/sign-in',
    error: '/sign-in', // Redirect OAuth errors back to sign-in page
  },
  events: {
    async createUser({ user }) {
      console.log('👤 New user created:', { id: user.id, email: user.email, name: user.name });
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@mail.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }
        
        // Normalize the email for lookup to prevent login issues with different email formats
        const normalizedEmail = normalizeEmail(credentials.email);
        
        const existingUser = await db.user.findUnique({
          where: { email: normalizedEmail }
        });
        if (!existingUser) {
          return null;
        }

        // Check if email is verified (only for credential logins)
        if (!existingUser.emailVerified) {
          throw new Error("Please verify your email before signing in. Check your inbox for the verification link.");
        }

        if (existingUser.password) {
          const passwordMatch = await compare(credentials.password, existingUser.password);
          if (!passwordMatch) {
            return null;
          }
        }

        return {
          id: `${existingUser.id}`,
          email: existingUser.email,
          name: existingUser.name
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // For Google provider, normalize the email and validate uniqueness
      if (account?.provider === "google" && user.email) {
        const normalizedEmail = normalizeEmail(user.email);
        
        console.log('🔄 Processing Google sign-in:', { email: user.email, normalizedEmail, name: user.name });
        
        // Check if a user with the normalized email already exists
        const existingUserByEmail = await db.user.findUnique({
          where: { email: normalizedEmail }
        });
        
        if (existingUserByEmail) {
          console.log('✅ Existing user found by email, allowing sign-in');
          // Update the user object to use normalized email for consistency
          user.email = normalizedEmail;
          return true;
        }
        
        // Check if username already exists (for new users)
        if (user.name) {
          const existingUserByName = await db.user.findUnique({
            where: { name: user.name }
          });
          
          if (existingUserByName) {
            console.log('❌ Username conflict for new Google user:', user.name);
            // This will be handled by the custom adapter with a proper error message
            // We allow the process to continue so the adapter can throw the appropriate error
          }
        }
        
        // Update the user object to use normalized email
        user.email = normalizedEmail;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          name: user.name,
        }
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          name: token.name,
        }
      }
    },
  }
}