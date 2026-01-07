'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface Session {
  client_id: string
  name: string
  company_name: string
  phone: string
  is_admin: boolean
}

interface SessionContextType {
  session: Session | null
  loading: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/clients/me')
      if (res.ok) {
        const data = await res.json()
        setSession({
          client_id: data.client.id,
          name: data.client.name,
          company_name: data.client.company_name,
          phone: data.client.phone,
          is_admin: false, // TODO: Verificar admin
        })
      } else {
        setSession(null)
      }
    } catch {
      setSession(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setSession(null)
    router.push('/login')
  }

  useEffect(() => {
    fetchSession()
  }, [])

  return (
    <SessionContext.Provider
      value={{
        session,
        loading,
        refresh: fetchSession,
        logout,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
