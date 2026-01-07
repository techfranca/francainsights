import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSession, isAdmin } from '@/lib/auth'

// POST - Registrar acesso do cliente
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Obtém informações do request
    const userAgent = request.headers.get('user-agent') || null
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : null

    // Registra o acesso
    const { error } = await supabase
      .from('client_access_logs')
      .insert({
        client_id: session.client_id,
        user_agent: userAgent,
        ip_address: ipAddress,
      })

    if (error) {
      console.error('[ACCESS LOGS] Erro ao registrar:', error)
      // Não retorna erro para não atrapalhar a experiência do usuário
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ACCESS LOGS] Erro:', error)
    return NextResponse.json({ success: false })
  }
}

// GET - Buscar estatísticas de acesso (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    const admin = await isAdmin()

    if (!session || !admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('client_id')

    const supabase = createAdminClient()

    // Se tem client_id, busca estatísticas específicas
    if (clientId) {
      // Acessos do mês atual
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const { count: monthlyCount } = await supabase
        .from('client_access_logs')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .gte('accessed_at', startOfMonth.toISOString())

      // Últimos 7 dias
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const { count: weeklyCount } = await supabase
        .from('client_access_logs')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .gte('accessed_at', sevenDaysAgo.toISOString())

      // Total de acessos
      const { count: totalCount } = await supabase
        .from('client_access_logs')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)

      return NextResponse.json({
        client_id: clientId,
        monthly_access: monthlyCount || 0,
        weekly_access: weeklyCount || 0,
        total_access: totalCount || 0,
      })
    }

    // Busca estatísticas gerais - acessos do mês por cliente
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const { data: accessData, error } = await supabase
      .from('client_access_logs')
      .select('client_id')
      .gte('accessed_at', startOfMonth.toISOString())

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
    }

    // Conta acessos por cliente
    const accessByClient: Record<string, number> = {}
    accessData?.forEach(log => {
      accessByClient[log.client_id] = (accessByClient[log.client_id] || 0) + 1
    })

    return NextResponse.json({ access_by_client: accessByClient })
  } catch (error) {
    console.error('[ACCESS LOGS] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
