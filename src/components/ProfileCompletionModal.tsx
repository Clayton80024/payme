import { useState } from 'react'
import { profileService } from '../services/profileService'
import type { UserProfile } from '../services/profileService'

interface ProfileCompletionModalProps {
  isOpen: boolean
  onComplete: () => void
  userProfile: UserProfile
}

const ProfileCompletionModal = ({ isOpen, onComplete, userProfile }: ProfileCompletionModalProps) => {
  const [businessName, setBusinessName] = useState('')
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!businessName.trim()) {
      setError('Business name is required')
      return
    }
    
    if (!phone.trim()) {
      setError('Phone number is required')
      return
    }

    if (phone.trim().length < 10) {
      setError('Please enter a valid phone number')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      console.log('Attempting to update profile for user:', userProfile.user_id)
      console.log('Update data:', { business_name: businessName.trim(), phone: phone.trim() })

      // Update profile with business info
      const { profile: updatedProfile, error: updateError } = await profileService.updateProfileWithValidation(
        userProfile.user_id,
        {
          business_name: businessName.trim(),
          phone: phone.trim()
        }
      )

      console.log('Update result:', { updatedProfile, updateError })

      if (updateError) {
        setError(updateError.message)
        return
      }

      // Profile completed successfully
      onComplete()
    } catch (error) {
      console.error('Profile completion error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark px-8 py-8 text-center">
          <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Complete Your Business Setup</h2>
          <p className="text-green-100 text-sm">
            Hi {userProfile.name}! Let's set up your business profile to start accepting payments.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                <span className="text-red-700 text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Business Name Field */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-dark mb-3">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter your business name"
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-base font-medium bg-white transition-all duration-200"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Phone Number Field */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-dark mb-3">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-base font-medium bg-white transition-all duration-200"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:from-primary-dark hover:to-primary transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Setting up your profile...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                <span>Complete Setup</span>
              </div>
            )}
          </button>

          {/* Info Text */}
          <p className="text-center text-xs text-gray-500 mt-4">
            This information helps your customers identify your business and contact you if needed.
          </p>
        </form>
      </div>
    </div>
  )
}

export default ProfileCompletionModal