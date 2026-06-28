'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'

// Simplified types for compatibility
interface AuthUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

interface AuthProfile {
  id: string
  email: string
  full_name?: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

interface AuthContextType {
  user: AuthUser | null
  profile: AuthProfile | null
  session: any
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<AuthProfile>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to set auth token as cookie
function setAuthCookie(token: string) {
  if (typeof window === 'undefined') return
  
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + 7) // 7 days
  
  document.cookie = `auth_token=${token}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax`
}

// Helper function to clear auth cookie
function clearAuthCookie() {
  if (typeof window === 'undefined') return
  
  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax'
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [useAPIAuth, setUseAPIAuth] = useState(true) // Fallback to API-based auth
  
  const supabase = createSupabaseClient()

  // Initialize auth - try Supabase first, fall back to API
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      console.warn('Auth loading timeout reached')
      setLoading(false)
    }, 3000)
    
    const initializeAuth = async () => {
      try {
        // Try to use Supabase if available
        if (supabase) {
          try {
            const { data: { session: supabaseSession }, error } = await supabase.auth.getSession()
            
            if (!error && supabaseSession) {
              setSession(supabaseSession)
              setUser({
                id: supabaseSession.user.id,
                email: supabaseSession.user.email || '',
                firstName: supabaseSession.user.user_metadata?.first_name,
                lastName: supabaseSession.user.user_metadata?.last_name,
              })
              setProfile({
                id: supabaseSession.user.id,
                email: supabaseSession.user.email || '',
                first_name: supabaseSession.user.user_metadata?.first_name,
                last_name: supabaseSession.user.user_metadata?.last_name,
                full_name: `${supabaseSession.user.user_metadata?.first_name || ''} ${supabaseSession.user.user_metadata?.last_name || ''}`.trim()
              })
              setUseAPIAuth(false)
              clearTimeout(loadingTimeout)
              setLoading(false)
              return
            }
          } catch (supabaseError: any) {
            console.warn('Supabase auth unavailable, falling back to API-based auth:', supabaseError?.message)
            setUseAPIAuth(true)
          }
        }

        // Check for auth token in localStorage (API-based auth)
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null
        
        if (token && userStr) {
          try {
            const userData = JSON.parse(userStr)
            setUser(userData)
            setProfile({
              id: userData.id,
              email: userData.email,
              first_name: userData.firstName,
              last_name: userData.lastName,
              full_name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
            })
            setSession({ token })
            setAuthCookie(token) // Restore cookie from localStorage
            setUseAPIAuth(true)
          } catch (parseError) {
            console.warn('Failed to parse stored auth data')
          }
        }

        clearTimeout(loadingTimeout)
        setLoading(false)
      } catch (error: any) {
        console.error('Auth initialization error:', error?.message)
        clearTimeout(loadingTimeout)
        setLoading(false)
      }
    }

    initializeAuth()

    return () => clearTimeout(loadingTimeout)
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Use API-based authentication
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setLoading(false)
        return { error: data.message || 'Sign in failed' }
      }

      // Store auth data locally and in cookie
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('auth_user', JSON.stringify(data.user))
        setAuthCookie(data.token) // Also set as cookie for middleware
      }

      setUser(data.user)
      setProfile({
        id: data.user.id,
        email: data.user.email,
        first_name: data.user.firstName,
        last_name: data.user.lastName,
        full_name: `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim()
      })
      setSession({ token: data.token })
      setUseAPIAuth(true)
      setLoading(false)
      return { error: null }
    } catch (error: any) {
      console.error('Sign in error:', error)
      setLoading(false)
      return { error: error?.message || 'An error occurred during sign in' }
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName })
      })

      const data = await response.json()

      if (!response.ok) {
        setLoading(false)
        return { error: data.message || 'Sign up failed' }
      }

      // Store auth data locally and in cookie
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('auth_user', JSON.stringify(data.user))
        setAuthCookie(data.token) // Also set as cookie for middleware
      }

      setUser(data.user)
      setProfile({
        id: data.user.id,
        email: data.user.email,
        first_name: data.user.firstName,
        last_name: data.user.lastName,
        full_name: `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim()
      })
      setSession({ token: data.token })
      setUseAPIAuth(true)
      setLoading(false)
      return { error: null }
    } catch (error: any) {
      console.error('Sign up error:', error)
      setLoading(false)
      return { error: error?.message || 'An error occurred during sign up' }
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      // Clear local auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        clearAuthCookie() // Also clear cookie
      }

      // Try Supabase sign out if available
      if (supabase && !useAPIAuth) {
        try {
          await supabase.auth.signOut()
        } catch (error) {
          console.warn('Supabase sign out failed, local auth cleared')
        }
      }

      setUser(null)
      setProfile(null)
      setSession(null)
      setLoading(false)
    } catch (error: any) {
      console.error('Sign out error:', error)
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<AuthProfile>) => {
    if (!user) return { error: 'No user logged in' }
    
    try {
      // Update profile state
      setProfile(prev => prev ? { ...prev, ...updates } : { id: user.id, email: user.email, ...updates })
      return { error: null }
    } catch (error: any) {
      console.error('Update profile error:', error)
      return { error: error?.message }
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}