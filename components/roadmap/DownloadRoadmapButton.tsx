'use client'

import { useState } from 'react'
import { Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface DownloadRoadmapButtonProps {
  /** The ID of the roadmap to download. Can be a real DB id or a mock id. */
  roadmapId: string
  /** Optional career goal — used for the filename. */
  careerGoal?: string
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'icon-only'
  /** Optional additional CSS class names */
  className?: string
}

type DownloadState = 'idle' | 'loading' | 'success' | 'error'

export default function DownloadRoadmapButton({
  roadmapId,
  careerGoal,
  variant = 'secondary',
  className = '',
}: DownloadRoadmapButtonProps) {
  const [state, setState] = useState<DownloadState>('idle')

  const handleDownload = async () => {
    if (state === 'loading') return

    setState('loading')

    try {
      const response = await fetch(`/api/roadmap/download?roadmapId=${encodeURIComponent(roadmapId)}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || `Download failed (${response.status})`)
      }

      // Get the PDF blob
      const blob = await response.blob()

      // Generate filename
      const goalSlug = (careerGoal || 'Career')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .slice(0, 40)
      const filename = `FutureMap_Roadmap_${goalSlug}.pdf`

      // Trigger browser download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setState('success')
      toast.success('Roadmap PDF downloaded successfully!')

      // Reset to idle after a short delay
      setTimeout(() => setState('idle'), 2500)
    } catch (error: any) {
      console.error('PDF download error:', error)
      setState('error')
      toast.error(error?.message || 'Failed to download PDF. Please try again.')
      setTimeout(() => setState('idle'), 3000)
    }
  }

  // ── Render ──

  const icon = {
    idle: <Download size={18} />,
    loading: <Loader2 size={18} className="animate-spin" />,
    success: <CheckCircle size={18} />,
    error: <AlertCircle size={18} />,
  }[state]

  const label = {
    idle: 'Download PDF',
    loading: 'Generating PDF...',
    success: 'Downloaded!',
    error: 'Failed',
  }[state]

  if (variant === 'icon-only') {
    return (
      <button
        onClick={handleDownload}
        disabled={state === 'loading'}
        title="Download Roadmap PDF"
        className={`p-2.5 rounded-lg border transition-all duration-200 ${
          state === 'loading'
            ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-wait'
            : state === 'success'
            ? 'bg-green-900/30 border-green-700 text-green-400'
            : state === 'error'
            ? 'bg-red-900/30 border-red-700 text-red-400'
            : 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:border-gray-600 hover:text-neon-cyan'
        } ${className}`}
      >
        {icon}
      </button>
    )
  }

  if (variant === 'primary') {
    return (
      <button
        onClick={handleDownload}
        disabled={state === 'loading'}
        className={`px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg ${
          state === 'loading'
            ? 'bg-gray-700 text-gray-400 cursor-wait shadow-none'
            : state === 'success'
            ? 'bg-green-600 text-white shadow-green-600/25'
            : state === 'error'
            ? 'bg-red-600 text-white shadow-red-600/25'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 hover:scale-[1.02] shadow-blue-600/25'
        } ${className}`}
      >
        {icon}
        <span>{label}</span>
      </button>
    )
  }

  // Default: secondary variant
  return (
    <button
      onClick={handleDownload}
      disabled={state === 'loading'}
      className={`px-6 py-4 bg-gray-800 border border-gray-700 rounded-xl font-semibold text-white transition-all duration-200 flex items-center space-x-2 ${
        state === 'loading'
          ? 'opacity-60 cursor-wait'
          : state === 'success'
          ? 'border-green-600 text-green-400'
          : state === 'error'
          ? 'border-red-600 text-red-400'
          : 'hover:bg-gray-700 hover:border-neon-cyan/50 hover:text-neon-cyan'
      } ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
