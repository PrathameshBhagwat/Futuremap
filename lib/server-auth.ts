import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { verifyToken } from './auth'

export async function getUnifiedSession(): Promise<{id: string, email: string, user_metadata?: any} | null> {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    let userId = session?.user?.id
    let email = session?.user?.email
    let user_metadata = session?.user?.user_metadata || {}

    // Fallback to custom JWT if Supabase session is missing
    if (!userId) {
      const cookieStore = cookies()
      const token = cookieStore.get('auth_token')?.value
      if (token) {
        const decoded = verifyToken(token)
        if (decoded?.userId) {
          userId = decoded.userId
          email = decoded.email
        }
      }
    }

    if (!userId) return null;
    return { id: userId, email: email || '', user_metadata }
  } catch (error) {
    console.error('Unified Auth Error:', error)
    return null
  }
}
