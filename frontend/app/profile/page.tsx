import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { DoctorProfileCard } from '@/components/dashboard/doctor-profile-card'
import { ArrowLeft, User, Settings, Shield, Award, Stethoscope } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-950 dark:via-cyan-950 dark:to-blue-950">
      <div className="container max-w-5xl mx-auto py-8 px-4 space-y-8">
        {/* Hero Section */}
        <div className="relative mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-950/30 dark:via-cyan-950/30 dark:to-blue-950/30 rounded-3xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 via-cyan-400/10 to-blue-400/10 rounded-3xl" />
          
          <div className="relative p-8 md:p-12">
            <Link href="/dashboard">
              <Button variant="ghost" className="mb-6 gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl blur-md opacity-50" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Settings className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                    Professional Settings
                  </span>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  Profile Settings
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                  Manage your professional information and preferences
                </p>
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm p-4 rounded-xl border border-teal-200/50 dark:border-teal-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Security
                    </div>
                    <div className="text-sm font-semibold">
                      Protected
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm p-4 rounded-xl border border-cyan-200/50 dark:border-cyan-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Status
                    </div>
                    <div className="text-sm font-semibold flex items-center gap-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                      </span>
                      Active
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Rating
                    </div>
                    <div className="text-sm font-semibold">
                      Excellent
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <DoctorProfileCard />
      </div>
    </div>
  )
}
