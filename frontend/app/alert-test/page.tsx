import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import AlertEngineTest from '@/components/alerts/AlertEngineTest'

export default async function AlertTestPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth')
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Navigation Header */}
      <header className="border-b bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold">Arogya-AI</h1>
              <span className="text-sm text-muted-foreground">
                Alert Engine Testing
              </span>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">🏥 Alert Engine Testing</h2>
          <p className="text-muted-foreground">
            Test the real-time medical alert detection system with dynamic input.
            Type any patient speech to see how the Alert Engine detects critical symptoms.
          </p>
        </div>

        <AlertEngineTest />
      </main>
    </div>
  )
}
