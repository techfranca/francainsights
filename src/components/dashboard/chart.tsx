'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from 'recharts'
import { motion } from 'framer-motion'
import { BarChart3, LineChart, PiggyBank, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui'
import { formatCurrency, formatMonthYearShort } from '@/lib/utils'
import type { ChartData } from '@/types'

interface ChartsGridProps {
  data: ChartData[]
  showValues?: boolean
}

// ============================================
// CHARTS GRID - Layout de gráficos responsivo
// ============================================
export function ChartsGrid({ data, showValues = true }: ChartsGridProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      name: formatMonthYearShort(item.monthNum, item.year),
      revenue: item.revenue,
      salesCount: item.salesCount ?? 0,
      investment: item.investment ?? 0,
    }))
  }, [data])

  const hasSalesData = data.some(item => item.salesCount && item.salesCount > 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <RevenueBarChart data={chartData} showValues={showValues} />
      {hasSalesData && (
        <SalesLineChart data={chartData} showValues={showValues} />
      )}
    </div>
  )
}

// ============================================
// INVESTMENT VS REVENUE CHART - Comparativo elegante
// ============================================
interface InvestmentVsRevenueChartProps {
  data: ChartData[]
  showValues?: boolean
}

export function InvestmentVsRevenueChart({ data, showValues = true }: InvestmentVsRevenueChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      name: formatMonthYearShort(item.monthNum, item.year),
      faturamento: item.revenue,
      investimento: item.investment ?? 0,
    }))
  }, [data])

  // Calcular totais e ROI
  const totals = useMemo(() => {
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
    const totalInvestment = data.reduce((sum, item) => sum + (item.investment ?? 0), 0)
    const roi = totalInvestment > 0 ? ((totalRevenue - totalInvestment) / totalInvestment) * 100 : 0
    return { totalRevenue, totalInvestment, roi }
  }, [data])

  const formatYAxis = (value: number) => {
    if (!showValues) return '•••'
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
    return value.toString()
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const faturamento = payload.find((p: any) => p.dataKey === 'faturamento')
      const investimento = payload.find((p: any) => p.dataKey === 'investimento')
      const roi = investimento?.value > 0 
        ? ((faturamento?.value - investimento?.value) / investimento?.value * 100).toFixed(0) 
        : 0

      return (
        <div className="bg-franca-blue text-white px-4 py-3 rounded-xl shadow-lg border border-white/10">
          <p className="text-xs font-medium text-white/60 mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-franca-green" />
              <span className="text-sm">Faturamento: {showValues ? formatCurrency(faturamento?.value || 0) : 'R$ •••••'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-sm">Investimento: {showValues ? formatCurrency(investimento?.value || 0) : 'R$ •••••'}</span>
            </div>
            {investimento?.value > 0 && showValues && (
              <div className="pt-1 mt-1 border-t border-white/20">
                <span className="text-xs text-franca-green font-medium">ROI: {roi}%</span>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  const hasInvestmentData = data.some(item => item.investment && item.investment > 0)

  if (!hasInvestmentData) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
    >
      <Card className="h-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 rounded-lg">
              <PiggyBank className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-base font-semibold text-franca-blue">Investimento vs Faturamento</h3>
          </div>

          {/* ROI Badge */}
          {totals.totalInvestment > 0 && showValues && (
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">ROI: {totals.roi.toFixed(0)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-franca-green/10 rounded-xl border border-franca-green/20">
            <p className="text-xs text-gray-500 mb-0.5">Total Faturado</p>
            <p className="text-lg font-bold text-franca-green-dark">
              {showValues ? formatCurrency(totals.totalRevenue) : 'R$ •••••'}
            </p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-xs text-gray-500 mb-0.5">Total Investido</p>
            <p className="text-lg font-bold text-amber-700">
              {showValues ? formatCurrency(totals.totalInvestment) : 'R$ •••••'}
            </p>
          </div>
        </div>

        {/* Gráfico */}
<div className="h-56 sm:h-64">
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={chartData} barGap={0} barCategoryGap="25%" margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
      <defs>
        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7DE08D" stopOpacity={1} />
          <stop offset="100%" stopColor="#5ea86a" stopOpacity={0.85} />
        </linearGradient>
        <linearGradient id="investmentGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity={1} />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.85} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
      <XAxis
        dataKey="name"
        axisLine={false}
        tickLine={false}
        tick={{ fill: '#94a3b8', fontSize: 10 }}
        dy={8}
      />
      <YAxis
        axisLine={false}
        tickLine={false}
        tick={{ fill: '#94a3b8', fontSize: 10 }}
        tickFormatter={formatYAxis}
        dx={-5}
      />
      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
      <Bar
        dataKey="faturamento"
        fill="url(#revenueGradient)"
        radius={[4, 4, 0, 0]}
      />
      <Bar
        dataKey="investimento"
        fill="url(#investmentGradient)"
        radius={[4, 4, 0, 0]}
      />
    </BarChart>
  </ResponsiveContainer>
</div>

        {/* Legenda */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-gradient-to-b from-franca-green to-franca-green-dark" />
            <span className="text-xs text-gray-500">Faturamento</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-gradient-to-b from-amber-400 to-amber-500" />
            <span className="text-xs text-gray-500">Investimento</span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ============================================
// REVENUE BAR CHART - Gráfico de barras elegante
// ============================================
interface RevenueBarChartProps {
  data: any[]
  showValues?: boolean
}

export function RevenueBarChart({ data, showValues = true }: RevenueBarChartProps) {
  const formatYAxis = (value: number) => {
    if (!showValues) return '•••'
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
    return value.toString()
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-franca-blue text-white px-4 py-3 rounded-xl shadow-lg border border-white/10">
          <p className="text-xs font-medium text-white/60 mb-1">{label}</p>
          <p className="text-lg font-bold">
            {showValues ? formatCurrency(payload[0].value) : 'R$ •••••'}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
    >
      <Card className="h-full">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-franca-green/10 rounded-lg">
              <BarChart3 className="w-4 h-4 text-franca-green" />
            </div>
            <h3 className="text-base font-semibold text-franca-blue">Faturamento</h3>
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{data.length} meses</span>
        </div>

        <div className="h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
              <defs>
                <linearGradient id="revenueBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7DE08D" stopOpacity={1} />
                  <stop offset="100%" stopColor="#5ea86a" stopOpacity={0.85} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickFormatter={formatYAxis}
                dx={-5}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(125, 224, 141, 0.1)' }} />
              <Bar
                dataKey="revenue"
                fill="url(#revenueBarGradient)"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  )
}

// ============================================
// SALES LINE CHART - Gráfico de área elegante
// ============================================
interface SalesLineChartProps {
  data: any[]
  showValues?: boolean
}

export function SalesLineChart({ data, showValues = true }: SalesLineChartProps) {
  const formatYAxis = (value: number) => {
    if (!showValues) return '•••'
    return value.toString()
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-franca-blue text-white px-4 py-3 rounded-xl shadow-lg border border-white/10">
          <p className="text-xs font-medium text-white/60 mb-1">{label}</p>
          <p className="text-lg font-bold">
            {showValues ? `${payload[0].value} vendas` : '••• vendas'}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card className="h-full">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-franca-blue/10 rounded-lg">
              <LineChart className="w-4 h-4 text-franca-blue" />
            </div>
            <h3 className="text-base font-semibold text-franca-blue">Vendas</h3>
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{data.length} meses</span>
        </div>

        <div className="h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#081534" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#081534" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickFormatter={formatYAxis}
                dx={-5}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="salesCount"
                stroke="#081534"
                strokeWidth={2.5}
                fill="url(#salesGradient)"
                dot={{ fill: '#081534', strokeWidth: 0, r: 3 }}
                activeDot={{ fill: '#081534', strokeWidth: 0, r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  )
}

// ============================================
// MINI CHART - Sparkline para cards
// ============================================
interface MiniChartProps {
  data: number[]
  color?: string
  height?: number
}

export function MiniChart({ data, color = '#7DE08D', height = 40 }: MiniChartProps) {
  const chartData = data.map((value, index) => ({ value, index }))

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`miniGradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#miniGradient-${color})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}