// ============================================
// UAZAPI - Integração com WhatsApp
// ============================================

const UAZAPI_URL = process.env.UAZAPI_URL
const UAZAPI_TOKEN = process.env.UAZAPI_TOKEN
const UAZAPI_INSTANCE = process.env.UAZAPI_INSTANCE

interface SendMessageResponse {
  success: boolean
  messageId?: string
  error?: string
}

// Envia mensagem de texto via WhatsApp
export async function sendWhatsAppMessage(
  phone: string,
  message: string
): Promise<SendMessageResponse> {
  try {
    // Formata o número para o padrão internacional (remove caracteres especiais)
    const cleanPhone = phone.replace(/\D/g, '')
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`

    console.log('[UAZAPI] Enviando mensagem para:', formattedPhone)
    console.log('[UAZAPI] URL:', `${UAZAPI_URL}/send/text`)

    // Validação do token
    if (!UAZAPI_TOKEN) {
      console.error('[UAZAPI] Token não configurado!')
      return { success: false, error: 'Token UAZAPI não configurado' }
    }

    const response = await fetch(
      `${UAZAPI_URL}/send/text`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': UAZAPI_TOKEN,
        },
        body: JSON.stringify({
          number: formattedPhone,
          text: message,
          linkPreview: false,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('[UAZAPI] Erro ao enviar mensagem:', error)
      return { success: false, error }
    }

    const data = await response.json()
    console.log('[UAZAPI] Mensagem enviada com sucesso:', data)
    return { success: true, messageId: data.key?.id || data.messageId }
  } catch (error) {
    console.error('[UAZAPI] Erro na requisição:', error)
    return { success: false, error: 'Falha na conexão com WhatsApp' }
  }
}

// Envia código OTP via WhatsApp
export async function sendOTPCode(
  phone: string,
  code: string,
  clientName?: string
): Promise<SendMessageResponse> {
  const greeting = clientName ? `Olá, ${clientName.split(' ')[0]}!` : 'Olá!'
  
  const message = `🔐 *FRANCA INSIGHTS*

${greeting}

Seu código de acesso: *${code}*

⏱️ Válido por 10 minutos.

_Se você não solicitou este código, ignore esta mensagem._`

  return sendWhatsAppMessage(phone, message)
}

// Envia mensagem de boas-vindas
export async function sendWelcomeMessage(
  phone: string,
  clientName: string
): Promise<SendMessageResponse> {
  const message = `🎉 *Bem-vindo ao FRANCA INSIGHTS!*

Olá, ${clientName.split(' ')[0]}!

Sua conta foi criada com sucesso. Agora você pode acompanhar a evolução do seu negócio de forma clara e visual.

📊 Acesse: insights.francaassessoria.com

Para entrar, basta informar seu WhatsApp e digitar o código que enviaremos.

Qualquer dúvida, estamos à disposição!

_Equipe Franca Assessoria_`

  return sendWhatsAppMessage(phone, message)
}

// Envia lembrete de preenchimento mensal
export async function sendMonthlyReminder(
  phone: string,
  clientName: string,
  month: string
): Promise<SendMessageResponse> {
  const message = `📊 *FRANCA INSIGHTS*

Olá, ${clientName.split(' ')[0]}!

Já é hora de registrar seus resultados de *${month}*!

Acesse agora e mantenha seu histórico atualizado:
👉 insights.francaassessoria.com

Leva menos de 1 minuto!

_Equipe Franca Assessoria_`

  return sendWhatsAppMessage(phone, message)
}

// Envia parabéns por novo registro
export async function sendRecordCongratulation(
  phone: string,
  clientName: string,
  revenue: number,
  growthPercent: number | null,
  isRecord: boolean
): Promise<SendMessageResponse> {
  const formattedRevenue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(revenue)

  let message = `🎉 *FRANCA INSIGHTS*

Parabéns, ${clientName.split(' ')[0]}!

Seu registro foi salvo com sucesso.
💰 Faturamento: *${formattedRevenue}*`

  if (growthPercent !== null) {
    const emoji = growthPercent >= 0 ? '📈' : '📉'
    const sign = growthPercent >= 0 ? '+' : ''
    message += `
${emoji} Crescimento: *${sign}${growthPercent.toFixed(1)}%* vs. mês anterior`
  }

  if (isRecord) {
    message += `

🏆 *NOVO RECORDE!* 
Esse foi seu melhor mês até agora!`
  }

  message += `

Acesse o app para ver mais detalhes:
👉 insights.francaassessoria.com

_Equipe Franca Assessoria_`

  return sendWhatsAppMessage(phone, message)
}

// Envia notificação de conquista desbloqueada
export async function sendAchievementUnlocked(
  phone: string,
  clientName: string,
  achievementName: string,
  achievementIcon: string
): Promise<SendMessageResponse> {
  const message = `🏅 *CONQUISTA DESBLOQUEADA!*

${achievementIcon} ${clientName.split(' ')[0]}, você desbloqueou:

*${achievementName}*

Continue evoluindo e desbloqueie mais conquistas!

Veja todas em:
👉 insights.francaassessoria.com/conquistas

_Equipe Franca Assessoria_`

  return sendWhatsAppMessage(phone, message)
}

// Notifica admin sobre novo registro
export async function notifyAdminNewRecord(
  clientName: string,
  companyName: string,
  revenue: number,
  month: string
): Promise<SendMessageResponse> {
  const adminPhone = process.env.ADMIN_WHATSAPP
  if (!adminPhone) return { success: false, error: 'Admin phone not configured' }

  const formattedRevenue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(revenue)

  const message = `📊 *Novo Registro - FRANCA INSIGHTS*

Cliente: *${clientName}*
Empresa: ${companyName}
Mês: ${month}
Faturamento: *${formattedRevenue}*`

  return sendWhatsAppMessage(adminPhone, message)
}