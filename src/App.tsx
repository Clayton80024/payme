import { useState, useRef, useEffect } from 'react'
import PaymentPage from './components/PaymentPage'
import Dashboard from './components/Dashboard'
import Settings from './components/Settings'
import AuthModal from './components/AuthModal'
import ProfileCompletionModal from './components/ProfileCompletionModal'
import LogoutConfirmationModal from './components/LogoutConfirmationModal'
import { authService } from './services/authService'
import { profileService } from './services/profileService'
import type { User, Session } from '@supabase/supabase-js'
import type { UserProfile } from './services/profileService'

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'payment' | 'settings'>('dashboard')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [_user, setUser] = useState<User | null>(null) // Current authenticated user
  const [_session, setSession] = useState<Session | null>(null) // Current auth session
  const [isLoading, setIsLoading] = useState(true)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isProfileComplete, setIsProfileComplete] = useState(false)
  const [showProfileCompletion, setShowProfileCompletion] = useState(false)
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Load user profile and check completion status
  const loadUserProfile = async (user: User) => {
    try {
      setIsProfileLoading(true)
      console.log('Loading profile for user:', user.email)
      
      const { profile, error } = await profileService.getOrCreateProfile(user)
      
      if (error) {
        console.error('Failed to load profile:', error)
        setUserProfile(null)
        setIsProfileComplete(false)
        return
      }

      if (profile) {
        console.log('Profile loaded successfully:', profile.name, profile.business_name)
        setUserProfile(profile)
        const complete = profileService.isProfileComplete(profile)
        setIsProfileComplete(complete)
        
        // Show profile completion modal if profile is incomplete
        if (!complete) {
          setShowProfileCompletion(true)
        }
      }
    } catch (error) {
      console.error('Profile loading error:', error)
      setUserProfile(null)
      setIsProfileComplete(false)
    } finally {
      setIsProfileLoading(false)
    }
  }

  // Initialize authentication and listen for auth state changes
  useEffect(() => {
    let authSubscription: any

    const initializeAuth = async () => {
      try {
        // Get current session
        const { session: currentSession } = await authService.getSession()
        
        if (currentSession?.user) {
          setSession(currentSession)
          setUser(currentSession.user)
          setIsAuthenticated(true)
          
          // Load user profile (async - doesn't block main loading)
          loadUserProfile(currentSession.user)
        } else {
          // No session found - ensure all user data is cleared
          console.log('No session found, clearing all user data...')
          setSession(null)
          setUser(null)
          setUserProfile(null)
          setIsProfileComplete(false)
          setShowProfileCompletion(false)
          setIsAuthenticated(false)
          if (currentView === 'dashboard') {
            setIsAuthModalOpen(true)
          }
        }

        // Listen for auth state changes
        authSubscription = authService.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.email)
          
          if (session?.user) {
            setSession(session)
            setUser(session.user)
            setIsAuthenticated(true)
            setIsAuthModalOpen(false)
            
            // Load user profile (async - doesn't block main loading)
            loadUserProfile(session.user)
          } else {
            // Complete user data cleanup on logout/session end
            console.log('Session ended, clearing all user data...')
            setSession(null)
            setUser(null)
            setUserProfile(null)
            setIsProfileComplete(false)
            setShowProfileCompletion(false)
            setIsAuthenticated(false)
            setIsProfileLoading(false)
            setCurrentView('dashboard')
            setIsAuthModalOpen(true)
          }
        })
      } catch (error) {
        console.error('Auth initialization error:', error)
        setIsAuthenticated(false)
        if (currentView === 'dashboard') {
          setIsAuthModalOpen(true)
        }
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Cleanup subscription on unmount
    return () => {
      if (authSubscription?.data?.subscription) {
        authSubscription.data.subscription.unsubscribe()
      }
    }
  }, [currentView])

  const handleNavigation = (view: 'dashboard' | 'payment' | 'settings') => {
    if (!isAuthenticated && view === 'dashboard') {
      setIsAuthModalOpen(true)
      return
    }
    
    // Don't allow navigation if profile is incomplete
    if (isAuthenticated && !isProfileComplete && showProfileCompletion) {
      return
    }
    
    setCurrentView(view)
    setIsMenuOpen(false)
  }

  const handleLogin = () => {
    // This will be handled by the AuthModal and auth state change listener
    console.log('Login successful')
  }

  const handleSignup = () => {
    // This will be handled by the AuthModal and auth state change listener
    console.log('Signup initiated')
  }

  const handleProfileCompletion = async () => {
    // Reload user profile to get updated data
    if (_user) {
      await loadUserProfile(_user)
    }
    setShowProfileCompletion(false)
  }

  const handleLogoutClick = () => {
    setShowLogoutConfirmation(true)
  }

  const handleLogoutConfirm = async () => {
    try {
      setShowLogoutConfirmation(false)
      
      // Immediately clear all user state before calling signOut
      setUser(null)
      setSession(null)
      setUserProfile(null)
      setIsProfileComplete(false)
      setShowProfileCompletion(false)
      setIsAuthenticated(false)
      setIsProfileLoading(false)
      setCurrentView('dashboard')
      setIsAuthModalOpen(true)
      
      console.log('User data cleared, signing out...')
      
      // Sign out from Supabase
      const { error } = await authService.signOut()
      if (error) {
        console.error('Logout error:', error)
      } else {
        console.log('Successfully logged out')
      }
    } catch (error) {
      console.error('Logout process error:', error)
      // Even if signOut fails, we've already cleared the local state
    }
  }

  const handleLogoutCancel = () => {
    setShowLogoutConfirmation(false)
  }

  // Show loading screen while initializing auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Pay.me...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Navigation Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            {/* Left side - Logo/Brand */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-primary to-primary-dark p-2 sm:p-3 rounded-xl">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-dark">Pay.me</h1>
                <p className="text-sm text-gray-medium">Payment Dashboard</p>
              </div>
            </div>

            {/* Center - Navigation Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                  isMenuOpen
                    ? 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20'
                    : 'bg-gray-50 text-gray-dark hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="hidden sm:inline">Menu</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 sm:w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 opacity-100 transform translate-y-0 transition-all duration-200">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs sm:text-sm font-medium text-gray-medium uppercase tracking-wider">Navigation</p>
                  </div>
                  
                  <button
                    onClick={() => handleNavigation('dashboard')}
                    className={`w-full flex items-center gap-4 px-4 sm:px-6 py-3 sm:py-4 text-left transition-all duration-200 ${
                      currentView === 'dashboard'
                        ? 'bg-primary bg-opacity-10 text-primary border-r-4 border-primary'
                        : 'text-gray-dark hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${
                      currentView === 'dashboard' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-medium'
                    }`}>
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-9 9a1 1 0 001.414 1.414L2 12.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-4.586l.293.293a1 1 0 001.414-1.414l-9-9z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base sm:text-lg">Dashboard</h3>
                      <p className="text-xs sm:text-sm text-gray-medium">View payment analytics and overview</p>
                    </div>
                    {currentView === 'dashboard' && (
                      <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() => handleNavigation('payment')}
                    className={`w-full flex items-center gap-4 px-4 sm:px-6 py-3 sm:py-4 text-left transition-all duration-200 ${
                      currentView === 'payment'
                        ? 'bg-primary bg-opacity-10 text-primary border-r-4 border-primary'
                        : 'text-gray-dark hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${
                      currentView === 'payment' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-medium'
                    }`}>
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base sm:text-lg">Create Payment</h3>
                      <p className="text-xs sm:text-sm text-gray-medium">Generate new payment links</p>
                    </div>
                    {currentView === 'payment' && (
                      <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() => handleNavigation('settings')}
                    className={`w-full flex items-center gap-4 px-4 sm:px-6 py-3 sm:py-4 text-left transition-all duration-200 ${
                      currentView === 'settings'
                        ? 'bg-primary bg-opacity-10 text-primary border-r-4 border-primary'
                        : 'text-gray-dark hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${
                      currentView === 'settings' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-medium'
                    }`}>
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base sm:text-lg">Settings</h3>
                      <p className="text-xs sm:text-sm text-gray-medium">Manage account preferences</p>
                    </div>
                    {currentView === 'settings' && (
                      <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Right side - Logout */}
            <div className="flex items-center">
              {isAuthenticated ? (
                <button 
                  onClick={handleLogoutClick}
                  className="p-2 sm:p-3 rounded-xl text-gray-medium hover:text-danger hover:bg-red-50 transition-all duration-200"
                  title="Logout"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-gradient-to-r from-primary to-primary-dark text-white font-semibold py-2 px-4 sm:px-6 rounded-xl transition-all duration-200 hover:from-primary-dark hover:to-primary"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Current View with conditional blur */}
      <div className={
        (!isAuthenticated && currentView === 'dashboard') || showProfileCompletion 
          ? 'blur-sm pointer-events-none select-none' 
          : ''
      }>
        {currentView === 'dashboard' && <Dashboard userProfile={userProfile} isLoading={isProfileLoading} />}
        {currentView === 'payment' && <PaymentPage userProfile={userProfile} isLoading={isProfileLoading} />}
        {currentView === 'settings' && <Settings />}
      </div>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => {}} // Empty function - modal cannot be closed without authentication
        onLogin={handleLogin}
        onSignup={handleSignup}
      />

      {/* Profile Completion Modal */}
      {userProfile && (
        <ProfileCompletionModal 
          isOpen={showProfileCompletion}
          onComplete={handleProfileCompletion}
          userProfile={userProfile}
        />
      )}

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal 
        isOpen={showLogoutConfirmation}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        userName={userProfile?.name}
      />
    </div>
  )
}

export default App