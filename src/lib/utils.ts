import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { MONTHS, SEGMENTS } from '@/types'

export { SEGMENTS }

// Merge de classes Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formata valor em Reais
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Formata valor completo em Reais (com centavos)
export function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Formata número com separador de milhar
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

// Formata porcentagem
export function formatPercent(value: number, decimals: number = 1): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

// Formata telefone brasileiro
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }
  if (cleaned.length === 13) {
    return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`
  }
  return phone
}

// Limpa telefone (só números)
export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

// Adiciona código do país se não tiver
export function normalizePhone(phone: string): string {
  const cleaned = cleanPhone(phone)
  if (cleaned.length === 11) {
    return `55${cleaned}`
  }
  return cleaned
}

// Retorna nome do mês
export function getMonthName(month: number): string {
  return MONTHS[month - 1]
}

// Retorna mês/ano formatado
export function formatMonthYear(month: number, year: number): string {
  return `${getMonthName(month)} ${year}`
}

// Retorna mês/ano abreviado
export function formatMonthYearShort(month: number, year: number): string {
  return `${getMonthName(month).slice(0, 3)}/${year.toString().slice(-2)}`
}

// Calcula crescimento percentual
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

// Gera código OTP de 6 dígitos
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Retorna saudação baseada na hora
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

// Retorna primeiro nome
export function getFirstName(fullName: string): string {
  return fullName.split(' ')[0]
}

// Retorna mês/ano atual
export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date()
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  }
}

// Retorna mês/ano anterior
export function getPreviousMonthYear(month: number, year: number): { month: number; year: number } {
  if (month === 1) {
    return { month: 12, year: year - 1 }
  }
  return { month: month - 1, year }
}

// Verifica se é o mesmo mês/ano
export function isSameMonthYear(
  month1: number,
  year1: number,
  month2: number,
  year2: number
): boolean {
  return month1 === month2 && year1 === year2
}

// Delay para animações
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Trunca texto
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

// Gera cor baseada em string (para avatares)
export function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = [
    '#7DE08D', '#5ea86a', '#4b8655', '#598F74',
    '#081534', '#0d2156', '#1a3a7a', '#2850a4',
  ]
  return colors[Math.abs(hash) % colors.length]
}

// Gera iniciais do nome
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Valida email
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// Valida telefone brasileiro
export function isValidPhone(phone: string): boolean {
  const cleaned = cleanPhone(phone)
  return cleaned.length === 11 || cleaned.length === 13
}

// Data de expiração do código (10 minutos)
export function getCodeExpiration(): Date {
  return new Date(Date.now() + 10 * 60 * 1000)
}

// Verifica se código expirou
export function isCodeExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date()
}

/**
 * Dias até o bloqueio do registro.
 * Regra: registra-se o MÊS ANTERIOR durante o mês atual, com prazo ATÉ o dia 10.
 *
 * Para um registro de (month, year), o prazo é o dia 10 do mês seguinte.
 * Ex: registro Dez/2025 => prazo até 10/Jan/2026 (fim do dia).
 */
export function getDaysUntilLock(month: number, year: number): number {
  // Em Date(), mês é 0-11. Como month aqui é 1-12:
  // new Date(year, month, 10) = dia 10 do mês seguinte ao "month".
  const lockDate = new Date(year, month, 10, 23, 59, 59) // fim do dia 10 do mês seguinte
  const today = new Date()
  const diff = lockDate.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Verifica se registro está bloqueado.
 * Regra do produto:
 * - Só é permitido registrar o MÊS ANTERIOR ao mês atual;
 * - O prazo é até o DIA 10 do mês atual (inclusive). Dia 11 em diante bloqueia.
 */
export function isRecordLocked(month: number, year: number): boolean {
  const now = new Date()
  const { month: currentMonth, year: currentYear } = getCurrentMonthYear()
  const { month: prevMonth, year: prevYear } = getPreviousMonthYear(currentMonth, currentYear)

  // Só permite registrar o mês anterior
  if (month !== prevMonth || year !== prevYear) return true

  // Prazo até dia 10 (inclusive)
  return now.getDate() > 10
}
