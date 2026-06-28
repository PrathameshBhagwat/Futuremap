'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  MapPin, 
  Map as MapIcon, 
  Grid3X3,
  SlidersHorizontal,
  X,
  Star,
  Loader
} from 'lucide-react'
import CollegeCard from '@/components/CollegeCard'
import dynamic from 'next/dynamic'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

// Dynamically import map components (Leaflet fallback)
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

// Google Maps (preferred if API key present)
const GoogleCollegesMap = dynamic(() => import('@/components/GoogleCollegesMap'), { ssr: false }) as any

interface College {
  id: string
  name: string
  shortName: string
  location: string
  state: string
  city: string
  ranking: number
  acceptanceRate: number
  tuition: string
  imageUrl: string
  programs: string[]
  averageGPA: string
  averageSAT: number
  description: string
  highlights: string[]
  campusSize: string
  studentPopulation: number
  isPublic: boolean
  website: string
  established: number
  fees: string
  cutoff: string
  rating: number
  type: string
  latitude: number
  longitude: number
  courses: string[]
  isSaved?: boolean
  distance?: number
}

// Mock college data - replace with real API
// @ts-ignore
const mockColleges: College[] = [
  {
    id: '1',
    name: 'Indian Institute of Technology Delhi',
    shortName: 'IIT Delhi',
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
    imageUrl: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400',
    averageGPA: '9.5',
    averageSAT: 1580,
    description: 'IIT Delhi is one of the premier engineering institutions in India, known for excellence in technical education and research.',
    highlights: ['Top Engineering Program', 'Research Excellence', 'Industry Connections'],
    campusSize: 'Large',
    studentPopulation: 8000,
    isPublic: true
  },
  {
    id: '2',
    name: 'Birla Institute of Technology and Science',
    shortName: 'BITS Pilani',
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
    ranking: 30,
    acceptanceRate: 5,
    tuition: 'High',
    imageUrl: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=400',
    averageGPA: '8.5',
    averageSAT: 1480,
    description: 'BITS Pilani is a leading private technical university known for its innovative education and industry partnerships.',
    highlights: ['Industry Partnerships', 'Innovation Focus', 'High Placement Rates'],
    campusSize: 'Large',
    studentPopulation: 4000,
    isPublic: false
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
    ranking: 58,
    acceptanceRate: 8,
    tuition: 'Low',
    imageUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=400',
    averageGPA: '8.2',
    averageSAT: 1400,
    description: 'DTU is a leading government technical university in Delhi known for its quality engineering education.',
    highlights: ['Government College', 'Delhi Location', 'Good Placements'],
    campusSize: 'Large',
    studentPopulation: 7000,
    isPublic: true
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
    imageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=400',
    averageGPA: '8.0',
    averageSAT: 1380,
    description: 'MIT Manipal is a premier private engineering institute known for its comprehensive technical education.',
    highlights: ['Modern Infrastructure', 'Industry Connections', 'Research Focus'],
    campusSize: 'Large',
    studentPopulation: 6000,
    isPublic: false
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
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400',
    averageGPA: '8.0',
    averageSAT: 1370,
    description: 'VIT Vellore is a leading private engineering university known for quality education and high placements.',
    highlights: ['Quality Education', 'Good Placements', 'Campus Facilities'],
    campusSize: 'Large',
    studentPopulation: 5000,
    isPublic: false
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
    imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400',
    averageGPA: '8.8',
    averageSAT: 1520,
    description: 'NIT Trichy is one of the top government engineering colleges in India with excellent academic standards.',
    highlights: ['Top Government College', 'Strong Alumni Network', 'Research Opportunities'],
    campusSize: 'Large',
    studentPopulation: 4500,
    isPublic: true
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
    imageUrl: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=400',
    averageGPA: '9.6',
    averageSAT: 1590,
    description: 'IIT Bombay is one of the most prestigious engineering institutes in India, globally recognized for technical excellence and innovation.',
    highlights: ['Highest Ranked IIT', 'World-Class Research', 'Top Placements (100% LPA)'],
    campusSize: 'Large',
    studentPopulation: 7500,
    isPublic: true
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
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
    averageGPA: '8.1',
    averageSAT: 1390,
    description: 'VJTI is one of India\'s oldest engineering colleges with a legacy of excellence in technical education and innovation.',
    highlights: ['Heritage Institute', 'Strong Placement Record', 'Mumbai Location'],
    campusSize: 'Medium',
    studentPopulation: 3200,
    isPublic: true
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
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
    averageGPA: '8.0',
    averageSAT: 1370,
    description: 'NIT Nagpur is a premier national institute providing quality engineering education with a focus on practical skills.',
    highlights: ['Central India Location', 'Good Infrastructure', 'Strong Industry Links'],
    campusSize: 'Large',
    studentPopulation: 3800,
    isPublic: true
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
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-25c147778286?w=400',
    averageGPA: '8.4',
    averageSAT: 1410,
    description: 'CoEP is one of Asia\'s oldest engineering colleges, renowned for academic excellence and producing industry leaders.',
    highlights: ['Asia\'s Oldest Engineering College', 'Pune Tech Hub', 'Strong Alumni Network'],
    campusSize: 'Large',
    studentPopulation: 3500,
    isPublic: true
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
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f70504c8a?w=400',
    averageGPA: '8.2',
    averageSAT: 1395,
    description: 'PICT is a leading private engineering college in Pune known for specialized IT education and innovation.',
    highlights: ['Pune Location', 'IT Focus', 'Quality Faculty'],
    campusSize: 'Medium',
    studentPopulation: 2800,
    isPublic: false
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
    imageUrl: 'https://images.unsplash.com/photo-1510531294647-37454b8b4f73?w=400',
    averageGPA: '8.0',
    averageSAT: 1380,
    description: 'Symbiosis is a prestigious private institute offering quality education with global perspective.',
    highlights: ['Global University', 'Modern Campus', 'International Exposure'],
    campusSize: 'Medium',
    studentPopulation: 2000,
    isPublic: false
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
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400',
    averageGPA: '7.8',
    averageSAT: 1360,
    description: 'BVCE offers comprehensive engineering education with focus on practical skills and research.',
    highlights: ['Established Curriculum', 'Good Placements', 'Industry Exposure'],
    campusSize: 'Medium',
    studentPopulation: 2200,
    isPublic: false
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
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
    averageGPA: '7.6',
    averageSAT: 1330,
    description: 'GEC Aurangabad provides quality engineering education in a developing city with good academic standards.',
    highlights: ['Affordable Education', 'Growing Infrastructure', 'Tier-2 City Benefits'],
    campusSize: 'Medium',
    studentPopulation: 2000,
    isPublic: true
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
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400',
    averageGPA: '7.5',
    averageSAT: 1320,
    description: 'AITPUNE offers engineering programs with focus on skill development and digital learning.',
    highlights: ['Affordable Fees', 'Digital Learning', 'Good Support System'],
    campusSize: 'Small',
    studentPopulation: 1500,
    isPublic: false
  }
]

// Filter options are now dynamic, set in state

export default function CollegesPage() {
  const { user } = useAuth()
  const [colleges, setColleges] = useState<College[]>([])
  const [filteredColleges, setFilteredColleges] = useState<College[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | undefined>(undefined)
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [savedColleges, setSavedColleges] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [states, setStates] = useState<string[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [courses, setCourses] = useState<string[]>([])
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'fees'>('rating')
  const [aiOverview, setAiOverview] = useState<string>('')
  const [aiLoading, setAiLoading] = useState<boolean>(false)

  // Fetch colleges and saved colleges data
  useEffect(() => {
    fetchColleges()
    if (user) {
      fetchSavedColleges()
    }
  }, [user])

  const fetchColleges = async () => {
    try {
      setLoading(true)
      console.log('🎓 Fetching colleges data...')
      
      try {
        const response = await fetch('/api/colleges?limit=100')  // Request all colleges
        const data = await response.json()
        
        console.log('📡 API Response:', { success: data.success, collegesCount: data.colleges?.length, source: data.source })
        
        // Check if API returned a valid response with colleges
        if (data.success && data.colleges && data.colleges.length > 0) {
          console.log('✅ Colleges fetched from API:', data.colleges.length, 'from', data.source)
          setColleges(data.colleges)
          
          // Extract unique values for filters
          const uniqueStates = Array.from(new Set(data.colleges.map((c: College) => c.state))).sort() as string[]
          const uniqueTypes = Array.from(new Set(data.colleges.map((c: College) => c.type))).sort() as string[]
          const uniqueCourses = Array.from(new Set(data.colleges.flatMap((c: College) => c.courses || c.programs || []))).sort() as string[]
          
          console.log('🔍 Extracted states:', uniqueStates)
          setStates(uniqueStates)
          setTypes(uniqueTypes)  
          setCourses(uniqueCourses)
          return
        } else {
          console.warn('⚠️ API returned invalid response:', data)
        }
      } catch (apiError) {
        console.warn('⚠️ API fetch failed:', apiError)
      }
      
      // Always fallback to mock colleges if API fails, returns empty, or returns insufficient data
      console.log('📚 Using local mock colleges as fallback:', mockColleges.length)
      setColleges(mockColleges)
      setStates(Array.from(new Set(mockColleges.map(c => c.state))).sort() as string[])
      setTypes(Array.from(new Set(mockColleges.map(c => c.type))).sort() as string[])
      setCourses(Array.from(new Set(mockColleges.flatMap(c => c.courses))).sort() as string[])
    } catch (error) {
      console.error('❌ Critical error fetching colleges:', error)
      setColleges(mockColleges)
      setStates(Array.from(new Set(mockColleges.map(c => c.state))).sort() as string[])
      setTypes(Array.from(new Set(mockColleges.map(c => c.type))).sort() as string[])
      setCourses(Array.from(new Set(mockColleges.flatMap(c => c.courses))).sort() as string[])
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedColleges = async () => {
    try {
      const response = await fetch('/api/saved-colleges')
      const data = await response.json()
      
      if (data.success && data.savedColleges) {
        console.log('📚 Saved colleges fetched:', data.savedColleges.length)
        setSavedColleges(data.savedColleges.map((sc: any) => sc.collegeId || sc.collegeId))
      }
    } catch (error) {
      console.error('❌ Error fetching saved colleges:', error)
    }
  }

  // Apply filters
  useEffect(() => {
    let filtered = colleges.filter(college => {
      const matchesSearch = college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           college.city.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesState = !selectedState || college.state === selectedState
      const matchesType = !selectedType || college.type === selectedType
      const matchesCourse = !selectedCourse || college.courses.includes(selectedCourse)
      const matchesRating = college.rating >= minRating
      
      return matchesSearch && matchesState && matchesType && matchesCourse && matchesRating
    })

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'rating':
          return b.rating - a.rating
        case 'fees':
          // Simple fee comparison (would need better parsing in real app)
          return a.fees.localeCompare(b.fees)
        default:
          return 0
      }
    })

    setFilteredColleges(filtered)
  }, [colleges, searchQuery, selectedState, selectedType, selectedCourse, minRating, sortBy])

  // Fetch AI overview when a college is selected
  useEffect(() => {
    const selected = filteredColleges.find(c => c.id === selectedCollegeId)
    if (!selected) return

    const run = async () => {
      try {
        setAiLoading(true)
        setAiOverview('')
        const resp = await fetch('/api/colleges/overview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: selected.name,
            city: selected.city,
            state: selected.state,
            programs: selected.courses,
            rating: selected.rating,
            type: selected.type,
            website: selected.website,
          })
        })
        const data = await resp.json()
        if (data.success && data.overview) setAiOverview(data.overview)
      } catch (e) {
        console.error('AI overview error', e)
      } finally {
        setAiLoading(false)
      }
    }

    run()
  }, [selectedCollegeId, filteredColleges])

  const handleSaveCollege = async (collegeId: string) => {
    if (!user) {
      toast.error('Please log in to save colleges')
      return
    }

    const isSaved = savedColleges.includes(collegeId)
    const college = colleges.find(c => c.id === collegeId)
    
    if (!college) {
      toast.error('College not found')
      return
    }

    try {
      // Optimistically update UI
      setSavedColleges(prev => 
        isSaved 
          ? prev.filter(id => id !== collegeId)
          : [...prev, collegeId]
      )

      const response = await fetch('/api/colleges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isSaved ? 'remove' : 'save',
          collegeId: college.id,
          collegeName: college.name,
          collegeLocation: college.location,
          collegeType: college.type
        })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success(isSaved ? 'College removed from saved list' : 'College saved successfully!')
      } else {
        // Revert optimistic update on error
        setSavedColleges(prev => 
          isSaved 
            ? [...prev, collegeId]
            : prev.filter(id => id !== collegeId)
        )
        toast.error(result.error || 'Failed to update college')
      }
    } catch (error) {
      console.error('Error saving college:', error)
      // Revert optimistic update on error
      setSavedColleges(prev => 
        isSaved 
          ? [...prev, collegeId]
          : prev.filter(id => id !== collegeId)
      )
      toast.error('Failed to save college')
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedState('')
    setSelectedType('')
    setSelectedCourse('')
    setMinRating(0)
  }

  const activeFiltersCount = [selectedState, selectedType, selectedCourse].filter(Boolean).length + (minRating > 0 ? 1 : 0)

  return (
    <div className="min-h-screen bg-space-dark relative overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid-bg"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white mb-4">
              Find Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-pink">College</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Discover top engineering colleges across India with detailed information and insights
            </p>
          </div>

          {/* Search and Controls */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search colleges or cities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-all"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-4">
                {/* Filters Toggle */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                    filtersOpen
                      ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan'
                      : 'border-gray-600 text-gray-400 hover:border-neon-cyan hover:text-neon-cyan'
                  }`}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="bg-neon-pink text-space-dark px-2 py-1 text-xs rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </motion.button>

                {/* View Toggle */}
                <div className="flex bg-black/20 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'grid'
                        ? 'bg-neon-cyan text-space-dark'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`p-2 rounded-md transition-all ${
                      viewMode === 'map'
                        ? 'bg-neon-cyan text-space-dark'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <MapIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
              {filtersOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-6 pt-6 border-t border-gray-700 overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* State Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
                      <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-all"
                      >
                        <option value="">All States</option>
                        {states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>

                    {/* Type Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-all"
                      >
                        <option value="">All Types</option>
                        {types.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {/* Course Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Course</label>
                      <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-all"
                      >
                        <option value="">All Courses</option>
                        {courses.map(course => (
                          <option key={course} value={course}>{course}</option>
                        ))}
                      </select>
                    </div>

                    {/* Rating Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Min Rating: {minRating.toFixed(1)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={minRating}
                        onChange={(e) => setMinRating(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Sort by</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="px-3 py-2 bg-black/20 border border-gray-600 rounded-lg text-white focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-all"
                        >
                          <option value="rating">Rating</option>
                          <option value="name">Name</option>
                          <option value="fees">Fees</option>
                        </select>
                      </div>
                      
                      <div className="pt-6">
                        <span className="text-sm text-gray-400">
                          {filteredColleges.length} colleges found
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={clearFilters}
                      className="flex items-center space-x-1 text-neon-pink hover:text-neon-cyan transition-colors text-sm font-semibold"
                    >
                      <X className="w-4 h-4" />
                      <span>Clear Filters</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          /* Loading State */
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <Loader className="w-8 h-8 text-neon-cyan animate-spin" />
              <p className="text-gray-400">Loading colleges...</p>
            </div>
          </div>
        ) : filteredColleges.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <div className="text-gray-400">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No colleges found</h3>
              <p>Try adjusting your filters or search query</p>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredColleges.map((college, index) => (
              <motion.div
                key={college.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => { setSelectedCollegeId(college.id); setViewMode('map') }}
              >
                <CollegeCard
                  college={college}
                  onSave={handleSaveCollege}
                  isSaved={savedColleges.includes(college.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Map View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-4 rounded-2xl"
          >
            <div className="h-[600px] rounded-lg overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Map */}
              <div className="col-span-2 min-h-[400px] rounded-lg overflow-hidden">
                {typeof window !== 'undefined' && (
                  <GoogleCollegesMap colleges={filteredColleges as any} selectedCollegeId={selectedCollegeId} apiKeyOverride={GOOGLE_MAPS_API_KEY} />
                )}
              </div>
              {/* AI Overview */}
              <div className="col-span-1 rounded-lg overflow-hidden">
                <div className="h-[600px] glass-card rounded-lg flex flex-col">
                  <div className="px-5 py-4 border-b border-gray-700 flex-shrink-0">
                    <h3 className="text-white font-semibold text-lg">AI Overview</h3>
                  </div>
                  
                  {!selectedCollegeId && (
                    <div className="flex-1 flex items-center justify-center p-5">
                      <p className="text-gray-400 text-sm text-center">Select a college card to see an AI overview here.</p>
                    </div>
                  )}
                  
                  {selectedCollegeId && aiLoading && (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-10 h-10 border-3 border-gray-600 border-t-cyan-400 rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-gray-400 text-sm">Generating overview...</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedCollegeId && !aiLoading && aiOverview && (
                    <div className="flex-1 overflow-y-auto px-5 py-4">
                      <div className="text-gray-200 text-sm leading-relaxed space-y-3">
                        {aiOverview.split('\n').map((line, idx) => {
                          // Handle bullet points and paragraphs
                          if (line.trim().startsWith('•')) {
                            return (
                              <div key={idx} className="flex gap-3">
                                <span className="text-cyan-400 flex-shrink-0 mt-0.5">•</span>
                                <p className="text-gray-200">{line.trim().substring(1).trim()}</p>
                              </div>
                            )
                          }
                          return (
                            line.trim() && (
                              <p key={idx} className="text-gray-200">
                                {line}
                              </p>
                            )
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* No Results */}
        {filteredColleges.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="glass-card p-12 rounded-2xl max-w-md mx-auto">
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Colleges Found</h3>
              <p className="text-gray-400 mb-4">
                Try adjusting your filters or search criteria
              </p>
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-neon-cyan to-neon-pink px-6 py-3 rounded-lg text-space-dark font-semibold hover:shadow-lg hover:shadow-neon-cyan/25 transition-all"
              >
                Clear All Filters
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}