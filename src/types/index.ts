// ============================================
// FRANCA INSIGHTS - Tipos e Interfaces
// ============================================

export interface Client {
  id: string
  created_at: string
  name: string
  company_name: string
  email: string | null
  phone: string
  start_date: string
  segment: string | null
  current_level: number
  total_points: number
  is_active: boolean
  last_login: string | null
  monthly_goal: number | null
  previous_annual_revenue: number | null
}

export interface MonthlyRecord {
  id: string
  client_id: string
  year: number
  month: number
  revenue: number
  sales_count: number | null
  ticket_average: number | null
  notes: string | null
  highlight: string | null
  investment: number | null
  submitted_at: string
  is_locked: boolean
}

export interface Achievement {
  id: string
  code: string
  name: string
  description: string | null
  icon: string
  points: number
}

export interface ClientAchievement {
  id: string
  client_id: string
  achievement_id: string
  unlocked_at: string
  record_id: string | null
  achievement?: Achievement
}

export interface AuthCode {
  id: string
  phone: string
  code: string
  created_at: string
  expires_at: string
  used: boolean
}

export interface AdminUser {
  id: string
  user_id: string
  email: string
  created_at: string
}

export interface ClientAccessLog {
  id: string
  client_id: string
  accessed_at: string
  user_agent: string | null
  ip_address: string | null
}

export interface MonthlyAccessCount {
  client_id: string
  year: number
  month: number
  access_count: number
}

export interface ClientMetrics {
  client_id: string
  total_months: number
  total_revenue: number
  avg_monthly_revenue: number
  best_month_revenue: number
  best_month: string | null
  last_growth_percent: number | null
  current_month_revenue: number | null
  previous_month_revenue: number | null
}

export interface ChartData {
  month: string
  revenue: number
  salesCount: number | null
  investment: number | null
  year: number
  monthNum: number
}

export interface AuthResponse {
  success: boolean
  message?: string
  error?: string
}

export interface VerifyResponse {
  success: boolean
  token?: string
  client?: Client
  error?: string
}

export interface UserSession {
  client_id: string
  phone: string
  name: string
  company_name: string
  is_admin: boolean
  exp: number
}

export interface JWTPayload {
  sub: string
  phone: string
  name: string
  company_name: string
  is_admin: boolean
  iat: number
  exp: number
}

export interface RecordFormData {
  revenue: number
  sales_count: number
  notes?: string
  highlight?: string
}

export interface CreateRecordResponse {
  success: boolean
  record?: MonthlyRecord
  achievements?: Achievement[]
  insights?: string[]
  is_record?: boolean
  growth_percent?: number
  error?: string
}

export interface CreateClientData {
  name: string
  company_name: string
  phone: string
  email?: string
  segment?: string
  start_date: string
  monthly_goal?: number
  previous_annual_revenue?: number
}

export interface Level {
  level: number
  name: string
  min_points: number
  icon: string
}

export const LEVELS: Level[] = [
  { level: 1, name: 'Iniciante', min_points: 0, icon: 'seedling' },
  { level: 2, name: 'Consistente', min_points: 100, icon: 'bar-chart' },
  { level: 3, name: 'Em Ascensão', min_points: 300, icon: 'trending-up' },
  { level: 4, name: 'Performer', min_points: 600, icon: 'flame' },
  { level: 5, name: 'Elite', min_points: 1000, icon: 'crown' },
]

export const ACHIEVEMENT_DEFINITIONS = [
  { code: 'first_record', name: 'Primeira Vez', description: 'Registrou seu primeiro mês', icon: 'rocket', points: 10 },
  { code: 'growth_10', name: 'Crescimento', description: 'Cresceu 10% ou mais em um mês', icon: 'trending-up', points: 20 },
  { code: 'growth_25', name: 'Decolando', description: 'Cresceu 25% ou mais em um mês', icon: 'plane-takeoff', points: 30 },
  { code: 'growth_50', name: 'Foguete', description: 'Cresceu 50% ou mais em um mês', icon: 'rocket', points: 50 },
  { code: 'streak_3', name: 'Em Chamas', description: '3 meses consecutivos de crescimento', icon: 'flame', points: 40 },
  { code: 'streak_6', name: 'Imparável', description: '6 meses consecutivos de crescimento', icon: 'zap', points: 80 },
  { code: 'record_breaker', name: 'Recorde', description: 'Bateu seu próprio recorde de faturamento', icon: 'gem', points: 30 },
  { code: 'consistent_6', name: 'Consistente', description: 'Registrou 6 meses seguidos', icon: 'calendar', points: 25 },
  { code: 'consistent_12', name: 'Dedicado', description: 'Registrou 12 meses seguidos', icon: 'trophy', points: 50 },
  { code: 'ticket_up_20', name: 'Ticket de Ouro', description: 'Ticket médio subiu 20% ou mais', icon: 'ticket', points: 25 },
  { code: 'six_figures', name: 'Seis Dígitos', description: 'Faturou R$ 100.000+ em um mês', icon: 'coins', points: 100 },
  { code: 'first_year', name: 'Aniversário', description: 'Completou 1 ano de acompanhamento', icon: 'cake', points: 50 },
  { code: 'goal_achieved', name: 'Meta Batida', description: 'Atingiu a meta mensal', icon: 'target', points: 25 },
] as const

export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
] as const

export const SEGMENTS = [
  'E-commerce',
  'Negócio Local',
  'Infoproduto',
  'Inside Sales',
  'Outros',
] as const

// Mensagens premium sem emojis
export const GROWTH_MESSAGES = {
  excellent: [
    'Resultado excepcional! Seu negócio está em plena expansão.',
    'Performance extraordinária! Os números refletem seu empenho.',
    'Crescimento impressionante! Você está no topo.',
    'Mês espetacular! Sua dedicação está gerando resultados notáveis.',
  ],
  good: [
    'Bom crescimento! Você está construindo algo sólido.',
    'Resultado positivo! A consistência está trazendo frutos.',
    'Ótimo trabalho! Continue evoluindo nessa direção.',
  ],
  stable: [
    'Resultado estável. Uma base sólida para novos desafios.',
    'Mês consistente. Momento ideal para inovar.',
  ],
  declining: [
    'Mês desafiador, mas todo ciclo tem seus ajustes. Vamos reverter juntos.',
    'Oportunidade de análise. Identificaremos os pontos de melhoria.',
  ],
  record: [
    'Você superou seu próprio recorde! Este resultado representa o ápice da sua jornada até aqui.',
  ],
  goal: [
    'Meta atingida! Você demonstrou que foco e estratégia geram resultados concretos.',
  ],
} as const

export function calculatePartnershipMonths(startDate: string): number {
  const start = new Date(startDate)
  const now = new Date()
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
  return Math.max(0, months)
}

export function formatPartnershipTime(months: number): string {
  if (months === 0) return 'Início'
  if (months === 1) return '1 mês'
  if (months < 12) return `${months} meses`
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (remainingMonths === 0) {
    return years === 1 ? '1 ano' : `${years} anos`
  }
  return years === 1 
    ? `1 ano e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`
    : `${years} anos e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`
}
