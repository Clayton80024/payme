import { supabase } from '../lib/supabase'
import type { AuthError, User, Session } from '@supabase/supabase-js'
import { profileService } from './profileService'

// Custom error types for better error handling
export interface AuthServiceError {
  message: string
  code?: string
  statusCode?: number
}

// User data interface
export interface UserProfile {
  id: string
  email: string
  name: string
  created_at: string
  email_verified: boolean
}

class AuthService {
  // Input validation and sanitization
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim().toLowerCase())
  }

  private validatePassword(password: string): boolean {
    // Strong password requirements
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password) &&
           /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }

  private sanitizeInput(input: string): string {
    return input.trim().toLowerCase()
  }

  // Sign up with enhanced security
  async signUp(email: string, password: string, name: string): Promise<{ user: User | null; error: AuthServiceError | null }> {
    try {
      // Input validation
      if (!this.validateEmail(email)) {
        return { user: null, error: { message: 'Please enter a valid email address', code: 'INVALID_EMAIL' } }
      }

      if (!this.validatePassword(password)) {
        return { 
          user: null, 
          error: { 
            message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
            code: 'WEAK_PASSWORD' 
          } 
        }
      }

      if (name.trim().length < 2) {
        return { user: null, error: { message: 'Name must be at least 2 characters long', code: 'INVALID_NAME' } }
      }

      // Sanitize inputs
      const sanitizedEmail = this.sanitizeInput(email)
      const sanitizedName = name.trim()

      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: password,
        options: {
          data: {
            name: sanitizedName,
            created_at: new Date().toISOString(),
          },
          emailRedirectTo: `${window.location.origin}/auth/verify`,
        },
      })

      if (error) {
        console.error('Signup error:', error)
        return { user: null, error: { message: this.getErrorMessage(error), code: error.message } }
      }

      // Create profile for new user if signup was successful
      if (data.user) {
        const { profile, error: profileError } = await profileService.createProfile(data.user, {
          name: sanitizedName
        })

        if (profileError) {
          console.error('Failed to create profile for new user:', profileError)
          // We don't return an error here since the user account was created successfully
          // The profile can be created later via getOrCreateProfile
        } else if (profile) {
          console.log('Profile created successfully for new user:', profile.id)
        }
      }

      // Log successful signup (without sensitive data)
      console.log('User signed up successfully:', { email: sanitizedEmail, id: data.user?.id })

      return { user: data.user, error: null }
    } catch (error) {
      console.error('Signup service error:', error)
      return { 
        user: null, 
        error: { message: 'An unexpected error occurred during signup', code: 'SIGNUP_ERROR' } 
      }
    }
  }

  // Sign in with enhanced security
  async signIn(email: string, password: string): Promise<{ user: User | null; session: Session | null; error: AuthServiceError | null }> {
    try {
      // Input validation
      if (!this.validateEmail(email)) {
        return { user: null, session: null, error: { message: 'Please enter a valid email address', code: 'INVALID_EMAIL' } }
      }

      if (password.length < 6) {
        return { user: null, session: null, error: { message: 'Password is required', code: 'INVALID_PASSWORD' } }
      }

      // Sanitize email
      const sanitizedEmail = this.sanitizeInput(email)

      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: password,
      })

      if (error) {
        console.error('Signin error:', error)
        return { 
          user: null, 
          session: null, 
          error: { message: this.getErrorMessage(error), code: error.message } 
        }
      }

      // Log successful signin (without sensitive data)
      console.log('User signed in successfully:', { email: sanitizedEmail, id: data.user?.id })

      return { user: data.user, session: data.session, error: null }
    } catch (error) {
      console.error('Signin service error:', error)
      return { 
        user: null, 
        session: null, 
        error: { message: 'An unexpected error occurred during signin', code: 'SIGNIN_ERROR' } 
      }
    }
  }

  // Sign out with cleanup
  async signOut(): Promise<{ error: AuthServiceError | null }> {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Signout error:', error)
        return { error: { message: this.getErrorMessage(error), code: error.message } }
      }

      // Clear any local storage data
      localStorage.removeItem('user-preferences')
      sessionStorage.clear()

      console.log('User signed out successfully')
      return { error: null }
    } catch (error) {
      console.error('Signout service error:', error)
      return { error: { message: 'An unexpected error occurred during signout', code: 'SIGNOUT_ERROR' } }
    }
  }

  // Password reset with validation
  async resetPassword(email: string): Promise<{ error: AuthServiceError | null }> {
    try {
      if (!this.validateEmail(email)) {
        return { error: { message: 'Please enter a valid email address', code: 'INVALID_EMAIL' } }
      }

      const sanitizedEmail = this.sanitizeInput(email)

      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        console.error('Password reset error:', error)
        return { error: { message: this.getErrorMessage(error), code: error.message } }
      }

      console.log('Password reset email sent to:', sanitizedEmail)
      return { error: null }
    } catch (error) {
      console.error('Password reset service error:', error)
      return { error: { message: 'An unexpected error occurred', code: 'RESET_ERROR' } }
    }
  }

  // Get current session
  async getSession(): Promise<{ session: Session | null; error: AuthServiceError | null }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Get session error:', error)
        return { session: null, error: { message: this.getErrorMessage(error), code: error.message } }
      }

      return { session, error: null }
    } catch (error) {
      console.error('Get session service error:', error)
      return { session: null, error: { message: 'Failed to get session', code: 'SESSION_ERROR' } }
    }
  }

  // Get current user
  async getUser(): Promise<{ user: User | null; error: AuthServiceError | null }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error) {
        console.error('Get user error:', error)
        return { user: null, error: { message: this.getErrorMessage(error), code: error.message } }
      }

      return { user, error: null }
    } catch (error) {
      console.error('Get user service error:', error)
      return { user: null, error: { message: 'Failed to get user', code: 'USER_ERROR' } }
    }
  }

  // Auth state change listener
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  // Helper method to format error messages for users
  private getErrorMessage(error: AuthError): string {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password. Please check your credentials and try again.'
      case 'User already registered':
        return 'This email is already registered. Please try signing in instead.'
      case 'Email not confirmed':
        return 'Please check your email and click the verification link before signing in.'
      case 'Too many requests':
        return 'Too many attempts. Please wait a few minutes before trying again.'
      case 'Weak password':
        return 'Password is too weak. Please use a stronger password with at least 8 characters.'
      case 'Invalid email':
        return 'Please enter a valid email address.'
      default:
        return error.message || 'An error occurred. Please try again.'
    }
  }
}

// Export singleton instance
export const authService = new AuthService()
export default authService