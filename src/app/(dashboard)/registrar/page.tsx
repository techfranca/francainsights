'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle2, History } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/shared'
import { useSidebar } from '@/contexts/SidebarContext'
import { RecordForm, SuccessScreen } from '@/components/forms'
import { Card, Spinner } from '@/components/ui'
import { getCurrentMonthYear, getPreviousMonthYear, getMonthName } from '@/lib/utils'
import type { RecordFormData, CreateRecordResponse } from '@/types'

export default function RegistrarPage() {
  const router = useRouter()
  const { openSidebar, setIsAdmin } = useSidebar()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [client, setClient] = useState<any>(null)
  const [hasCurrentRecord, setHasCurrentRecord] = useState(false)
  const [successData, setSuccessData] = useState<CreateRecordResponse | null>(null)

  const { month: currentMonth, year: currentYear } = getCurrentMonthYear()
  const { month, year } = getPreviousMonthYear(currentMonth, currentYear)

  useEffect(() => {
    checkExistingRecord()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkExistingRecord = async () => {
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

      setClient(clientData.client)
      setIsAdmin(clientData.is_admin || false)

      const records = recordsData.records || []
      const currentRecord = records.find(
        (r: any) => r.month === month && r.year === year
      )
      setHasCurrentRecord(!!currentRecord)
    } catch (error) {
      console.error('Erro ao verificar registro:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: RecordFormData) => {
    setSubmitting(true)

    try {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          month,
          year,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        alert(result.error || 'Erro ao salvar registro')
        setSubmitting(false)
        return
      }

      setSuccessData(result)
    } catch (error) {
      console.error('Erro ao enviar:', error)
      alert('Erro de conexão. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500 mt-3">Verificando...</p>
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

      <main className="p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8">
        <div className="max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            {successData ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card>
                  <SuccessScreen
                    revenue={successData.record?.revenue || 0}
                    growthPercent={successData.growth_percent || null}
                    isRecord={successData.is_record || false}
                    insights={successData.insights || []}
                    achievements={successData.achievements || []}
                    onClose={() => router.push('/dashboard')}
                  />
                </Card>
              </motion.div>
            ) : hasCurrentRecord ? (
              <motion.div
                key="already-registered"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="text-center py-10 sm:py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-franca-blue mb-2">
                    {getMonthName(month)} já registrado
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    O faturamento de <span className="font-semibold">{getMonthName(month)} {year}</span> já está salvo.
                  </p>
                  <Link
                    href="/historico"
                    className="inline-flex items-center gap-2 text-franca-green font-semibold hover:underline"
                  >
                    <History className="w-4 h-4" />
                    Ver histórico
                  </Link>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-franca-blue transition-colors mb-5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Link>

                <Card>
                  <RecordForm
                    month={month}
                    year={year}
                    onSubmit={handleSubmit}
                    isLoading={submitting}
                  />
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  )
}
