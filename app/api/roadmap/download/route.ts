export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getDemoUserId, logDatabasePermissionOnce } from '@/lib/database/demo-mode'
import { getUnifiedSession } from '@/lib/server-auth'
import { generateRoadmapPDF, type RoadmapPDFData, type PDFPhase } from '@/lib/pdf-generator'

/**
 * GET /api/roadmap/download?roadmapId=<id>
 * 
 * Generates and returns a downloadable PDF of the user's career roadmap.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roadmapId = searchParams.get('roadmapId')

    // ── 1. Authenticate ──
    const session = await getUnifiedSession()
    const userId = session?.id || getDemoUserId()

    // ── 2. Fetch roadmap data ──
    let roadmapRaw: any = null

    if (roadmapId && !roadmapId.startsWith('mock_') && !roadmapId.startsWith('roadmap_')) {
      // Fetch from database
      try {
        const db = process.env.NODE_ENV === 'development' ? supabaseAdmin : createRouteHandlerClient({ cookies })

        const { data, error } = await db
          .from('career_roadmaps')
          .select('*')
          .eq('id', roadmapId)
          .single()

        if (!error && data) {
          roadmapRaw = data
        } else {
          console.warn('Roadmap fetch error, falling back to mock:', error?.message)
          logDatabasePermissionOnce('PDF Download API')
        }
      } catch (dbError) {
        console.warn('Database error fetching roadmap for PDF:', dbError)
        logDatabasePermissionOnce('PDF Download API (fallback)')
      }
    }

    // If no data from DB, use mock roadmap
    if (!roadmapRaw) {
      roadmapRaw = getMockRoadmapForPDF(userId)
    }

    // ── 3. Fetch user profile ──
    let userName = session?.user_metadata?.first_name
      ? `${session.user_metadata.first_name} ${session.user_metadata.last_name || ''}`.trim()
      : 'Student'
    let userEmail = session?.email || 'user@example.com'

    // Try to get profile from DB
    try {
      const db = process.env.NODE_ENV === 'development' ? supabaseAdmin : createRouteHandlerClient({ cookies })
      const { data: profile } = await db
        .from('users')
        .select('first_name, last_name, email, skills, interests')
        .eq('id', userId)
        .single()

      if (profile) {
        if (profile.first_name) {
          userName = `${profile.first_name} ${profile.last_name || ''}`.trim()
        }
        if (profile.email) {
          userEmail = profile.email
        }
      }
    } catch {
      // Use defaults from session
    }

    // ── 4. Transform roadmap data into PDF format ──
    const phases = transformPhases(roadmapRaw)
    const aiRecs = roadmapRaw.roadmap_data?.ai_recommendations
    const timeline = roadmapRaw.roadmap_data?.timeline

    const pdfData: RoadmapPDFData = {
      userName,
      userEmail,
      roadmapId: roadmapRaw.id || roadmapId || 'unknown',
      title: roadmapRaw.title || 'Career Roadmap',
      description: roadmapRaw.description || '',
      careerGoal: roadmapRaw.career_goal || roadmapRaw.careerGoal || 'Career Development',
      currentLevel: roadmapRaw.current_level || roadmapRaw.currentLevel || 'beginner',
      durationMonths: roadmapRaw.duration_months || 12,
      progress: roadmapRaw.progress || 0,
      generatedDate: new Date(roadmapRaw.created_at || Date.now()).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
      phases,
      executiveSummary: aiRecs?.summary || undefined,
      currentSkills: aiRecs?.currentSkills || undefined,
      missingSkills: aiRecs?.missingSkills || undefined,
      readinessScore: aiRecs?.readinessScore || undefined,
      recommendedResources: aiRecs?.resources || undefined,
      projectRecommendations: aiRecs?.projects || undefined,
      careerOpportunities: aiRecs?.careers || undefined,
      aiRecommendations: Array.isArray(aiRecs)
        ? aiRecs
        : aiRecs?.recommendations || undefined,
    }

    // ── 5. Generate PDF ──
    const pdfBuffer = generateRoadmapPDF(pdfData)

    // ── 6. Return as downloadable file ──
    const filename = `FutureMap_Roadmap_${(pdfData.careerGoal || 'Career').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Error generating roadmap PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF. Please try again.' },
      { status: 500 }
    )
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────

function transformPhases(roadmap: any): PDFPhase[] {
  // Try roadmap_data.phases first (from /api/roadmap/generate)
  let rawPhases = roadmap.roadmap_data?.phases || roadmap.phases

  // Try parsing if it's a JSON string
  if (typeof rawPhases === 'string') {
    try {
      rawPhases = JSON.parse(rawPhases)
    } catch {
      rawPhases = []
    }
  }

  if (!rawPhases) rawPhases = []
  if (!Array.isArray(rawPhases)) {
    rawPhases = Object.values(rawPhases)
  }

  return rawPhases.map((phase: any, index: number) => ({
    title: phase.title || `Phase ${index + 1}`,
    description: phase.description || '',
    duration: phase.duration || '',
    type: phase.type || 'foundation',
    nodes: (phase.milestones || phase.nodes || []).map((node: any) => ({
      title: node.title || 'Untitled',
      type: node.type || 'skill',
      description: node.description || '',
      duration: node.duration || '',
      difficulty: node.difficulty || '',
      resources: node.resources || [],
      skills: node.skills || [],
    })),
  }))
}

function getMockRoadmapForPDF(userId: string): any {
  return {
    id: 'mock_pdf_roadmap',
    user_id: userId,
    title: 'Full-Stack Developer Career Path',
    description: 'A comprehensive roadmap to become a full-stack developer',
    career_goal: 'Full-Stack Developer',
    current_level: 'beginner',
    duration_months: 12,
    progress: 25,
    created_at: new Date().toISOString(),
    roadmap_data: {
      phases: [
        {
          title: 'Foundation — Web Fundamentals',
          description: 'Build a solid foundation in core web technologies.',
          duration: '8 weeks',
          type: 'foundation',
          milestones: [
            { title: 'HTML5 & Semantic Markup', type: 'skill', difficulty: 'beginner', duration: '2 weeks', resources: ['MDN Web Docs', 'freeCodeCamp'], skills: ['HTML5'] },
            { title: 'CSS3 & Responsive Design', type: 'skill', difficulty: 'beginner', duration: '2 weeks', resources: ['CSS-Tricks', 'Flexbox Froggy'], skills: ['CSS3', 'Responsive Design'] },
            { title: 'JavaScript Fundamentals', type: 'skill', difficulty: 'beginner', duration: '4 weeks', resources: ['JavaScript.info', 'Eloquent JS'], skills: ['JavaScript', 'ES6+'] },
          ],
        },
        {
          title: 'Frontend — React Ecosystem',
          description: 'Master modern frontend development with React.',
          duration: '10 weeks',
          type: 'intermediate',
          milestones: [
            { title: 'React Fundamentals', type: 'course', difficulty: 'intermediate', duration: '3 weeks', resources: ['React Official Docs', 'Scrimba'], skills: ['React', 'JSX'] },
            { title: 'State Management & Hooks', type: 'skill', difficulty: 'intermediate', duration: '2 weeks', resources: ['React Docs', 'Udemy'], skills: ['React Hooks', 'Context API'] },
            { title: 'Next.js Framework', type: 'skill', difficulty: 'intermediate', duration: '3 weeks', resources: ['Next.js Docs', 'Vercel'], skills: ['Next.js', 'SSR', 'SSG'] },
            { title: 'Portfolio Website', type: 'project', difficulty: 'intermediate', duration: '2 weeks', skills: ['React', 'CSS', 'Deployment'] },
          ],
        },
        {
          title: 'Backend — Server & Databases',
          description: 'Learn server-side development and database management.',
          duration: '10 weeks',
          type: 'advanced',
          milestones: [
            { title: 'Node.js & Express', type: 'skill', difficulty: 'intermediate', duration: '3 weeks', resources: ['Node.js Docs', 'The Odin Project'], skills: ['Node.js', 'Express'] },
            { title: 'PostgreSQL & Prisma ORM', type: 'skill', difficulty: 'intermediate', duration: '3 weeks', resources: ['Prisma Docs', 'PostgreSQL Tutorial'], skills: ['SQL', 'Prisma'] },
            { title: 'REST API Project', type: 'project', difficulty: 'advanced', duration: '2 weeks', skills: ['API Design', 'Authentication'] },
            { title: 'Full-Stack Application', type: 'project', difficulty: 'advanced', duration: '2 weeks', skills: ['Full Stack', 'Deployment'] },
          ],
        },
        {
          title: 'Specialization — Career Launch',
          description: 'Prepare for the job market with advanced skills and interview practice.',
          duration: '8 weeks',
          type: 'specialization',
          milestones: [
            { title: 'TypeScript Deep Dive', type: 'skill', difficulty: 'advanced', duration: '2 weeks', resources: ['TypeScript Handbook'], skills: ['TypeScript'] },
            { title: 'Testing & CI/CD', type: 'skill', difficulty: 'advanced', duration: '2 weeks', resources: ['Jest Docs', 'GitHub Actions'], skills: ['Testing', 'CI/CD'] },
            { title: 'Capstone Project', type: 'project', difficulty: 'advanced', duration: '3 weeks', skills: ['Architecture', 'DevOps'] },
            { title: 'Interview Preparation', type: 'skill', difficulty: 'advanced', duration: '1 week', resources: ['LeetCode', 'Pramp'], skills: ['DSA', 'System Design'] },
          ],
        },
      ],
    },
  }
}
