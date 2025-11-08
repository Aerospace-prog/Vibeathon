import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { DoctorProfileCard } from '@/components/dashboard/doctor-profile-card'
import { ArrowLeft, User, Settings, Sparkles, Star, Shield, Award, Heart, Stethoscope, TrendingUp } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s', animationDuration: '20s' }} />
        <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-pink-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s', animationDuration: '25s' }} />
        <div className="absolute bottom-20 left-1/3 w-[450px] h-[450px] bg-blue-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '10s', animationDuration: '30s' }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative container max-w-5xl mx-auto py-8 px-4 space-y-8">
        {/* Hero Section */}
        <div className="relative group">
          {/* Mega glow effect */}
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-3xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse-slow" />
          
          <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl border-2 border-white/20 shadow-2xl overflow-hidden p-8 md:p-12">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 animate-gradient-shift" style={{ backgroundSize: '200% 200%' }} />
            
            {/* Sparkle decorations */}
            <Sparkles className="absolute top-6 right-6 w-8 h-8 text-yellow-400 animate-pulse" />
            <Star className="absolute bottom-6 left-6 w-6 h-6 text-pink-400 animate-spin" style={{ animationDuration: '8s' }} />
            <Shield className="absolute top-1/2 right-12 w-6 h-6 text-blue-400 animate-pulse" />
            
            <div className="relative">
              <Link href="/dashboard">
                <Button variant="ghost" className="mb-6 gap-2 hover:bg-purple-100 dark:hover:bg-purple-950/30 group/btn">
                  <ArrowLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
                  Back to Dashboard
                </Button>
              </Link>
              
              <div className="flex items-center gap-5 mb-6">
                {/* Enhanced Icon */}
                <div className="relative">
                  <div className="absolute -inset-3 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur-2xl opacity-75 animate-pulse-slow" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  {/* Badges */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg">
                    <Stethoscope className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-yellow-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg animate-bounce" style={{ animationDuration: '2s' }}>
                    <Award className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-spin" style={{ animationDuration: '8s' }} />
                    <span className="text-sm font-bold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text uppercase tracking-wider">
                      Professional Settings
                    </span>
                    <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x" style={{ backgroundSize: '200% 200%' }}>
                    Profile Settings
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-2 text-lg font-medium">
                    <Shield className="w-5 h-5 text-blue-500" />
                    Manage your professional information and preferences
                    <Heart className="w-5 h-5 text-pink-500 animate-heartbeat fill-pink-500" />
                  </p>
                </div>
              </div>

              {/* Quick Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="group/card relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl blur opacity-50 group-hover/card:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 p-4 rounded-xl border-2 border-purple-200 dark:border-purple-800 shadow-lg transform group-hover/card:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                          Security
                        </div>
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Verified Account
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group/card relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl blur opacity-50 group-hover/card:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/50 dark:to-rose-950/50 p-4 rounded-xl border-2 border-pink-200 dark:border-pink-800 shadow-lg transform group-hover/card:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg shadow-lg">
                        <Award className="w-5 h-5 text-white animate-pulse" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wide">
                          Status
                        </div>
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Professional
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group/card relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl blur opacity-50 group-hover/card:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800 shadow-lg transform group-hover/card:scale-105 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-lg">
                        <TrendingUp className="w-5 h-5 text-white animate-bounce" style={{ animationDuration: '2s' }} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                          Rating
                        </div>
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          Excellent
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border-2 border-white/20 shadow-2xl overflow-hidden">
            <DoctorProfileCard />
          </div>
        </div>
      </div>
    </div>
  )
}
