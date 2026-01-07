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

    const { data: achievements, error } = await supabase
      .from('client_achievements')
      .select(`
        achievement_id,
        unlocked_at,
        achievements (
          code,
          name,
          description,
          icon,
          points
        )
      `)
      .eq('client_id', session.client_id)
      .order('unlocked_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar conquistas' }, { status: 500 })
    }

    return NextResponse.json({ achievements })
  } catch (error) {
    console.error('[ACHIEVEMENTS] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
