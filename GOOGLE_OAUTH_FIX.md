# Google OAuth Username Conflict Fix

## Problem
Google sign-in was failing with a unique constraint error on the `name` field because:
1. Google OAuth sends display names like "John Smith" which are not unique
2. Our database schema requires unique usernames (`name` field)
3. Multiple users with the same display name caused conflicts

## Solution Implemented

### 1. Custom PrismaAdapter
- Added error handling for unique constraint violations (P2002)
- If user already exists with same email, return existing user instead of creating new one
- Graceful fallback for duplicate usernames

### 2. Enhanced signIn Callback
- Generates unique usernames for Google OAuth users
- Uses multiple fallback strategies:
  1. Clean display name (remove special characters)
  2. Email prefix if display name is taken
  3. Display name + counter if needed
  4. Email prefix + timestamp as final fallback

### 3. Email Normalization for OAuth
- Ensures consistent email handling between manual signup and Google OAuth
- Prevents duplicate accounts for users with email variations

## Implementation Details

```typescript
// Username generation logic:
baseUsername = "johnsmith" (from "John Smith")
emailPrefix = "john.doe" (from "john.doe@gmail.com")

Attempts:
1. "johnsmith"
2. "john.doe" (if johnsmith exists)
3. "johnsmith2", "johnsmith3", etc.
4. "john.doe1734567890" (timestamp fallback)
```

## Testing
1. Try Google sign-in with existing display names
2. Check that users are created with unique usernames
3. Verify email normalization works correctly

## Error Logs to Monitor
- Look for "Custom adapter createUser" logs
- Monitor for any remaining P2002 errors
- Check username generation patterns
