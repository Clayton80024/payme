import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

// Profile data interface matching your Supabase table structure
export interface UserProfile {
  id: string
  created_at: string
  user_id: string
  name: string
  email: string
  business_name?: string
  phone?: string
}

// Service error interface
export interface ProfileServiceError {
  message: string
  code?: string
}

class ProfileService {
  // Get user profile by user ID
  async getProfile(userId: string): Promise<{ profile: UserProfile | null; error: ProfileServiceError | null }> {
    try {
      console.log('Attempting to get profile for user ID:', userId)
      
      // First test basic table access
      console.log('Testing Profile table access...')
      const testResult = await supabase
        .from('Profile')
        .select('*')
        .limit(1)
      
      console.log('Table test result:', testResult)
      
      // Get all profiles for this user, ordered by creation date (most recent first)
      const { data: profiles, error } = await supabase
        .from('Profile')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Handle duplicates by taking the most recent one
      const data = profiles && profiles.length > 0 ? profiles[0] : null
      
      // Clean up duplicates if found
      if (profiles && profiles.length > 1) {
        console.log(`Found ${profiles.length} duplicate profiles for user, cleaning up...`)
        const duplicateIds = profiles.slice(1).map(p => p.id)
        
        supabase
          .from('Profile')
          .delete()
          .in('id', duplicateIds)
          .then(({ error: deleteError }) => {
            if (deleteError) {
              console.warn('Failed to clean up duplicate profiles:', deleteError)
            } else {
              console.log('Successfully cleaned up duplicate profiles')
            }
          })
      }

      if (error) {
        console.error('Get profile error:', error)
        console.error('Error details:', { 
          code: error.code, 
          message: error.message, 
          details: error.details,
          hint: error.hint,
          userId: userId 
        })
        return { 
          profile: null, 
          error: { message: `Failed to load profile: ${error.message}`, code: error.code } 
        }
      }

      if (!data) {
        return { 
          profile: null, 
          error: { message: 'No profile found', code: 'PGRST116' } 
        }
      }

      return { profile: data as UserProfile, error: null }
    } catch (error) {
      console.error('Profile service error:', error)
      return { 
        profile: null, 
        error: { message: 'An unexpected error occurred while loading profile' } 
      }
    }
  }

  // Create initial profile for new user
  async createProfile(user: User, additionalData?: Partial<UserProfile>): Promise<{ profile: UserProfile | null; error: ProfileServiceError | null }> {
    try {
      // First check if profile already exists to prevent duplicates
      const { profile: existingProfile } = await this.getProfile(user.id)
      if (existingProfile) {
        console.log('Profile already exists for user:', user.id)
        return { profile: existingProfile, error: null }
      }

      const profileData = {
        user_id: user.id,
        name: user.user_metadata?.name || additionalData?.name || '',
        email: user.email!,
        business_name: additionalData?.business_name || null,
        phone: additionalData?.phone || null,
      }

      console.log('Creating profile with data:', profileData)

      const { data, error } = await supabase
        .from('Profile')
        .insert([profileData])
        .select()
        .single()

      if (error) {
        console.error('Create profile error:', error)
        return { 
          profile: null, 
          error: { message: 'Failed to create profile', code: error.code } 
        }
      }

      console.log('Profile created successfully for user:', user.email)
      return { profile: data as UserProfile, error: null }
    } catch (error) {
      console.error('Create profile service error:', error)
      return { 
        profile: null, 
        error: { message: 'An unexpected error occurred while creating profile' } 
      }
    }
  }

  // Update user profile
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<{ profile: UserProfile | null; error: ProfileServiceError | null }> {
    try {
      // Remove read-only fields from updates
      const { id, user_id, email, created_at, ...allowedUpdates } = updates
      
      const updateData = {
        ...allowedUpdates,
      }

      console.log('Updating profile with data:', updateData)

      // First, get all profiles for this user to handle duplicates
      const { data: existingProfiles, error: fetchError } = await supabase
        .from('Profile')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching existing profiles:', fetchError)
        return { 
          profile: null, 
          error: { message: `Failed to fetch profile: ${fetchError.message}`, code: fetchError.code } 
        }
      }

      if (!existingProfiles || existingProfiles.length === 0) {
        return { 
          profile: null, 
          error: { message: 'No profile found for user', code: 'NO_PROFILE' } 
        }
      }

      // Use the most recent profile (first in the ordered list)
      const profileToUpdate = existingProfiles[0]
      console.log(`Found ${existingProfiles.length} profiles for user, updating the most recent one:`, profileToUpdate.id)

      // Update the most recent profile using its ID
      const { data, error } = await supabase
        .from('Profile')
        .update(updateData)
        .eq('id', profileToUpdate.id)
        .select()
        .single()

      // Clean up duplicate profiles (keep the most recent one)
      if (existingProfiles.length > 1) {
        console.log(`Cleaning up ${existingProfiles.length - 1} duplicate profiles`)
        const duplicateIds = existingProfiles.slice(1).map(p => p.id)
        
        const { error: deleteError } = await supabase
          .from('Profile')
          .delete()
          .in('id', duplicateIds)
        
        if (deleteError) {
          console.warn('Failed to clean up duplicate profiles:', deleteError)
        } else {
          console.log('Successfully cleaned up duplicate profiles')
        }
      }

      if (error) {
        console.error('Update profile error:', error)
        console.error('Update error details:', { 
          code: error.code, 
          message: error.message, 
          details: error.details,
          hint: error.hint,
          userId: userId,
          updateData: updateData
        })
        return { 
          profile: null, 
          error: { message: `Failed to update profile: ${error.message}`, code: error.code } 
        }
      }

      console.log('Profile updated successfully for user:', userId)
      return { profile: data as UserProfile, error: null }
    } catch (error) {
      console.error('Update profile service error:', error)
      return { 
        profile: null, 
        error: { message: 'An unexpected error occurred while updating profile' } 
      }
    }
  }

  // Get or create profile (useful for ensuring profile exists)
  async getOrCreateProfile(user: User): Promise<{ profile: UserProfile | null; error: ProfileServiceError | null }> {
    try {
      // First, try to get existing profile
      const { profile, error: getError } = await this.getProfile(user.id)
      
      if (profile) {
        return { profile, error: null }
      }

      // If profile doesn't exist, create it
      if (getError?.code === 'PGRST116') { // PostgreSQL "no rows returned" error
        console.log('Profile not found, creating new profile for user:', user.email)
        return await this.createProfile(user)
      }

      // If there was a different error, return it
      return { profile: null, error: getError }
    } catch (error) {
      console.error('Get or create profile service error:', error)
      return { 
        profile: null, 
        error: { message: 'An unexpected error occurred while loading profile' } 
      }
    }
  }

  // Validate profile data before saving
  private validateProfileData(data: Partial<UserProfile>): ProfileServiceError | null {
    if (data.name && data.name.trim().length < 2) {
      return { message: 'Name must be at least 2 characters long' }
    }

    if (data.phone && data.phone.length > 0 && !/^[\+]?[1-9][\d]{0,15}$/.test(data.phone)) {
      return { message: 'Please enter a valid phone number' }
    }

    if (data.business_name && data.business_name.trim().length < 2) {
      return { message: 'Business name must be at least 2 characters long' }
    }

    return null
  }

  // Update profile with validation
  async updateProfileWithValidation(userId: string, updates: Partial<UserProfile>): Promise<{ profile: UserProfile | null; error: ProfileServiceError | null }> {
    // Validate data first
    const validationError = this.validateProfileData(updates)
    if (validationError) {
      return { profile: null, error: validationError }
    }

    // Sanitize data
    const sanitizedUpdates = {
      ...updates,
      name: updates.name?.trim(),
      business_name: updates.business_name?.trim(),
      phone: updates.phone?.trim(),
    }

    return await this.updateProfile(userId, sanitizedUpdates)
  }

  // Check if profile is complete (has business name and phone)
  isProfileComplete(profile: UserProfile): boolean {
    return !!(profile.business_name?.trim() && profile.phone?.trim())
  }

  // Delete profile (for cleanup purposes)
  async deleteProfile(userId: string): Promise<{ error: ProfileServiceError | null }> {
    try {
      const { error } = await supabase
        .from('Profile')
        .delete()
        .eq('user_id', userId)

      if (error) {
        console.error('Delete profile error:', error)
        return { error: { message: 'Failed to delete profile', code: error.code } }
      }

      console.log('Profile deleted successfully for user:', userId)
      return { error: null }
    } catch (error) {
      console.error('Delete profile service error:', error)
      return { error: { message: 'An unexpected error occurred while deleting profile' } }
    }
  }
}

// Export singleton instance
export const profileService = new ProfileService()
export default profileService