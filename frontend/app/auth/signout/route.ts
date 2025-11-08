import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const supabase = await createClient()

  // Sign out from Supabase
  await supabase.auth.signOut()

  // Clear all cookies
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  
  // Create response with redirect to landing page
  const response = NextResponse.redirect(new URL('/', request.url))
  
  // Delete all Supabase-related cookies with proper options
  allCookies.forEach((cookie) => {
    if (cookie.name.includes('supabase') || cookie.name.includes('sb-')) {
      response.cookies.set(cookie.name, '', {
        maxAge: 0,
        path: '/',
      })
    }
  })

  return response
}
