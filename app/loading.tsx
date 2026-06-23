'use client'

import { motion } from 'framer-motion'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B0E17]/90 backdrop-blur-md">
      <div className="relative flex items-center justify-center w-32 h-32">
        {/* Outer Orbit */}
        <motion.div
          className="absolute inset-0 rounded-full border-t-2 border-r-2 border-transparent"
          style={{ borderTopColor: '#00FFFF', borderRightColor: '#8B00FF' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Middle Orbit */}
        <motion.div
          className="absolute inset-2 rounded-full border-b-2 border-l-2 border-transparent opacity-80"
          style={{ borderBottomColor: '#FF007F', borderLeftColor: '#00FFFF' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Inner Core Pulse */}
        <motion.div
          className="w-12 h-12 rounded-full shadow-[0_0_15px_#00FFFF]"
          style={{ background: 'linear-gradient(45deg, #00FFFF, #8B00FF)' }}
          animate={{ 
            scale: [0.8, 1.2, 0.8], 
            opacity: [0.7, 1, 0.7] 
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Deep Glow Effect */}
        <div className="absolute inset-0 rounded-full blur-2xl opacity-20 bg-gradient-to-tr from-[#00FFFF] via-[#8B00FF] to-[#FF007F]" />
      </div>
      
      {/* Dynamic Text */}
      <motion.div 
        className="mt-8 flex flex-col items-center"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <p className="text-xl font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#FF007F] text-glow uppercase">
          Mapping Future
        </p>
        <p className="text-sm text-cyan-200/60 mt-2 tracking-widest uppercase">
          Initializing Systems...
        </p>
      </motion.div>
    </div>
  )
}
