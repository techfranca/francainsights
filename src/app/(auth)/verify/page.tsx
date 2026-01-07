'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/shared'
import { Button } from '@/components/ui'
import { OTPInput } from '@/components/forms'
import { formatPhone } from '@/lib/utils'

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get('phone') || ''
  
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)

  // Countdown para reenvio
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Auto-submit quando código completo
  useEffect(() => {
    if (code.length === 6) {
      handleVerify()
    }
  }, [code])

  const handleVerify = async () => {
    if (code.length !== 6) return
    
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Código inválido')
        setCode('')
        setLoading(false)
        return
      }

      // Login bem sucedido - redireciona para dashboard
      router.push('/')
      router.refresh()
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0 || resending) return
    
    setResending(true)
    setError('')

    try {
      const response = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })

      if (response.ok) {
        setCountdown(60)
        setCode('')
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao reenviar código')
      }
    } catch (err) {
      setError('Erro de conexão')
    } finally {
      setResending(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-franca-blue via-franca-blue to-franca-blue-dark flex items-center justify-center p-4">
      {/* Decorações de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-franca-green/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-franca-green/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
          {/* Voltar */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-franca-blue transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo />
          </div>

          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-franca-blue mb-2">
              Digite o código
            </h1>
            <p className="text-gray-500">
              Enviamos um código de 6 dígitos para
            </p>
            <p className="text-franca-blue font-semibold">
              {formatPhone(phone)}
            </p>
          </div>

          {/* Input do código */}
          <div className="mb-6">
            <OTPInput
              value={code}
              onChange={setCode}
              error={error}
            />
          </div>

          {/* Botão de verificar */}
          <Button
            onClick={handleVerify}
            size="lg"
            className="w-full mb-4"
            disabled={loading || code.length !== 6}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verificando...
              </>
            ) : (
              'Verificar código'
            )}
          </Button>

          {/* Reenviar */}
          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-gray-400">
                Reenviar código em {countdown}s
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="inline-flex items-center gap-2 text-sm text-franca-green hover:text-franca-green-dark transition-colors disabled:opacity-50"
              >
                {resending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Reenviar código
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-white/50 mt-6">
          © {new Date().getFullYear()} Franca Assessoria
        </p>
      </motion.div>
    </main>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-franca-blue flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-franca-green" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}
