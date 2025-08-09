import { useState } from 'react'
import { authService } from '../services/authService'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: () => void
  onSignup: () => void
}

const AuthModal = ({ isOpen, onLogin }: AuthModalProps) => {
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      if (isLoginMode) {
        // Handle login
        const { user, session, error: loginError } = await authService.signIn(
          formData.email, 
          formData.password
        )

        if (loginError) {
          setError(loginError.message)
          return
        }

        if (user && session) {
          setSuccessMessage('Successfully signed in!')
          onLogin()
          // Modal will close after successful authentication
        }
      } else {
        // Handle signup
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          return
        }

        const { user, error: signupError } = await authService.signUp(
          formData.email, 
          formData.password, 
          formData.name
        )

        if (signupError) {
          setError(signupError.message)
          return
        }

        if (user) {
          setSuccessMessage('Account created! Please check your email to verify your account before signing in.')
          // Don't automatically log in - user needs to verify email first
          setIsLoginMode(true) // Switch to login mode
          setFormData({ name: '', email: formData.email, password: '', confirmPassword: '' })
        }
      }
    } catch (error) {
      console.error('Authentication error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const switchMode = () => {
    setIsLoginMode(!isLoginMode)
    setFormData({ name: '', email: '', password: '', confirmPassword: '' })
    setError(null)
    setSuccessMessage(null)
  }

  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address first')
      return
    }

    setIsLoading(true)
    setError(null)

    const { error: resetError } = await authService.resetPassword(formData.email)

    if (resetError) {
      setError(resetError.message)
    } else {
      setSuccessMessage('Password reset email sent! Check your inbox.')
    }

    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur - No onClick to prevent closing */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-md"
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 p-5 text-center relative">
          {/* Removed close button - users must authenticate */}
          
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="bg-white border border-gray-200 p-2 rounded-xl shadow-sm">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Pay.me</h2>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
          </h3>
          <p className="text-sm text-gray-600 mb-1">
            {isLoginMode ? 'Sign in to your account' : 'Get started with Pay.me'}
          </p>
          <p className="text-xs text-gray-500">
            Authentication required to access dashboard
          </p>
        </div>

        {/* Form */}
        <div className="p-5">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
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
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span className="text-green-700 text-sm font-medium">{successMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm bg-white transition-all duration-200"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm bg-white transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm bg-white transition-all duration-200"
                placeholder="Enter your password"
                minLength={6}
              />
            </div>

            {!isLoginMode && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wider">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm bg-white transition-all duration-200"
                  placeholder="Confirm your password"
                  minLength={6}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-all duration-200 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isLoginMode ? 'Signing In...' : 'Creating Account...'}</span>
                </div>
              ) : (
                <span>{isLoginMode ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>

            {isLoginMode && (
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isLoading}
                className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 text-sm transition-colors duration-200 disabled:opacity-50"
              >
                Forgot your password?
              </button>
            )}
          </form>

          {/* Switch Mode */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-gray-600 mb-2 text-sm">
              {isLoginMode ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button
              onClick={switchMode}
              className="text-gray-800 hover:text-black font-medium text-sm transition-colors duration-200"
            >
              {isLoginMode ? 'Create Account' : 'Sign In'}
            </button>
          </div>

          {/* Security Note */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1.5">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
              Secure & encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthModal