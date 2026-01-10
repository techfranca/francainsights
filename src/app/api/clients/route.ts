import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSession, isAdmin } from '@/lib/auth'
import { sendWelcomeMessage } from '@/lib/uazapi'
import { normalizePhone } from '@/lib/utils'

// GET - Listar todos os clientes (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    const admin = await isAdmin()

    if (!session || !admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const supabase = createAdminClient()

    const { data: clients, error } = await supabase
      .from('clients')
      .select(`
        *,
        monthly_records (
          id,
          year,
          month,
          revenue
        )
      `)
      .order('name')

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 })
    }

    // Busca contagem de acessos do mês atual
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const { data: accessLogs } = await supabase
      .from('client_access_logs')
      .select('client_id')
      .gte('accessed_at', startOfMonth.toISOString())

    // Conta acessos por cliente
    const accessByClient: Record<string, number> = {}
    accessLogs?.forEach(log => {
      accessByClient[log.client_id] = (accessByClient[log.client_id] || 0) + 1
    })

    // Processa dados para incluir métricas
    const clientsWithMetrics = clients?.map((client) => {
      const records = client.monthly_records || []
      const totalRevenue = records.reduce((sum: number, r: any) => sum + (r.revenue || 0), 0)
      
      // Ordena por data (mais recente primeiro) para pegar o último registro
      const sortedDesc = [...records].sort((a: any, b: any) => {
        if (a.year !== b.year) return b.year - a.year
        return b.month - a.month
      })
      const lastRecord = sortedDesc[0]

      // Calcula crescimento individual (apenas se tiver 2+ registros)
      let growth_percent: number | null = null
      if (records.length >= 2) {
        // Ordena por data (mais antigo primeiro)
        const sortedAsc = [...records].sort((a: any, b: any) => {
          if (a.year !== b.year) return a.year - b.year
          return a.month - b.month
        })
        const firstRecord = sortedAsc[0]
        const latestRecord = sortedAsc[sortedAsc.length - 1]
        
        if (firstRecord.revenue > 0) {
          growth_percent = ((latestRecord.revenue - firstRecord.revenue) / firstRecord.revenue) * 100
        }
      }

      return {
        ...client,
        total_records: records.length,
        total_revenue: totalRevenue,
        last_record: lastRecord ? `${lastRecord.month}/${lastRecord.year}` : null,
        monthly_access_count: accessByClient[client.id] || 0,
        growth_percent,
        monthly_records: undefined,
      }
    })

    return NextResponse.json({ clients: clientsWithMetrics })
  } catch (error) {
    console.error('[CLIENTS] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST - Criar novo cliente (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const admin = await isAdmin()

    if (!session || !admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name, company_name, phone, secondary_phone, email, segment, start_date, monthly_goal, previous_annual_revenue } = body

    if (!name || !company_name || !phone || !start_date) {
      return NextResponse.json(
        { error: 'Nome, empresa, telefone e data de início são obrigatórios' },
        { status: 400 }
      )
    }

    const normalizedPhone = normalizePhone(phone)
    const normalizedSecondaryPhone = secondary_phone ? normalizePhone(secondary_phone) : null
    const supabase = createAdminClient()

    // Verifica se telefone já existe
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('phone', normalizedPhone)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Já existe um cliente com este telefone' },
        { status: 400 }
      )
    }

    // Cria o cliente
    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        name,
        company_name,
        phone: normalizedPhone,
        secondary_phone: normalizedSecondaryPhone,
        email: email || null,
        segment: segment || null,
        start_date,
        monthly_goal: monthly_goal ? parseFloat(monthly_goal) : null,
        previous_annual_revenue: previous_annual_revenue ? parseFloat(previous_annual_revenue) : null,
      })
      .select()
      .single()

    if (error) {
      console.error('[CLIENTS] Erro ao criar:', error)
      return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 })
    }

    // Envia mensagem de boas-vindas
    await sendWelcomeMessage(normalizedPhone, name)

    return NextResponse.json({ client })
  } catch (error) {
    console.error('[CLIENTS] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// PATCH - Atualizar cliente (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    const admin = await isAdmin()

    if (!session || !admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID do cliente obrigatório' }, { status: 400 })
    }

    // Normaliza telefone se estiver sendo atualizado
    if (updates.phone) {
      updates.phone = normalizePhone(updates.phone)
    }

    // Normaliza telefone secundário se estiver sendo atualizado
    if (updates.secondary_phone !== undefined) {
      updates.secondary_phone = updates.secondary_phone ? normalizePhone(updates.secondary_phone) : null
    }

    // Trata monthly_goal
    if (updates.monthly_goal !== undefined) {
      updates.monthly_goal = updates.monthly_goal ? parseFloat(updates.monthly_goal) : null
    }

    // Trata previous_annual_revenue
    if (updates.previous_annual_revenue !== undefined) {
      updates.previous_annual_revenue = updates.previous_annual_revenue ? parseFloat(updates.previous_annual_revenue) : null
    }

    const supabase = createAdminClient()

    const { data: client, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Erro ao atualizar cliente' }, { status: 500 })
    }

    return NextResponse.json({ client })
  } catch (error) {
    console.error('[CLIENTS] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// DELETE - Desativar ou excluir permanentemente cliente (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    const admin = await isAdmin()

    if (!session || !admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const permanent = searchParams.get('permanent') === 'true'

    if (!id) {
      return NextResponse.json({ error: 'ID do cliente obrigatório' }, { status: 400 })
    }

    const supabase = createAdminClient()

    if (permanent) {
      // Exclusão permanente - remove tudo relacionado ao cliente
      
      // 1. Remove conquistas do cliente
      await supabase
        .from('client_achievements')
        .delete()
        .eq('client_id', id)

      // 2. Remove registros mensais
      await supabase
        .from('monthly_records')
        .delete()
        .eq('client_id', id)

      // 3. Remove logs de acesso
      await supabase
        .from('client_access_logs')
        .delete()
        .eq('client_id', id)

      // 4. Remove códigos de autenticação pelo telefone do cliente
      const { data: client } = await supabase
        .from('clients')
        .select('phone')
        .eq('id', id)
        .single()

      if (client?.phone) {
        await supabase
          .from('auth_codes')
          .delete()
          .eq('phone', client.phone)
      }

      // 5. Remove o cliente
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('[CLIENTS] Erro ao excluir:', error)
        return NextResponse.json({ error: 'Erro ao excluir cliente permanentemente' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Cliente excluído permanentemente' })
    } else {
      // Soft delete - apenas desativa
      const { error } = await supabase
        .from('clients')
        .update({ is_active: false })
        .eq('id', id)

      if (error) {
        return NextResponse.json({ error: 'Erro ao desativar cliente' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Cliente desativado' })
    }
  } catch (error) {
    console.error('[CLIENTS] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
