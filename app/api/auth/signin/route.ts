export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, generateToken } from '@/lib/auth'
import { getMockDatabase } from '@/lib/mock-database'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = signInSchema.parse(body)

    let user: any = null
    let useMockDb = false

    // Try to use Supabase first (primary database)
    try {
      const supabaseAdmin = getSupabaseAdmin()

      if (!supabaseAdmin) {
        console.warn('⚠️ Supabase admin not available, falling back to mock database')
        useMockDb = true
      } else {
        // Find user by email from Supabase users table
        const { data, error } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', email)
          .single()

        if (error) {
          if (error.code !== 'PGRST116') { // PGRST116 = not found, which is expected
            console.warn('⚠️ Supabase query error, falling back to mock database:', error.message)
            useMockDb = true
          }
          // If PGRST116 (not found), user stays null — will return 401 below
        } else if (data) {
          user = data
        }
      }
    } catch (supabaseError: any) {
      console.warn('⚠️ Supabase error, falling back to mock database:', supabaseError?.message)
      useMockDb = true
    }

    // Use mock database as fallback when Supabase fails
    if (useMockDb && !user) {
      const mockDb = getMockDatabase()
      user = mockDb.findUserByEmail(email)
      if (user) {
        console.log('✅ Using mock database for signin (Supabase fallback)')
      }
    }

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email
    })

    // Create response with token in cookie
    const response = NextResponse.json({
      message: 'Sign in successful',
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
    console.error('Sign in error:', error)
    
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