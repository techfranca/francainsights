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

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('client_id')

    if (!clientId) {
      return NextResponse.json({ error: 'client_id é obrigatório' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Busca cliente
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    // Busca registros (últimos 24 meses)
    const { data: records, error: recordsError } = await supabase
      .from('monthly_records')
      .select('*')
      .eq('client_id', clientId)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(24)

    if (recordsError) {
      return NextResponse.json({ error: 'Erro ao buscar registros' }, { status: 500 })
    }

    // Busca conquistas
    const { data: achievements, error: achievementsError } = await supabase
      .from('client_achievements')
      .select('*, achievement:achievements(*)')
      .eq('client_id', clientId)

    return NextResponse.json({
      client,
      records: records || [],
      achievements: achievements || [],
      achievementsCount: achievements?.length || 0,
    })
  } catch (error) {
    console.error('[ADMIN CLIENT DASHBOARD] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
