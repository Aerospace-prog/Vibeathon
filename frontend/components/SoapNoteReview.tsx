'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { AlertCircle, CheckCircle, Lightbulb, RefreshCw, ArrowLeft } from 'lucide-react'
import { LoadingOverlay } from '@/components/ui/spinner'
import { toast } from 'sonner'

interface SoapNoteReviewProps {
  consultationId: string
}

interface SoapNote {
  subjective: string
  objective: string
  assessment: string
  plan: string
}

interface StigmaSuggestion {
  section: 'assessment' | 'plan'
  original: string
  suggested: string
  rationale: string
}

interface LexiconContribution {
  term_english: string
  term_regional: string
  language: string
}

export default function SoapNoteReview({ consultationId }: SoapNoteReviewProps) {
  const router = useRouter()
  
  // State for SOAP note sections
  const [soapNote, setSoapNote] = useState<SoapNote>({
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  })
  
  // State for de-stigmatization suggestions
  const [suggestions, setSuggestions] = useState<StigmaSuggestion[]>([])
  
  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Modal state for Community Lexicon
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [lexiconForm, setLexiconForm] = useState<LexiconContribution>({
    term_english: '',
    term_regional: '',
    language: 'hi'
  })
  const [isSubmittingLexicon, setIsSubmittingLexicon] = useState(false)

  // Fetch SOAP note and suggestions on component mount
  useEffect(() => {
    const fetchSoapNote = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('consultations')
          .select('raw_soap_note, de_stigma_suggestions')
          .eq('id', consultationId)
          .single()

        if (fetchError) {
          throw fetchError
        }

        if (!data) {
          throw new Error('Consultation not found')
        }

        // Parse and set SOAP note
        if (data.raw_soap_note) {
          setSoapNote(data.raw_soap_note as SoapNote)
        } else {
          toast.warning('No SOAP note found. It may not have been generated yet.')
        }

        // Parse and set de-stigmatization suggestions
        if (data.de_stigma_suggestions && data.de_stigma_suggestions.suggestions) {
          setSuggestions(data.de_stigma_suggestions.suggestions as StigmaSuggestion[])
        }

      } catch (err) {
        console.error('Error fetching SOAP note:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to load SOAP note'
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSoapNote()
  }, [consultationId])

  // Handle SOAP note section updates
  const handleSectionChange = (section: keyof SoapNote, value: string) => {
    setSoapNote(prev => ({
      ...prev,
      [section]: value
    }))
  }

  // Handle accepting a de-stigmatization suggestion
  const handleAcceptSuggestion = (suggestion: StigmaSuggestion) => {
    try {
      const section = suggestion.section
      const currentText = soapNote[section]
      const updatedText = currentText.replace(suggestion.original, suggestion.suggested)
      
      handleSectionChange(section, updatedText)
      
      // Remove the suggestion from the list
      setSuggestions(prev => prev.filter(s => s !== suggestion))
      
      // Show success feedback
      toast.success('Suggestion applied successfully')
    } catch (err) {
      console.error('Error applying suggestion:', err)
      toast.error('Failed to apply suggestion')
    }
  }

  // Handle Community Lexicon contribution
  const handleLexiconSubmit = async () => {
    try {
      setIsSubmittingLexicon(true)
      setError(null)

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      
      const response = await fetch(`${backendUrl}/community_lexicon/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lexiconForm)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Failed to submit lexicon term')
      }

      // Show success message
      toast.success('Thank you! Your term has been added to the Community Lexicon.')
      
      // Reset form and close modal
      setLexiconForm({
        term_english: '',
        term_regional: '',
        language: 'hi'
      })
      setIsModalOpen(false)

    } catch (err) {
      console.error('Error submitting lexicon term:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit term'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmittingLexicon(false)
    }
  }

  // Handle final approval and save
  const handleApproveAndSave = async () => {
    try {
      setIsSaving(true)
      setError(null)

      const { error: updateError } = await supabase
        .from('consultations')
        .update({
          raw_soap_note: soapNote,
          approved: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', consultationId)

      if (updateError) {
        throw updateError
      }

      // Show success message
      toast.success('SOAP note approved and saved successfully!')
      
      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)

    } catch (err) {
      console.error('Error saving SOAP note:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to save SOAP note'
      setError(errorMessage)
      toast.error(errorMessage)
      setIsSaving(false)
    }
  }

  const handleRetry = () => {
    window.location.reload()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <LoadingOverlay message="Loading SOAP note..." />
      </div>
    )
  }

  if (error && !soapNote.subjective && !soapNote.objective) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <CardTitle>Failed to Load SOAP Note</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <div className="flex gap-3">
              <Button onClick={handleRetry} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Navigation Header */}
      <header className="border-b bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-2xl font-bold">Arogya-AI</h1>
              <span className="text-sm text-muted-foreground">
                SOAP Note Review
              </span>
            </div>
            <div className="flex gap-3">
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Suggest Better Term
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Contribute to Community Lexicon</DialogTitle>
                    <DialogDescription>
                      Help improve translations by adding regional medical terms
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="term_english" className="text-sm font-medium">
                        English Term
                      </label>
                      <Input
                        id="term_english"
                        placeholder="e.g., fever"
                        value={lexiconForm.term_english}
                        onChange={(e) => setLexiconForm(prev => ({
                          ...prev,
                          term_english: e.target.value
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="term_regional" className="text-sm font-medium">
                        Regional Term
                      </label>
                      <Input
                        id="term_regional"
                        placeholder="e.g., बुखार"
                        value={lexiconForm.term_regional}
                        onChange={(e) => setLexiconForm(prev => ({
                          ...prev,
                          term_regional: e.target.value
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="language" className="text-sm font-medium">
                        Language
                      </label>
                      <Input
                        id="language"
                        placeholder="e.g., hi (Hindi)"
                        value={lexiconForm.language}
                        onChange={(e) => setLexiconForm(prev => ({
                          ...prev,
                          language: e.target.value
                        }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      disabled={isSubmittingLexicon}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleLexiconSubmit}
                      disabled={
                        isSubmittingLexicon ||
                        !lexiconForm.term_english ||
                        !lexiconForm.term_regional ||
                        !lexiconForm.language
                      }
                    >
                      {isSubmittingLexicon ? 'Submitting...' : 'Submit'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button
                onClick={handleApproveAndSave}
                disabled={isSaving}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Approve and Save Record'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Error Message */}
        {error && (soapNote.subjective || soapNote.objective) && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Subjective Section */}
          <Card>
            <CardHeader>
              <CardTitle>Subjective</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={soapNote.subjective}
                onChange={(e) => handleSectionChange('subjective', e.target.value)}
                placeholder="Patient's reported symptoms and history..."
                className="min-h-32"
              />
            </CardContent>
          </Card>

          {/* Objective Section */}
          <Card>
            <CardHeader>
              <CardTitle>Objective</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={soapNote.objective}
                onChange={(e) => handleSectionChange('objective', e.target.value)}
                placeholder="Observable findings and measurements..."
                className="min-h-32"
              />
            </CardContent>
          </Card>

          {/* Assessment Section */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={soapNote.assessment}
                onChange={(e) => handleSectionChange('assessment', e.target.value)}
                placeholder="Clinical diagnosis and interpretation..."
                className="min-h-32"
              />
              
              {/* Display suggestions for assessment section */}
              {suggestions
                .filter(s => s.section === 'assessment')
                .map((suggestion, index) => (
                  <Alert key={index} className="border-amber-500 bg-amber-50 dark:bg-amber-950">
                    <Lightbulb className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-900 dark:text-amber-100">
                      Compassion Reflex Suggestion
                    </AlertTitle>
                    <AlertDescription className="space-y-2">
                      <div>
                        <span className="font-semibold">Original:</span>{' '}
                        <span className="text-amber-900 dark:text-amber-100">
                          "{suggestion.original}"
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold">Suggested:</span>{' '}
                        <span className="text-green-700 dark:text-green-400">
                          "{suggestion.suggested}"
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-semibold">Rationale:</span> {suggestion.rationale}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAcceptSuggestion(suggestion)}
                        className="mt-2"
                      >
                        Accept Suggestion
                      </Button>
                    </AlertDescription>
                  </Alert>
                ))}
            </CardContent>
          </Card>

          {/* Plan Section */}
          <Card>
            <CardHeader>
              <CardTitle>Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={soapNote.plan}
                onChange={(e) => handleSectionChange('plan', e.target.value)}
                placeholder="Treatment plan and follow-up..."
                className="min-h-32"
              />
              
              {/* Display suggestions for plan section */}
              {suggestions
                .filter(s => s.section === 'plan')
                .map((suggestion, index) => (
                  <Alert key={index} className="border-amber-500 bg-amber-50 dark:bg-amber-950">
                    <Lightbulb className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-900 dark:text-amber-100">
                      Compassion Reflex Suggestion
                    </AlertTitle>
                    <AlertDescription className="space-y-2">
                      <div>
                        <span className="font-semibold">Original:</span>{' '}
                        <span className="text-amber-900 dark:text-amber-100">
                          "{suggestion.original}"
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold">Suggested:</span>{' '}
                        <span className="text-green-700 dark:text-green-400">
                          "{suggestion.suggested}"
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-semibold">Rationale:</span> {suggestion.rationale}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAcceptSuggestion(suggestion)}
                        className="mt-2"
                      >
                        Accept Suggestion
                      </Button>
                    </AlertDescription>
                  </Alert>
                ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
