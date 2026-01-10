export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSession, isAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    const admin = await isAdmin()

    if (!session || !admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Busca todos os clientes com seus registros
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select(`
        id,
        name,
        company_name,
        is_active,
        start_date,
        monthly_records (
          id,
          year,
          month,
          revenue
        )
      `)

    if (clientsError) {
      console.error('[ADMIN CONSOLIDATED] Erro ao buscar clientes:', clientsError)
      return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
    }

    // Calcula métricas consolidadas
    let totalRevenue = 0
    let totalActiveClients = 0
    let clientsWithGrowth: number[] = []

    clients?.forEach((client) => {
      const records = client.monthly_records || []
      
      // Soma faturamento total
      records.forEach((record: any) => {
        totalRevenue += record.revenue || 0
      })

      // Conta clientes ativos
      if (client.is_active) {
        totalActiveClients++
      }

      // Calcula crescimento individual (apenas para clientes com 2+ registros)
      if (records.length >= 2) {
        // Ordena registros por data (mais antigo primeiro)
        const sortedRecords = [...records].sort((a: any, b: any) => {
          if (a.year !== b.year) return a.year - b.year
          return a.month - b.month
        })

        const firstRecord = sortedRecords[0]
        const lastRecord = sortedRecords[sortedRecords.length - 1]

        // Calcula crescimento percentual
        if (firstRecord.revenue > 0) {
          const growth = ((lastRecord.revenue - firstRecord.revenue) / firstRecord.revenue) * 100
          clientsWithGrowth.push(growth)
        }
      }
    })

    // Calcula média de crescimento
    const averageGrowth = clientsWithGrowth.length > 0
      ? clientsWithGrowth.reduce((sum, g) => sum + g, 0) / clientsWithGrowth.length
      : null

    return NextResponse.json({
      totalRevenue,
      totalActiveClients,
      totalClients: clients?.length || 0,
      averageGrowth,
      clientsWithGrowthCount: clientsWithGrowth.length,
    })
  } catch (error) {
    console.error('[ADMIN CONSOLIDATED] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
