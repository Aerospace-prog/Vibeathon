'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const validateForm = () => {
    if (!email || !password) {
      setError('Email and password are required')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return false
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      if (mode === 'signin') {
        console.log('Attempting sign in...')
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        console.log('Sign in response:', { data, error: signInError })

        if (signInError) {
          console.error('Sign in error:', signInError)
          setError(signInError.message)
          setLoading(false)
          return
        }

        if (data.session) {
          console.log('Session created, redirecting to dashboard...')
          // Use window.location for a full page reload to ensure cookies are set
          window.location.href = '/dashboard'
          return
        } else {
          setError('Sign in successful but no session created. Please try again.')
          setLoading(false)
        }
      } else {
        console.log('Attempting sign up...')
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })

        console.log('Sign up response:', { data, error: signUpError })

        if (signUpError) {
          console.error('Sign up error:', signUpError)
          setError(signUpError.message)
          setLoading(false)
          return
        }

        if (data.session) {
          console.log('Session created, redirecting to dashboard...')
          // Use window.location for a full page reload to ensure cookies are set
          window.location.href = '/dashboard'
          return
        } else if (data.user && !data.session) {
          setError('Account created! Please check your email to confirm your account before signing in.')
          setLoading(false)
        } else {
          setError('Sign up successful but no user created. Please try again.')
          setLoading(false)
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            {mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </CardTitle>
          <CardDescription>
            {mode === 'signin'
              ? 'Enter your credentials to access your account'
              : 'Create a new account to get started'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="doctor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                aria-invalid={!!error}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                aria-invalid={!!error}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </Button>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin')
                  setError('')
                }}
                className="text-primary hover:underline"
                disabled={loading}
              >
                {mode === 'signin'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
