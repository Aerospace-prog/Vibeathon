import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import VideoCallRoomWithSignaling from '@/components/VideoCallRoomWithSignaling'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ userType?: string }>
}

export default async function ConsultationRoomPage({ params, searchParams }: PageProps) {
  const supabase = await createClient()
  const { id } = await params
  const { userType } = await searchParams

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth')
  }

  // Validate userType
  const validUserType = userType === 'doctor' || userType === 'patient' ? userType : 'doctor'

  return <VideoCallRoomWithSignaling consultationId={id} userType={validUserType} />
}
