'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  Users, 
  Code, 
  Brain, 
  Palette,
  Shield,
  Target,
  Linkedin,
  Twitter,
  Github,
  Mail,
  Phone,
  Star,
  Crown
} from 'lucide-react'

const TeamPage = () => {
  const allTeamMembers = [
    {
      name: 'Prathamesh Bhagwat',
      role: 'Developer',
      bio: 'Ensures exceptional user experience through comprehensive testing and quality assurance. Expert in debugging and system optimization.',
      skills: ['Quality Assurance', 'Testing Strategies', 'Debugging', 'User Experience'],
      profileImage: '/Profile.png',
      icon: Shield,
      color: 'text-neon-pink',
      isLeader: false
    },
    {
      name: 'Pradnya Gore',
      role: 'Developer',
      bio: 'Drives team coordination and manages project workflows. Specializes in strategic presentations and team management.',
      skills: ['Project Coordination', 'Team Management', 'Presentation', 'Strategic Planning'],
      profileImage: '/Profile.png',
      icon: Target,
      color: 'text-purple-400',
      isLeader: false
    },
    {
      name: 'Omkar Chavhan',
      role: 'Developer',
      bio: 'Transforms complex data into actionable insights and compelling visualizations. Expert in statistical analysis and data presentation.',
      skills: ['Data Analysis', 'Data Visualization', 'Statistical Analysis', 'Presentation'],
      profileImage: '/Profile.png',
      icon: Brain,
      color: 'text-green-400',
      isLeader: false
    },
    {
      name: 'Dr.Nilesh Sueyawanski',
      role: 'Project Guide',
      bio: 'Brings creative problem-solving and fresh perspectives to complex challenges. Specializes in strategic thinking and innovation.',
      skills: ['Creative Problem Solving', 'Innovation', 'Strategic Thinking', 'Research'],
      profileImage: '/Profile.png',
      icon: Users,
      color: 'text-yellow-400',
      isLeader: false
    },
    {
      name: 'Prof.Rahul Sharma',
      role: 'Project Co-ordinator',
      bio: 'Contributes analytical expertise and strategic development insights. Expert in creative solutions and problem-solving approaches.',
      skills: ['Strategic Analysis', 'Creative Development', 'Problem Solving', 'Research'],
      profileImage: '/Profile.png',
      icon: Palette,
      color: 'text-orange-400',
      isLeader: false
    }
  ]

  const departments = [
    {
      name: 'Engineering',
      icon: Code,
      color: 'text-neon-cyan',
      bgColor: 'from-neon-cyan/10 to-neon-cyan/5',
      members: 8,
      description: 'Building scalable AI-powered career guidance systems'
    },
    {
      name: 'AI Research',
      icon: Brain,
      color: 'text-neon-pink',
      bgColor: 'from-neon-pink/10 to-neon-pink/5',
      members: 5,
      description: 'Developing cutting-edge machine learning models for career matching'
    },
    {
      name: 'Design',
      icon: Palette,
      color: 'text-purple-400',
      bgColor: 'from-purple-400/10 to-purple-400/5',
      members: 4,
      description: 'Creating intuitive and beautiful user experiences'
    },
    {
      name: 'Security',
      icon: Shield,
      color: 'text-green-400',
      bgColor: 'from-green-400/10 to-green-400/5',
      members: 3,
      description: 'Ensuring data privacy and platform security'
    }
  ]

  const cultureValues = [
    {
      title: 'Student-First Mindset',
      description: 'Every decision we make is guided by what\'s best for students and their career success.'
    },
    {
      title: 'Innovation & Excellence',
      description: 'We continuously push the boundaries of what\'s possible in educational technology.'
    },
    {
      title: 'Collaboration',
      description: 'Great products are built by great teams working together towards a common goal.'
    },
    {
      title: 'Lifelong Learning',
      description: 'We believe in continuous growth and learning, both personally and professionally.'
    }
  ]

  const openPositions = [
    'Senior AI Engineer',
    'Full-Stack Developer',
    'UX/UI Designer',
    'Product Manager',
    'DevOps Engineer',
    'Content Strategist'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-space-darker via-space-dark to-space-darker">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="grid-bg opacity-10"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-cyan/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-neon-pink/5 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex justify-center mb-6"
            >
              <div className="flex items-center space-x-3 px-6 py-3 glass-card rounded-full">
                <Users className="h-6 w-6 text-neon-cyan" />
                <span className="text-neon-cyan font-semibold">Meet Our Team</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-8"
            >
              <span className="bg-gradient-to-r from-neon-cyan via-white to-neon-pink bg-clip-text text-transparent">
                Our Team
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
            >
              Meet the passionate individuals behind CareerGuide who are dedicated to 
              transforming the future of career guidance through innovation and technology.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Unified Team Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allTeamMembers.map((member, index) => {
              const IconComponent = member.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass-card p-8 rounded-2xl text-center hover:scale-105 transition-transform duration-300 relative"
                >
                  <div className="mb-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-cyan to-neon-pink p-1 mx-auto mb-4">
                      <div className="w-full h-full rounded-full overflow-hidden bg-space-dark flex items-center justify-center">
                        {member.profileImage ? (
                          <Image
                            src={member.profileImage}
                            alt={`${member.name} - ${member.role}`}
                            width={member.isLeader ? 112 : 96}
                            height={member.isLeader ? 112 : 96}
                            className="w-full h-full object-cover rounded-full"
                            priority={false}
                          />
                        ) : (
                          <IconComponent className={`h-12 w-12 ${member.color}`} />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-white mb-2 text-xl">
                    {member.name}
                  </h3>
                  <p className={`font-semibold mb-4 ${member.color} text-base`}>
                    {member.role}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

export default TeamPage