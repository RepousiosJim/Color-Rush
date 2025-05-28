'use client'

import React, { useState, useEffect } from 'react'
import { X, TrendingUp, Trophy, Coins, Zap, Star, Target, Clock, Award, BarChart3 } from 'lucide-react'
import { statisticsManager } from '@/lib/statistics/StatisticsManager'
import { GameStatistics, PerformanceStats, ProgressionStats, CurrencyStats, MatchStatistics } from '@/types/statistics'

interface StatisticsModalProps {
  isOpen: boolean
  onClose: () => void
}

const StatisticsModal: React.FC<StatisticsModalProps> = ({ isOpen, onClose }) => {
  const [statistics, setStatistics] = useState<GameStatistics | null>(null)
  const [activeTab, setActiveTab] = useState<'performance' | 'progression' | 'currency' | 'matches'>('performance')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadStatistics()
    }
  }, [isOpen])

  const loadStatistics = async () => {
    setIsLoading(true)
    try {
      await statisticsManager.initialize()
      const stats = statisticsManager.getStatistics()
      setStatistics(stats)
    } catch (error) {
      console.error('Failed to load statistics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const getProgressPercentage = (current: number, total: number): number => {
    return Math.min((current / total) * 100, 100)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-md rounded-2xl border border-purple-500/30 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Statistics & Progress</h2>
              <p className="text-purple-300">Track your divine journey</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-purple-500/30">
          {[
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'progression', label: 'Progression', icon: Trophy },
            { id: 'currency', label: 'Currency', icon: Coins },
            { id: 'matches', label: 'Match Analytics', icon: Zap }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-300 border-b-2 border-purple-400 bg-purple-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
            </div>
          ) : statistics ? (
            <>
              {activeTab === 'performance' && <PerformanceTab stats={statistics.performance} />}
              {activeTab === 'progression' && <ProgressionTab stats={statistics.progression} />}
              {activeTab === 'currency' && <CurrencyTab stats={statistics.currency} />}
              {activeTab === 'matches' && <MatchesTab stats={statistics.matches} />}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400">Failed to load statistics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Performance Tab Component
const PerformanceTab: React.FC<{ stats: PerformanceStats }> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Games Played"
          value={stats.gamesPlayed}
          icon={<Target className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Win Rate"
          value={`${(stats.winRate * 100).toFixed(1)}%`}
          icon={<Trophy className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Best Score"
          value={stats.bestScore.toLocaleString()}
          icon={<Star className="w-6 h-6" />}
          color="yellow"
        />
        <StatCard
          title="Current Streak"
          value={stats.currentWinStreak}
          icon={<Zap className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Statistics */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Score Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Total Score:</span>
              <span className="text-white font-medium">{stats.totalScore.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Average Score:</span>
              <span className="text-white font-medium">{Math.round(stats.averageScore).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Best Score:</span>
              <span className="text-yellow-400 font-medium">{stats.bestScore.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Time & Efficiency */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-400" />
            Time & Efficiency
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Fastest Level:</span>
              <span className="text-white font-medium">{stats.fastestLevel}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Average Time:</span>
              <span className="text-white font-medium">{Math.round(stats.averageLevelTime)}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Best Moves:</span>
              <span className="text-green-400 font-medium">{stats.bestMovesPerLevel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Streaks */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          Streaks & Records
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Current Win Streak</span>
              <span className="text-2xl font-bold text-purple-400">{stats.currentWinStreak}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((stats.currentWinStreak / stats.bestWinStreak) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-400 mt-1">Best: {stats.bestWinStreak}</p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Play Streak</span>
              <span className="text-2xl font-bold text-blue-400">{stats.currentPlayStreak}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((stats.currentPlayStreak / stats.bestPlayStreak) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-400 mt-1">Best: {stats.bestPlayStreak}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Progression Tab Component
const ProgressionTab: React.FC<{ stats: ProgressionStats }> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* Campaign Progress */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Campaign Progress
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">{stats.campaignProgress.currentWorld}</div>
            <div className="text-gray-300">Current World</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{stats.campaignProgress.currentLevel}</div>
            <div className="text-gray-300">Current Level</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{stats.levelsCompleted}</div>
            <div className="text-gray-300">Levels Completed</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Overall Progress</span>
            <span>{stats.levelsCompleted}/{stats.totalLevels}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(stats.levelsCompleted / stats.totalLevels) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Stars & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Star Collection
          </h3>
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-yellow-400">{stats.totalStars}</div>
            <div className="text-gray-300">Total Stars</div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(stats.totalStars / stats.maxStars) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400 mt-2 text-center">{stats.totalStars}/{stats.maxStars} stars collected</p>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            Achievements
          </h3>
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-purple-400">{stats.achievements.filter(a => a.isUnlocked).length}</div>
            <div className="text-gray-300">Unlocked</div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-purple-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(stats.achievements.filter(a => a.isUnlocked).length / stats.achievements.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400 mt-2 text-center">
            {stats.achievements.filter(a => a.isUnlocked).length}/{stats.achievements.length} achievements
          </p>
        </div>
      </div>
    </div>
  )
}

// Currency Tab Component
const CurrencyTab: React.FC<{ stats: CurrencyStats }> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* Currency Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Divine Essence"
          value={stats.divineEssence.toLocaleString()}
          icon={<Coins className="w-6 h-6" />}
          color="purple"
          subtitle={`+${stats.totalEssenceEarned.toLocaleString()} earned`}
        />
        <StatCard
          title="Gems"
          value={stats.gems.toLocaleString()}
          icon={<Star className="w-6 h-6" />}
          color="blue"
          subtitle={`+${stats.totalGemsEarned.toLocaleString()} earned`}
        />
        <StatCard
          title="Player Level"
          value={stats.level}
          icon={<Trophy className="w-6 h-6" />}
          color="yellow"
          subtitle={`${stats.experience}/${stats.experienceToNext} XP`}
        />
      </div>

      {/* Experience Progress */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Experience Progress
        </h3>
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Level {stats.level}</span>
            <span>Level {stats.level + 1}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${(stats.experience / stats.experienceToNext) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            {stats.experience.toLocaleString()} / {stats.experienceToNext.toLocaleString()} XP
          </p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{stats.totalExperience.toLocaleString()}</div>
          <div className="text-gray-300">Total Experience Earned</div>
        </div>
      </div>

      {/* Currency Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Coins className="w-5 h-5 text-purple-400" />
            Divine Essence
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Current Balance:</span>
              <span className="text-purple-400 font-medium">{stats.divineEssence.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Total Earned:</span>
              <span className="text-green-400 font-medium">{stats.totalEssenceEarned.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Total Spent:</span>
              <span className="text-red-400 font-medium">{stats.totalEssenceSpent.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-blue-400" />
            Premium Gems
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Current Balance:</span>
              <span className="text-blue-400 font-medium">{stats.gems.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Total Earned:</span>
              <span className="text-green-400 font-medium">{stats.totalGemsEarned.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Total Purchased:</span>
              <span className="text-yellow-400 font-medium">{stats.totalGemsPurchased.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Matches Tab Component
const MatchesTab: React.FC<{ stats: MatchStatistics }> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* Match Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Matches"
          value={stats.totalMatches.toLocaleString()}
          icon={<Zap className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Best Combo"
          value={stats.combos.bestCombo}
          icon={<Star className="w-6 h-6" />}
          color="yellow"
        />
        <StatCard
          title="Total Combos"
          value={stats.combos.totalCombos.toLocaleString()}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Cascades"
          value={stats.cascades.totalCascades.toLocaleString()}
          icon={<Target className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Match Size Distribution */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          Match Size Distribution
        </h3>
        <div className="space-y-3">
          {Object.entries(stats.matchesBySize).map(([size, count]) => (
            <div key={size} className="flex items-center justify-between">
              <span className="text-gray-300">{size}-match:</span>
              <div className="flex items-center gap-3 flex-1 ml-4">
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(count / stats.totalMatches) * 100}%` }}
                  ></div>
                </div>
                <span className="text-white font-medium w-16 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Combo & Cascade Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Combo Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Total Combos:</span>
              <span className="text-white font-medium">{stats.combos.totalCombos.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Best Combo:</span>
              <span className="text-yellow-400 font-medium">{stats.combos.bestCombo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Average Combo:</span>
              <span className="text-white font-medium">{stats.combos.averageCombo.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Cascade Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Total Cascades:</span>
              <span className="text-white font-medium">{stats.cascades.totalCascades.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Best Cascade:</span>
              <span className="text-purple-400 font-medium">{stats.cascades.bestCascade}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Average Score:</span>
              <span className="text-white font-medium">{Math.round(stats.cascades.averageCascadeScore).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Reusable Stat Card Component
interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red'
  subtitle?: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    green: 'text-green-400 bg-green-500/10 border-green-500/30',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    red: 'text-red-400 bg-red-500/10 border-red-500/30'
  }

  return (
    <div className={`${colorClasses[color]} rounded-xl p-4 border`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-gray-300">{title}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
    </div>
  )
}

export default StatisticsModal 