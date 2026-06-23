import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory rate limiting map
// In production, consider using Redis (Upstash) for distributed rate limiting
const rateLimitMap = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT_WINDOW_MS = 60000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60 // 60 requests per minute

function applyRateLimit(req: NextRequest): boolean {
  const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1'
  const now = Date.now()
  const windowData = rateLimitMap.get(ip)

  if (!windowData) {
    rateLimitMap.set(ip, { count: 1, timestamp: now })
    return true
  }

  // Reset window if it has passed
  if (now - windowData.timestamp > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, timestamp: now })
    return true
  }

  // Check if limit exceeded
  if (windowData.count >= MAX_REQUESTS_PER_WINDOW) {
    return false
  }

  // Increment counter
  windowData.count++
  rateLimitMap.set(ip, windowData)
  return true
}

// Check if Supabase is properly configured
function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return (
    url && 
    key && 
    url !== 'https://your-project-id.supabase.co' && 
    key !== 'your-anon-key-here' &&
    url.startsWith('https://') &&
    key.startsWith('eyJ') // JWT should start with eyJ
  )
}

export async function middleware(req: NextRequest) {
  // Apply rate limiting to all API routes
  if (req.nextUrl.pathname.startsWith('/api')) {
    if (!applyRateLimit(req)) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  const res = NextResponse.next()
  
  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/quiz', '/profile']
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // Auth routes
  const authRoutes = ['/auth/signin', '/auth/signup']
  const isAuthRoute = authRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // Allow access to auth routes
  if (isAuthRoute) {
    return res
  }

  // Check for API-based auth token in cookies first
  const token = req.cookies.get('auth_token')?.value
  
  // If we have a token, allow access to protected routes
  if (token) {
    return res
  }

  // Skip Supabase middleware if not properly configured
  if (!isSupabaseConfigured()) {
    // Check for API-based auth token in cookies as fallback
    const token = req.cookies.get('auth_token')?.value
    
    // If user is not logged in and trying to access protected route
    if (isProtectedRoute && !token) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/auth/signin'
      redirectUrl.searchParams.set('next', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    return res
  }

  // Use Supabase authentication for production with error handling
  try {
    const supabase = createMiddlewareClient({ req, res })
    
    // Refresh session if expired - required for Server Components
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.warn('Middleware: Error getting Supabase session:', error)
      // Check for API-based auth fallback
      const token = req.cookies.get('auth_token')?.value
      
      if (isProtectedRoute && !token) {
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/auth/signin'
        redirectUrl.searchParams.set('next', req.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }
      
      return res
    }

    // If user is not logged in and trying to access protected route
    if (isProtectedRoute && !session) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/auth/signin'
      redirectUrl.searchParams.set('next', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error: any) {
    console.warn('Middleware: Supabase error:', error?.message)
    // Fall back to allowing access - client-side auth will handle it
    // or redirect to signin for protected routes
    if (isProtectedRoute) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/auth/signin'
      redirectUrl.searchParams.set('next', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}