'use client'

import { useState, useRef, useEffect } from 'react'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/lib/translation-service'
import { motion, AnimatePresence } from 'framer-motion'

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const { currentLanguage, setLanguage, isTranslating } = useLanguage()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-300 hover:text-neon-cyan transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-800/50"
        aria-label="Select Language"
      >
        <Globe className="w-5 h-5" />
        <span className="hidden sm:inline-block">
          {SUPPORTED_LANGUAGES[currentLanguage as SupportedLanguage]?.name || 'English'}
        </span>
        {isTranslating ? (
          <div className="w-4 h-4 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin ml-1" />
        ) : (
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-space-dark/95 backdrop-blur-lg border border-neon-cyan/20 rounded-xl shadow-2xl shadow-neon-cyan/10 z-50 overflow-hidden"
          >
            <div className="py-1">
              {(Object.entries(SUPPORTED_LANGUAGES) as [SupportedLanguage, { name: string, nativeName: string }][]).map(([code, lang]) => (
                <button
                  key={code}
                  onClick={() => {
                    setLanguage(code)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors ${
                    currentLanguage === code 
                      ? 'bg-neon-cyan/10 text-neon-cyan font-medium' 
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                  }`}
                  disabled={isTranslating}
                >
                  <div className="flex flex-col">
                    <span>{lang.nativeName}</span>
                    <span className="text-xs opacity-70">{lang.name}</span>
                  </div>
                  {currentLanguage === code && <Check className="w-4 h-4 text-neon-cyan" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
