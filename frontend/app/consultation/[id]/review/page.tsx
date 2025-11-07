import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import SoapNoteReview from '@/components/SoapNoteReview'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ConsultationReviewPage({ params }: PageProps) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth')
  }

  return <SoapNoteReview consultationId={id} />
}
