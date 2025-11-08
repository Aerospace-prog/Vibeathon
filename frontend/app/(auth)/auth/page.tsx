'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Heart, Stethoscope, Pill, Syringe, Thermometer, Brain, Dna } from 'lucide-react'

export const dynamic = 'force-dynamic'

// Floating medical icons component
const FloatingIcon = ({ Icon, delay, duration, x, y }: { Icon: any; delay: number; duration: number; x: string; y: string }) => (
  <div
    className="absolute opacity-10 animate-float"
    style={{
      left: x,
      top: y,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    }}
  >
    <Icon size={48} className="text-teal-500" />
  </div>
)

// Inspirational medical quotes
const medicalQuotes = [
  {
    text: "The art of medicine consists of amusing the patient while nature cures the disease.",
    author: "Voltaire",
    icon: Heart
  },
  {
    text: "Wherever the art of medicine is loved, there is also a love of humanity.",
    author: "Hippocrates",
    icon: Stethoscope
  },
  {
    text: "The good physician treats the disease; the great physician treats the patient.",
    author: "William Osler",
    icon: Activity
  },
  {
    text: "Medicine is not only a science; it is also an art. It does not consist of compounding pills and plasters.",
    author: "Paracelsus",
    icon: Brain
  },
  {
    text: "To cure sometimes, to relieve often, to comfort always.",
    author: "Hippocrates",
    icon: Heart
  },
  {
    text: "The best doctor gives the least medicines.",
    author: "Benjamin Franklin",
    icon: Pill
  },
  {
    text: "Health is the greatest gift, contentment the greatest wealth, faithfulness the best relationship.",
    author: "Buddha",
    icon: Heart
  },
  {
    text: "The doctor of the future will give no medicine, but will interest patients in care of the human frame.",
    author: "Thomas Edison",
    icon: Dna
  }
]

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'doctor' | 'patient'>('doctor')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Compute email placeholder - consistent for SSR
  const emailPlaceholder = mode === 'signup' 
    ? (role === 'doctor' ? 'doctor@arogya.ai' : 'patient@arogya.ai')
    : 'your.email@example.com'

  // Rotate quotes every 7 seconds
  useEffect(() => {
    if (!mounted) return
    
    const interval = setInterval(() => {
      setFadeIn(false)
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % medicalQuotes.length)
        setFadeIn(true)
      }, 500)
    }, 7000)

    return () => clearInterval(interval)
  }, [mounted])

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
          console.log('Session created, redirecting...')
          const userRole = data.session.user.user_metadata?.role || 'doctor'
          window.location.href = userRole === 'doctor' ? '/dashboard' : '/patient/dashboard'
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
          options: {
            data: {
              role: role,
            }
          }
        })

        console.log('Sign up response:', { data, error: signUpError })

        if (signUpError) {
          console.error('Sign up error:', signUpError)
          setError(signUpError.message)
          setLoading(false)
          return
        }

        if (data.session) {
          console.log('Session created, redirecting...')
          window.location.href = role === 'doctor' ? '/dashboard' : '/patient/dashboard'
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

  // Don't render until mounted to avoid hydration issues with browser extensions
  if (!mounted) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="animate-pulse">
          <Activity className="w-8 h-8 text-teal-500 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />
      
      {/* Floating medical icons - subtle and contained */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <FloatingIcon Icon={Heart} delay={0} duration={8} x="10%" y="15%" />
          <FloatingIcon Icon={Stethoscope} delay={1} duration={10} x="85%" y="20%" />
          <FloatingIcon Icon={Activity} delay={2} duration={7} x="15%" y="75%" />
          <FloatingIcon Icon={Pill} delay={0.5} duration={9} x="80%" y="70%" />
          <FloatingIcon Icon={Brain} delay={3} duration={10} x="25%" y="85%" />
          <FloatingIcon Icon={Dna} delay={1.8} duration={9} x="75%" y="10%" />
        </div>
      )}

      {/* Side Info Panels - Desktop Only */}
      {mounted && (
        <>
          {/* Left Panel */}
          <div className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 w-64 z-5">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border-2 border-teal-200 dark:border-teal-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-2.5 rounded-lg">
                  <Heart className="w-5 h-5 text-white animate-heartbeat" />
                </div>
                <h3 className="font-bold text-teal-900 dark:text-teal-100">Healthcare Excellence</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                  <span>AI-Powered Translation</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <span>Real-time Consultations</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
                  <span>SOAP Note Generation</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" style={{ animationDelay: '0.6s' }} />
                  <span>Multilingual Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Rotating Quote */}
          <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-64 z-5">
            <div 
              className={`bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border-2 border-cyan-200 dark:border-cyan-800 transition-all duration-700 ${
                fadeIn ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5 rounded-lg">
                  {(() => {
                    const QuoteIcon = medicalQuotes[currentQuoteIndex].icon
                    return <QuoteIcon className="w-5 h-5 text-white" />
                  })()}
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/50 to-transparent" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed mb-3 italic">
                "{medicalQuotes[currentQuoteIndex].text}"
              </p>
              <p className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold">
                — {medicalQuotes[currentQuoteIndex].author}
              </p>
              
              {/* Quote indicators */}
              <div className="flex gap-1.5 mt-4 justify-center">
                {medicalQuotes.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      index === currentQuoteIndex
                        ? 'w-6 bg-gradient-to-r from-cyan-500 to-blue-600'
                        : 'w-1.5 bg-slate-300 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main card with clean design */}
      <Card className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-900 border-2 border-teal-200 dark:border-teal-800 shadow-2xl overflow-hidden transition-shadow duration-500 hover:shadow-teal-500/20 hover:shadow-3xl">
        {/* Animated gradient header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 animate-gradient" style={{ backgroundSize: '200% 200%' }} />
        
        <CardHeader className="relative space-y-3 pt-8">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-2">
            <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-4 rounded-full shadow-lg">
              <Activity className="w-8 h-8 text-white animate-heartbeat" />
            </div>
          </div>
          
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Arogya-AI
          </CardTitle>
          
          <CardDescription className="text-center text-base">
            {mode === 'signin'
              ? 'Welcome back! Sign in to continue your healthcare journey'
              : 'Join us in revolutionizing healthcare with AI'}
          </CardDescription>
        </CardHeader>

        <CardContent className="relative">
          <form onSubmit={handleSubmit} className="space-y-5" suppressHydrationWarning>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-teal-700 dark:text-teal-300 flex items-center gap-2">
                <Heart size={16} className="animate-pulse-slow" />
                Email Address
              </label>
              <Input
                  id="email"
                  type="email"
                  placeholder={emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  aria-invalid={!!error}
                  className="border-teal-200 dark:border-teal-800 focus:border-teal-500 focus:ring-teal-500 transition-all duration-300"
                />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-teal-700 dark:text-teal-300 flex items-center gap-2">
                <Stethoscope size={16} className="animate-pulse-slow" />
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
                  className="border-teal-200 dark:border-teal-800 focus:border-teal-500 focus:ring-teal-500 transition-all duration-300"
                />
            </div>

            {/* Role Selection - Only show during signup */}
            {mode === 'signup' && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-teal-700 dark:text-teal-300">
                  I am a:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('doctor')}
                    className={`p-4 border-2 rounded-xl transition-all duration-300 ${
                      role === 'doctor'
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30 shadow-md'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-teal-300 dark:hover:border-teal-700'
                    }`}
                  >
                    <Stethoscope className={`w-6 h-6 mx-auto mb-2 ${role === 'doctor' ? 'text-teal-600 dark:text-teal-400' : 'text-zinc-400'}`} />
                    <div className={`font-semibold text-sm ${role === 'doctor' ? 'text-teal-700 dark:text-teal-300' : 'text-zinc-600 dark:text-zinc-400'}`}>
                      Doctor
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('patient')}
                    className={`p-4 border-2 rounded-xl transition-all duration-300 ${
                      role === 'patient'
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30 shadow-md'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-cyan-300 dark:hover:border-cyan-700'
                    }`}
                  >
                    <Heart className={`w-6 h-6 mx-auto mb-2 ${role === 'patient' ? 'text-cyan-600 dark:text-cyan-400 animate-heartbeat' : 'text-zinc-400'}`} />
                    <div className={`font-semibold text-sm ${role === 'patient' ? 'text-cyan-700 dark:text-cyan-300' : 'text-zinc-600 dark:text-zinc-400'}`}>
                      Patient
                    </div>
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 p-3 rounded-lg border border-red-200 dark:border-red-800 animate-shake">
                {error}
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 p-3 rounded-lg border border-red-200 dark:border-red-800 animate-shake">
                {error}
              </div>
            )}

            <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold py-6 rounded-lg shadow-lg shadow-teal-500/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Activity className="w-5 h-5 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {mode === 'signin' ? 'Sign In' : 'Create Account'}
                    <Heart className="w-5 h-5 animate-heartbeat" />
                  </span>
                )}
              </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-teal-200 dark:border-teal-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-zinc-900 px-2 text-teal-600 dark:text-teal-400">
                  {mode === 'signin' ? 'New to Arogya-AI?' : 'Already have an account?'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin')
                setError('')
              }}
              className="w-full text-center text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors duration-200 py-2"
              disabled={loading}
            >
              {mode === 'signin'
                ? '✨ Create your free account'
                : '🔐 Sign in to your account'}
            </button>
          </form>

          {/* Trust indicators */}
          <div className="mt-6 pt-6 border-t border-teal-100 dark:border-teal-900">
            <div className="flex items-center justify-center gap-6 text-xs text-teal-600/60 dark:text-teal-400/60">
              <div className="flex items-center gap-1">
                <Activity size={14} />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart size={14} />
                <span>Secure & Private</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
