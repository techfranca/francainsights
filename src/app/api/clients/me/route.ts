export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const supabase = createAdminClient()

    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', session.client_id)
      .single()

    if (error || !client) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    }

    const { count: achievementsCount } = await supabase
      .from('client_achievements')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', session.client_id)

    // CORREÇÃO: Retorna is_admin do session
    return NextResponse.json({
      client,
      achievements_count: achievementsCount || 0,
      is_admin: session.is_admin || false,
    })
  } catch (error) {
    console.error('[CLIENT/ME] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
