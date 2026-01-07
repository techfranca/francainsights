import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSession } from '@/lib/auth'
import { sendRecordCongratulation, sendAchievementUnlocked, notifyAdminNewRecord } from '@/lib/uazapi'
import { calculateGrowth, formatMonthYear, isRecordLocked, getCurrentMonthYear, getPreviousMonthYear } from '@/lib/utils'
import { ACHIEVEMENT_DEFINITIONS } from '@/types'

// ====== n8n webhook config ======
const N8N_WEBHOOK_NEW_RECORD = process.env.N8N_WEBHOOK_NEW_RECORD
const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET // opcional, mas recomendado

function fireAndForgetN8n(payload: any) {
  if (!N8N_WEBHOOK_NEW_RECORD) return

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3000) // 3s pra não travar request

  // Não bloqueia a resposta do usuário
  void fetch(N8N_WEBHOOK_NEW_RECORD, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(N8N_WEBHOOK_SECRET ? { 'x-webhook-secret': N8N_WEBHOOK_SECRET } : {}),
    },
    body: JSON.stringify(payload),
    signal: controller.signal,
  })
    .catch((err) => {
      // log leve; não quebra o fluxo principal
      console.warn('[N8N] Falha ao chamar webhook novo registro:', err?.message || err)
    })
    .finally(() => clearTimeout(timeout))
}

// POST - Criar novo registro mensal
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { revenue, sales_count, notes, highlight, month, year } = await request.json()

    if (!revenue || revenue <= 0) {
      return NextResponse.json(
        { error: 'Faturamento é obrigatório' },
        { status: 400 }
      )
    }

    // ✅ Default agora é mês anterior (blindagem). Mas o front já manda month/year.
    const { month: currentMonth, year: currentYear } = getCurrentMonthYear()
    const prev = getPreviousMonthYear(currentMonth, currentYear)

    const recordMonth = month ?? prev.month
    const recordYear = year ?? prev.year

    // Verifica se registro está bloqueado
    if (isRecordLocked(recordMonth, recordYear)) {
      return NextResponse.json(
        { error: 'Prazo de registro encerrado para este mês' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Verifica se já existe registro para este mês
    const { data: existingRecord } = await supabase
      .from('monthly_records')
      .select('id')
      .eq('client_id', session.client_id)
      .eq('year', recordYear)
      .eq('month', recordMonth)
      .single()

    if (existingRecord) {
      return NextResponse.json(
        { error: 'Já existe registro para este mês' },
        { status: 400 }
      )
    }

    // Calcula ticket médio se tiver quantidade de vendas
    const ticketAverage = sales_count && sales_count > 0 ? revenue / sales_count : null

    // Cria o registro
    const { data: record, error: insertError } = await supabase
      .from('monthly_records')
      .insert({
        client_id: session.client_id,
        year: recordYear,
        month: recordMonth,
        revenue,
        sales_count: sales_count || null,
        ticket_average: ticketAverage,
        notes: notes || null,
        highlight: highlight || null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('[RECORDS] Erro ao criar registro:', insertError)
      return NextResponse.json(
        { error: 'Erro ao salvar registro' },
        { status: 500 }
      )
    }

    // Busca dados do cliente
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('id', session.client_id)
      .single()

    // Busca histórico para cálculos
    const { data: history } = await supabase
      .from('monthly_records')
      .select('*')
      .eq('client_id', session.client_id)
      .order('year', { ascending: false })
      .order('month', { ascending: false })

    // Calcula crescimento vs mês anterior
let growthPercent: number | null = null
let previousRevenue: number | null = null

if (history && history.length > 1) {
  const previous = history[1] // O atual já está no índice 0

  // Garantia de tipo (se vier null/undefined do banco, não quebra)
  previousRevenue = typeof previous?.revenue === 'number' ? previous.revenue : null

  if (previousRevenue !== null) {
    growthPercent = calculateGrowth(revenue, previousRevenue)
  }
}


    // Verifica se é recorde
    const isRecord = history ? !history.some((r) => r.id !== record.id && r.revenue >= revenue) : true

    // Processa conquistas
    const unlockedAchievements: { icon: string; name: string }[] = []

    // Busca conquistas já desbloqueadas
    const { data: existingAchievements } = await supabase
      .from('client_achievements')
      .select('achievement_id, achievements(code)')
      .eq('client_id', session.client_id)

    const unlockedCodes = existingAchievements?.map((a: any) => a.achievements?.code) || []

    // Verifica cada conquista
    const achievementsToUnlock: string[] = []

    // Primeiro registro
    if (history?.length === 1 && !unlockedCodes.includes('first_record')) {
      achievementsToUnlock.push('first_record')
    }

    // Crescimento
    if (growthPercent !== null) {
      if (growthPercent >= 50 && !unlockedCodes.includes('growth_50')) {
        achievementsToUnlock.push('growth_50')
      } else if (growthPercent >= 25 && !unlockedCodes.includes('growth_25')) {
        achievementsToUnlock.push('growth_25')
      } else if (growthPercent >= 10 && !unlockedCodes.includes('growth_10')) {
        achievementsToUnlock.push('growth_10')
      }
    }

    // Recorde
    if (isRecord && history && history.length > 1 && !unlockedCodes.includes('record_breaker')) {
      achievementsToUnlock.push('record_breaker')
    }

    // Seis dígitos
    if (revenue >= 100000 && !unlockedCodes.includes('six_figures')) {
      achievementsToUnlock.push('six_figures')
    }

    // Desbloqueia conquistas
    for (const achievementCode of achievementsToUnlock) {
      const { data: achievement } = await supabase
        .from('achievements')
        .select('*')
        .eq('code', achievementCode)
        .single()

      if (achievement) {
        await supabase.from('client_achievements').insert({
          client_id: session.client_id,
          achievement_id: achievement.id,
          record_id: record.id,
        })

        // Atualiza pontos do cliente
        await supabase
          .from('clients')
          .update({
            total_points: (client?.total_points || 0) + achievement.points
          })
          .eq('id', session.client_id)

        unlockedAchievements.push({
          icon: achievement.icon,
          name: achievement.name,
        })

        // Envia notificação de conquista (mantido)
        if (client) {
          await sendAchievementUnlocked(
            client.phone,
            client.name,
            achievement.name,
            achievement.icon
          )
        }
      }
    }

    // Gera insights baseados nos dados
    const insights: string[] = []

    if (growthPercent !== null) {
      if (growthPercent > 20) {
        insights.push(`Excelente crescimento! Você superou o mês anterior em ${growthPercent.toFixed(0)}%.`)
      } else if (growthPercent > 0) {
        insights.push(`Bom trabalho! Você manteve o crescimento em ${growthPercent.toFixed(0)}%.`)
      } else if (growthPercent < -10) {
        insights.push('Mês mais fraco que o anterior. Vamos analisar as causas juntos.')
      }
    }

    if (ticketAverage && history && history.length > 1) {
      const prevTicket = history[1].ticket_average
      if (prevTicket && ticketAverage > prevTicket * 1.1) {
        insights.push(`Seu ticket médio aumentou ${((ticketAverage / prevTicket - 1) * 100).toFixed(0)}%!`)
      }
    }

    if (isRecord) {
      insights.push('Este foi seu melhor mês até agora. Continue assim!')
    }

    // Envia WhatsApp de parabéns (mantido)
    if (client) {
      await sendRecordCongratulation(
        client.phone,
        client.name,
        revenue,
        growthPercent,
        isRecord
      )

      // Notifica admin (mantido)
      await notifyAdminNewRecord(
        client.name,
        client.company_name,
        revenue,
        formatMonthYear(recordMonth, recordYear)
      )
    }

    // Webhook n8n (mantido como opcional, não quebra nada)
    fireAndForgetN8n({
      event: 'monthly_record_created',
      record: {
        id: record.id,
        client_id: session.client_id,
        year: recordYear,
        month: recordMonth,
        revenue,
        sales_count: sales_count || null,
        ticket_average: ticketAverage,
        notes: notes || null,
        highlight: highlight || null,
        created_at: record.created_at ?? new Date().toISOString(),
      },
      client: client ? {
        id: client.id,
        name: client.name,
        phone: client.phone,
        company_name: client.company_name,
        total_points: client.total_points,
      } : null,
      computed: {
        month_year: formatMonthYear(recordMonth, recordYear),
        growth_percent: growthPercent,
        previous_revenue: previousRevenue,
        is_record: isRecord,
      },
      achievements_unlocked: unlockedAchievements,
      insights,
    })

    return NextResponse.json({
      success: true,
      record,
      growth_percent: growthPercent,
      is_record: isRecord,
      achievements: unlockedAchievements,
      insights,
    })
  } catch (error) {
    console.error('[RECORDS] Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    )
  }
}

// GET - Buscar registros do cliente
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '12')

    const { data: records, error } = await supabase
      .from('monthly_records')
      .select('*')
      .eq('client_id', session.client_id)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar registros' }, { status: 500 })
    }

    return NextResponse.json({ records })
  } catch (error) {
    console.error('[RECORDS] Erro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
