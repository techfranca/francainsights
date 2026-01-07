import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOTPCode } from '@/lib/uazapi'
import { generateOTP, normalizePhone, getCodeExpiration } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { error: 'Número de telefone obrigatório' },
        { status: 400 }
      )
    }

    const normalizedPhone = normalizePhone(phone)
    const supabase = createAdminClient()

    // Verifica se cliente existe e está ativo
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, name, is_active')
      .eq('phone', normalizedPhone)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Número não cadastrado. Entre em contato com a Franca Assessoria.' },
        { status: 404 }
      )
    }

    if (!client.is_active) {
      return NextResponse.json(
        { error: 'Conta inativa. Entre em contato com a Franca Assessoria.' },
        { status: 403 }
      )
    }

    // Verifica se já existe código válido recente (rate limiting)
    const { data: recentCode } = await supabase
      .from('auth_codes')
      .select('created_at')
      .eq('phone', normalizedPhone)
      .eq('used', false)
      .gte('created_at', new Date(Date.now() - 60000).toISOString()) // último minuto
      .single()

    if (recentCode) {
      return NextResponse.json(
        { error: 'Aguarde 1 minuto antes de solicitar novo código' },
        { status: 429 }
      )
    }

    // Gera código OTP
    const code = generateOTP()
    const expiresAt = getCodeExpiration()

    // Salva código no banco
    const { error: insertError } = await supabase
      .from('auth_codes')
      .insert({
        phone: normalizedPhone,
        code,
        expires_at: expiresAt.toISOString(),
      })

    if (insertError) {
      console.error('[AUTH] Erro ao salvar código:', insertError)
      return NextResponse.json(
        { error: 'Erro interno. Tente novamente.' },
        { status: 500 }
      )
    }

    // Envia código via WhatsApp
    const whatsappResult = await sendOTPCode(normalizedPhone, code, client.name)

    if (!whatsappResult.success) {
      console.error('[AUTH] Erro ao enviar WhatsApp:', whatsappResult.error)
      return NextResponse.json(
        { error: 'Erro ao enviar código. Tente novamente.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Código enviado com sucesso',
    })
  } catch (error) {
    console.error('[AUTH] Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno. Tente novamente.' },
      { status: 500 }
    )
  }
}
