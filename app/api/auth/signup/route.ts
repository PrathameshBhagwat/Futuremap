import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, generateToken } from '@/lib/auth'
import { getMockDatabase } from '@/lib/mock-database'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { z } from 'zod'

// Separate schema for API that doesn't require confirmPassword
const signUpAPISchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password } = signUpAPISchema.parse(body)

    let useMockDb = false
    let user: any = null
    let error: any = null

    // Try to use Supabase first (primary database)
    try {
      const supabaseAdmin = getSupabaseAdmin()

      if (!supabaseAdmin) {
        console.warn('⚠️ Supabase admin not available, falling back to mock database')
        useMockDb = true
      } else {
        // Check if user already exists
        const { data: existingUser, error: lookupError } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', email)
          .single()

        if (existingUser) {
          return NextResponse.json(
            { message: 'User with this email already exists' },
            { status: 400 }
          )
        }

        // If lookup error is NOT "not found", it's a real error — fallback
        if (lookupError && lookupError.code !== 'PGRST116') {
          console.warn('⚠️ Supabase lookup error, falling back to mock database:', lookupError.message)
          useMockDb = true
        } else {
          // Hash password for custom DB
          const hashedPassword = await hashPassword(password)

          // 1. Create user in Supabase Authentication (GoTrue) so they appear in the dashboard
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true, // Auto-confirm email for immediate login
            user_metadata: {
              first_name: firstName,
              last_name: lastName
            }
          })

          if (authError) {
            console.warn('⚠️ Supabase Auth create error, falling back to mock database:', authError.message)
            useMockDb = true
          } else {
            // 2. Also create user in the public 'users' table for app logic
            const { data: newUser, error: createError } = await supabaseAdmin
              .from('users')
              .insert({
                id: authData?.user?.id, // Link to the same Supabase Auth ID if possible
                email,
                password: hashedPassword,
                firstName,
                lastName,
                avatar: null
              })
              .select()
              .single()

            if (createError) {
              console.warn('⚠️ Supabase DB create error, falling back to mock database:', createError.message)
              useMockDb = true
            } else {
              user = newUser
            }
          }
        }
      }
    } catch (supabaseError: any) {
      console.warn('⚠️ Supabase error, falling back to mock database:', supabaseError?.message)
      useMockDb = true
    }

    // Use mock database as fallback when Supabase fails
    if (useMockDb && !user) {
      try {
        const mockDb = getMockDatabase()
        const hashedPassword = await hashPassword(password)
        
        user = mockDb.createUser({
          email,
          firstName,
          lastName,
          password: hashedPassword,
          avatar: null
        })

        console.log('✅ Using mock database for signup (Supabase fallback)')
      } catch (mockError: any) {
        return NextResponse.json(
          { message: mockError.message || 'Registration failed' },
          { status: 400 }
        )
      }
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email
    })

    // Create response with token in cookie
    const response = NextResponse.json({
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar
      }
    })

    // Set auth token as cookie for middleware
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return response
  } catch (error: any) {
    console.error('Sign up error:', error)
    
    if (error.errors) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}