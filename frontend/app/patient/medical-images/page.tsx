import Link from 'next/link'
import { ArrowLeft, Sparkles, Brain, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import MedicalImageUpload from '@/components/patient/MedicalImageUpload'

export default function MedicalImagesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950 dark:via-pink-950 dark:to-orange-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            asChild
            variant="ghost"
            className="gap-2 hover:bg-white/50 dark:hover:bg-slate-800/50 backdrop-blur-sm"
          >
            <Link href="/patient/dashboard">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Header Card */}
        <Card className="mb-8 border-2 border-white/20 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-2xl shadow-lg">
                  <Brain className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                    AI Medical Image Analysis
                  </h1>
                  <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  Upload photos of skin conditions, wounds, or rashes for instant AI-powered preliminary assessment
                </p>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 mt-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full border border-purple-200 dark:border-purple-800 shadow-sm">
                <Brain className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Google Gemini Vision AI</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full border border-pink-200 dark:border-pink-800 shadow-sm">
                <Shield className="w-4 h-4 text-pink-600" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Instant Analysis</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full border border-orange-200 dark:border-orange-800 shadow-sm">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Preliminary Assessment</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Upload Component */}
        <MedicalImageUpload />
      </div>
    </div>
  )
}
