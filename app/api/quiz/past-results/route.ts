import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getUnifiedSession } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
  try {
    // Check for API-based auth token from cookie
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Try to fetch from Supabase
    try {
      const { createRouteHandlerClient } = await import('@supabase/auth-helpers-nextjs')
      const supabase = createRouteHandlerClient({ cookies })
      const session = await getUnifiedSession()

      if (session?.id) {
        const { data: results, error } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', session?.id)
          .order('created_at', { ascending: false })

        if (!error && results) {
          return NextResponse.json({
            success: true,
            results: results || []
          })
        }
      }
    } catch (supabaseError) {
      console.warn('Supabase unavailable, returning empty results')
    }

    // Return empty results as fallback when Supabase is unavailable
    return NextResponse.json({
      success: true,
      results: []
    })

  } catch (error) {
    console.error('Error in GET /api/quiz/past-results:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch quiz results',
      success: false,
      results: []
    }, { status: 200 })
  }
}