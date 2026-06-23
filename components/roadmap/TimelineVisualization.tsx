'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, CheckCircle, Clock, Zap } from 'lucide-react'

interface TimelineVisualizationProps {
  roadmap: any
}

export default function TimelineVisualization({ roadmap }: TimelineVisualizationProps) {
  const [expandedPhase, setExpandedPhase] = useState<number>(0)

  // Handle phases - ensure it's always an array
  let phases = roadmap?.phases || []
  
  // If phases is empty or invalid, try to create a default placeholder
  if (!Array.isArray(phases) || phases.length === 0) {
    // Create a basic timeline structure from available data
    phases = [
      {
        id: 'phase-1',
        title: roadmap?.title || 'Career Development Roadmap',
        description: roadmap?.description || 'Your personalized learning path',
        duration: roadmap?.totalDuration || 6,
        difficulty: 'intermediate',
        nodes: []
      }
    ]
  }

  if (!roadmap) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <p>No roadmap data available</p>
          <p className="text-sm mt-2">Please generate a roadmap first</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-y-auto p-6 bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-white mb-8">Career Learning Timeline</h2>
        
        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-neon-cyan via-neon-purple to-neon-pink"></div>

          {/* Phases */}
          {roadmap.phases.map((phase: any, phaseIndex: number) => (
            <motion.div
              key={phaseIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: phaseIndex * 0.1 }}
              className="mb-8 ml-16"
            >
              {/* Phase Node */}
              <div className="absolute left-0 top-6 w-9 h-9 bg-gray-900 border-2 border-neon-cyan rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-neon-cyan rounded-full"></div>
              </div>

              {/* Phase Header */}
              <button
                onClick={() => setExpandedPhase(expandedPhase === phaseIndex ? -1 : phaseIndex)}
                className="w-full group"
              >
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/80 hover:border-neon-cyan transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-neon-cyan">{phase.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">{phase.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={16} />
                          {phase.duration || 'N/A'} weeks
                        </span>
                        {phase.difficulty && (
                          <span className="flex items-center gap-1">
                            <Zap size={16} />
                            {phase.difficulty}
                          </span>
                        )}
                        <span>{phase.nodes?.length || 0} modules</span>
                      </div>
                    </div>
                    <ChevronDown
                      size={24}
                      className={`text-neon-cyan transition-transform ${
                        expandedPhase === phaseIndex ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
              </button>

              {/* Nodes List */}
              {expandedPhase === phaseIndex && phase.nodes && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-3 ml-4 border-l-2 border-neon-purple pl-4"
                >
                  {phase.nodes.map((node: any, nodeIndex: number) => (
                    <motion.div
                      key={nodeIndex}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: nodeIndex * 0.05 }}
                      className="group relative"
                    >
                      <div className="absolute -left-8 top-2 w-4 h-4 bg-gray-800 border-2 border-neon-purple rounded-full"></div>
                      
                      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 hover:border-neon-purple hover:bg-gray-900/80 transition-all">
                        <div className="flex items-start gap-3">
                          {node.completed ? (
                            <CheckCircle size={20} className="text-neon-green flex-shrink-0 mt-0.5" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex-shrink-0 mt-0.5"></div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{node.title}</h4>
                            {node.description && (
                              <p className="text-sm text-gray-400 mt-1">{node.description}</p>
                            )}
                            
                            {/* Node Details Grid */}
                            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                              {node.duration && (
                                <div className="flex items-center gap-1 text-gray-500">
                                  <Clock size={12} />
                                  <span>{node.duration}</span>
                                </div>
                              )}
                              {node.difficulty && (
                                <div className="flex items-center gap-1 text-gray-500">
                                  <Zap size={12} />
                                  <span>{node.difficulty}</span>
                                </div>
                              )}
                            </div>

                            {/* Resources */}
                            {node.resources && node.resources.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <p className="text-xs font-semibold text-gray-400 uppercase">Resources:</p>
                                {node.resources.map((resource: any, idx: number) => (
                                  <div key={idx} className="text-xs bg-gray-800/50 rounded px-2 py-1 text-gray-300">
                                    • {typeof resource === 'string' ? resource : resource.title || 'Resource'}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Skills */}
                            {node.skills && node.skills.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {node.skills.map((skill: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-neon-purple/20 text-neon-purple rounded-full px-2 py-1 border border-neon-purple/30"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-4 bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 border border-neon-cyan/30 rounded-lg"
        >
          <p className="text-sm text-gray-300">
            <span className="font-semibold text-neon-cyan">Total Duration:</span> {roadmap.totalDuration || 'N/A'} weeks
          </p>
          <p className="text-sm text-gray-300 mt-2">
            <span className="font-semibold text-neon-cyan">Total Modules:</span> {roadmap.phases.reduce((sum: number, p: any) => sum + (p.nodes?.length || 0), 0)}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
