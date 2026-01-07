'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, TrendingUp, TrendingDown, Filter, X, Search, FileText, BarChart3 } from 'lucide-react'
import { Header } from '@/components/shared'
import { useSidebar } from '@/contexts/SidebarContext'
import { Card, Spinner, Button } from '@/components/ui'
import { formatCurrency, formatMonthYear, formatPercent, cn } from '@/lib/utils'
import { MONTHS } from '@/types'
import type { MonthlyRecord } from '@/types'

export default function HistoricoPage() {
  const router = useRouter()
  const { openSidebar, setIsAdmin } = useSidebar()
  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState<any>(null)
  const [records, setRecords] = useState<MonthlyRecord[]>([])

  // Filtros
  const [showFilters, setShowFilters] = useState(false)
  const [yearFilter, setYearFilter] = useState<string>('')
  const [monthFilter, setMonthFilter] = useState<string>('')
  const [minRevenue, setMinRevenue] = useState<string>('')
  const [maxRevenue, setMaxRevenue] = useState<string>('')
  const [searchNotes, setSearchNotes] = useState<string>('')

  useEffect(() => {
    loadHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadHistory = async () => {
    try {
      const [clientRes, recordsRes] = await Promise.all([
        fetch('/api/clients/me'),
        fetch('/api/records?limit=100'),
      ])

      if (!clientRes.ok) {
        router.push('/login')
        return
      }

      const clientData = await clientRes.json()
      const recordsData = await recordsRes.json()

      setClient(clientData.client)
      setIsAdmin(clientData.is_admin || false)
      setRecords(recordsData.records || [])
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  // Anos disponíveis para filtro
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(records.map(r => r.year)))
    return years.sort((a, b) => b - a)
  }, [records])

  // Aplicar filtros
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      if (yearFilter && record.year !== parseInt(yearFilter)) return false
      if (monthFilter && record.month !== parseInt(monthFilter)) return false
      if (minRevenue && record.revenue < parseFloat(minRevenue)) return false
      if (maxRevenue && record.revenue > parseFloat(maxRevenue)) return false
      if (searchNotes) {
        const notes = record.notes?.toLowerCase() || ''
        const highlight = record.highlight?.toLowerCase() || ''
        const search = searchNotes.toLowerCase()
        if (!notes.includes(search) && !highlight.includes(search)) return false
      }
      return true
    })
  }, [records, yearFilter, monthFilter, minRevenue, maxRevenue, searchNotes])

  const clearFilters = () => {
    setYearFilter('')
    setMonthFilter('')
    setMinRevenue('')
    setMaxRevenue('')
    setSearchNotes('')
  }

  const hasActiveFilters = yearFilter || monthFilter || minRevenue || maxRevenue || searchNotes

  const getGrowth = (current: MonthlyRecord, index: number) => {
    if (index >= filteredRecords.length - 1) return null
    const previous = filteredRecords[index + 1]
    if (!previous || previous.revenue === 0) return null
    return ((current.revenue - previous.revenue) / previous.revenue) * 100
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500 mt-3">Carregando histórico...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header
        clientName={client?.name || ''}
        companyName={client?.company_name || ''}
        onMenuClick={openSidebar}
      />

      <main className="p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-franca-blue">Histórico</h1>
            <p className="text-sm text-gray-500">
              {filteredRecords.length} de {records.length} registros
            </p>
          </div>

          <Button
            variant={showFilters ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1.5"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
            )}
          </Button>
        </div>

        {/* Painel de Filtros */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5"
          >
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-franca-blue text-sm">Filtros</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-red-500 hover:underline flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    Limpar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ano</label>
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border-2 border-gray-200 bg-white text-franca-blue focus:outline-none focus:border-franca-green"
                  >
                    <option value="">Todos</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Mês</label>
                  <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border-2 border-gray-200 bg-white text-franca-blue focus:outline-none focus:border-franca-green"
                  >
                    <option value="">Todos</option>
                    {MONTHS.map((month, index) => (
                      <option key={index} value={index + 1}>{month}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchNotes}
                      onChange={(e) => setSearchNotes(e.target.value)}
                      placeholder="Em observações..."
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border-2 border-gray-200 bg-white text-franca-blue focus:outline-none focus:border-franca-green"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fat. mínimo</label>
                  <input
                    type="number"
                    value={minRevenue}
                    onChange={(e) => setMinRevenue(e.target.value)}
                    placeholder="R$ 0"
                    className="w-full px-3 py-2 text-sm rounded-xl border-2 border-gray-200 bg-white text-franca-blue focus:outline-none focus:border-franca-green"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fat. máximo</label>
                  <input
                    type="number"
                    value={maxRevenue}
                    onChange={(e) => setMaxRevenue(e.target.value)}
                    placeholder="R$ 999.999"
                    className="w-full px-3 py-2 text-sm rounded-xl border-2 border-gray-200 bg-white text-franca-blue focus:outline-none focus:border-franca-green"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Lista de registros */}
        {filteredRecords.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-bold text-franca-blue mb-2">
              {hasActiveFilters ? 'Nenhum registro encontrado' : 'Nenhum registro ainda'}
            </h2>
            <p className="text-sm text-gray-500">
              {hasActiveFilters 
                ? 'Ajuste os filtros para ver mais resultados.'
                : 'Comece registrando seu primeiro mês!'
              }
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((record, index) => {
              const growth = getGrowth(record, index)
              const isPositive = growth !== null && growth >= 0

              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card hover className="p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      {/* Ícone */}
                      <div className="p-2 bg-franca-green/10 rounded-xl text-franca-green flex-shrink-0">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-franca-blue text-sm sm:text-base">
                          {formatMonthYear(record.month, record.year)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(record.submitted_at).toLocaleDateString('pt-BR')}
                        </p>
                        
                        {(record.notes || record.highlight) && (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-1 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {record.highlight || record.notes}
                          </p>
                        )}
                      </div>

                      {/* Valores */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg sm:text-xl font-bold text-franca-blue">
                          {formatCurrency(record.revenue)}
                        </p>

                        {record.sales_count && (
                          <p className="text-xs text-gray-500">
                            {record.sales_count} vendas
                          </p>
                        )}

                        {growth !== null && (
                          <div
                            className={cn(
                              'inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md text-xs font-medium',
                              isPositive
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-red-50 text-red-500'
                            )}
                          >
                            {isPositive ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {formatPercent(growth)}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
