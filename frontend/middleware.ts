import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Skip middleware if env vars are not set (e.g., during build)
  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/records') ||
    request.nextUrl.pathname.startsWith('/room') ||
    request.nextUrl.pathname.startsWith('/soap-review') ||
    request.nextUrl.pathname.startsWith('/patient')

  // Redirect authenticated users away from auth page based on role
  if (isAuthPage && session) {
    const userRole = session.user.user_metadata?.role || 'doctor'
    const redirectUrl = userRole === 'doctor' ? '/dashboard' : '/patient/dashboard'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // Redirect unauthenticated users to auth page
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // Role-based access control
  if (session) {
    const userRole = session.user.user_metadata?.role || 'doctor'
    const isPatientRoute = request.nextUrl.pathname.startsWith('/patient')
    const isDoctorRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                          request.nextUrl.pathname.startsWith('/records')

    // Redirect doctors trying to access patient routes
    if (userRole === 'doctor' && isPatientRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Redirect patients trying to access doctor routes
    if (userRole === 'patient' && isDoctorRoute) {
      return NextResponse.redirect(new URL('/patient/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
