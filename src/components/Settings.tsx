import { useState, useEffect } from 'react'
import { authService } from '../services/authService'
import { profileService } from '../services/profileService'
import type { UserProfile } from '../services/profileService'

const Settings = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: false,
    marketing: false
  })

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: ''
  })

  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: '30',
    autoLogout: true
  })

  // Reset profile data when user changes (for security)
  useEffect(() => {
    setProfile({ name: '', email: '', phone: '', businessName: '' })
    setOriginalProfile(null)
    setError(null)
    setSuccessMessage(null)
  }, []) // This runs when component mounts/remounts

  // Load user profile on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get current user
        const { user, error: userError } = await authService.getUser()
        if (userError || !user) {
          setError('Failed to load user information')
          return
        }

        // Get or create profile
        const { profile: userProfile, error: profileError } = await profileService.getOrCreateProfile(user)
        if (profileError) {
          setError(profileError.message)
          return
        }

        if (userProfile) {
          // Set profile data
          setOriginalProfile(userProfile)
          const profileData = {
            name: userProfile.name || '',
            email: userProfile.email || user.email || '',
            phone: userProfile.phone || '',
            businessName: userProfile.business_name || ''
          }
          console.log('Loaded profile data:', profileData)
          setProfile(profileData)
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
        setError('An unexpected error occurred while loading your profile')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleProfileChange = (key: keyof typeof profile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSecurityChange = (key: keyof typeof security, value: boolean | string) => {
    setSecurity(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!originalProfile) {
      setError('No profile data to save')
      return
    }

    // Validate required fields
    if (!profile.businessName.trim()) {
      setError('Business name is required')
      return
    }

    if (!profile.phone.trim()) {
      setError('Phone number is required')
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      setSuccessMessage(null)

      // Update profile
      const { profile: updatedProfile, error: updateError } = await profileService.updateProfileWithValidation(
        originalProfile.user_id,
        {
          name: profile.name,
          phone: profile.phone,
          business_name: profile.businessName
        }
      )

      if (updateError) {
        setError(updateError.message)
        return
      }

      if (updatedProfile) {
        setOriginalProfile(updatedProfile)
        setSuccessMessage('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
      setError('An unexpected error occurred while saving your profile')
    } finally {
      setIsSaving(false)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-light flex items-center justify-center p-3 sm:p-6 lg:p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-light p-3 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 mb-6 sm:mb-8 shadow-lg border border-gray-100">
          <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="bg-gradient-to-br from-primary to-primary-dark p-3 sm:p-4 rounded-2xl">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-dark">Settings</h1>
              <p className="text-gray-medium text-base sm:text-lg lg:text-xl">Manage your account preferences</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* Profile Completion Warning */}
          {!isLoading && (!profile.businessName.trim() || !profile.phone.trim()) && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-orange-800 mb-1">Complete Your Profile Setup</h3>
                  <p className="text-orange-700 text-sm">
                    Please complete your business information below to start accepting payments.
                  </p>
                  <p className="text-xs text-orange-600 mt-2 font-mono">
                    Debug: Business: "{profile.businessName}" | Phone: "{profile.phone}"
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {!profile.businessName.trim() && (
                  <div className="flex items-center gap-2 text-orange-700 text-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span>Add your business name</span>
                  </div>
                )}
                {!profile.phone.trim() && (
                  <div className="flex items-center gap-2 text-orange-700 text-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span>Add your phone number</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profile Settings */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 sm:px-8 py-5 sm:py-6 border-b border-gray-100">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-dark mb-2">Profile Information</h2>
              <p className="text-gray-medium text-sm sm:text-base">Update your personal and business details</p>
            </div>
            
            <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-red-700 text-sm font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-green-700 text-sm font-medium">{successMessage}</span>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-dark mb-2 sm:mb-3">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary text-base sm:text-lg font-medium bg-white transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-dark mb-2 sm:mb-3">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full px-4 sm:px-5 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl text-base sm:text-lg font-medium bg-gray-50 text-gray-500 cursor-not-allowed transition-all duration-200"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed for security reasons</p>
                </div>
                
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-dark mb-2 sm:mb-3">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    required
                    placeholder="Enter your phone number"
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary text-base sm:text-lg font-medium bg-white transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-gray-dark mb-2 sm:mb-3">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={profile.businessName}
                    onChange={(e) => handleProfileChange('businessName', e.target.value)}
                    required
                    placeholder="Enter your business name"
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary text-base sm:text-lg font-medium bg-white transition-all duration-200"
                  />
                </div>
              </div>
              
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 sm:px-8 py-5 sm:py-6 border-b border-gray-100">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-dark mb-2">Notifications</h2>
              <p className="text-gray-medium text-sm sm:text-base">Choose how you want to be notified</p>
            </div>
            
            <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-dark capitalize">
                      {key === 'sms' ? 'SMS' : key} Notifications
                    </h3>
                    <p className="text-gray-medium text-sm sm:text-base">
                      {key === 'email' && 'Receive payment confirmations via email'}
                      {key === 'sms' && 'Get text messages for important updates'}
                      {key === 'push' && 'Browser push notifications'}
                      {key === 'marketing' && 'Product updates and promotional content'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange(key as keyof typeof notifications)}
                    className={`relative inline-flex h-6 w-11 sm:h-7 sm:w-12 items-center rounded-full transition-colors duration-200 ${
                      value ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white transition-transform duration-200 ${
                        value ? 'translate-x-6 sm:translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 sm:px-8 py-5 sm:py-6 border-b border-gray-100">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-dark mb-2">Security</h2>
              <p className="text-gray-medium text-sm sm:text-base">Protect your account with security options</p>
            </div>
            
            <div className="p-6 sm:p-8 space-y-6 sm:space-y-8">
              <div className="flex items-center justify-between py-2">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-dark">Two-Factor Authentication</h3>
                  <p className="text-gray-medium text-sm sm:text-base">Add an extra layer of security to your account</p>
                </div>
                <button
                  onClick={() => handleSecurityChange('twoFactor', !security.twoFactor)}
                  className={`relative inline-flex h-6 w-11 sm:h-7 sm:w-12 items-center rounded-full transition-colors duration-200 ${
                    security.twoFactor ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white transition-transform duration-200 ${
                      security.twoFactor ? 'translate-x-6 sm:translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-dark mb-2 sm:mb-3">
                  Session Timeout (minutes)
                </label>
                <select
                  value={security.sessionTimeout}
                  onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary text-base sm:text-lg font-medium bg-white transition-all duration-200"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-dark">Auto Logout</h3>
                  <p className="text-gray-medium text-sm sm:text-base">Automatically log out after period of inactivity</p>
                </div>
                <button
                  onClick={() => handleSecurityChange('autoLogout', !security.autoLogout)}
                  className={`relative inline-flex h-6 w-11 sm:h-7 sm:w-12 items-center rounded-full transition-colors duration-200 ${
                    security.autoLogout ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white transition-transform duration-200 ${
                      security.autoLogout ? 'translate-x-6 sm:translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center sm:justify-end">
            <button 
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-4 sm:py-5 px-8 sm:px-12 lg:px-16 rounded-2xl sm:rounded-3xl text-lg sm:text-xl lg:text-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:from-primary-dark hover:to-primary transform hover:scale-[1.02] active:scale-95 border border-primary-dark disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSaving ? (
                <div className="flex items-center justify-center gap-3 sm:gap-4">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3 sm:gap-4">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span>Save Changes</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings