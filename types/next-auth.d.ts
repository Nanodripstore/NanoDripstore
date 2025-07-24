import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      phone?: string | null
      addresses?: Array<{
        id: string
        name: string
        street: string
        city: string
        state: string
        zipCode: string
        country: string
        isDefault: boolean
      }>
      cartCount?: number
      wishlistCount?: number
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    phone?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    phone?: string | null
  }
}
