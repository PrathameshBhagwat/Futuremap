export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getValidatedConfig } from '@/lib/env-validation'
import { FreeAIService } from '@/lib/free-ai-services'
import { PDFParser } from '@/lib/pdf-parser'

import { verifyToken } from '@/lib/auth'
import { getUnifiedSession } from '@/lib/server-auth'

export async function POST(request: NextRequest) {
  try {
    const config = getValidatedConfig()
    const supabase = createRouteHandlerClient({ cookies })
    const session = await getUnifiedSession()

    let userId = session?.id

    // Fallback to custom JWT if Supabase session is missing
    if (!userId) {
      const cookieStore = cookies()
      const token = cookieStore.get('auth_token')?.value
      if (token) {
        const decoded = verifyToken(token)
        if (decoded?.userId) {
          userId = decoded.userId
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('resume') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate PDF file
    const validation = PDFParser.validatePDFFile(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Extract text from PDF
    let resumeText: string
    try {
      const pdfResult = await PDFParser.extractTextFromFile(file)
      resumeText = PDFParser.cleanText(pdfResult.text)
      
      if (!resumeText.trim()) {
        throw new Error('No text content found in PDF')
      }
      
      console.log(`✅ PDF parsed successfully: ${pdfResult.pages} pages, ${resumeText.length} characters`)
    } catch (pdfError) {
      console.error('❌ PDF parsing failed:', pdfError)
      return NextResponse.json({ 
        error: 'Failed to parse PDF file. Please ensure the file is a valid PDF with text content.' 
      }, { status: 400 })
    }

    // Initialize Free AI Service
    const aiService = FreeAIService.getInstance()

    // Analyze resume using free AI models
    const analysisData = await aiService.parseResume(resumeText)

    // Save resume data to database (Non-fatal if table doesn't exist)
    let savedResumeId = 'temp-' + Date.now();
    try {
      const { data: savedResume, error: saveError } = await supabase
        .from('user_resumes')
        .insert({
          user_id: userId,
          filename: file.name,
          content: resumeText,
          ai_analysis: analysisData,
          skills_extracted: analysisData.skills.technical || [],
          experience_extracted: analysisData.experience?.map((exp: any) => exp.title) || []
        })
        .select()
        .single()

      if (!saveError && savedResume) {
        savedResumeId = savedResume.id;
      }

      // Log activity
      await supabase.from('user_activities').insert({
        user_id: userId,
        activity_type: 'resume_analyzed',
        description: `Analyzed resume: ${file.name}`,
        metadata: { 
          filename: file.name,
          skillsCount: analysisData.skills.technical?.length || 0,
        }
      })
    } catch (dbError) {
      console.warn('⚠️ Could not save resume to DB (table might not exist), skipping DB save:', dbError);
    }

    return NextResponse.json({
      success: true,
      analysis: analysisData,
      resumeId: savedResumeId,
      message: 'Resume analyzed successfully'
    })

  } catch (error) {
    console.error('❌ Resume parsing error:', error)
    
    return NextResponse.json({
      error: 'Failed to analyze resume',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}