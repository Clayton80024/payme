import { createClient } from '@supabase/supabase-js'

// Environment variables for Supabase configuration
// These should be set in your .env.local file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

// Create Supabase client with additional security options
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Additional security settings
    flowType: 'pkce', // Use PKCE flow for enhanced security
    storage: window.localStorage, // Secure session storage
    storageKey: 'payme-auth-token',
  },
  global: {
    headers: {
      'X-Client-Info': 'payme-web-app',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    // Disable realtime for enhanced security if not needed
    params: {
      eventsPerSecond: 2,
    },
  },
})

// Auth event listener for session changes
supabase.auth.onAuthStateChange((event, _session) => {
  console.log('Auth event:', event)
  
  // Clear sensitive data on sign out
  if (event === 'SIGNED_OUT') {
    // Clear any cached user data
    localStorage.removeItem('user-preferences')
    sessionStorage.clear()
  }
  
  // Log security events (in production, send to monitoring service)
  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
    console.log(`User ${event.toLowerCase()} at:`, new Date().toISOString())
  }
})

export default supabase