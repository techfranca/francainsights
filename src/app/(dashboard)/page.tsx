'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Esta página é acessada quando alguém vai para /(dashboard) diretamente
// Redireciona para /dashboard para manter consistência
export default function DashboardGroupPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  return null
}
