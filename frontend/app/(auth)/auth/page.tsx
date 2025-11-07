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

  // Compute email placeholder - only use after mounted to avoid hydration mismatch
  const emailPlaceholder = mounted && mode === 'signup' 
    ? (role === 'doctor' ? 'doctor@arogya.ai' : 'patient@arogya.ai')
    : 'your.email@example.com'

  // Rotate quotes every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false)
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % medicalQuotes.length)
        setFadeIn(true)
      }, 500) // Wait for fade out before changing quote
    }, 7000)

    return () => clearInterval(interval)
  }, [])

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
          // Redirect based on user role
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
          // Redirect based on role
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

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-950 dark:via-cyan-950 dark:to-blue-950 p-4">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 via-cyan-400/20 to-blue-400/20 animate-gradient-shift" />
      
      {/* Animated particles/dots - Fixed positions to avoid hydration errors */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-1 h-1 bg-teal-400/30 rounded-full animate-particle" style={{ left: '15%', top: '20%', animationDelay: '0s', animationDuration: '18s' }} />
          <div className="absolute w-1 h-1 bg-teal-400/30 rounded-full animate-particle" style={{ left: '85%', top: '15%', animationDelay: '1s', animationDuration: '22s' }} />
          <div className="absolute w-1 h-1 bg-teal-400/30 rounded-full animate-particle" style={{ left: '25%', top: '60%', animationDelay: '2s', animationDuration: '20s' }} />
          <div className="absolute w-1 h-1 bg-teal-400/30 rounded-full animate-particle" style={{ left: '70%', top: '80%', animationDelay: '0.5s', animationDuration: '19s' }} />
          <div className="absolute w-1 h-1 bg-teal-400/30 rounded-full animate-particle" style={{ left: '45%', top: '30%', animationDelay: '1.5s', animationDuration: '21s' }} />
          <div className="absolute w-1 h-1 bg-teal-400/30 rounded-full animate-particle" style={{ left: '60%', top: '50%', animationDelay: '2.5s', animationDuration: '17s' }} />
          <div className="absolute w-1 h-1 bg-teal-400/30 rounded-full animate-particle" style={{ left: '10%', top: '70%', animationDelay: '3s', animationDuration: '23s' }} />
          <div className="absolute w-1 h-1 bg-teal-400/30 rounded-full animate-particle" style={{ left: '90%', top: '40%', animationDelay: '1.8s', animationDuration: '16s' }} />
          <div className="absolute w-1 h-1 bg-teal-400/30 rounded-full animate-particle" style={{ left: '35%', top: '85%', animationDelay: '0.8s', animationDuration: '24s' }} />
          <div className="absolute w-1 h-1 bg-teal-400/30 rounded-full animate-particle" style={{ left: '75%', top: '25%', animationDelay: '2.2s', animationDuration: '19s' }} />
          <div className="absolute w-1 h-1 bg-teal-400/30 rounded-full animate-particle" style={{ left: '20%', top: '45%', animationDelay: '1.2s', animationDuration: '21s' }} />
          <div className="absolute w-1 h-1 bg-teal-400/30 rounded-full animate-particle" style={{ left: '55%', top: '65%', animationDelay: '3.5s', animationDuration: '18s' }} />
          <div className="absolute w-1 h-1 bg-teal-400/30 rounded-full animate-particle" style={{ left: '40%', top: '10%', animationDelay: '0.3s', animationDuration: '22s' }} />
          <div className="absolute w-1 h-1 bg-teal-400/30 rounded-full animate-particle" style={{ left: '80%', top: '55%', animationDelay: '2.8s', animationDuration: '20s' }} />
          <div className="absolute w-1 h-1 bg-teal-400/30 rounded-full animate-particle" style={{ left: '30%', top: '75%', animationDelay: '1.3s', animationDuration: '17s' }} />
          <div className="absolute w-1 h-1 bg-teal-400/30 rounded-full animate-particle" style={{ left: '65%', top: '35%', animationDelay: '3.2s', animationDuration: '23s' }} />
          <div className="absolute w-1 h-1 bg-teal-400/30 rounded-full animate-particle" style={{ left: '12%', top: '90%', animationDelay: '0.7s', animationDuration: '19s' }} />
          <div className="absolute w-1 h-1 bg-teal-400/30 rounded-full animate-particle" style={{ left: '88%', top: '65%', animationDelay: '2.3s', animationDuration: '21s' }} />
          <div className="absolute w-1 h-1 bg-teal-400/30 rounded-full animate-particle" style={{ left: '50%', top: '20%', animationDelay: '1.7s', animationDuration: '18s' }} />
          <div className="absolute w-1 h-1 bg-teal-400/30 rounded-full animate-particle" style={{ left: '22%', top: '55%', animationDelay: '3.8s', animationDuration: '24s' }} />
        </div>
      )}
      
      {/* Floating medical icons */}
      {mounted && (
        <>
          <FloatingIcon Icon={Heart} delay={0} duration={8} x="10%" y="15%" />
          <FloatingIcon Icon={Stethoscope} delay={1} duration={10} x="85%" y="20%" />
          <FloatingIcon Icon={Activity} delay={2} duration={7} x="15%" y="75%" />
          <FloatingIcon Icon={Pill} delay={0.5} duration={9} x="80%" y="70%" />
          <FloatingIcon Icon={Syringe} delay={1.5} duration={11} x="5%" y="45%" />
          <FloatingIcon Icon={Thermometer} delay={2.5} duration={8} x="90%" y="50%" />
          <FloatingIcon Icon={Brain} delay={3} duration={10} x="25%" y="85%" />
          <FloatingIcon Icon={Dna} delay={1.8} duration={9} x="75%" y="10%" />
        </>
      )}

      {/* DNA Helix decoration */}
      <div className="absolute left-0 top-0 h-full w-32 opacity-5">
        <div className="h-full w-full bg-gradient-to-b from-teal-500 via-cyan-500 to-blue-500 animate-dna-rotate" 
             style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
      </div>
      <div className="absolute right-0 top-0 h-full w-32 opacity-5">
        <div className="h-full w-full bg-gradient-to-b from-blue-500 via-cyan-500 to-teal-500 animate-dna-rotate-reverse" 
             style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
      </div>

      {/* Side Quote Panels - Desktop Only */}
      {mounted && (
        <>
          {/* Left Quote Panel */}
          <div className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 w-64 z-5">
            <div 
              className={`backdrop-blur-lg bg-gradient-to-br from-white/70 to-teal-50/70 dark:from-zinc-900/70 dark:to-teal-950/70 rounded-2xl p-6 shadow-xl border border-teal-200/40 dark:border-teal-800/40 transition-all duration-700 ${
                fadeIn ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-2.5 rounded-lg">
                  {(() => {
                    const QuoteIcon = medicalQuotes[currentQuoteIndex].icon
                    return <QuoteIcon className="w-5 h-5 text-white" />
                  })()}
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-teal-500/50 to-transparent" />
              </div>
              <p className="text-sm font-medium text-teal-900 dark:text-teal-100 leading-relaxed mb-3 italic">
                "{medicalQuotes[currentQuoteIndex].text}"
              </p>
              <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                — {medicalQuotes[currentQuoteIndex].author}
              </p>
            </div>
          </div>

          {/* Right Quote Panel */}
          <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-64 z-5">
            <div 
              className={`backdrop-blur-lg bg-gradient-to-bl from-white/70 to-cyan-50/70 dark:from-zinc-900/70 dark:to-cyan-950/70 rounded-2xl p-6 shadow-xl border border-cyan-200/40 dark:border-cyan-800/40 transition-all duration-700 ${
                fadeIn ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-teal-500 animate-heartbeat" />
                  <span className="text-xs font-semibold text-teal-700 dark:text-teal-300">Healthcare Excellence</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-teal-600 dark:text-teal-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    <span>AI-Powered Translation</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-teal-600 dark:text-teal-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <span>Real-time Consultations</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-teal-600 dark:text-teal-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>SOAP Note Generation</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-teal-600 dark:text-teal-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    <span>Multilingual Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Quote Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
            <div className="flex gap-2 items-center backdrop-blur-md bg-white/50 dark:bg-zinc-900/50 px-5 py-2.5 rounded-full border border-teal-200/50 dark:border-teal-800/50 shadow-lg">
              {medicalQuotes.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    index === currentQuoteIndex
                      ? 'w-10 bg-gradient-to-r from-teal-500 to-cyan-600 shadow-md shadow-teal-500/50'
                      : 'w-2 bg-teal-400/40 dark:bg-teal-600/40 hover:bg-teal-400/60 dark:hover:bg-teal-600/60 cursor-pointer'
                  }`}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Main card with glassmorphism */}
      <Card className="relative z-10 w-full max-w-md backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 border-teal-200/50 dark:border-teal-800/50 shadow-2xl shadow-teal-500/10">
        {/* Animated pulse ring */}
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 rounded-lg blur-lg opacity-20 animate-pulse-slow" />
        
        <CardHeader className="relative space-y-3">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full blur-xl opacity-50 animate-pulse-slow" />
              <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 p-4 rounded-full shadow-lg">
                <Activity className="w-8 h-8 text-white animate-heartbeat" />
              </div>
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
              <div suppressHydrationWarning>
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
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-teal-700 dark:text-teal-300 flex items-center gap-2">
                <Stethoscope size={16} className="animate-pulse-slow" />
                Password
              </label>
              <div suppressHydrationWarning>
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

            <div suppressHydrationWarning>
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
            </div>

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

            <div suppressHydrationWarning>
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
            </div>
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
