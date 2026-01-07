export const dynamic = 'force-dynamic'


import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSession, isAdmin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    const admin = await isAdmin()

    if (!session || !admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { client_id, year, month, revenue, sales_count, notes, investment } = body

    if (!client_id || !year || !month || !revenue) {
      return NextResponse.json(
        { error: 'Client ID, ano, mês e faturamento são obrigatórios' },
        { status: 400 }
      )
    }

    if (month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Mês deve estar entre 1 e 12' },
        { status: 400 }
      )
    }

    if (revenue <= 0) {
      return NextResponse.json(
        { error: 'Faturamento deve ser maior que zero' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, name, company_name')
      .eq('id', client_id)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    const { data: existingRecord } = await supabase
      .from('monthly_records')
      .select('id')
      .eq('client_id', client_id)
      .eq('year', year)
      .eq('month', month)
      .single()

    if (existingRecord) {
      return NextResponse.json(
        { error: `Já existe registro para ${month}/${year}. Exclua o existente primeiro.` },
        { status: 400 }
      )
    }

    const ticketAverage = sales_count && sales_count > 0 ? revenue / sales_count : null

    const { data: record, error: insertError } = await supabase
      .from('monthly_records')
      .insert({
        client_id,
        year,
        month,
        revenue,
        sales_count: sales_count || null,
        ticket_average: ticketAverage,
        notes: notes ? `[Admin] ${notes}` : '[Admin] Registro retroativo',
        investment: investment ? parseFloat(investment) : null,
        is_locked: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('[ADMIN RECORDS] Erro ao criar registro:', insertError)
      return NextResponse.json(
        { error: 'Erro ao salvar registro' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      record,
      message: `Registro de ${month}/${year} criado com sucesso para ${client.company_name}`,
    })
  } catch (error) {
    console.error('[ADMIN RECORDS] Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    const admin = await isAdmin()

    if (!session || !admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('client_id')

    if (!clientId) {
      return NextResponse.json(
        { error: 'client_id é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: records, error } = await supabase
      .from('monthly_records')
      .select('*')
      .eq('client_id', clientId)
      .order('year', { ascending: false })
      .order('month', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar registros' }, { status: 500 })
    }

    return NextResponse.json({ records })
  } catch (error) {
    console.error('[ADMIN RECORDS] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// PATCH - Editar registro existente (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    const admin = await isAdmin()

    if (!session || !admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { id, revenue, sales_count, notes, highlight, investment } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID do registro é obrigatório' },
        { status: 400 }
      )
    }

    if (revenue !== undefined && revenue <= 0) {
      return NextResponse.json(
        { error: 'Faturamento deve ser maior que zero' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Monta objeto de atualização
    const updates: any = {}
    
    if (revenue !== undefined) {
      updates.revenue = parseFloat(revenue)
    }
    
    if (sales_count !== undefined) {
      updates.sales_count = sales_count ? parseInt(sales_count) : null
    }
    
    if (notes !== undefined) {
      updates.notes = notes || null
    }
    
    if (highlight !== undefined) {
      updates.highlight = highlight || null
    }

    if (investment !== undefined) {
      updates.investment = investment ? parseFloat(investment) : null
    }

    // Recalcula ticket médio se necessário
    if (updates.revenue !== undefined || updates.sales_count !== undefined) {
      // Busca registro atual para ter os valores completos
      const { data: currentRecord } = await supabase
        .from('monthly_records')
        .select('revenue, sales_count')
        .eq('id', id)
        .single()

      const finalRevenue = updates.revenue ?? currentRecord?.revenue ?? 0
      const finalSalesCount = updates.sales_count ?? currentRecord?.sales_count

      if (finalSalesCount && finalSalesCount > 0) {
        updates.ticket_average = finalRevenue / finalSalesCount
      } else {
        updates.ticket_average = null
      }
    }

    const { data: record, error } = await supabase
      .from('monthly_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[ADMIN RECORDS] Erro ao atualizar:', error)
      return NextResponse.json({ error: 'Erro ao atualizar registro' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      record,
      message: 'Registro atualizado com sucesso',
    })
  } catch (error) {
    console.error('[ADMIN RECORDS] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    const admin = await isAdmin()

    if (!session || !admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const recordId = searchParams.get('id')

    if (!recordId) {
      return NextResponse.json(
        { error: 'ID do registro é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    await supabase
      .from('client_achievements')
      .delete()
      .eq('record_id', recordId)

    const { error } = await supabase
      .from('monthly_records')
      .delete()
      .eq('id', recordId)

    if (error) {
      return NextResponse.json({ error: 'Erro ao remover registro' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ADMIN RECORDS] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}