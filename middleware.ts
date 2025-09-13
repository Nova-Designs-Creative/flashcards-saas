import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Update session for all requests
  const response = await updateSession(request);
  
  // Check if the response is already a redirect from Supabase middleware
  if (response.status === 307 || response.status === 308 || response.headers.get('location')) {
    return response;
  }

  // Protected routes that require authentication
  const protectedPaths = [
    '/flashcards',
    '/premium',
    '/payment',
    '/api/flashcards',
    '/api/user',
    '/api/payments'
  ];

  // Check if the current path requires authentication
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    // Check if user is authenticated by looking at the response headers
    const hasUser = response.headers.get('x-supabase-user');
    
    if (!hasUser && !request.nextUrl.pathname.startsWith('/api/')) {
      // Redirect to login for UI routes
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
