'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Wallet, TrendingUp, BarChart3, Trophy, PiggyBank, FileDown } from 'lucide-react'
import { Header } from '@/components/shared'
import { useSidebar } from '@/contexts/SidebarContext'
import { 
  MetricCard, 
  RevenueCard, 
  PendingAlert, 
  RecordIndicator, 
  GrowthMessageCard,
  ToggleValuesButton,
  TotalGrowthCard,
  BeforeAfterCard,
  SectionHeader,
} from '@/components/dashboard/cards'
import { ChartsGrid, InvestmentVsRevenueChart } from '@/components/dashboard/chart'
import { Spinner } from '@/components/ui'
import { formatMonthYear, getCurrentMonthYear, getPreviousMonthYear, getMonthName } from '@/lib/utils'
import { calculatePartnershipMonths } from '@/types'
import { useExportPDF } from '@/hooks/useExportPDF'
import type { Client, MonthlyRecord, ChartData } from '@/types'

interface DashboardData {
  client: Client
  records: MonthlyRecord[]
  currentMonthRecord: MonthlyRecord | null
  previousMonthRecord: MonthlyRecord | null
  bestRecord: MonthlyRecord | null
  totalRevenue: number
  avgRevenue: number
  avgSales: number
  totalMonths: number
  achievements: number
  chartData: ChartData[]
  growthPercent: number | null
  totalGrowthPercent: number | null
  partnershipMonths: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { openSidebar, setIsAdmin } = useSidebar()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [showValues, setShowValues] = useState(true)
  const { exportDashboardPDF, exporting } = useExportPDF()

  useEffect(() => {
    loadDashboard()
    const savedPreference = localStorage.getItem('franca-show-values')
    if (savedPreference !== null) {
      setShowValues(savedPreference === 'true')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleShowValues = () => {
    const newValue = !showValues
    setShowValues(newValue)
    localStorage.setItem('franca-show-values', String(newValue))
  }

  const loadDashboard = async () => {
    try {
      const [clientRes, recordsRes] = await Promise.all([
        fetch('/api/clients/me'),
        fetch('/api/records?limit=24'),
      ])

      if (!clientRes.ok) {
        router.push('/login')
        return
      }

      const clientData = await clientRes.json()
      const recordsData = await recordsRes.json()

      setIsAdmin(clientData.is_admin || false)

      const records: MonthlyRecord[] = recordsData.records || []
      const client: Client = clientData.client

      const { month: currentMonth, year: currentYear } = getCurrentMonthYear()
      const { month, year } = getPreviousMonthYear(currentMonth, currentYear)

      const currentMonthRecord = records.find(
        (r) => r.month === month && r.year === year
      ) || null

      const { month: previousMonth, year: previousYear } = getPreviousMonthYear(month, year)
      const previousMonthRecord = records.find(
        (r) => r.month === previousMonth && r.year === previousYear
      ) || null

      const bestRecord = records.length > 0
        ? records.reduce((best, r) => r.revenue > best.revenue ? r : best, records[0])
        : null

      const totalRevenue = records.reduce((sum, r) => sum + r.revenue, 0)
      const totalSales = records.reduce((sum, r) => sum + (r.sales_count || 0), 0)
      const avgRevenue = records.length > 0 ? totalRevenue / records.length : 0
      const avgSales = records.length > 0 ? totalSales / records.length : 0

      let growthPercent: number | null = null
      if (currentMonthRecord && previousMonthRecord) {
        growthPercent = ((currentMonthRecord.revenue - previousMonthRecord.revenue) / previousMonthRecord.revenue) * 100
      }

      let totalGrowthPercent: number | null = null
      if (records.length >= 2) {
        const sortedRecords = [...records].sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year
          return a.month - b.month
        })
        const firstRecord = sortedRecords[0]
        const lastRecord = sortedRecords[sortedRecords.length - 1]
        if (firstRecord.revenue > 0) {
          totalGrowthPercent = ((lastRecord.revenue - firstRecord.revenue) / firstRecord.revenue) * 100
        }
      }

      const partnershipMonths = calculatePartnershipMonths(client.start_date)

      const chartData: ChartData[] = records
        .slice(0, 12)
        .reverse()
        .map((r) => ({
          month: getMonthName(r.month),
          revenue: r.revenue,
          salesCount: r.sales_count,
          investment: r.investment,
          year: r.year,
          monthNum: r.month,
        }))

      setData({
        client,
        records,
        currentMonthRecord,
        previousMonthRecord,
        bestRecord,
        totalRevenue,
        avgRevenue,
        avgSales,
        totalMonths: records.length,
        achievements: clientData.achievements_count || 0,
        chartData,
        growthPercent,
        totalGrowthPercent,
        partnershipMonths,
      })
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  // Função para exportar PDF
  const handleExportPDF = async () => {
    if (!data) return

    const totalInvestment = data.records.reduce((sum, r) => sum + (r.investment || 0), 0)

    const exportData = {
      clientName: data.client.name,
      companyName: data.client.company_name,
      period: `Últimos ${data.records.length} meses`,
      totalRevenue: data.totalRevenue,
      avgRevenue: data.avgRevenue,
      totalInvestment,
      roi: totalInvestment > 0
        ? ((data.totalRevenue - totalInvestment) / totalInvestment) * 100
        : undefined,
      partnershipMonths: data.partnershipMonths,
      records: data.records.map(r => ({
        month: formatMonthYear(r.month, r.year),
        revenue: r.revenue,
        investment: r.investment,
      })),
    }

    await exportDashboardPDF(exportData, 'charts-section')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500 mt-3">Carregando dados...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">Erro ao carregar dados</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 text-sm text-franca-green hover:underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  const { client, currentMonthRecord, previousMonthRecord, bestRecord, chartData, growthPercent, totalGrowthPercent, partnershipMonths } = data

  const { month: cMonth, year: cYear } = getCurrentMonthYear()
  const { month, year } = getPreviousMonthYear(cMonth, cYear)
  const currentMonth = formatMonthYear(month, year)

  const hasPendingRecord = !currentMonthRecord
  const isRecord = bestRecord?.id === currentMonthRecord?.id && currentMonthRecord !== null
  const goalAchieved = client.monthly_goal ? (currentMonthRecord?.revenue || 0) >= client.monthly_goal : false

  return (
    <>
      <Header
        clientName={client.name}
        companyName={client.company_name}
        onMenuClick={openSidebar}
        partnershipMonths={partnershipMonths}
      />

      <main className="p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 max-w-7xl mx-auto">
        {/* Controles do topo */}
        <div className="flex items-center justify-end gap-3 mb-5">
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-franca-blue text-white rounded-xl text-sm font-medium hover:bg-franca-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">{exporting ? 'Gerando...' : 'Exportar PDF'}</span>
            <span className="sm:hidden">{exporting ? '...' : 'PDF'}</span>
          </button>
          <ToggleValuesButton showValues={showValues} onToggle={toggleShowValues} />
        </div>

        {/* ==========================================
            SEÇÃO 1: AÇÃO PENDENTE (se houver)
        ========================================== */}
        {hasPendingRecord && (
          <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <PendingAlert
              month={currentMonth}
              onClick={() => router.push('/registrar')}
            />
          </motion.section>
        )}

        {/* ==========================================
            SEÇÃO 2: RESULTADO DO MÊS (destaque)
        ========================================== */}
        <section className="mb-6">
          {currentMonthRecord ? (
            <>
              <RevenueCard
                revenue={currentMonthRecord.revenue}
                previousRevenue={previousMonthRecord?.revenue}
                month={currentMonth}
                isRecord={isRecord}
                showValue={showValues}
                goal={client.monthly_goal}
              />
              {/* Mensagem de análise - sempre abaixo do card principal */}
              <div className="mt-4">
                <GrowthMessageCard
                  growthPercent={growthPercent}
                  isRecord={isRecord}
                  goalAchieved={goalAchieved}
                />
              </div>
            </>
          ) : previousMonthRecord ? (
            <RevenueCard
              revenue={previousMonthRecord.revenue}
              month={formatMonthYear(previousMonthRecord.month, previousMonthRecord.year)}
              isRecord={bestRecord?.id === previousMonthRecord.id}
              showValue={showValues}
              goal={client.monthly_goal}
            />
          ) : null}
        </section>

        {/* ==========================================
            SEÇÃO 3: IMPACTO DA PARCERIA (se houver dados)
        ========================================== */}
        {client.previous_annual_revenue && (
          <section className="mb-6">
            <BeforeAfterCard
              previousAnnualRevenue={client.previous_annual_revenue}
              currentAverageRevenue={data.avgRevenue}
              showValue={showValues}
            />
          </section>
        )}

        {/* ==========================================
            SEÇÃO 4: MÉTRICAS RÁPIDAS (grid uniforme)
        ========================================== */}
        <section className="mb-6">
          <SectionHeader 
            title="Visão Geral" 
            subtitle="Métricas consolidadas"
            icon={<BarChart3 className="w-4 h-4" />}
          />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <MetricCard
              title="Total Acumulado"
              value={data.totalRevenue}
              icon={<Wallet className="w-5 h-5" />}
              delay={0.1}
              showValue={showValues}
            />
            <MetricCard
              title="Média Mensal"
              value={data.avgRevenue}
              icon={<TrendingUp className="w-5 h-5" />}
              delay={0.15}
              showValue={showValues}
            />
            <TotalGrowthCard
              growthPercent={totalGrowthPercent}
              showValue={showValues}
              delay={0.2}
            />
          </div>
        </section>

        {/* ==========================================
            SEÇÃO 5: MELHOR RESULTADO (destaque dourado)
        ========================================== */}
        {bestRecord && (
          <section className="mb-6">
            <SectionHeader 
              title="Recorde" 
              subtitle="Seu melhor desempenho"
              icon={<Trophy className="w-4 h-4" />}
            />
            <RecordIndicator
              month={formatMonthYear(bestRecord.month, bestRecord.year)}
              value={bestRecord.revenue}
              showValue={showValues}
            />
          </section>
        )}

        {/* ==========================================
            SEÇÃO 6: GRÁFICOS DE EVOLUÇÃO
        ========================================== */}
        {chartData.length > 1 && (
          <section id="charts-section" className="mb-6">
            <SectionHeader 
              title="Evolução" 
              subtitle="Acompanhe seu progresso"
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <ChartsGrid data={chartData} showValues={showValues} />
          </section>
        )}

        {/* ==========================================
            SEÇÃO 7: INVESTIMENTO VS FATURAMENTO (última)
        ========================================== */}
        {chartData.some(item => item.investment && item.investment > 0) && (
          <section>
            <SectionHeader 
              title="Retorno sobre Investimento" 
              subtitle="Acompanhe seu ROI"
              icon={<PiggyBank className="w-4 h-4" />}
            />
            <InvestmentVsRevenueChart data={chartData} showValues={showValues} />
          </section>
        )}
      </main>
    </>
  )
}