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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 dark:from-cyan-950 dark:via-blue-950 dark:to-teal-950">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your professional information and preferences
          </p>
        </div>
        
        <DoctorProfileCard />
      </div>
    </div>
  )
}
