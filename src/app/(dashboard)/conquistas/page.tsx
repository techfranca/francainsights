'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trophy, Star, Award } from 'lucide-react'
import { Header, PageHeader } from '@/components/shared'
import { useSidebar } from '@/contexts/SidebarContext'
import { AchievementCard, LevelProgress } from '@/components/dashboard/cards'
import { Card, Spinner } from '@/components/ui'
import { ACHIEVEMENT_DEFINITIONS, LEVELS } from '@/types'

interface ClientAchievement {
  achievement_id: string
  unlocked_at: string
  achievements: {
    code: string
    name: string
    description: string
    icon: string
    points: number
  }
}

export default function ConquistasPage() {
  const router = useRouter()
  const { openSidebar, setIsAdmin } = useSidebar()
  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState<any>(null)
  const [unlockedAchievements, setUnlockedAchievements] = useState<ClientAchievement[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [clientRes, achievementsRes] = await Promise.all([
        fetch('/api/clients/me'),
        fetch('/api/achievements'),
      ])

      if (!clientRes.ok) {
        router.push('/login')
        return
      }

      const clientData = await clientRes.json()
      const achievementsData = await achievementsRes.json()

      setClient(clientData.client)
      setIsAdmin(clientData.is_admin || false)
      setUnlockedAchievements(achievementsData.achievements || [])
    } catch (error) {
      console.error('Erro ao carregar conquistas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500 mt-3">Carregando conquistas...</p>
        </div>
      </div>
    )
  }

  const unlockedCodes = unlockedAchievements.map((a) => a.achievements?.code)
  const totalPoints = client?.total_points || 0
  
  const currentLevel = LEVELS.reduce((level, l) => {
    if (totalPoints >= l.min_points) return l
    return level
  }, LEVELS[0])

  const nextLevel = LEVELS.find((l) => l.min_points > totalPoints) || LEVELS[LEVELS.length - 1]
  const pointsToNext = nextLevel.min_points - totalPoints

  return (
    <>
      <Header
        clientName={client?.name || ''}
        companyName={client?.company_name || ''}
        onMenuClick={openSidebar}
      />

      <main className="p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 max-w-5xl mx-auto">
        <PageHeader
          title="Conquistas"
          subtitle={`${unlockedAchievements.length} de ${ACHIEVEMENT_DEFINITIONS.length} desbloqueadas`}
        />

        {/* Progresso de nível */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <LevelProgress
            currentLevel={currentLevel.level}
            currentPoints={totalPoints}
            nextLevelPoints={nextLevel.min_points}
            levelName={currentLevel.name}
            levelIcon={currentLevel.icon}
          />
        </motion.div>

        {/* Resumo de pontos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-r from-franca-green/5 to-franca-green/10 border border-franca-green/15">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-franca-green rounded-xl text-white flex-shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500">Total de pontos</p>
                <p className="text-2xl sm:text-3xl font-bold text-franca-blue">{totalPoints}</p>
              </div>
              {pointsToNext > 0 && (
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">Faltam</p>
                  <p className="text-lg font-semibold text-franca-green">{pointsToNext} pts</p>
                  <p className="text-xs text-gray-400">para {nextLevel.name}</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Seção de conquistas desbloqueadas */}
        {unlockedAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-franca-green" />
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Desbloqueadas</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {ACHIEVEMENT_DEFINITIONS.filter((a) => unlockedCodes.includes(a.code)).map((achievement, index) => {
                const unlockedData = unlockedAchievements.find(
                  (a) => a.achievements?.code === achievement.code
                )
                return (
                  <motion.div
                    key={achievement.code}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.03 }}
                  >
                    <AchievementCard
                      icon={achievement.icon}
                      name={achievement.name}
                      description={achievement.description}
                      unlocked={true}
                      unlockedAt={unlockedData?.unlocked_at}
                    />
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Seção de conquistas bloqueadas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">A desbloquear</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {ACHIEVEMENT_DEFINITIONS.filter((a) => !unlockedCodes.includes(a.code)).map((achievement, index) => (
              <motion.div
                key={achievement.code}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.03 }}
              >
                <AchievementCard
                  icon={achievement.icon}
                  name={achievement.name}
                  description={achievement.description}
                  unlocked={false}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </>
  )
}
