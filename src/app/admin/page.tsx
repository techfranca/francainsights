'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Users,
  DollarSign,
  Calendar,
  Edit,
  Trash2,
  Phone,
  Mail,
  X,
  Target,
  TrendingUp,
  Clock,
  BarChart3,
  ChevronRight,
  Building2,
  History,
  Power,
  Skull,
  ArrowLeft,
  PiggyBank,
} from 'lucide-react'
import { Header, Sidebar, PageHeader } from '@/components/shared'
import { Button, Input, Card, Spinner, Badge, Avatar } from '@/components/ui'
import { formatCurrency, formatPhone, cleanPhone, SEGMENTS, formatMonthYear } from '@/lib/utils'
import { MONTHS, formatPartnershipTime, calculatePartnershipMonths } from '@/types'

interface ClientWithMetrics {
  id: string
  name: string
  company_name: string
  phone: string
  secondary_phone: string | null
  email: string | null
  segment: string | null
  start_date: string
  is_active: boolean
  total_records: number
  total_revenue: number
  last_record: string | null
  monthly_goal: number | null
  previous_annual_revenue: number | null
  monthly_access_count?: number
}

interface MonthlyRecord {
  id: string
  client_id: string
  year: number
  month: number
  revenue: number
  sales_count: number | null
  ticket_average: number | null
  notes: string | null
  highlight: string | null
  investment: number | null
  submitted_at: string
}

type ModalType = 'client' | 'record' | 'goal' | 'deactivate' | 'delete' | 'editRecord' | null

export default function AdminPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<ClientWithMetrics[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // Cliente selecionado para ver detalhes
  const [selectedClient, setSelectedClient] = useState<ClientWithMetrics | null>(null)
  const [clientRecords, setClientRecords] = useState<MonthlyRecord[]>([])
  const [loadingRecords, setLoadingRecords] = useState(false)

  // Modais
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [editingRecord, setEditingRecord] = useState<MonthlyRecord | null>(null)

  // Form de cliente
  const [clientForm, setClientForm] = useState({
    name: '',
    company_name: '',
    phone: '',
    secondary_phone: '',
    email: '',
    segment: '',
    start_date: new Date().toISOString().split('T')[0],
    monthly_goal: '',
    previous_annual_revenue: '',
  })

  // Form de registro de vendas
  const [recordForm, setRecordForm] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    revenue: '',
    sales_count: '',
    notes: '',
    investment: '',
  })

  // Form de edição de registro
  const [editRecordForm, setEditRecordForm] = useState({
    revenue: '',
    sales_count: '',
    notes: '',
    highlight: '',
    investment: '',
  })

  const [goalForm, setGoalForm] = useState({ monthly_goal: '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      const res = await fetch('/api/clients')
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login')
          return
        }
        throw new Error('Erro ao carregar clientes')
      }
      const data = await res.json()
      setClients(data.clients || [])
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  // Carregar registros do cliente selecionado
  const loadClientRecords = async (clientId: string) => {
    setLoadingRecords(true)
    try {
      const res = await fetch(`/api/admin/records?client_id=${clientId}`)
      if (res.ok) {
        const data = await res.json()
        setClientRecords(data.records || [])
      }
    } catch (error) {
      console.error('Erro ao carregar registros:', error)
    } finally {
      setLoadingRecords(false)
    }
  }

  // Abrir detalhes do cliente
  const openClientDetails = async (client: ClientWithMetrics) => {
    setSelectedClient(client)
    await loadClientRecords(client.id)
  }

  // Fechar detalhes
  const closeClientDetails = () => {
    setSelectedClient(null)
    setClientRecords([])
  }

  // ============================================
  // MODAL DE CLIENTE (criar/editar)
  // ============================================
  const openClientModal = (client?: ClientWithMetrics) => {
    if (client) {
      setClientForm({
        name: client.name,
        company_name: client.company_name,
        phone: formatPhone(client.phone),
        secondary_phone: client.secondary_phone ? formatPhone(client.secondary_phone) : '',
        email: client.email || '',
        segment: client.segment || '',
        start_date: client.start_date,
        monthly_goal: client.monthly_goal?.toString() || '',
        previous_annual_revenue: client.previous_annual_revenue?.toString() || '',
      })
    } else {
      setClientForm({
        name: '',
        company_name: '',
        phone: '',
        secondary_phone: '',
        email: '',
        segment: '',
        start_date: new Date().toISOString().split('T')[0],
        monthly_goal: '',
        previous_annual_revenue: '',
      })
    }
    setActiveModal('client')
  }

  const handleSaveClient = async () => {
    if (!clientForm.name || !clientForm.company_name || !clientForm.phone || !clientForm.start_date) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    setSaving(true)

    try {
      const payload = {
        ...clientForm,
        phone: cleanPhone(clientForm.phone),
        secondary_phone: clientForm.secondary_phone ? cleanPhone(clientForm.secondary_phone) : null,
        email: clientForm.email || null,
        segment: clientForm.segment || null,
        monthly_goal: clientForm.monthly_goal ? parseFloat(clientForm.monthly_goal) : null,
        previous_annual_revenue: clientForm.previous_annual_revenue ? parseFloat(clientForm.previous_annual_revenue) : null,
      }

      let res
      if (selectedClient) {
        res = await fetch('/api/clients', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedClient.id, ...payload }),
        })
      } else {
        res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Erro ao salvar')
        return
      }

      setActiveModal(null)
      loadClients()
      if (selectedClient) {
        // Atualiza o cliente selecionado
        const updated = await res.json()
        setSelectedClient({ ...selectedClient, ...updated.client })
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar cliente')
    } finally {
      setSaving(false)
    }
  }

  // ============================================
  // MODAL DE REGISTRO DE VENDAS
  // ============================================
  const openRecordModal = () => {
    if (!selectedClient) return
    const now = new Date()
    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
    const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    
    setRecordForm({
      year: prevYear,
      month: prevMonth,
      revenue: '',
      sales_count: '',
      notes: '',
      investment: '',
    })
    setActiveModal('record')
  }

  const handleSaveRecord = async () => {
    if (!selectedClient || !recordForm.revenue || !recordForm.sales_count) {
      alert('Preencha o faturamento e o número de vendas (obrigatório)')
      return
    }

    setSaving(true)

    try {
      const res = await fetch('/api/admin/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: selectedClient.id,
          year: recordForm.year,
          month: recordForm.month + 1,
          revenue: parseFloat(recordForm.revenue),
          sales_count: parseInt(recordForm.sales_count),
          notes: recordForm.notes || null,
          investment: recordForm.investment ? parseFloat(recordForm.investment) : null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Erro ao salvar registro')
        return
      }

      setActiveModal(null)
      loadClients()
      loadClientRecords(selectedClient.id)
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar registro')
    } finally {
      setSaving(false)
    }
  }

  // ============================================
  // MODAL DE EDIÇÃO DE REGISTRO
  // ============================================
  const openEditRecordModal = (record: MonthlyRecord) => {
    setEditingRecord(record)
    setEditRecordForm({
      revenue: record.revenue.toString(),
      sales_count: record.sales_count?.toString() || '',
      notes: record.notes || '',
      highlight: record.highlight || '',
      investment: record.investment?.toString() || '',
    })
    setActiveModal('editRecord')
  }

  const handleUpdateRecord = async () => {
    if (!editingRecord || !editRecordForm.revenue) {
      alert('Preencha o faturamento')
      return
    }

    setSaving(true)

    try {
      const res = await fetch('/api/admin/records', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingRecord.id,
          revenue: parseFloat(editRecordForm.revenue),
          sales_count: editRecordForm.sales_count ? parseInt(editRecordForm.sales_count) : null,
          notes: editRecordForm.notes || null,
          highlight: editRecordForm.highlight || null,
          investment: editRecordForm.investment ? parseFloat(editRecordForm.investment) : null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Erro ao atualizar registro')
        return
      }

      setActiveModal(null)
      setEditingRecord(null)
      loadClients()
      if (selectedClient) {
        loadClientRecords(selectedClient.id)
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao atualizar registro')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/records?id=${recordId}`, { method: 'DELETE' })
      if (!res.ok) {
        alert('Erro ao excluir registro')
        return
      }
      loadClients()
      if (selectedClient) {
        loadClientRecords(selectedClient.id)
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao excluir registro')
    }
  }

  // ============================================
  // MODAL DE META
  // ============================================
  const openGoalModal = () => {
    if (!selectedClient) return
    setGoalForm({ monthly_goal: selectedClient.monthly_goal?.toString() || '' })
    setActiveModal('goal')
  }

  const handleSaveGoal = async () => {
    if (!selectedClient) return
    setSaving(true)

    try {
      const res = await fetch('/api/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedClient.id,
          monthly_goal: goalForm.monthly_goal ? parseFloat(goalForm.monthly_goal) : null,
        }),
      })

      if (!res.ok) {
        alert('Erro ao salvar meta')
        return
      }

      setActiveModal(null)
      loadClients()
      setSelectedClient({ ...selectedClient, monthly_goal: goalForm.monthly_goal ? parseFloat(goalForm.monthly_goal) : null })
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar meta')
    } finally {
      setSaving(false)
    }
  }

  // ============================================
  // DESATIVAR / REATIVAR CLIENTE
  // ============================================
  const handleToggleActive = async () => {
    if (!selectedClient) return
    setDeleting(true)

    try {
      if (selectedClient.is_active) {
        // Desativar
        const res = await fetch(`/api/clients?id=${selectedClient.id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Erro ao desativar')
      } else {
        // Reativar
        const res = await fetch('/api/clients', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedClient.id, is_active: true }),
        })
        if (!res.ok) throw new Error('Erro ao reativar')
      }

      setActiveModal(null)
      loadClients()
      setSelectedClient({ ...selectedClient, is_active: !selectedClient.is_active })
    } catch (error: any) {
      alert(error?.message || 'Erro ao alterar status')
    } finally {
      setDeleting(false)
    }
  }

  // ============================================
  // EXCLUIR PERMANENTEMENTE
  // ============================================
  const handlePermanentDelete = async () => {
    if (!selectedClient) return
    setDeleting(true)

    try {
      const res = await fetch(`/api/clients?id=${selectedClient.id}&permanent=true`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Erro ao excluir')
      }

      setActiveModal(null)
      closeClientDetails()
      loadClients()
    } catch (error: any) {
      alert(error?.message || 'Erro ao excluir cliente')
    } finally {
      setDeleting(false)
    }
  }

  const closeModal = () => {
    if (saving || deleting) return
    setActiveModal(null)
    setEditingRecord(null)
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isAdmin />

      <div className="lg:ml-72">
        <Header
          clientName="Admin"
          companyName="Franca Assessoria"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8">
          {/* View: Lista de clientes ou Detalhes */}
          <AnimatePresence mode="wait">
            {selectedClient ? (
              // ==========================================
              // DETALHES DO CLIENTE
              // ==========================================
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Header com voltar */}
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={closeClientDetails}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <div className="flex-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-franca-blue">{selectedClient.name}</h1>
                    <p className="text-sm text-gray-500">{selectedClient.company_name}</p>
                  </div>
                  <Badge variant={selectedClient.is_active ? 'success' : 'danger'}>
                    {selectedClient.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  <Card className="p-4">
                    <p className="text-xs text-gray-500 mb-1">Total Faturado</p>
                    <p className="text-lg font-bold text-franca-blue">{formatCurrency(selectedClient.total_revenue)}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs text-gray-500 mb-1">Registros</p>
                    <p className="text-lg font-bold text-franca-blue">{selectedClient.total_records}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs text-gray-500 mb-1">Parceria</p>
                    <p className="text-lg font-bold text-franca-blue">{formatPartnershipTime(calculatePartnershipMonths(selectedClient.start_date))}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs text-gray-500 mb-1">Acessos/mês</p>
                    <p className="text-lg font-bold text-franca-blue">{selectedClient.monthly_access_count || 0}</p>
                  </Card>
                </div>

                {/* Informações do cliente */}
                <Card className="mb-6">
                  <h3 className="font-semibold text-franca-blue mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Informações
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{formatPhone(selectedClient.phone)}</span>
                    </div>
                    {selectedClient.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{selectedClient.email}</span>
                      </div>
                    )}
                    {selectedClient.segment && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span>{selectedClient.segment}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Início: {new Date(selectedClient.start_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {selectedClient.monthly_goal && (
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-franca-green" />
                        <span>Meta: {formatCurrency(selectedClient.monthly_goal)}</span>
                      </div>
                    )}
                    {selectedClient.previous_annual_revenue && (
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-gray-400" />
                        <span>Fat. anterior: {formatCurrency(selectedClient.previous_annual_revenue)}/ano</span>
                      </div>
                    )}
                  </div>

                  {/* Botões de ação */}
                  <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
                    <Button size="sm" variant="outline" onClick={() => openClientModal(selectedClient)}>
                      <Edit className="w-4 h-4" />
                      Editar
                    </Button>
                    <Button size="sm" variant="outline" onClick={openGoalModal}>
                      <Target className="w-4 h-4" />
                      Meta
                    </Button>
                    <Button size="sm" variant="outline" onClick={openRecordModal}>
                      <Plus className="w-4 h-4" />
                      Novo Registro
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveModal('deactivate')}
                      className={selectedClient.is_active ? 'text-amber-600 border-amber-200 hover:bg-amber-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}
                    >
                      <Power className="w-4 h-4" />
                      {selectedClient.is_active ? 'Desativar' : 'Reativar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveModal('delete')}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Skull className="w-4 h-4" />
                      Excluir
                    </Button>
                  </div>
                </Card>

                {/* Histórico de registros */}
                <Card>
                  <h3 className="font-semibold text-franca-blue mb-4 flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Histórico de Registros
                  </h3>

                  {loadingRecords ? (
                    <div className="flex justify-center py-8">
                      <Spinner />
                    </div>
                  ) : clientRecords.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">Nenhum registro encontrado</p>
                  ) : (
                    <div className="space-y-2">
                      {clientRecords.map((record) => (
                        <div
                          key={record.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-franca-blue text-sm">
                              {formatMonthYear(record.month, record.year)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {record.sales_count ? `${record.sales_count} vendas` : 'Sem vendas'}
                              {record.investment && ` • Inv: ${formatCurrency(record.investment)}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-franca-blue">
                              {formatCurrency(record.revenue)}
                            </p>
                            {record.investment && record.investment > 0 && (
                              <p className="text-xs text-emerald-600 font-medium">
                                ROI: {(((record.revenue - record.investment) / record.investment) * 100).toFixed(0)}%
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => openEditRecordModal(record)}
                              className="p-1.5 hover:bg-white rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(record.id)}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            ) : (
              // ==========================================
              // LISTA DE CLIENTES (Cards compactos)
              // ==========================================
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <PageHeader
                  title="Clientes"
                  subtitle={`${clients.length} clientes cadastrados`}
                  action={
                    <Button onClick={() => openClientModal()} size="sm">
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Novo Cliente</span>
                    </Button>
                  }
                />

                <div className="mb-5">
                  <Input
                    placeholder="Buscar por nome ou empresa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<Search className="w-5 h-5" />}
                  />
                </div>

                {/* Grid de cards compactos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredClients.map((client, index) => (
                    <motion.div
                      key={client.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Card
                        hover
                        className="cursor-pointer p-4"
                        onClick={() => openClientDetails(client)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar name={client.name} size="md" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-franca-blue text-sm truncate">
                                {client.name}
                              </p>
                              {!client.is_active && (
                                <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate mb-2">
                              {client.company_name}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-franca-green font-medium">
                                {formatCurrency(client.total_revenue)}
                              </span>
                              <span className="text-xs text-gray-400">
                                {client.total_records} reg.
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {filteredClients.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhum cliente encontrado</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* ==========================================
          MODAIS
      ========================================== */}

      {/* MODAL DE CLIENTE */}
      <AnimatePresence>
        {activeModal === 'client' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="text-lg font-bold text-franca-blue">
                  {selectedClient ? 'Editar Cliente' : 'Novo Cliente'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <Input
                  label="Nome completo *"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  placeholder="João Silva"
                />
                <Input
                  label="Nome da empresa *"
                  value={clientForm.company_name}
                  onChange={(e) => setClientForm({ ...clientForm, company_name: e.target.value })}
                  placeholder="Clínica Exemplo"
                />
                <Input
                  label="WhatsApp *"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  placeholder="(67) 99999-9999"
                  icon={<Phone className="w-5 h-5" />}
                />
                <Input
                  label="WhatsApp secundário (sócio)"
                  value={clientForm.secondary_phone}
                  onChange={(e) => setClientForm({ ...clientForm, secondary_phone: e.target.value })}
                  placeholder="(67) 98888-8888"
                  icon={<Phone className="w-5 h-5" />}
                />
                <Input
                  label="E-mail"
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  placeholder="joao@exemplo.com"
                  icon={<Mail className="w-5 h-5" />}
                />
                <div>
                  <label className="block text-sm font-medium text-franca-blue mb-1.5">Segmento</label>
                  <select
                    value={clientForm.segment}
                    onChange={(e) => setClientForm({ ...clientForm, segment: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-franca-blue focus:outline-none focus:border-franca-green text-sm"
                  >
                    <option value="">Selecione...</option>
                    {SEGMENTS.map((seg) => (
                      <option key={seg} value={seg}>{seg}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Data de início *"
                  type="date"
                  value={clientForm.start_date}
                  onChange={(e) => setClientForm({ ...clientForm, start_date: e.target.value })}
                />
                <Input
                  label="Meta mensal (R$)"
                  type="number"
                  value={clientForm.monthly_goal}
                  onChange={(e) => setClientForm({ ...clientForm, monthly_goal: e.target.value })}
                  placeholder="50000"
                  icon={<Target className="w-5 h-5" />}
                />
                <div className="p-3 bg-franca-green/5 rounded-xl border border-franca-green/20">
                  <Input
                    label="Faturamento anual anterior (R$)"
                    type="number"
                    value={clientForm.previous_annual_revenue}
                    onChange={(e) => setClientForm({ ...clientForm, previous_annual_revenue: e.target.value })}
                    placeholder="600000"
                    icon={<BarChart3 className="w-5 h-5" />}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Usado para comparar antes/depois da parceria.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-5 border-t">
                <Button variant="outline" className="flex-1" onClick={closeModal}>Cancelar</Button>
                <Button className="flex-1" onClick={handleSaveClient} loading={saving}>
                  {selectedClient ? 'Salvar' : 'Cadastrar'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE REGISTRO */}
      <AnimatePresence>
        {activeModal === 'record' && selectedClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-5 border-b">
                <div>
                  <h2 className="text-lg font-bold text-franca-blue">Novo Registro</h2>
                  <p className="text-xs text-gray-500">{selectedClient.company_name}</p>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-franca-blue mb-1.5">Ano *</label>
                    <select
                      value={recordForm.year}
                      onChange={(e) => setRecordForm({ ...recordForm, year: parseInt(e.target.value) })}
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-franca-blue focus:outline-none focus:border-franca-green text-sm"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-franca-blue mb-1.5">Mês *</label>
                    <select
                      value={recordForm.month}
                      onChange={(e) => setRecordForm({ ...recordForm, month: parseInt(e.target.value) })}
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-franca-blue focus:outline-none focus:border-franca-green text-sm"
                    >
                      {MONTHS.map((monthName, index) => (
                        <option key={index} value={index}>{monthName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  label="Faturamento (R$) *"
                  type="number"
                  value={recordForm.revenue}
                  onChange={(e) => setRecordForm({ ...recordForm, revenue: e.target.value })}
                  placeholder="50000"
                  icon={<DollarSign className="w-5 h-5" />}
                />
                <Input
                  label="Número de vendas *"
                  type="number"
                  value={recordForm.sales_count}
                  onChange={(e) => setRecordForm({ ...recordForm, sales_count: e.target.value })}
                  placeholder="120"
                  icon={<TrendingUp className="w-5 h-5" />}
                />
                <Input
                  label="Investimento (R$)"
                  type="number"
                  value={recordForm.investment}
                  onChange={(e) => setRecordForm({ ...recordForm, investment: e.target.value })}
                  placeholder="5000"
                  icon={<PiggyBank className="w-5 h-5" />}
                />
                <div>
                  <label className="block text-sm font-medium text-franca-blue mb-1.5">Observações</label>
                  <textarea
                    value={recordForm.notes}
                    onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                    placeholder="Alguma observação..."
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-franca-blue focus:outline-none focus:border-franca-green resize-none text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 p-5 border-t">
                <Button variant="outline" className="flex-1" onClick={closeModal}>Cancelar</Button>
                <Button className="flex-1" onClick={handleSaveRecord} loading={saving}>Registrar</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE EDIÇÃO DE REGISTRO */}
      <AnimatePresence>
        {activeModal === 'editRecord' && editingRecord && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-5 border-b">
                <div>
                  <h2 className="text-lg font-bold text-franca-blue">Editar Registro</h2>
                  <p className="text-xs text-gray-500">{formatMonthYear(editingRecord.month, editingRecord.year)}</p>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <Input
                  label="Faturamento (R$) *"
                  type="number"
                  value={editRecordForm.revenue}
                  onChange={(e) => setEditRecordForm({ ...editRecordForm, revenue: e.target.value })}
                  placeholder="50000"
                  icon={<DollarSign className="w-5 h-5" />}
                />
                <Input
                  label="Número de vendas"
                  type="number"
                  value={editRecordForm.sales_count}
                  onChange={(e) => setEditRecordForm({ ...editRecordForm, sales_count: e.target.value })}
                  placeholder="120"
                  icon={<TrendingUp className="w-5 h-5" />}
                />
                <Input
                  label="Investimento (R$)"
                  type="number"
                  value={editRecordForm.investment}
                  onChange={(e) => setEditRecordForm({ ...editRecordForm, investment: e.target.value })}
                  placeholder="5000"
                  icon={<PiggyBank className="w-5 h-5" />}
                />
                <div>
                  <label className="block text-sm font-medium text-franca-blue mb-1.5">Observações</label>
                  <textarea
                    value={editRecordForm.notes}
                    onChange={(e) => setEditRecordForm({ ...editRecordForm, notes: e.target.value })}
                    placeholder="Observações..."
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-franca-blue focus:outline-none focus:border-franca-green resize-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-franca-blue mb-1.5">Destaque</label>
                  <textarea
                    value={editRecordForm.highlight}
                    onChange={(e) => setEditRecordForm({ ...editRecordForm, highlight: e.target.value })}
                    placeholder="Destaque do mês..."
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-franca-blue focus:outline-none focus:border-franca-green resize-none text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 p-5 border-t">
                <Button variant="outline" className="flex-1" onClick={closeModal}>Cancelar</Button>
                <Button className="flex-1" onClick={handleUpdateRecord} loading={saving}>Salvar</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE META */}
      <AnimatePresence>
        {activeModal === 'goal' && selectedClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm"
            >
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="text-lg font-bold text-franca-blue">Definir Meta</h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5">
                <Input
                  label="Meta mensal (R$)"
                  type="number"
                  value={goalForm.monthly_goal}
                  onChange={(e) => setGoalForm({ ...goalForm, monthly_goal: e.target.value })}
                  placeholder="50000"
                  icon={<Target className="w-5 h-5" />}
                />
                {selectedClient.monthly_goal && (
                  <p className="text-xs text-gray-500 mt-2">
                    Meta atual: {formatCurrency(selectedClient.monthly_goal)}
                  </p>
                )}
              </div>

              <div className="flex gap-3 p-5 border-t">
                <Button variant="outline" className="flex-1" onClick={closeModal}>Cancelar</Button>
                <Button className="flex-1" onClick={handleSaveGoal} loading={saving}>Salvar</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE DESATIVAR/REATIVAR */}
      <AnimatePresence>
        {activeModal === 'deactivate' && selectedClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm"
            >
              <div className="p-5 border-b">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedClient.is_active ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                    <Power className={`w-5 h-5 ${selectedClient.is_active ? 'text-amber-600' : 'text-emerald-600'}`} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-franca-blue">
                      {selectedClient.is_active ? 'Desativar' : 'Reativar'} cliente
                    </h2>
                    <p className="text-xs text-gray-500">
                      {selectedClient.is_active ? 'O cliente não poderá acessar o sistema' : 'O cliente voltará a ter acesso'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <p className="text-sm text-gray-700">
                  {selectedClient.is_active
                    ? `Deseja desativar ${selectedClient.name}? Os dados serão mantidos.`
                    : `Deseja reativar ${selectedClient.name}?`
                  }
                </p>
              </div>

              <div className="flex gap-3 p-5 border-t">
                <Button variant="outline" className="flex-1" onClick={closeModal} disabled={deleting}>
                  Cancelar
                </Button>
                <Button
                  className={`flex-1 ${selectedClient.is_active ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                  onClick={handleToggleActive}
                  loading={deleting}
                >
                  {selectedClient.is_active ? 'Desativar' : 'Reativar'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE EXCLUSÃO PERMANENTE */}
      <AnimatePresence>
        {activeModal === 'delete' && selectedClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm"
            >
              <div className="p-5 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <Skull className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-red-600">Excluir permanentemente</h2>
                    <p className="text-xs text-gray-500">Esta ação NÃO pode ser desfeita</p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <p className="text-sm text-red-700">
                    <strong>ATENÇÃO:</strong> Todos os dados serão excluídos permanentemente, incluindo:
                  </p>
                  <ul className="text-xs text-red-600 mt-2 space-y-1">
                    <li>• Todos os registros de vendas</li>
                    <li>• Todas as conquistas</li>
                    <li>• Histórico de acessos</li>
                    <li>• Dados do cliente</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-700">
                  Deseja excluir permanentemente <strong>{selectedClient.name}</strong>?
                </p>
              </div>

              <div className="flex gap-3 p-5 border-t">
                <Button variant="outline" className="flex-1" onClick={closeModal} disabled={deleting}>
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={handlePermanentDelete}
                  loading={deleting}
                >
                  <Skull className="w-4 h-4" />
                  Excluir
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
