import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Heart, Stethoscope, Globe, Zap, Shield, Users, Brain, Languages, FileText, Video, Sparkles, Dna } from 'lucide-react'
import { TranslationDemo } from '@/components/landing/translation-demo'
import { Medical3DIcon } from '@/components/landing/medical-3d-icon'
import { AnimatedLogo } from '@/components/ui/animated-logo'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-teal-950 dark:via-cyan-950 dark:to-blue-950">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <AnimatedLogo size="md" href="/" />

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="relative text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-teal-600 dark:hover:text-teal-400 transition-all flex items-center gap-1 group">
                <span className="relative">
                  Features
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-600 group-hover:w-full transition-all duration-300" />
                </span>
                <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-300" />
              </a>

              <a href="#technology" className="relative text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-teal-600 dark:hover:text-teal-400 transition-all flex items-center gap-1 group">
                <span className="relative">
                  Technology
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 group-hover:w-full transition-all duration-300" />
                </span>
                <Brain className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
              </a>

              <a href="#pricing" className="relative text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-teal-600 dark:hover:text-teal-400 transition-all flex items-center gap-1 group">
                <span className="relative">
                  Pricing
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-teal-600 group-hover:w-full transition-all duration-300" />
                </span>
                <Zap className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-300" />
              </a>

              <a href="#contact" className="relative text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-teal-600 dark:hover:text-teal-400 transition-all flex items-center gap-1 group">
                <span className="relative">
                  Contact
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-600 group-hover:w-full transition-all duration-300" />
                </span>
                <Heart className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:scale-110 animate-heartbeat transition-all duration-300" />
              </a>
            </div>

            {/* Trust Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-teal-50 dark:bg-teal-950/30 rounded-full border border-teal-200/50 dark:border-teal-800/50">
              <Shield className="w-3 h-3 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-semibold text-teal-700 dark:text-teal-300">HIPAA Compliant</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/auth">
                <Button variant="ghost" className="text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-all">
                  <Heart className="w-4 h-4 mr-2 animate-heartbeat" />
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 via-cyan-400/10 to-blue-400/10" />

        <div className="max-w-7xl mx-auto px-6 py-20 md:py-32 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-teal-100 dark:bg-teal-900/30 px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">
                  AI-Powered Healthcare Platform
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  Breaking Language Barriers
                </span>
                <br />
                <span className="text-zinc-900 dark:text-zinc-100">
                  in Healthcare
                </span>
              </h1>

              <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Real-time Hindi-English translation for medical consultations.
                Empowering doctors and patients to communicate seamlessly with AI-powered SOAP notes.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/auth">
                  <Button size="lg" className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white text-lg px-8 py-6">
                    <Heart className="w-5 h-5 mr-2" />
                    Start Free Trial
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 text-lg px-8 py-6">
                  <Video className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">1000+ Doctors</span>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-8 border border-teal-200/50 dark:border-teal-800/50 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    {/* Animated Stethoscope Icon */}
                    <div className="relative group">
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity animate-pulse-slow" />

                      {/* Main icon container */}
                      <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-xl shadow-lg transform group-hover:scale-110 transition-all duration-300">
                        <Stethoscope className="w-6 h-6 text-white animate-pulse" />

                        {/* Pulse rings */}
                        <div className="absolute inset-0 rounded-xl border-2 border-white/30 animate-ping" />
                      </div>

                      {/* 3D shadow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-cyan-700 rounded-xl transform translate-x-0.5 translate-y-0.5 -z-10" />
                    </div>

                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">Live Translation</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Hindi ↔ English</p>
                    </div>
                  </div>

                  {/* Animated Translation Demo */}
                  <TranslationDemo />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3D Medical Visualization Section */}
      <section id="technology" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-50/50 to-transparent dark:via-teal-950/50" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
              Powered by Advanced AI Technology
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              Multiple AI models working together for accurate healthcare translation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* 3D Visualization */}
            <div className="order-2 md:order-1">
              <Medical3DIcon />
            </div>

            {/* AI Models Description */}
            <div className="order-1 md:order-2 space-y-6">
              <div className="flex items-start gap-4 p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-teal-200/50 dark:border-teal-800/50">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-2 rounded-lg flex-shrink-0">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    Google Cloud Speech-to-Text
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Real-time audio transcription with Hindi-English code-switching support
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-cyan-200/50 dark:border-cyan-800/50">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg flex-shrink-0">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    Google Gemini LLM
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    AI-powered SOAP note generation and compassion reflex analysis
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                <div className="bg-gradient-to-br from-blue-500 to-teal-600 p-2 rounded-lg flex-shrink-0">
                  <Dna className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    Vector Embeddings (GTE-Small)
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Semantic search for medical terminology and regional language matching
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-teal-200/50 dark:border-teal-800/50">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-2 rounded-lg flex-shrink-0">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    Google Translate API
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Instant Hindi-English translation with medical context awareness
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50 dark:bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
              Powerful Features for Modern Healthcare
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              Everything you need to provide exceptional patient care
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-teal-200/50 dark:border-teal-800/50 hover:shadow-xl transition-shadow group">
              <CardHeader>
                <div className="relative w-fit mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-xl shadow-lg transform group-hover:scale-110 transition-all duration-300">
                    <Languages className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-cyan-700 rounded-xl transform translate-x-0.5 translate-y-0.5 -z-10" />
                </div>
                <CardTitle>Real-Time Translation</CardTitle>
                <CardDescription>
                  Instant Hindi-English translation during video consultations with AI-powered accuracy
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-cyan-200/50 dark:border-cyan-800/50 hover:shadow-xl transition-shadow group">
              <CardHeader>
                <div className="relative w-fit mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl shadow-lg transform group-hover:scale-110 transition-all duration-300">
                    <FileText className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl transform translate-x-0.5 translate-y-0.5 -z-10" />
                </div>
                <CardTitle>SOAP Note Generation</CardTitle>
                <CardDescription>
                  Automated clinical documentation with AI-generated SOAP notes from consultation transcripts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-blue-200/50 dark:border-blue-800/50 hover:shadow-xl transition-shadow group">
              <CardHeader>
                <div className="relative w-fit mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-teal-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-blue-500 to-teal-600 p-3 rounded-xl shadow-lg transform group-hover:scale-110 transition-all duration-300">
                    <Brain className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-teal-700 rounded-xl transform translate-x-0.5 translate-y-0.5 -z-10" />
                </div>
                <CardTitle>Compassion Reflex</CardTitle>
                <CardDescription>
                  AI-powered suggestions to remove stigmatizing language and promote person-first care
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-teal-200/50 dark:border-teal-800/50 hover:shadow-xl transition-shadow group">
              <CardHeader>
                <div className="relative w-fit mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-xl shadow-lg transform group-hover:scale-110 transition-all duration-300">
                    <Video className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-cyan-700 rounded-xl transform translate-x-0.5 translate-y-0.5 -z-10" />
                </div>
                <CardTitle>Video Consultations</CardTitle>
                <CardDescription>
                  High-quality WebRTC video calls with live captions and translation overlay
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-cyan-200/50 dark:border-cyan-800/50 hover:shadow-xl transition-shadow group">
              <CardHeader>
                <div className="relative w-fit mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl shadow-lg transform group-hover:scale-110 transition-all duration-300">
                    <Globe className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl transform translate-x-0.5 translate-y-0.5 -z-10" />
                </div>
                <CardTitle>Community Lexicon</CardTitle>
                <CardDescription>
                  Crowdsourced medical terminology database for regional language accuracy
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-blue-200/50 dark:border-blue-800/50 hover:shadow-xl transition-shadow group">
              <CardHeader>
                <div className="relative w-fit mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-teal-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-blue-500 to-teal-600 p-3 rounded-xl shadow-lg transform group-hover:scale-110 transition-all duration-300">
                    <Shield className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-teal-700 rounded-xl transform translate-x-0.5 translate-y-0.5 -z-10" />
                </div>
                <CardTitle>HIPAA Compliant</CardTitle>
                <CardDescription>
                  Enterprise-grade security with end-to-end encryption and compliance standards
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Healthcare?
            </h2>
            <p className="text-xl text-teal-50 mb-8">
              Join thousands of doctors providing better care with AI-powered translation
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="bg-white text-teal-600 hover:bg-teal-50 text-lg px-8 py-6">
                  <Heart className="w-5 h-5 mr-2" />
                  Start Free Trial
                </Button>
              </Link>
              <Button size="lg" className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-teal-600 text-lg px-8 py-6 font-semibold">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t bg-white/50 dark:bg-zinc-900/50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <AnimatedLogo size="md" href="/" />
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Breaking language barriers in healthcare with AI-powered translation.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Product</h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400">Features</a></li>
                <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400">Pricing</a></li>
                <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400">Security</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Company</h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400">About</a></li>
                <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400">Blog</a></li>
                <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400">Careers</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Legal</h3>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400">Privacy</a></li>
                <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400">Terms</a></li>
                <li><a href="#" className="hover:text-teal-600 dark:hover:text-teal-400">HIPAA</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-800 mt-8 pt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
            <p>© 2024 Arogya-AI. All rights reserved. Built with ❤️ for healthcare professionals.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
