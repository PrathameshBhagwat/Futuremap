import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ChatBot from '@/components/ChatBot'
import { AuthProvider } from '@/contexts/AuthContext'
import { ChatProvider } from '@/contexts/ChatContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { Toaster } from 'react-hot-toast'
import DemoModeBanner from '@/components/DemoModeBanner'
import TranslationWrapper from '@/components/TranslationWrapper'


export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'FutureMap | Your Personalized Career Guide',
  description: 'Discover your path with AI-powered quizzes, 3D career maps & nearby government college suggestions.',
  keywords: 'career guidance, college finder, education advisor, career quiz, college recommendations',
  authors: [{ name: 'Career Advisor Platform' }],
  robots: 'index, follow',
  icons: {
    icon: '/icon.webp',
  },
  openGraph: {
    title: 'Career Advisor Platform',
    description: 'Discover your path with AI-powered quizzes, 3D career maps & nearby government college suggestions.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Career Advisor Platform',
    description: 'Discover your path with AI-powered quizzes, 3D career maps & nearby government college suggestions.',
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <AuthProvider>
            <ChatProvider>
              <DemoModeBanner />
              <div className="grid-bg"></div>
              <Navbar />
              <main className="relative z-10 mt-16">
                <TranslationWrapper>
                  {children}
                </TranslationWrapper>
              </main>
              <Footer />
              <ChatBot />
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: '#1F2937',
                    color: '#F9FAFB',
                    border: '1px solid #374151',
                  },
                }}
              />
            </ChatProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}