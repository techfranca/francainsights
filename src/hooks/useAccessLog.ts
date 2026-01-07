'use client'

import { useEffect, useRef } from 'react'

/**
 * Hook para registrar acesso do cliente na plataforma.
 * Deve ser usado uma vez por sessão (no layout do dashboard).
 */
export function useAccessLog() {
  const hasLogged = useRef(false)

  useEffect(() => {
    // Evita múltiplos registros na mesma sessão
    if (hasLogged.current) return

    // Verifica se já registrou nesta sessão (usando sessionStorage)
    const sessionKey = 'franca-access-logged'
    if (sessionStorage.getItem(sessionKey)) return

    const logAccess = async () => {
      try {
        await fetch('/api/access-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
        
        // Marca que já registrou nesta sessão
        sessionStorage.setItem(sessionKey, 'true')
        hasLogged.current = true
      } catch (error) {
        // Não bloqueia a experiência se falhar
        console.error('Erro ao registrar acesso:', error)
      }
    }

    logAccess()
  }, [])
}
