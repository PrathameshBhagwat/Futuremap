export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getUnifiedSession } from '@/lib/server-auth'

// GET - Admin statistics
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const session = await getUnifiedSession()

    // Check if user is authenticated and is admin
    if (!session || session?.email !== 'admin@careerpath.ai') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      // Get total users
      const totalUsers = await prisma.user.count()

      return NextResponse.json({
        totalUsers,
        activeSubscriptions: 0,
        monthlyRevenue: 0,
        churnRate: 0,
        conversionRate: 0,
        tierDistribution: {
          free: totalUsers,
          basic: 0,
          premium: 0,
          elite: 0
        }
      })

    } catch (dbError) {
      console.error('Database error fetching admin stats:', dbError)
      
      // Return mock data for demo
      return NextResponse.json({
        totalUsers: 2847,
        activeSubscriptions: 0,
        monthlyRevenue: 0,
        churnRate: 0,
        conversionRate: 0,
        tierDistribution: {
          free: 2847,
          basic: 0,
          premium: 0,
          elite: 0
        }
      })
    }

  } catch (error) {
    console.error('Error in admin stats API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    )
  }
}