'use client'

import { Sidebar, BottomNav } from '@/components/shared'
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext'
import { useAccessLog } from '@/hooks'

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen, closeSidebar, isAdmin } = useSidebar()

  // Registra acesso do cliente
  useAccessLog()

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        isOpen={isOpen}
        onClose={closeSidebar}
        isAdmin={isAdmin}
      />

      <div className="flex-1 lg:ml-72">
        {children}
      </div>

      <BottomNav />
    </div>
  )
}

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  )
}
