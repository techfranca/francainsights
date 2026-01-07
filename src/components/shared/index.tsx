'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  PlusCircle,
  History,
  Trophy,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Users,
  Sun,
  Sunrise,
  Moon,
  Calendar,
  TrendingUp,
  Users2,
} from 'lucide-react'
import { cn, getGreeting, getFirstName } from '@/lib/utils'
import { Avatar } from '@/components/ui'
import { formatPartnershipTime } from '@/types'

// ============================================
// LOGO - Logotipo da Franca
// ============================================
interface LogoProps {
  variant?: 'full' | 'icon'
  className?: string
}

export function Logo({ variant = 'full', className }: LogoProps) {
  if (variant === 'icon') {
    return (
      <svg viewBox="0 0 40 40" className={cn('w-10 h-10', className)}>
        <path
          d="M5 35L20 5L35 20L20 35H5Z"
          fill="#7DE08D"
        />
        <path
          d="M20 5L35 5L35 20L20 5Z"
          fill="#598F74"
        />
        <text x="12" y="28" fontFamily="Poppins" fontWeight="bold" fontSize="14" fill="#081534">F</text>
        <circle cx="32" cy="32" r="4" fill="#081534" />
      </svg>
    )
  }

  return (
    <Link href="/dashboard" className={cn('flex items-center gap-2', className)}>
      <Logo variant="icon" />
      <span className="text-xl font-bold text-franca-blue">
        <span className="text-franca-green">F</span>RANCA
        <span className="text-franca-blue">.</span>
      </span>
    </Link>
  )
}

// ============================================
// GREETING ICON - Ícone baseado na hora
// ============================================
function GreetingIcon() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) {
    return <Sunrise className="w-4 h-4 text-amber-500" />
  } else if (hour >= 12 && hour < 18) {
    return <Sun className="w-4 h-4 text-amber-500" />
  } else {
    return <Moon className="w-4 h-4 text-indigo-400" />
  }
}

// ============================================
// HEADER - Cabeçalho do dashboard com parceria
// ============================================
interface HeaderProps {
  clientName: string
  companyName: string
  onMenuClick?: () => void
  partnershipMonths?: number
}

export function Header({ clientName, companyName, onMenuClick, partnershipMonths }: HeaderProps) {
  const greeting = getGreeting()
  const firstName = getFirstName(clientName)

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-gray-100">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Menu mobile */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
            >
              <Menu className="w-6 h-6 text-franca-blue" />
            </button>

            <div className="min-w-0">
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <GreetingIcon />
                {greeting}
              </p>
              <h1 className="text-lg sm:text-xl font-bold text-franca-blue truncate">{firstName}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Badge de Parceria - Desktop */}
{partnershipMonths !== undefined && partnershipMonths > 0 && (
  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-franca-green/15 border border-franca-green/30 rounded-full">
    <Users2 className="w-3.5 h-3.5 text-franca-green-dark" />
    <span className="text-xs font-semibold text-franca-green-dark">
      Parceria Ativa: <span className="font-bold">{formatPartnershipTime(partnershipMonths)}</span>
    </span>
  </div>
)}

            {/* Badge de Parceria - Mobile */}
{partnershipMonths !== undefined && partnershipMonths > 0 && (
  <div className="sm:hidden flex items-center gap-1.5 px-2.5 py-1.5 bg-franca-green/15 border border-franca-green/30 rounded-full">
    <Users2 className="w-3 h-3 text-franca-green-dark" />
    <span className="text-[10px] font-semibold text-franca-green-dark">{formatPartnershipTime(partnershipMonths)}</span>
  </div>
)}

            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-franca-blue truncate max-w-[150px]">{companyName}</p>
            </div>
            <Avatar name={clientName} />
          </div>
        </div>
      </div>
    </header>
  )
}

// ============================================
// SIDEBAR - Menu lateral
// ============================================
interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  isAdmin?: boolean
}

const menuItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/registrar', icon: PlusCircle, label: 'Registrar Vendas' },
  { href: '/historico', icon: History, label: 'Histórico' },
  { href: '/conquistas', icon: Trophy, label: 'Conquistas' },
]

const adminItems = [
  { href: '/admin', icon: Users, label: 'Clientes' },
]

export function Sidebar({ isOpen, onClose, isAdmin }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const isActive = pathname === href || (href === '/dashboard' && pathname === '/')

    const handleClick = () => {
      if (window.innerWidth < 1024) {
        onClose()
      }
    }

    return (
      <Link
        href={href}
        onClick={handleClick}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
          isActive
            ? 'bg-franca-green text-franca-blue font-semibold'
            : 'text-gray-600 hover:bg-gray-100'
        )}
      >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
        {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
      </Link>
    )
  }

  return (
    <>
      {/* Overlay mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-72 bg-white border-r border-gray-100',
          'transform transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo e close */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <Logo />
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}

            {isAdmin && (
              <>
                <div className="my-4 border-t border-gray-100" />
                <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Administração
                </p>
                {adminItems.map((item) => (
                  <NavItem key={item.href} {...item} />
                ))}
              </>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

// ============================================
// BOTTOM NAV - Navegação mobile inferior
// ============================================
export function BottomNav() {
  const pathname = usePathname()

  const items = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Início' },
    { href: '/registrar', icon: PlusCircle, label: 'Registrar' },
    { href: '/historico', icon: History, label: 'Histórico' },
    { href: '/conquistas', icon: Trophy, label: 'Conquistas' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-100 lg:hidden safe-bottom">
      <div className="flex items-center justify-around py-2 px-2">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-[60px]',
                isActive ? 'text-franca-green' : 'text-gray-400'
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// ============================================
// PAGE HEADER - Cabeçalho de página interna
// ============================================
interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-franca-blue">{title}</h1>
        {subtitle && <p className="text-gray-500 mt-1 text-sm sm:text-base">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ============================================
// SHAREABLE CARD - Card para compartilhar
// ============================================
interface ShareableCardProps {
  clientName: string
  companyName: string
  revenue: number
  growthPercent: number | null
  month: string
  isRecord?: boolean
}

export function ShareableCard({
  clientName,
  companyName,
  revenue,
  growthPercent,
  month,
  isRecord,
}: ShareableCardProps) {
  return (
    <div
      id="shareable-card"
      className="w-full max-w-md mx-auto aspect-square bg-gradient-to-br from-franca-blue to-franca-blue-hover rounded-3xl p-8 text-white relative overflow-hidden"
    >
      {/* Decorações */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-franca-green/20 rounded-full -translate-y-24 translate-x-24" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-franca-green/10 rounded-full translate-y-16 -translate-x-16" />

      <div className="relative h-full flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Logo variant="icon" className="w-12 h-12" />
          {isRecord && (
            <span className="px-3 py-1 bg-franca-green text-franca-blue text-xs font-bold rounded-full flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              RECORDE
            </span>
          )}
        </div>

        {/* Content */}
        <div className="text-center">
          <p className="text-white/60 text-sm mb-2">{month}</p>
          <p className="text-5xl font-bold mb-4">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              minimumFractionDigits: 0,
            }).format(revenue)}
          </p>
          {growthPercent !== null && (
            <p className={cn(
              'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold',
              growthPercent >= 0 ? 'bg-franca-green/20 text-franca-green' : 'bg-red-500/20 text-red-300'
            )}>
              <TrendingUp className="w-3.5 h-3.5" />
              {growthPercent >= 0 ? '+' : ''}{growthPercent.toFixed(1)}%
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="font-semibold">{companyName}</p>
          <p className="text-white/60 text-sm">Acompanhado pela Franca Assessoria</p>
        </div>
      </div>
    </div>
  )
}