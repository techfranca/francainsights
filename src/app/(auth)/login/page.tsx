'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Phone, ArrowRight, Loader2 } from 'lucide-react'
import { Logo } from '@/components/shared'
import { Button, Input } from '@/components/ui'
import { formatPhone, cleanPhone, isValidPhone } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const cleaned = cleanPhone(value)
    
    // Formata enquanto digita
    if (cleaned.length <= 11) {
      if (cleaned.length <= 2) {
        setPhone(cleaned)
      } else if (cleaned.length <= 7) {
        setPhone(`(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`)
      } else {
        setPhone(`(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const cleaned = cleanPhone(phone)
    if (!isValidPhone(cleaned)) {
      setError('Digite um número de WhatsApp válido')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleaned }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao enviar código')
        setLoading(false)
        return
      }

      // Redireciona para verificação
      router.push(`/verify?phone=${encodeURIComponent(cleaned)}`)
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
      setLoading(false)
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
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo />
          </div>

          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-franca-blue mb-2">
              Bem-vindo ao Insights
            </h1>
            <p className="text-gray-500">
              Digite seu WhatsApp para entrar
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-franca-blue mb-2">
                WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(67) 99999-9999"
                  className="
                    w-full pl-12 pr-4 py-4 text-lg rounded-xl
                    border-2 border-gray-200 bg-white text-franca-blue
                    focus:outline-none focus:border-franca-green focus:ring-2 focus:ring-franca-green/20
                    transition-all duration-200
                  "
                  autoFocus
                />
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-500"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading || phone.length < 14}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando código...
                </>
              ) : (
                <>
                  Continuar
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Info */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Enviaremos um código de 6 dígitos para seu WhatsApp
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-white/50 mt-6">
          © {new Date().getFullYear()} Franca Assessoria
        </p>
      </motion.div>
    </main>
  )
}
