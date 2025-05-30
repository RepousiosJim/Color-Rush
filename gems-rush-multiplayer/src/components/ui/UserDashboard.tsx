'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Trophy, 
  Star, 
  TrendingUp, 
  Calendar, 
  Award, 
  Target, 
  Clock, 
  Flame,
  Crown,
  Edit3,
  X,
  Check
} from 'lucide-react'

interface UserStats {
  level: number
  xp: number
  coins: number
  gems: number
  streak: number
  gamesPlayed: number
  totalScore: number
  averageScore: number
  bestScore: number
  dailyChallengeCompleted: boolean
  achievements: Achievement[]
  favoriteMode: string
  totalPlayTime: number
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum'
  unlockedAt?: Date
  progress?: number
  maxProgress?: number
}

interface UserDashboardProps {
  isVisible: boolean
  onClose: () => void
  userStats: UserStats
  onUpdateProfile: (updates: Partial<UserStats>) => void
}

const rarityColors = {
  bronze: 'bg-amber-600',
  silver: 'bg-gray-400',
  gold: 'bg-yellow-500',
  platinum: 'bg-purple-500'
}

const rarityGradients = {
  bronze: 'from-amber-600 to-amber-800',
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-purple-500 to-purple-700'
}

export default function UserDashboard({ 
  isVisible, 
  onClose, 
  userStats, 
  onUpdateProfile 
}: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'statistics'>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [editingStats, setEditingStats] = useState(userStats)

  useEffect(() => {
    setEditingStats(userStats)
  }, [userStats])

  const handleSaveProfile = () => {
    onUpdateProfile(editingStats)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditingStats(userStats)
    setIsEditing(false)
  }

  const xpToNextLevel = (level: number) => {
    return level * 1000
  }

  const currentLevelXP = userStats.xp % xpToNextLevel(userStats.level)
  const xpNeeded = xpToNextLevel(userStats.level)
  const progressPercentage = (currentLevelXP / xpNeeded) * 100

  const mockAchievements: Achievement[] = [
    {
      id: 'first-match',
      name: 'First Steps',
      description: 'Complete your first match',
      icon: '🎯',
      rarity: 'bronze',
      unlockedAt: new Date()
    },
    {
      id: 'score-master',
      name: 'Score Master',
      description: 'Reach 10,000 points in a single game',
      icon: '🏆',
      rarity: 'gold',
      progress: userStats.bestScore,
      maxProgress: 10000
    },
    {
      id: 'streak-warrior',
      name: 'Streak Warrior',
      description: 'Maintain a 7-day play streak',
      icon: '🔥',
      rarity: 'silver',
      progress: userStats.streak,
      maxProgress: 7
    },
    {
      id: 'gem-collector',
      name: 'Gem Collector',
      description: 'Collect 1000 gems',
      icon: '💎',
      rarity: 'platinum',
      progress: userStats.gems,
      maxProgress: 1000
    }
  ]

  const formatPlayTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-4xl mx-4 bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          {/* Header */}
          <div className="relative p-6 border-b border-white/20">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-6">
              {/* Profile Avatar */}
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-4xl">
                  👑
                </div>
                <div className={`absolute -bottom-1 -right-1 w-8 h-8 ${rarityColors.gold} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                  {userStats.level}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-white">Gem Master</h2>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfile}
                        className="p-1 text-green-400 hover:text-green-300 transition-colors"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 text-white/60 hover:text-white transition-colors"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <div className="text-white/80 mb-3">Level {userStats.level} Divine Warrior</div>
                
                {/* XP Progress */}
                <div className="w-full max-w-md">
                  <div className="flex justify-between text-sm text-white/60 mb-1">
                    <span>{currentLevelXP.toLocaleString()} XP</span>
                    <span>{xpNeeded.toLocaleString()} XP</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <motion.div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-yellow-400 text-2xl font-bold">{userStats.coins.toLocaleString()}</div>
                  <div className="text-white/60 text-sm">Coins</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-purple-400 text-2xl font-bold">{userStats.gems}</div>
                  <div className="text-white/60 text-sm">Gems</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-orange-400 text-2xl font-bold">{userStats.streak}</div>
                  <div className="text-white/60 text-sm">Streak</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-green-400 text-2xl font-bold">{userStats.gamesPlayed}</div>
                  <div className="text-white/60 text-sm">Games</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-white/20">
            <div className="flex">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'achievements', label: 'Achievements', icon: Trophy },
                { id: 'statistics', label: 'Statistics', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'text-white border-b-2 border-purple-400 bg-white/5'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Recent Activity */}
                  <div className="bg-white/5 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-purple-400" />
                      Recent Activity
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="text-white font-medium">High Score Achieved!</div>
                            <div className="text-white/60 text-sm">Scored {userStats.bestScore.toLocaleString()} points</div>
                          </div>
                        </div>
                        <div className="text-white/60 text-sm">Today</div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                            <Flame className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="text-white font-medium">{userStats.streak} Day Streak</div>
                            <div className="text-white/60 text-sm">Keep it up!</div>
                          </div>
                        </div>
                        <div className="text-white/60 text-sm">Active</div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white/5 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Target className="w-6 h-6 text-purple-400" />
                      Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <button className="p-4 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl text-white hover:from-purple-700 hover:to-purple-900 transition-all duration-200 transform hover:scale-105">
                        <Star className="w-8 h-8 mx-auto mb-2" />
                        <div className="font-medium">Daily Challenge</div>
                      </button>
                      <button className="p-4 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl text-white hover:from-blue-700 hover:to-blue-900 transition-all duration-200 transform hover:scale-105">
                        <Trophy className="w-8 h-8 mx-auto mb-2" />
                        <div className="font-medium">Leaderboard</div>
                      </button>
                      <button className="p-4 bg-gradient-to-br from-green-600 to-green-800 rounded-xl text-white hover:from-green-700 hover:to-green-900 transition-all duration-200 transform hover:scale-105">
                        <Clock className="w-8 h-8 mx-auto mb-2" />
                        <div className="font-medium">Time Attack</div>
                      </button>
                      <button className="p-4 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-xl text-white hover:from-yellow-700 hover:to-yellow-900 transition-all duration-200 transform hover:scale-105">
                        <Crown className="w-8 h-8 mx-auto mb-2" />
                        <div className="font-medium">Campaign</div>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'achievements' && (
                <motion.div
                  key="achievements"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="grid gap-4">
                    {mockAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`relative p-4 rounded-xl border transition-all duration-200 ${
                          achievement.unlockedAt
                            ? `bg-gradient-to-r ${rarityGradients[achievement.rarity]} border-white/20`
                            : 'bg-white/5 border-white/10 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${
                            achievement.unlockedAt ? 'bg-white/20' : 'bg-white/10'
                          }`}>
                            {achievement.icon}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-white">{achievement.name}</h4>
                            <p className="text-white/80 text-sm mb-2">{achievement.description}</p>
                            
                            {achievement.progress !== undefined && achievement.maxProgress && (
                              <div className="w-full bg-white/20 rounded-full h-2">
                                <div
                                  className="bg-white rounded-full h-2 transition-all duration-500"
                                  style={{ width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` }}
                                />
                              </div>
                            )}
                            
                            {achievement.unlockedAt && (
                              <div className="text-white/60 text-xs mt-1">
                                Unlocked {achievement.unlockedAt.toLocaleDateString()}
                              </div>
                            )}
                          </div>

                          <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${rarityColors[achievement.rarity]}`}>
                            {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'statistics' && (
                <motion.div
                  key="statistics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-white mb-4">Game Statistics</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">Games Played</span>
                          <span className="text-white font-bold">{userStats.gamesPlayed}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">Total Score</span>
                          <span className="text-white font-bold">{userStats.totalScore.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">Average Score</span>
                          <span className="text-white font-bold">{userStats.averageScore.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">Best Score</span>
                          <span className="text-yellow-400 font-bold">{userStats.bestScore.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">Favorite Mode</span>
                          <span className="text-white font-bold">{userStats.favoriteMode}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">Total Play Time</span>
                          <span className="text-white font-bold">{formatPlayTime(userStats.totalPlayTime)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-white mb-4">Progress</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white/80">Current Level</span>
                            <span className="text-purple-400 font-bold">Level {userStats.level}</span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <div className="text-white/60 text-sm mt-1">
                            {(xpNeeded - currentLevelXP).toLocaleString()} XP to next level
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">Current Streak</span>
                          <span className="text-orange-400 font-bold flex items-center gap-1">
                            <Flame className="w-4 h-4" />
                            {userStats.streak} days
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">Achievements</span>
                          <span className="text-blue-400 font-bold">
                            {mockAchievements.filter(a => a.unlockedAt).length}/{mockAchievements.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 