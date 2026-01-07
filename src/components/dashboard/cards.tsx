'use client'

import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Trophy, 
  Target, 
  Calendar, 
  Eye, 
  EyeOff,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  DollarSign,
  BarChart3,
  Sparkles,
  Award,
  ChevronRight,
  Wallet,
  PiggyBank,
  LineChart,
  Star,
  Gem,
  Crown,
  Rocket,
  Flame,
  Lock,
} from 'lucide-react'
import { formatCurrency, formatPercent, cn } from '@/lib/utils'
import { Card } from '@/components/ui'
import { GROWTH_MESSAGES, formatPartnershipTime } from '@/types'

// ============================================
// SECTION HEADER - Título de seção elegante
// ============================================
interface SectionHeaderProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
}

export function SectionHeader({ title, subtitle, icon }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {icon && (
        <div className="p-2 bg-franca-green/10 rounded-xl text-franca-green">
          {icon}
        </div>
      )}
      <div>
        <h2 className="text-lg font-semibold text-franca-blue">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  )
}

// ============================================
// METRIC CARD - Card de métrica uniforme
// ============================================
interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: number
  icon?: React.ReactNode
  delay?: number
  showValue?: boolean
  variant?: 'default' | 'success' | 'warning'
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon, 
  delay = 0, 
  showValue = true,
  variant = 'default'
}: MetricCardProps) {
  const isPositive = trend !== undefined && trend >= 0

  const displayValue = () => {
    if (!showValue) return '•••••'
    if (typeof value === 'number') return formatCurrency(value)
    return value
  }

  const variantStyles = {
    default: 'bg-franca-green/10 text-franca-green',
    success: 'bg-emerald-100 text-emerald-600',
    warning: 'bg-amber-100 text-amber-600',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="h-full"
    >
      <Card className="h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <p className="text-sm font-medium text-gray-500 leading-tight">{title}</p>
          {icon && (
            <div className={cn("p-2 rounded-xl flex-shrink-0", variantStyles[variant])}>
              {icon}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-end">
          <p className="text-2xl sm:text-3xl font-bold text-franca-blue mb-1 truncate">
            {displayValue()}
          </p>

          <div className="flex items-center gap-2 min-h-[20px]">
            {trend !== undefined && showValue && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-sm font-medium',
                  isPositive ? 'text-emerald-600' : 'text-red-500'
                )}
              >
                {isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {formatPercent(trend)}
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-gray-400 truncate">{subtitle}</span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ============================================
// PARTNERSHIP CARD - Tempo de parceria
// ============================================
interface PartnershipCardProps {
  months: number
  delay?: number
}

export function PartnershipCard({ months, delay = 0 }: PartnershipCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="h-full"
    >
      <Card className="h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <p className="text-sm font-medium text-gray-500">Parceria</p>
          <div className="p-2 bg-franca-blue/10 rounded-xl text-franca-blue flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-end">
          <p className="text-2xl sm:text-3xl font-bold text-franca-blue mb-1">
            {formatPartnershipTime(months)}
          </p>
          <p className="text-xs text-gray-400">
            Construindo juntos
          </p>
        </div>
      </Card>
    </motion.div>
  )
}

// ============================================
// TOTAL GROWTH CARD - Crescimento total
// ============================================
interface TotalGrowthCardProps {
  growthPercent: number | null
  showValue?: boolean
  delay?: number
}

export function TotalGrowthCard({ growthPercent, showValue = true, delay = 0 }: TotalGrowthCardProps) {
  const isPositive = growthPercent !== null && growthPercent >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="h-full"
    >
      <Card className="h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <p className="text-sm font-medium text-gray-500">Crescimento Total</p>
          <div className={cn(
            "p-2 rounded-xl flex-shrink-0",
            isPositive ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"
          )}>
            {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-end">
          <p className={cn(
            "text-2xl sm:text-3xl font-bold mb-1",
            isPositive ? "text-emerald-600" : "text-red-500"
          )}>
            {growthPercent !== null && showValue 
              ? `${isPositive ? '+' : ''}${formatPercent(growthPercent)}`
              : '•••%'
            }
          </p>
          <p className="text-xs text-gray-400">
            Evolução na parceria
          </p>
        </div>
      </Card>
    </motion.div>
  )
}

// ============================================
// BEFORE/AFTER CARD - Comparação elegante
// ============================================
interface BeforeAfterCardProps {
  previousAnnualRevenue: number | null
  currentAverageRevenue: number
  showValue?: boolean
}

export function BeforeAfterCard({ previousAnnualRevenue, currentAverageRevenue, showValue = true }: BeforeAfterCardProps) {
  if (!previousAnnualRevenue) return null

  const previousMonthly = previousAnnualRevenue / 12
  const improvement = ((currentAverageRevenue - previousMonthly) / previousMonthly) * 100
  const isPositive = improvement >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="relative overflow-hidden border border-franca-green/20 bg-gradient-to-br from-white to-franca-green/5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-franca-green rounded-xl text-white">
            <Zap className="w-4 h-4" />
          </div>
          <p className="text-sm font-semibold text-franca-blue">Impacto da Parceria</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Média Anterior</p>
            <p className="text-base sm:text-lg font-bold text-gray-600">
              {showValue ? formatCurrency(previousMonthly) : 'R$ •••••'}
            </p>
          </div>

          <div className="p-3 bg-franca-green/10 rounded-xl border border-franca-green/20">
            <p className="text-xs text-franca-green-dark mb-1">Média Atual</p>
            <p className="text-base sm:text-lg font-bold text-franca-green-dark">
              {showValue ? formatCurrency(currentAverageRevenue) : 'R$ •••••'}
            </p>
          </div>
        </div>

        <div className={cn(
          "flex items-center justify-center gap-2 py-2.5 rounded-xl",
          isPositive ? "bg-emerald-50" : "bg-red-50"
        )}>
          {isPositive ? (
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          )}
          <span className={cn(
            "text-lg font-bold",
            isPositive ? "text-emerald-600" : "text-red-500"
          )}>
            {showValue ? formatPercent(improvement) : '•••%'}
          </span>
          <span className="text-sm text-gray-600">
            de evolução
          </span>
        </div>
      </Card>
    </motion.div>
  )
}

// ============================================
// REVENUE CARD - Card principal premium
// ============================================
interface RevenueCardProps {
  revenue: number
  previousRevenue?: number
  month: string
  isRecord?: boolean
  showValue?: boolean
  goal?: number | null
}

export function RevenueCard({ revenue, previousRevenue, month, isRecord, showValue = true, goal }: RevenueCardProps) {
  const growth = previousRevenue ? ((revenue - previousRevenue) / previousRevenue) * 100 : null
  const isPositive = growth !== null && growth >= 0
  const goalProgress = goal ? (revenue / goal) * 100 : null
  const goalAchieved = goal ? revenue >= goal : false

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-franca-blue via-franca-blue to-franca-blue-dark text-white p-6 sm:p-8">
        {/* Decorações sutis */}
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute top-0 left-0 w-48 h-48 bg-franca-green rounded-full -translate-x-24 -translate-y-24" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-franca-green rounded-full translate-x-16 translate-y-16" />
        </div>

        <div className="relative">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {isRecord && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-franca-green text-franca-blue rounded-full text-xs font-bold"
              >
                <Trophy className="w-3.5 h-3.5" />
                NOVO RECORDE
              </motion.div>
            )}

            {goalAchieved && !isRecord && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 text-franca-blue rounded-full text-xs font-bold"
              >
                <Target className="w-3.5 h-3.5" />
                META ATINGIDA
              </motion.div>
            )}
          </div>

          {/* Label do mês */}
          <p className="text-sm font-medium text-white/60 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Faturamento de {month}
          </p>

          {/* Valor principal */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight"
          >
            {showValue ? formatCurrency(revenue) : 'R$ •••••'}
          </motion.p>

          {/* Crescimento */}
          {growth !== null && (
            <div className="flex items-center gap-3 mb-4">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold',
                  isPositive ? 'bg-white/10 text-franca-green' : 'bg-white/10 text-red-300'
                )}
              >
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {showValue ? formatPercent(growth) : '••%'}
              </span>
              <span className="text-sm text-white/50">vs. mês anterior</span>
            </div>
          )}

          {/* Barra de progresso da meta */}
          {goal && goalProgress !== null && (
            <div className="pt-4 border-t border-white/10">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-white/50 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  Meta mensal
                </span>
                <span className="text-white/70 font-medium">
                  {showValue ? `${Math.min(100, goalProgress).toFixed(0)}%` : '••%'}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, goalProgress)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                  className={`h-full rounded-full ${goalAchieved ? 'bg-franca-green' : 'bg-amber-400'}`}
                />
              </div>
              <p className="text-xs text-white/40 mt-1.5">
                Meta: {showValue ? formatCurrency(goal) : 'R$ •••••'}
              </p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

// ============================================
// GROWTH MESSAGE CARD - Mensagem premium
// ============================================
interface GrowthMessageCardProps {
  growthPercent: number | null
  isRecord: boolean
  goalAchieved: boolean
}

export function GrowthMessageCard({ growthPercent, isRecord, goalAchieved }: GrowthMessageCardProps) {
  const getMessage = () => {
    if (isRecord) {
      return GROWTH_MESSAGES.record[0]
    }
    if (goalAchieved) {
      return GROWTH_MESSAGES.goal[0]
    }
    if (growthPercent === null) {
      return 'Continue registrando para acompanhar sua evolução completa.'
    }
    if (growthPercent >= 25) {
      const messages = GROWTH_MESSAGES.excellent
      return messages[Math.floor(Math.random() * messages.length)]
    }
    if (growthPercent >= 5) {
      const messages = GROWTH_MESSAGES.good
      return messages[Math.floor(Math.random() * messages.length)]
    }
    if (growthPercent >= -5) {
      const messages = GROWTH_MESSAGES.stable
      return messages[Math.floor(Math.random() * messages.length)]
    }
    const messages = GROWTH_MESSAGES.declining
    return messages[Math.floor(Math.random() * messages.length)]
  }

  const getIcon = () => {
    if (isRecord) return <Trophy className="w-5 h-5" />
    if (goalAchieved) return <Target className="w-5 h-5" />
    if (growthPercent === null) return <BarChart3 className="w-5 h-5" />
    if (growthPercent >= 25) return <Rocket className="w-5 h-5" />
    if (growthPercent >= 5) return <TrendingUp className="w-5 h-5" />
    if (growthPercent >= -5) return <LineChart className="w-5 h-5" />
    return <Sparkles className="w-5 h-5" />
  }

  const message = getMessage()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-franca-green/5 via-franca-green/10 to-franca-green/5 border border-franca-green/15 p-5">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-franca-green/15 rounded-xl text-franca-green flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-franca-green uppercase tracking-wide mb-1.5">
              Análise do Mês
            </p>
            <p className="text-franca-blue font-medium leading-relaxed">
              {message}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// TOGGLE VALUES BUTTON - Botão elegante
// ============================================
interface ToggleValuesButtonProps {
  showValues: boolean
  onToggle: () => void
}

export function ToggleValuesButton({ showValues, onToggle }: ToggleValuesButtonProps) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border',
        showValues 
          ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50' 
          : 'bg-franca-green/10 border-franca-green/20 text-franca-green hover:bg-franca-green/15'
      )}
    >
      {showValues ? (
        <>
          <EyeOff className="w-4 h-4" />
          <span className="hidden sm:inline">Ocultar valores</span>
          <span className="sm:hidden">Ocultar</span>
        </>
      ) : (
        <>
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">Mostrar valores</span>
          <span className="sm:hidden">Mostrar</span>
        </>
      )}
    </motion.button>
  )
}

// ============================================
// RECORD INDICATOR - Card de recorde premium
// ============================================
interface RecordIndicatorProps {
  month: string
  value: number
  showValue?: boolean
}

export function RecordIndicator({ month, value, showValue = true }: RecordIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-white">
        {/* Efeito de brilho sutil */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse opacity-50" />
        
        <div className="relative flex items-center gap-4">
          {/* Ícone */}
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          
          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-0.5">
              Seu melhor resultado
            </p>
            <p className="text-2xl sm:text-3xl font-bold truncate">
              {showValue ? formatCurrency(value) : 'R$ •••••'}
            </p>
            <p className="text-sm text-white/70 mt-0.5">
              Alcançado em {month}
            </p>
          </div>

          {/* Decoração */}
          <div className="hidden sm:block absolute top-2 right-2">
            <Star className="w-5 h-5 text-white/30" />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ============================================
// PENDING ALERT - Alerta elegante
// ============================================
interface PendingAlertProps {
  month: string
  onClick: () => void
}

export function PendingAlert({ month, onClick }: PendingAlertProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      className="w-full p-4 bg-gradient-to-r from-franca-green/5 to-franca-green/10 border-2 border-franca-green/30 border-dashed rounded-2xl text-left transition-all hover:border-franca-green/50 hover:bg-franca-green/10"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-franca-green rounded-xl text-white flex-shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-franca-blue">Registrar {month}</p>
          <p className="text-sm text-gray-500">Preencha o faturamento do mês</p>
        </div>
        <ChevronRight className="w-5 h-5 text-franca-green flex-shrink-0" />
      </div>
    </motion.button>
  )
}

// ============================================
// ACHIEVEMENT CARD - Card de conquista sem emoji
// ============================================
interface AchievementCardProps {
  icon: string
  name: string
  description: string
  unlocked: boolean
  unlockedAt?: string
}

const iconMap: Record<string, React.ReactNode> = {
  rocket: <Rocket className="w-6 h-6" />,
  'trending-up': <TrendingUp className="w-6 h-6" />,
  flame: <Flame className="w-6 h-6" />,
  zap: <Zap className="w-6 h-6" />,
  gem: <Gem className="w-6 h-6" />,
  trophy: <Trophy className="w-6 h-6" />,
  target: <Target className="w-6 h-6" />,
  calendar: <Calendar className="w-6 h-6" />,
  crown: <Crown className="w-6 h-6" />,
  star: <Star className="w-6 h-6" />,
  award: <Award className="w-6 h-6" />,
  coins: <DollarSign className="w-6 h-6" />,
  ticket: <Wallet className="w-6 h-6" />,
  cake: <Sparkles className="w-6 h-6" />,
  'plane-takeoff': <Rocket className="w-6 h-6" />,
  seedling: <Sparkles className="w-6 h-6" />,
  'bar-chart': <BarChart3 className="w-6 h-6" />,
}

export function AchievementCard({ icon, name, description, unlocked, unlockedAt }: AchievementCardProps) {
  const IconComponent = iconMap[icon] || <Award className="w-6 h-6" />

  return (
    <motion.div
      whileHover={unlocked ? { scale: 1.01 } : undefined}
      className={cn(
        'relative p-4 rounded-2xl border-2 transition-all duration-200',
        unlocked
          ? 'bg-white border-franca-green/30 shadow-sm'
          : 'bg-gray-50 border-gray-200 opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2.5 rounded-xl",
          unlocked ? "bg-franca-green/10 text-franca-green" : "bg-gray-200 text-gray-400"
        )}>
          {unlocked ? IconComponent : <Lock className="w-6 h-6" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            'font-semibold',
            unlocked ? 'text-franca-blue' : 'text-gray-400'
          )}>
            {name}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          {unlocked && unlockedAt && (
            <p className="text-xs text-franca-green mt-2 flex items-center gap-1">
              <Award className="w-3 h-3" />
              {new Date(unlockedAt).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// LEVEL PROGRESS - Progresso elegante
// ============================================
interface LevelProgressProps {
  currentLevel: number
  currentPoints: number
  nextLevelPoints: number
  levelName: string
  levelIcon: string
}

export function LevelProgress({
  currentLevel,
  currentPoints,
  nextLevelPoints,
  levelName,
  levelIcon,
}: LevelProgressProps) {
  const progress = (currentPoints / nextLevelPoints) * 100
  const IconComponent = iconMap[levelIcon] || <Star className="w-8 h-8" />

  return (
    <Card>
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-franca-green/10 rounded-xl text-franca-green">
          {IconComponent}
        </div>
        <div>
          <p className="text-sm text-gray-500">Nível {currentLevel}</p>
          <p className="text-xl font-bold text-franca-blue">{levelName}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">{currentPoints} pontos</span>
          <span className="text-gray-400">{nextLevelPoints} para próximo</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-franca-green to-franca-green-dark rounded-full"
          />
        </div>
      </div>
    </Card>
  )
}