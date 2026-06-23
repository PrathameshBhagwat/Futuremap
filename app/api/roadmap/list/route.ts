import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getValidatedConfig } from '@/lib/env-validation'
import { getUnifiedSession } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
  try {
    // Validate environment configuration
    const config = getValidatedConfig()
    console.log('✅ Environment validated for roadmap list')
    
    const supabase = createRouteHandlerClient({ cookies })
    const session = await getUnifiedSession()
    
    if (!session?.id) {
      console.log('❌ No authenticated user found')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    console.log(`🔍 Fetching roadmaps for user: ${session?.id}`)

    // Try to fetch user's roadmaps - first with user_id (snake_case)
    let { data: roadmaps, error } = await supabaseAdmin
      .from('career_roadmaps')
      .select('*')
      .eq('user_id', session?.id)
      .order('created_at', { ascending: false })

    // If user_id doesn't work, try userid (no underscore)
    if (error && error.message.includes('user_id does not exist')) {
      console.log('🔄 Trying userid field instead...')
      const result = await supabaseAdmin
        .from('career_roadmaps')
        .select('*')
        .eq('userid', session?.id)
        .order('created_at', { ascending: false })
      
      roadmaps = result.data
      error = result.error
    }

    // If table doesn't exist, return empty array
    if (error && (error.message.includes('does not exist') || error.message.includes('table'))) {
      console.log('⚠️  Table career_roadmaps does not exist yet, returning empty array')
      return NextResponse.json({
        roadmaps: [],
        count: 0,
        success: true
      })
    }

    // Handle other errors
    if (error) {
      console.error('❌ Supabase error fetching roadmaps:', {
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        user_id: session?.id
      })
      
      return NextResponse.json({
        error: 'Database error: ' + error.message,
        success: false
      }, { status: 500 })
    }

    console.log(`✅ Successfully fetched ${roadmaps?.length || 0} roadmaps for user`)

    return NextResponse.json({
      roadmaps: roadmaps || [],
      count: roadmaps?.length || 0,
      success: true
    })

  } catch (error) {
    console.error('❌ Roadmap list error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json({
      error: `Failed to fetch roadmaps: ${errorMessage}`,
      success: false
    }, { status: 500 })
  }
}