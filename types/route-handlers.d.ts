// Override Next.js types for route handlers to fix build issues
declare module 'next/server' {
  export interface RouteHandlerParams {
    params: Record<string, string>;
  }
}
