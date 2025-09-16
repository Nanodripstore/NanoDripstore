import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// In-memory storage for development (Map-based)
const store = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  interval: number; // in milliseconds
  uniqueTokenPerInterval: number; // max requests per interval
  type: 'payment' | 'auth' | 'webhook' | 'general';
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter: number;
  isUserBased: boolean;
}

// Helper function to get client IP
export function getClientIP(request: Request): string {
  // Try to get real IP from headers (Cloudflare, Vercel, etc.)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(",")[0].trim();
  
  // Fallback
  return "unknown";
}

// Main rate limiting function with user-based + IP-based hybrid approach
export async function rateLimit(
  request: Request,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  // Get user identifier (prefer user ID, fallback to IP)
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;
  const ip = getClientIP(request);

  // Create composite key: prefer user-based, fallback to IP-based
  let identifier: string;
  let isUserBased = false;

  if (userEmail && (options.type === 'payment' || options.type === 'auth')) {
    // For logged-in users on critical endpoints, use email-based limiting
    identifier = `user:${userEmail}:${options.type}`;
    isUserBased = true;
  } else {
    // For anonymous users or webhooks, use IP-based limiting  
    identifier = `ip:${ip}:${options.type}`;
  }

  const now = Date.now();

  // Get or create rate limit entry
  let entry = store.get(identifier);
  
  if (!entry || entry.resetTime < now) {
    // Reset window or create new entry
    entry = { 
      count: 1, 
      resetTime: now + options.interval 
    };
    store.set(identifier, entry);
    
    return {
      success: true,
      limit: options.uniqueTokenPerInterval,
      remaining: options.uniqueTokenPerInterval - 1,
      reset: entry.resetTime,
      retryAfter: 0,
      isUserBased
    };
  } else if (entry.count >= options.uniqueTokenPerInterval) {
    // Rate limit exceeded
    const resetIn = Math.ceil((entry.resetTime - now) / 1000);
    
    return {
      success: false,
      limit: options.uniqueTokenPerInterval,
      remaining: 0,
      reset: entry.resetTime,
      retryAfter: resetIn,
      isUserBased
    };
  } else {
    // Increment counter
    entry.count++;
    store.set(identifier, entry);

    return {
      success: true,
      limit: options.uniqueTokenPerInterval,
      remaining: options.uniqueTokenPerInterval - entry.count,
      reset: entry.resetTime,
      retryAfter: 0,
      isUserBased
    };
  }
}

// Cleanup function to remove expired entries
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (value.resetTime < now) {
      store.delete(key);
    }
  }
}

// Periodically cleanup expired entries (1% chance on each call)
setInterval(cleanupExpiredEntries, 60000); // Run every minute

// Helper functions for different endpoint types
export const paymentRateLimit = (request: Request) => 
  rateLimit(request, { 
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 15, // Increased for legitimate users
    type: 'payment' 
  });

export const authRateLimit = (request: Request) => 
  rateLimit(request, { 
    interval: 60 * 1000, // 1 minute  
    uniqueTokenPerInterval: 8, // Slightly increased
    type: 'auth'
  });

export const webhookRateLimit = (request: Request) => 
  rateLimit(request, { 
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 100, // Keep high for webhooks
    type: 'webhook' 
  });

export const generalRateLimit = (request: Request) => 
  rateLimit(request, { 
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 30, // General API endpoints
    type: 'general' 
  });

// Helper function to create rate limit response
export function createRateLimitResponse(result: RateLimitResult): Response {
  const message = result.isUserBased 
    ? "You're making requests too quickly. Please wait a moment before trying again."
    : "Too many requests from this location. Please try again later.";
    
  return new Response(
    JSON.stringify({
      error: "Rate limit exceeded",
      message,
      resetTime: new Date(result.reset).toISOString(),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
        "Retry-After": result.retryAfter.toString(),
      },
    }
  );
}