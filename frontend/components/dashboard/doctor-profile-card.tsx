'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { User, Edit2, Save, X, Briefcase, DollarSign } from 'lucide-react'

interface DoctorProfile {
  id: string
  email: string
  full_name: string | null
  specialization: string | null
  years_of_experience: number | null
  consultation_fee: number | null
  is_available: boolean | null
}

export function DoctorProfileCard() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<DoctorProfile>>({})

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) throw error
      setProfile(data)
      setEditedProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return
    setIsSaving(true)

    try {
      const updateData = {
        full_name: editedProfile.full_name,
        specialization: editedProfile.specialization,
        years_of_experience: editedProfile.years_of_experience ?? 0,
        consultation_fee: editedProfile.consultation_fee ?? 0,
        is_available: editedProfile.is_available ?? true,
      }

      console.log('Updating profile with:', updateData)

      const { data, error } = await supabase
        .from('doctors')
        .update(updateData)
        .eq('id', profile.id)
        .select()

      console.log('Update response:', { data, error })

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      setProfile({ ...profile, ...editedProfile } as DoctorProfile)
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      const errorMessage = error?.message || error?.details || 'Failed to update profile. Please check console for details.'
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile || {})
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Profile not found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Doctor Profile</CardTitle>
            <CardDescription>Manage your professional information</CardDescription>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="outline" size="sm" disabled={isSaving}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} size="sm" disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email (Read-only) */}
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={profile.email} disabled />
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            value={isEditing ? editedProfile.full_name || '' : profile.full_name || ''}
            onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
            disabled={!isEditing}
            placeholder="Dr. John Doe"
          />
        </div>

        {/* Specialization */}
        <div className="space-y-2">
          <Label htmlFor="specialization">Specialization</Label>
          <Input
            id="specialization"
            value={isEditing ? editedProfile.specialization || '' : profile.specialization || ''}
            onChange={(e) => setEditedProfile({ ...editedProfile, specialization: e.target.value })}
            disabled={!isEditing}
            placeholder="e.g., General Physician, Cardiologist"
          />
        </div>

        {/* Years of Experience */}
        <div className="space-y-2">
          <Label htmlFor="years_of_experience">
            <Briefcase className="w-4 h-4 inline mr-2" />
            Years of Experience
          </Label>
          <Input
            id="years_of_experience"
            type="number"
            min="0"
            value={isEditing ? (editedProfile.years_of_experience ?? 0) : (profile.years_of_experience ?? 0)}
            onChange={(e) => setEditedProfile({ ...editedProfile, years_of_experience: parseInt(e.target.value) || 0 })}
            disabled={!isEditing}
            placeholder="0"
          />
        </div>

        {/* Consultation Fee */}
        <div className="space-y-2">
          <Label htmlFor="consultation_fee">
            <DollarSign className="w-4 h-4 inline mr-2" />
            Consultation Fee (₹)
          </Label>
          <Input
            id="consultation_fee"
            type="number"
            min="0"
            step="0.01"
            value={isEditing ? (editedProfile.consultation_fee ?? 0) : (profile.consultation_fee ?? 0)}
            onChange={(e) => setEditedProfile({ ...editedProfile, consultation_fee: parseFloat(e.target.value) || 0 })}
            disabled={!isEditing}
            placeholder="500.00"
          />
        </div>

        {/* Availability Toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="is_available" className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${(isEditing ? editedProfile.is_available : profile.is_available) ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              Available for Consultations
            </Label>
            <button
              type="button"
              onClick={() => {
                if (isEditing) {
                  setEditedProfile({ ...editedProfile, is_available: !editedProfile.is_available })
                }
              }}
              disabled={!isEditing}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                (isEditing ? editedProfile.is_available : profile.is_available) ? 'bg-green-500' : 'bg-gray-300'
              } ${!isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  (isEditing ? editedProfile.is_available : profile.is_available) ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            {(isEditing ? editedProfile.is_available : profile.is_available) 
              ? 'You are visible to patients and can receive appointments' 
              : 'You are not accepting new appointments'}
          </p>
        </div>

        {/* Professional Summary */}
        {!isEditing && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Experience</p>
                <p className="font-medium">{profile.years_of_experience ?? 0} years</p>
              </div>
              <div>
                <p className="text-muted-foreground">Consultation Fee</p>
                <p className="font-medium">₹{(profile.consultation_fee ?? 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
