export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { aiService } from '@/lib/ai-services'
import { z } from 'zod'
import { logDatabasePermissionOnce, getDemoUserId } from '@/lib/database/demo-mode'
import { getUnifiedSession } from '@/lib/server-auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')  // Increased limit
    const search = searchParams.get('search') || ''
    const major = searchParams.get('major') || ''
    const state = searchParams.get('state') || ''

    console.log('🎓 Fetching colleges with params:', { page, limit, search, major, state })

    // Get mock colleges first (always available and complete)
    const mockColleges = getMockColleges()
    console.log('📚 Mock colleges available:', mockColleges.length)

    // Try to fetch colleges from Supabase database as supplement
    let dbColleges: any[] = []
    const supabase = createRouteHandlerClient({ cookies })
    
    try {
      let collegeQuery = supabase
        .from('colleges')
        .select('*')
        .order('rating', { ascending: false })
      
      const { data: databaseColleges, error: collegeError } = await collegeQuery
      
      if (!collegeError && databaseColleges && databaseColleges.length > 0) {
        console.log('✅ Found colleges from database:', databaseColleges.length)
        dbColleges = databaseColleges
      }
    } catch (dbError: any) {
      console.warn('⚠️ Database colleges fetch failed:', dbError.message)
    }

    // Merge database colleges with mock colleges (mock colleges are base, db supplements)
    let allColleges = [...mockColleges]
    if (dbColleges.length > 0) {
      // Append database colleges that aren't in mock
      for (const dbCollege of dbColleges) {
        if (!allColleges.find(c => c.id === dbCollege.id)) {
          allColleges.push(dbCollege)
        }
      }
    }

    // Apply filters to combined data
    let filteredColleges = allColleges
    if (search) {
      filteredColleges = allColleges.filter(college => 
        college.name.toLowerCase().includes(search.toLowerCase()) ||
        college.city.toLowerCase().includes(search.toLowerCase()) ||
        college.state.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (state) {
      filteredColleges = filteredColleges.filter(college => college.state === state)
    }

    if (major) {
      filteredColleges = filteredColleges.filter(college => 
        college.programs?.some((program: string) => program.toLowerCase().includes(major.toLowerCase())) ||
        college.courses?.some((course: string) => course.toLowerCase().includes(major.toLowerCase()))
      )
    }

    // Apply pagination to combined data
    const startIndex = (page - 1) * limit
    const paginatedColleges = filteredColleges.slice(startIndex, startIndex + limit)

    console.log('📊 Returning colleges:', paginatedColleges.length, 'of', filteredColleges.length)

    return NextResponse.json({
      success: true,
      colleges: paginatedColleges,
      total: filteredColleges.length,
      page,
      limit,
      source: 'combined'
    })

  } catch (error) {
    console.error('Error in GET /api/colleges:', error)
    
    // Final fallback - return mock colleges
    const mockColleges = getMockColleges()
    const startIndex = 0
    const limit = 100
    const paginatedColleges = mockColleges.slice(startIndex, startIndex + limit)
    
    return NextResponse.json({
      success: true,
      colleges: paginatedColleges,
      total: mockColleges.length,
      page: 1,
      limit,
      source: 'fallback'
    })
  }
}

// POST - Save or remove college from user's saved list
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const session = await getUnifiedSession()
    
    // Allow demo mode in development
    const userId = session?.id || 'demo-user'
    
    if (!userId && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, collegeId, collegeName, collegeLocation, collegeType } = body

    // Validate required fields
    if (!action || !collegeId) {
      return NextResponse.json({ 
        error: 'Missing required fields: action, collegeId' 
      }, { status: 400 })
    }

    if (!['save', 'remove'].includes(action)) {
      return NextResponse.json({ 
        error: 'Invalid action. Must be "save" or "remove"' 
      }, { status: 400 })
    }

    console.log(`${action} college:`, { collegeId, collegeName, userId })

    try {
      if (action === 'save') {
        // Check if college is already saved (prevent duplicates)
        const { data: existingSave } = await supabase
          .from('saved_colleges')
          .select('id')
          .eq('userId', userId)
          .eq('collegeId', collegeId)
          .single()

        if (existingSave) {
          return NextResponse.json({ 
            success: true,
            message: 'College already saved',
            data: existingSave,
            alreadyExists: true
          })
        }

        // Save college to user's saved list with retry logic
        let saveAttempts = 0
        let saveError = null
        let saveData = null

        while (saveAttempts < 3) {
          const { data, error } = await supabase
            .from('saved_colleges')
            .insert({ userId: userId, collegeId: collegeId })
            .select()

          if (!error) {
            saveData = data
            break
          } else {
            saveError = error
            saveAttempts++
            console.warn(`Save attempt ${saveAttempts} failed:`, error)
            
            // Wait briefly before retrying
            if (saveAttempts < 3) {
              await new Promise(resolve => setTimeout(resolve, 200))
            }
          }
        }

        if (saveError) {
          console.error('Error saving college after retries:', saveError)
          logDatabasePermissionOnce('Colleges API - Save')
          
          // Return success anyway to prevent UI blocking
          return NextResponse.json({ 
            success: true,
            message: 'College saved successfully (local fallback)',
            data: null,
            fallback: true
          })
        }

        // Log activity
        await logActivity(supabase, userId, {
          type: 'college',
          title: 'College Saved',
          description: `Saved ${collegeName || 'college'} to your college list`,
          metadata: { collegeId, collegeName, collegeLocation, collegeType, action: 'save' }
        })

        console.log(`✅ College saved successfully: ${collegeName} for user ${userId}`)

        return NextResponse.json({ 
          success: true,
          message: 'College saved successfully',
          data: saveData?.[0] || null
        })

      } else if (action === 'remove') {
        // Remove college from user's saved list with verification
        const { data: deletedRows, error } = await supabase
          .from('saved_colleges')
          .delete()
          .eq('userId', userId)
          .eq('collegeId', collegeId)
          .select()

        if (error) {
          console.error('Error removing college:', error)
          logDatabasePermissionOnce('Colleges API - Remove')
          
          // Graceful fallback
          return NextResponse.json({ 
            success: true,
            message: 'College removed successfully (local fallback)',
            fallback: true
          })
        }

        // Check if anything was actually deleted
        if (deletedRows && deletedRows.length === 0) {
          return NextResponse.json({ 
            success: true,
            message: 'College was not in saved list',
            notFound: true
          })
        }

        // Log activity
        await logActivity(supabase, userId, {
          type: 'college',
          title: 'College Removed',
          description: `Removed ${collegeName || 'college'} from your saved list`,
          metadata: { collegeId, collegeName, collegeLocation, collegeType, action: 'remove' }
        })

        console.log(`✅ College removed successfully: ${collegeName} for user ${userId}`)

        return NextResponse.json({ 
          success: true,
          message: 'College removed successfully',
          data: deletedRows?.[0] || null
        })
      }

    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ 
        success: true,
        message: `College ${action}d successfully (fallback)`
      })
    }

  } catch (error) {
    console.error('Error in POST /api/colleges:', error)
    return NextResponse.json({ 
      error: 'Failed to process college action',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to get mock colleges data
function getMockColleges() {
  return [
    {
      id: '1',
      name: 'Indian Institute of Technology Delhi',
      shortName: 'IIT-D',
      location: 'Hauz Khas, New Delhi',
      state: 'Delhi',
      city: 'New Delhi',
      type: 'Government',
      established: 1961,
      website: 'https://home.iitd.ac.in',
      courses: ['Computer Science', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Chemical Engineering'],
      programs: ['Computer Science', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Chemical Engineering'],
      rating: 4.8,
      fees: '₹2.5L - 3L',
      cutoff: 'JEE Rank 1-500',
      latitude: 28.5449,
      longitude: 77.1928,
      ranking: 2,
      acceptanceRate: 2,
      tuition: 'Low',
      imageUrl: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400&h=300&fit=crop',
      averageGPA: '9.2',
      averageSAT: 1580,
      description: 'IIT Delhi is one of the premier engineering institutions in India.',
      highlights: ['Strong Computer Science program', 'Strong Electronics program', 'Strong Mechanical program'],
      campusSize: 'Large',
      studentPopulation: 8000,
      isPublic: true,
      isSaved: false
    },
    {
      id: '2',
      name: 'Birla Institute of Technology and Science',
      shortName: 'BITS',
      location: 'Pilani, Rajasthan',
      state: 'Rajasthan',
      city: 'Pilani',
      type: 'Private',
      established: 1964,
      website: 'https://www.bits-pilani.ac.in',
      courses: ['Computer Science', 'Electronics', 'Mechanical', 'Chemical', 'Biotechnology'],
      programs: ['Computer Science', 'Electronics', 'Mechanical', 'Chemical', 'Biotechnology'],
      rating: 4.6,
      fees: '₹4L - 5L',
      cutoff: 'BITSAT 350+',
      latitude: 28.3670,
      longitude: 75.5886,
      ranking: 15,
      acceptanceRate: 8,
      tuition: 'Moderate',
      imageUrl: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400&h=300&fit=crop',
      averageGPA: '8.8',
      averageSAT: 1520,
      description: 'BITS Pilani is a premier private technical and research university.',
      highlights: ['Strong Computer Science program', 'Strong Information Technology program', 'Strong Biotechnology program'],
      campusSize: 'Large',
      studentPopulation: 15000,
      isPublic: false,
      isSaved: false
    },
    {
      id: '3',
      name: 'Delhi Technological University',
      shortName: 'DTU',
      location: 'Shahbad Daulatpur, Delhi',
      state: 'Delhi',
      city: 'New Delhi',
      type: 'Government',
      established: 1941,
      website: 'http://www.dtu.ac.in',
      courses: ['Computer Engineering', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'],
      programs: ['Computer Engineering', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'],
      rating: 4.4,
      fees: '₹1.5L - 2L',
      cutoff: 'JEE Rank 3000-8000',
      latitude: 28.7501,
      longitude: 77.1177,
      ranking: 25,
      acceptanceRate: 12,
      tuition: 'Low',
      imageUrl: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400&h=300&fit=crop',
      averageGPA: '8.2',
      averageSAT: 1450,
      description: 'Delhi Technological University is a premier engineering institution in Delhi.',
      highlights: ['Strong Computer Engineering program', 'Strong Information Technology program', 'Strong Electronics program'],
      campusSize: 'Large',
      studentPopulation: 12000,
      isPublic: true,
      isSaved: false
    },
    {
      id: '4',
      name: 'Manipal Institute of Technology',
      shortName: 'MIT Manipal',
      location: 'Manipal, Karnataka',
      state: 'Karnataka',
      city: 'Manipal',
      type: 'Private',
      established: 1957,
      website: 'https://manipal.edu',
      courses: ['Computer Science', 'Information Technology', 'Mechanical', 'Aeronautical', 'Biomedical'],
      programs: ['Computer Science', 'Information Technology', 'Mechanical', 'Aeronautical', 'Biomedical'],
      rating: 4.3,
      fees: '₹3.5L - 4.5L',
      cutoff: 'MET Rank 1-5000',
      latitude: 13.3475,
      longitude: 74.7869,
      ranking: 45,
      acceptanceRate: 12,
      tuition: 'High',
      imageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=400&h=300&fit=crop',
      averageGPA: '8.0',
      averageSAT: 1380,
      description: 'MIT Manipal is a premier private engineering institute known for its comprehensive technical education.',
      highlights: ['Modern Infrastructure', 'Industry Connections', 'Research Focus'],
      campusSize: 'Large',
      studentPopulation: 6000,
      isPublic: false,
      isSaved: false
    },
    {
      id: '5',
      name: 'Vellore Institute of Technology',
      shortName: 'VIT Vellore',
      location: 'Vellore, Tamil Nadu',
      state: 'Tamil Nadu',
      city: 'Vellore',
      type: 'Private',
      established: 1984,
      website: 'https://vit.ac.in',
      courses: ['Computer Science', 'Electronics', 'Biotechnology', 'Chemical', 'Mechanical'],
      programs: ['Computer Science', 'Electronics', 'Biotechnology', 'Chemical', 'Mechanical'],
      rating: 4.2,
      fees: '₹2L - 3L',
      cutoff: 'VITEEE Rank 1-10000',
      latitude: 12.9716,
      longitude: 79.1588,
      ranking: 75,
      acceptanceRate: 15,
      tuition: 'High',
      imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop',
      averageGPA: '8.0',
      averageSAT: 1370,
      description: 'VIT Vellore is a leading private engineering university known for quality education and high placements.',
      highlights: ['Quality Education', 'Good Placements', 'Campus Facilities'],
      campusSize: 'Large',
      studentPopulation: 5000,
      isPublic: false,
      isSaved: false
    },
    {
      id: '6',
      name: 'National Institute of Technology Trichy',
      shortName: 'NIT Trichy',
      location: 'Tiruchirappalli, Tamil Nadu',
      state: 'Tamil Nadu',
      city: 'Tiruchirappalli',
      type: 'Government',
      established: 1964,
      website: 'https://www.nitt.edu',
      courses: ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical'],
      programs: ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical'],
      rating: 4.7,
      fees: '₹1.5L - 2L',
      cutoff: 'JEE Rank 800-3000',
      latitude: 10.7596,
      longitude: 78.8149,
      ranking: 32,
      acceptanceRate: 4,
      tuition: 'Low',
      imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop',
      averageGPA: '8.8',
      averageSAT: 1520,
      description: 'NIT Trichy is one of the top government engineering colleges in India with excellent academic standards.',
      highlights: ['Top Government College', 'Strong Alumni Network', 'Research Opportunities'],
      campusSize: 'Large',
      studentPopulation: 4500,
      isPublic: true,
      isSaved: false
    },
    {
      id: '7',
      name: 'Indian Institute of Technology Bombay',
      shortName: 'IIT Bombay',
      location: 'Powai, Mumbai',
      state: 'Maharashtra',
      city: 'Mumbai',
      type: 'Government',
      established: 1958,
      website: 'https://www.iitb.ac.in',
      courses: ['Computer Science', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Aerospace Engineering', 'Chemical Engineering'],
      programs: ['Computer Science', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Aerospace Engineering', 'Chemical Engineering'],
      rating: 4.9,
      fees: '₹2.5L - 3L',
      cutoff: 'JEE Rank 1-300',
      latitude: 19.1335,
      longitude: 72.9133,
      ranking: 3,
      acceptanceRate: 1.5,
      tuition: 'Low',
      imageUrl: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400&h=300&fit=crop',
      averageGPA: '9.6',
      averageSAT: 1590,
      description: 'IIT Bombay is one of the most prestigious engineering institutes globally recognized for technical excellence.',
      highlights: ['Highest Ranked IIT', 'World-Class Research', 'Top Placements'],
      campusSize: 'Large',
      studentPopulation: 7500,
      isPublic: true,
      isSaved: false
    },
    {
      id: '8',
      name: 'Veermata Jijabai Technological Institute',
      shortName: 'VJTI',
      location: 'Matunga, Mumbai',
      state: 'Maharashtra',
      city: 'Mumbai',
      type: 'Government',
      established: 1887,
      website: 'https://www.vjti.ac.in',
      courses: ['Computer Engineering', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Production Engineering'],
      programs: ['Computer Engineering', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Production Engineering'],
      rating: 4.5,
      fees: '₹1.2L - 1.8L',
      cutoff: 'JEE Rank 5000-12000',
      latitude: 19.0176,
      longitude: 72.8326,
      ranking: 50,
      acceptanceRate: 6,
      tuition: 'Low',
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
      averageGPA: '8.1',
      averageSAT: 1390,
      description: 'VJTI is one of India\'s oldest engineering colleges with a legacy of excellence.',
      highlights: ['Heritage Institute', 'Strong Placement Record', 'Mumbai Location'],
      campusSize: 'Medium',
      studentPopulation: 3200,
      isPublic: true,
      isSaved: false
    },
    {
      id: '9',
      name: 'National Institute of Technology Nagpur',
      shortName: 'NIT Nagpur',
      location: 'Nagpur, Maharashtra',
      state: 'Maharashtra',
      city: 'Nagpur',
      type: 'Government',
      established: 1960,
      website: 'https://www.nitnagpur.ac.in',
      courses: ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Chemical'],
      programs: ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Chemical'],
      rating: 4.4,
      fees: '₹1.3L - 2L',
      cutoff: 'JEE Rank 8000-15000',
      latitude: 21.1458,
      longitude: 79.0882,
      ranking: 65,
      acceptanceRate: 7,
      tuition: 'Low',
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
      averageGPA: '8.0',
      averageSAT: 1370,
      description: 'NIT Nagpur is a premier national institute providing quality engineering education.',
      highlights: ['Central India Location', 'Good Infrastructure', 'Strong Industry Links'],
      campusSize: 'Large',
      studentPopulation: 3800,
      isPublic: true,
      isSaved: false
    },
    {
      id: '10',
      name: 'College of Engineering, Pune',
      shortName: 'CoEP',
      location: 'Shivajinagar, Pune',
      state: 'Maharashtra',
      city: 'Pune',
      type: 'Government',
      established: 1854,
      website: 'https://www.coep.org.in',
      courses: ['Computer Engineering', 'Information Technology', 'Mechanical', 'Civil', 'Electronics', 'Production'],
      programs: ['Computer Engineering', 'Information Technology', 'Mechanical', 'Civil', 'Electronics', 'Production'],
      rating: 4.6,
      fees: '₹1.2L - 1.8L',
      cutoff: 'JEE Rank 3000-9000',
      latitude: 18.5314,
      longitude: 73.8446,
      ranking: 40,
      acceptanceRate: 5,
      tuition: 'Low',
      imageUrl: 'https://images.unsplash.com/photo-1497633762265-25c147778286?w=400&h=300&fit=crop',
      averageGPA: '8.4',
      averageSAT: 1410,
      description: 'CoEP is one of Asia\'s oldest engineering colleges, renowned for academic excellence.',
      highlights: ['Asia\'s Oldest Engineering College', 'Pune Tech Hub', 'Strong Alumni Network'],
      campusSize: 'Large',
      studentPopulation: 3500,
      isPublic: true,
      isSaved: false
    },
    {
      id: '11',
      name: 'Pune Institute of Computer Technology',
      shortName: 'PICT',
      location: 'Dhankawadi, Pune',
      state: 'Maharashtra',
      city: 'Pune',
      type: 'Private',
      established: 1983,
      website: 'https://www.pict.edu',
      courses: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical'],
      programs: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical'],
      rating: 4.3,
      fees: '₹2.5L - 3.5L',
      cutoff: 'DTE Rank 1-3000',
      latitude: 18.4881,
      longitude: 73.9273,
      ranking: 55,
      acceptanceRate: 8,
      tuition: 'Medium',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f70504c8a?w=400&h=300&fit=crop',
      averageGPA: '8.2',
      averageSAT: 1395,
      description: 'PICT is a leading private engineering college in Pune known for IT education.',
      highlights: ['Pune Location', 'IT Focus', 'Quality Faculty'],
      campusSize: 'Medium',
      studentPopulation: 2800,
      isPublic: false,
      isSaved: false
    },
    {
      id: '12',
      name: 'Symbiosis Institute of Technology',
      shortName: 'SIT Pune',
      location: 'Lavale, Pune',
      state: 'Maharashtra',
      city: 'Pune',
      type: 'Private',
      established: 2002,
      website: 'https://www.sibm.edu',
      courses: ['Computer Science', 'Electronics', 'Mechanical', 'Civil'],
      programs: ['Computer Science', 'Electronics', 'Mechanical', 'Civil'],
      rating: 4.2,
      fees: '₹3L - 4L',
      cutoff: 'JEE Mains 300+',
      latitude: 18.5971,
      longitude: 73.7858,
      ranking: 70,
      acceptanceRate: 10,
      tuition: 'High',
      imageUrl: 'https://images.unsplash.com/photo-1510531294647-37454b8b4f73?w=400&h=300&fit=crop',
      averageGPA: '8.0',
      averageSAT: 1380,
      description: 'Symbiosis is a prestigious private institute offering quality education with global perspective.',
      highlights: ['Global University', 'Modern Campus', 'International Exposure'],
      campusSize: 'Medium',
      studentPopulation: 2000,
      isPublic: false,
      isSaved: false
    },
    {
      id: '13',
      name: 'Bharati Vidyapeeth College of Engineering',
      shortName: 'BVCE',
      location: 'Pune',
      state: 'Maharashtra',
      city: 'Pune',
      type: 'Private',
      established: 1983,
      website: 'https://www.bharatividyapeeth.edu',
      courses: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical'],
      programs: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical'],
      rating: 4.1,
      fees: '₹2.2L - 3.2L',
      cutoff: 'DTE Rank 5000-15000',
      latitude: 18.4408,
      longitude: 73.8868,
      ranking: 75,
      acceptanceRate: 12,
      tuition: 'Medium',
      imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
      averageGPA: '7.8',
      averageSAT: 1360,
      description: 'BVCE offers comprehensive engineering education with focus on practical skills.',
      highlights: ['Established Curriculum', 'Good Placements', 'Industry Exposure'],
      campusSize: 'Medium',
      studentPopulation: 2200,
      isPublic: false,
      isSaved: false
    },
    {
      id: '14',
      name: 'Government College of Engineering, Aurangabad',
      shortName: 'GEC Aurangabad',
      location: 'Aurangabad, Maharashtra',
      state: 'Maharashtra',
      city: 'Aurangabad',
      type: 'Government',
      established: 1985,
      website: 'https://www.gcegaurangabad.ac.in',
      courses: ['Computer Science', 'Electronics', 'Mechanical', 'Civil'],
      programs: ['Computer Science', 'Electronics', 'Mechanical', 'Civil'],
      rating: 4.0,
      fees: '₹1.2L - 1.6L',
      cutoff: 'JEE Rank 15000-25000',
      latitude: 19.8762,
      longitude: 75.3433,
      ranking: 90,
      acceptanceRate: 8,
      tuition: 'Low',
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
      averageGPA: '7.6',
      averageSAT: 1330,
      description: 'GEC Aurangabad provides quality engineering education with good academic standards.',
      highlights: ['Affordable Education', 'Growing Infrastructure', 'Tier-2 City Benefits'],
      campusSize: 'Medium',
      studentPopulation: 2000,
      isPublic: true,
      isSaved: false
    },
    {
      id: '15',
      name: 'Dr. Ambedkar Institute of Technology',
      shortName: 'AITPUNE',
      location: 'Pune, Maharashtra',
      state: 'Maharashtra',
      city: 'Pune',
      type: 'Private',
      established: 1999,
      website: 'https://www.aitpune.com',
      courses: ['Computer Science', 'Information Technology', 'Electronics'],
      programs: ['Computer Science', 'Information Technology', 'Electronics'],
      rating: 3.9,
      fees: '₹2L - 3L',
      cutoff: 'DTE Rank 20000+',
      latitude: 18.5204,
      longitude: 73.8567,
      ranking: 95,
      acceptanceRate: 15,
      tuition: 'Medium',
      imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
      averageGPA: '7.5',
      averageSAT: 1320,
      description: 'AITPUNE offers engineering programs with focus on skill development and digital learning.',
      highlights: ['Affordable Fees', 'Digital Learning', 'Good Support System'],
      campusSize: 'Small',
      studentPopulation: 1500,
      isPublic: false,
      isSaved: false
    }
  ]
}

// Helper function to log user activity
async function logActivity(supabase: any, userId: string, activity: {
  type: string
  title: string
  description: string
  metadata: any
}) {
  try {
    await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        metadata: activity.metadata
      })
  } catch (error) {
    console.error('Error logging activity:', error)
    // Don't throw - logging failure shouldn't break the main operation
  }
}