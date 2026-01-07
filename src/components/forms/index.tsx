'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  DollarSign, 
  Hash, 
  MessageSquare, 
  Sparkles, 
  Check, 
  AlertCircle,
  Trophy,
  TrendingUp,
  TrendingDown,
  Share2,
  LayoutDashboard,
  Lightbulb,
  PartyPopper,
  Award
} from 'lucide-react'
import { Button, Input, Card } from '@/components/ui'
import { formatCurrency, getMonthName } from '@/lib/utils'
import type { RecordFormData } from '@/types'

// ============================================
// CURRENCY INPUT - Input de valor monetário
// ============================================
interface CurrencyInputProps {
  value: number
  onChange: (value: number) => void
  label?: string
  placeholder?: string
  error?: string
}

export function CurrencyInput({
  value,
  onChange,
  label = 'Faturamento',
  placeholder = '0,00',
  error,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(value ? formatCurrency(value).replace('R$', '').trim() : '')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    const numeric = parseInt(raw) || 0
    setDisplayValue(raw ? (numeric / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '')
    onChange(numeric / 100)
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-franca-blue mb-1.5">
          {label} <span className="text-red-500">*</span>
        </label>
      )}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl sm:text-2xl font-bold text-franca-blue">
          R$
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`
            w-full pl-14 sm:pl-16 pr-4 py-4 text-2xl sm:text-3xl font-bold text-franca-blue
            rounded-2xl border-2 border-gray-200 bg-white
            focus:outline-none focus:border-franca-green focus:ring-2 focus:ring-franca-green/20
            transition-all duration-200
            ${error ? 'border-red-500' : ''}
          `}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  )
}

// ============================================
// RECORD FORM - Formulário de registro mensal
// ============================================
interface RecordFormProps {
  month: number
  year: number
  onSubmit: (data: RecordFormData) => Promise<void>
  isLoading?: boolean
}

export function RecordForm({ month, year, onSubmit, isLoading }: RecordFormProps) {
  const [revenue, setRevenue] = useState(0)
  const [salesCount, setSalesCount] = useState('')
  const [highlight, setHighlight] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const newErrors: Record<string, string> = {}

    if (revenue <= 0) {
      newErrors.revenue = 'Informe o valor do faturamento'
    }

    if (!salesCount || parseInt(salesCount) <= 0) {
      newErrors.salesCount = 'Informe a quantidade de vendas'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    await onSubmit({
      revenue,
      sales_count: parseInt(salesCount),
      highlight: highlight || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-franca-blue mb-1">
          {getMonthName(month)} {year}
        </h2>
        <p className="text-sm text-gray-500">Quanto você faturou?</p>
      </div>

      <CurrencyInput
        value={revenue}
        onChange={setRevenue}
        label="Faturamento total"
        error={errors.revenue}
      />

      <div>
        <Input
          type="number"
          label={
            <span>
              Quantidade de vendas <span className="text-red-500">*</span>
            </span>
          }
          placeholder="Ex: 45"
          value={salesCount}
          onChange={(e) => setSalesCount(e.target.value)}
          icon={<Hash className="w-5 h-5" />}
          error={errors.salesCount}
        />
        {errors.salesCount && (
          <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.salesCount}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-franca-blue mb-1.5">
          Destaque do mês (opcional)
        </label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <textarea
            value={highlight}
            onChange={(e) => setHighlight(e.target.value)}
            placeholder="Ex: Fechei 3 contratos grandes..."
            rows={3}
            className="
              w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-white
              text-franca-blue placeholder:text-gray-400 text-sm
              focus:outline-none focus:border-franca-green focus:ring-2 focus:ring-franca-green/20
              transition-all duration-200 resize-none
            "
          />
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" loading={isLoading}>
        <Check className="w-5 h-5" />
        Registrar Vendas
      </Button>
    </form>
  )
}

// ============================================
// SUCCESS SCREEN - Tela de sucesso após registro
// ============================================
interface SuccessScreenProps {
  revenue: number
  growthPercent: number | null
  isRecord: boolean
  insights: string[]
  achievements: { icon: string; name: string }[]
  onClose: () => void
}

export function SuccessScreen({
  revenue,
  growthPercent,
  isRecord,
  insights,
  achievements,
  onClose,
}: SuccessScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="w-16 h-16 mx-auto mb-5 bg-franca-green/10 rounded-2xl flex items-center justify-center"
      >
        <PartyPopper className="w-8 h-8 text-franca-green" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-bold text-franca-blue mb-1"
      >
        Registro salvo!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-gray-500 mb-6"
      >
        Seus dados foram atualizados
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-franca-blue to-franca-blue-hover text-white mb-5 p-5">
          {isRecord && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-franca-green text-franca-blue rounded-full text-xs font-bold mb-3">
              <Trophy className="w-3.5 h-3.5" />
              NOVO RECORDE
            </div>
          )}

          <p className="text-3xl sm:text-4xl font-bold mb-2">{formatCurrency(revenue)}</p>

          {growthPercent !== null && (
            <p className={`text-sm flex items-center justify-center gap-1.5 ${growthPercent >= 0 ? 'text-franca-green' : 'text-red-300'}`}>
              {growthPercent >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {growthPercent >= 0 ? '+' : ''}{growthPercent.toFixed(1)}% vs. mês anterior
            </p>
          )}
        </Card>
      </motion.div>

      {achievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-5"
        >
          <p className="text-xs text-gray-500 mb-2 flex items-center justify-center gap-1">
            <Award className="w-3.5 h-3.5" />
            Conquistas desbloqueadas
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {achievements.map((achievement, index) => (
              <motion.span
                key={achievement.name}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-franca-green/10 text-franca-green-darkest rounded-full text-xs font-medium"
              >
                <Award className="w-3 h-3" />
                {achievement.name}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-6"
        >
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Insights</span>
          </div>
          <Card className="text-left p-4">
            {insights.map((insight, index) => (
              <p key={index} className="text-sm text-gray-600 mb-2 last:mb-0 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                {insight}
              </p>
            ))}
          </Card>
        </motion.div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 text-sm" onClick={onClose}>
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </Button>
        <Button className="flex-1 text-sm">
          <Share2 className="w-4 h-4" />
          Compartilhar
        </Button>
      </div>
    </motion.div>
  )
}

// ============================================
// OTP INPUT - Input para código de verificação
// ============================================
interface OTPInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  error?: string
}

export function OTPInput({ value, onChange, length = 6, error }: OTPInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, '').slice(0, length)
    onChange(newValue)
  }

  return (
    <div>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        maxLength={length}
        className={`
          w-full text-center text-3xl sm:text-4xl font-bold tracking-[0.4em] py-4
          rounded-2xl border-2 border-gray-200 bg-white text-franca-blue
          focus:outline-none focus:border-franca-green focus:ring-2 focus:ring-franca-green/20
          transition-all duration-200
          ${error ? 'border-red-500' : ''}
        `}
        placeholder="••••••"
      />
      {error && <p className="mt-2 text-sm text-red-500 text-center">{error}</p>}
    </div>
  )
}
