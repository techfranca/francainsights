import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateToken, setSession } from '@/lib/auth'
import { normalizePhone, isCodeExpired } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json()

    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Telefone e código são obrigatórios' },
        { status: 400 }
      )
    }

    const normalizedPhone = normalizePhone(phone)
    const supabase = createAdminClient()

    // Busca código válido
    const { data: authCode, error: codeError } = await supabase
      .from('auth_codes')
      .select('*')
      .eq('phone', normalizedPhone)
      .eq('code', code)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (codeError || !authCode) {
      return NextResponse.json(
        { error: 'Código inválido' },
        { status: 401 }
      )
    }

    // Verifica expiração
    if (isCodeExpired(authCode.expires_at)) {
      return NextResponse.json(
        { error: 'Código expirado. Solicite um novo.' },
        { status: 401 }
      )
    }

    // Marca código como usado
    await supabase
      .from('auth_codes')
      .update({ used: true })
      .eq('id', authCode.id)

    // Busca dados do cliente
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('phone', normalizedPhone)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Verifica se é admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', client.id)
      .single()

    const isAdmin = !!adminUser

    // Atualiza último login
    await supabase
      .from('clients')
      .update({ last_login: new Date().toISOString() })
      .eq('id', client.id)

    // Gera token JWT
    const token = await generateToken(client, isAdmin)

    // Salva sessão no cookie
    await setSession(token)

    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        company_name: client.company_name,
      },
    })
  } catch (error) {
    console.error('[AUTH] Erro na verificação:', error)
    return NextResponse.json(
      { error: 'Erro interno. Tente novamente.' },
      { status: 500 }
    )
  }
}
