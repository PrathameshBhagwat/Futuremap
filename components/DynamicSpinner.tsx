'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DynamicSpinnerProps {
  messages?: string[]
  intervalMs?: number
  size?: 'sm' | 'md' | 'lg'
  fullscreen?: boolean
}

const defaultMessages = [
  "Initializing...",
  "Analyzing data...",
  "Applying models...",
  "Optimizing results...",
  "Almost there..."
]

export default function DynamicSpinner({ 
  messages = defaultMessages, 
  intervalMs = 2500,
  size = 'md',
  fullscreen = false
}: DynamicSpinnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [messages.length, intervalMs])

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-24 h-24'
  }

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className={`relative ${sizeClasses[size]}`}>
        <motion.div
          className="absolute inset-0 rounded-full border-t-2 border-r-2 border-primary-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-b-2 border-l-2 border-accent-400"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-4 bg-primary-500/20 rounded-full blur-md"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <div className="h-8 relative w-64 flex justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-sm md:text-base font-medium text-slate-300 absolute"
          >
            {messages[currentIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-space-dark/80 backdrop-blur-sm">
        {spinnerContent}
      </div>
    )
  }

  return spinnerContent
}
