'use client'

import React, { useState, useEffect } from 'react'
import { X, Star, Lock, Trophy, Target, Clock, Zap, Map, ChevronRight, Crown } from 'lucide-react'

// For now, let's define the interfaces here until we have the proper LevelProgressionManager
interface GameLevel {
  id: number
  worldId: number
  type: 'score' | 'moves' | 'time' | 'clear' | 'combo' | 'cascade' | 'boss'
  name: string
  description: string
  targetScore: number
  maxMoves?: number
  timeLimit?: number
  clearTarget?: { gemType: string; count: number }
  comboTarget?: number
  cascadeTarget?: number
  starRequirements: {
    onestar: { score: number; moves?: number; time?: number }
    twostar: { score: number; moves?: number; time?: number }
    threestar: { score: number; moves?: number; time?: number }
  }
  rewards: {
    essence: number
    experience: number
    gems?: number
  }
  isUnlocked: boolean
  isCompleted: boolean
  bestScore: number
  bestMoves: number
  bestTime: number
  stars: number
  completedAt?: Date
}

interface GameWorld {
  id: number
  name: string
  theme: string
  description: string
  symbol: string
  color: string
  backgroundGradient: string
  levels: GameLevel[]
  totalLevels: number
  unlockRequirements: {
    previousWorldStars?: number
    levelsCompleted?: number
  }
  isUnlocked: boolean
  isCompleted: boolean
  starsEarned: number
  levelsCompleted: number
  completedAt?: Date
}

interface CampaignInterfaceProps {
  isOpen: boolean
  onClose: () => void
  onStartLevel: (worldId: number, levelId: number) => void
}

const CampaignInterface = ({ isOpen, onClose, onStartLevel }: CampaignInterfaceProps): React.ReactElement | null => {
  const [worlds, setWorlds] = useState<GameWorld[]>([])
  const [selectedWorld, setSelectedWorld] = useState<GameWorld | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<GameLevel | null>(null)
  const [showLevelDetails, setShowLevelDetails] = useState(false)
  const [progressStats, setProgressStats] = useState({
    totalWorlds: 0,
    worldsUnlocked: 0,
    worldsCompleted: 0,
    totalLevels: 0,
    levelsCompleted: 0,
    totalStars: 0,
    maxStars: 0,
    progressPercentage: 0
  })

  // Mock data for now - this will be replaced with the actual levelProgressionManager
  const mockWorlds: GameWorld[] = [
    {
      id: 1,
      name: 'Infernal Forge',
      theme: 'fire',
      description: 'Where divine flames burn eternal and forge the strongest gems',
      symbol: '🔥',
      color: '#FF4500',
      backgroundGradient: 'linear-gradient(135deg, #FF4500, #DC143C, #8B0000)',
      unlockRequirements: {},
      totalLevels: 5,
      isUnlocked: true,
      isCompleted: false,
      starsEarned: 8,
      levelsCompleted: 3,
      levels: [
        {
          id: 1, worldId: 1, type: 'score', name: 'Ember Trial',
          description: 'Learn the basics of divine flame manipulation',
          targetScore: 1000, maxMoves: 25,
          starRequirements: {
            onestar: { score: 1000, moves: 25 },
            twostar: { score: 1500, moves: 20 },
            threestar: { score: 2000, moves: 15 }
          },
          rewards: { essence: 50, experience: 100 },
          isUnlocked: true, isCompleted: true, bestScore: 1800, bestMoves: 18, bestTime: 0, stars: 2
        },
        {
          id: 2, worldId: 1, type: 'clear', name: 'Flame Harvest',
          description: 'Clear fire gems to stoke the eternal flames',
          targetScore: 1200, clearTarget: { gemType: 'fire', count: 30 }, maxMoves: 30,
          starRequirements: {
            onestar: { score: 1200, moves: 30 },
            twostar: { score: 1800, moves: 25 },
            threestar: { score: 2400, moves: 20 }
          },
          rewards: { essence: 75, experience: 150 },
          isUnlocked: true, isCompleted: true, bestScore: 2100, bestMoves: 22, bestTime: 0, stars: 3
        },
        {
          id: 3, worldId: 1, type: 'combo', name: 'Infernal Chains',
          description: 'Master the art of consecutive fire combinations',
          targetScore: 1500, comboTarget: 5, maxMoves: 35,
          starRequirements: {
            onestar: { score: 1500, moves: 35 },
            twostar: { score: 2250, moves: 30 },
            threestar: { score: 3000, moves: 25 }
          },
          rewards: { essence: 100, experience: 200 },
          isUnlocked: true, isCompleted: true, bestScore: 2800, bestMoves: 28, bestTime: 0, stars: 3
        },
        {
          id: 4, worldId: 1, type: 'time', name: 'Rapid Burn',
          description: 'Race against time in the forge of flames',
          targetScore: 2000, timeLimit: 120,
          starRequirements: {
            onestar: { score: 2000, time: 120 },
            twostar: { score: 2800, time: 90 },
            threestar: { score: 3600, time: 60 }
          },
          rewards: { essence: 125, experience: 250 },
          isUnlocked: true, isCompleted: false, bestScore: 0, bestMoves: 0, bestTime: 0, stars: 0
        },
        {
          id: 5, worldId: 1, type: 'boss', name: 'Flame Lord',
          description: 'Face the guardian of the Infernal Forge',
          targetScore: 4000, maxMoves: 40,
          starRequirements: {
            onestar: { score: 4000, moves: 40 },
            twostar: { score: 6000, moves: 35 },
            threestar: { score: 8000, moves: 30 }
          },
          rewards: { essence: 250, experience: 500, gems: 10 },
          isUnlocked: false, isCompleted: false, bestScore: 0, bestMoves: 0, bestTime: 0, stars: 0
        }
      ]
    },
    {
      id: 2,
      name: 'Celestial Ocean',
      theme: 'water',
      description: 'Where divine waters flow with ancient wisdom and power',
      symbol: '💧',
      color: '#1E90FF',
      backgroundGradient: 'linear-gradient(135deg, #1E90FF, #4169E1, #000080)',
      unlockRequirements: { previousWorldStars: 10 },
      totalLevels: 5,
      isUnlocked: false,
      isCompleted: false,
      starsEarned: 0,
      levelsCompleted: 0,
      levels: []
    }
  ]

  useEffect(() => {
    if (isOpen) {
      loadCampaignData()
    }
  }, [isOpen])

  const loadCampaignData = () => {
    // Mock implementation - replace with levelProgressionManager.getAllWorlds()
    const allWorlds = mockWorlds
    const stats = {
      totalWorlds: allWorlds.length,
      worldsUnlocked: allWorlds.filter(w => w.isUnlocked).length,
      worldsCompleted: allWorlds.filter(w => w.isCompleted).length,
      totalLevels: allWorlds.reduce((sum, world) => sum + world.totalLevels, 0),
      levelsCompleted: allWorlds.reduce((sum, world) => sum + world.levelsCompleted, 0),
      totalStars: allWorlds.reduce((sum, world) => sum + world.starsEarned, 0),
      maxStars: allWorlds.reduce((sum, world) => sum + world.totalLevels, 0) * 3,
      progressPercentage: 0
    }
    stats.progressPercentage = (stats.levelsCompleted / stats.totalLevels) * 100
    
    setWorlds(allWorlds)
    setProgressStats(stats)
    
    // Auto-select first unlocked world
    const firstUnlocked = allWorlds.find(w => w.isUnlocked && !w.isCompleted) || allWorlds[0]
    if (firstUnlocked) {
      setSelectedWorld(firstUnlocked)
    }
  }

  const handleWorldSelect = (world: GameWorld) => {
    if (!world.isUnlocked) return
    setSelectedWorld(world)
    setSelectedLevel(null)
    setShowLevelDetails(false)
  }

  const handleLevelSelect = (level: GameLevel) => {
    if (!level.isUnlocked) return
    setSelectedLevel(level)
    setShowLevelDetails(true)
  }

  const handleStartLevel = () => {
    if (selectedLevel && selectedWorld) {
      onStartLevel(selectedWorld.id, selectedLevel.id)
      onClose()
    }
  }

  const getLevelTypeIcon = (type: string) => {
    switch (type) {
      case 'score': return <Target className="w-4 h-4" />
      case 'time': return <Clock className="w-4 h-4" />
      case 'clear': return <Zap className="w-4 h-4" />
      case 'combo': return <Star className="w-4 h-4" />
      case 'cascade': return <ChevronRight className="w-4 h-4" />
      case 'boss': return <Crown className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  const getLevelTypeColor = (type: string) => {
    switch (type) {
      case 'score': return 'text-blue-400'
      case 'time': return 'text-yellow-400'
      case 'clear': return 'text-green-400'
      case 'combo': return 'text-purple-400'
      case 'cascade': return 'text-cyan-400'
      case 'boss': return 'text-red-400'
      default: return 'text-blue-400'
    }
  }

  const renderStars = (stars: number, maxStars: number = 3) => {
    const starElements = []
    for (let i = 0; i < maxStars; i++) {
      starElements.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < stars 
              ? 'text-yellow-400 fill-yellow-400' 
              : 'text-gray-600'
          }`}
        />
      )
    }
    return <div className="flex gap-1">{starElements}</div>
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-md rounded-2xl border border-purple-500/30 w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
          <div className="flex items-center gap-3">
            <Map className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Divine Campaign</h2>
              <p className="text-purple-300">Embark on your celestial journey</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Progress Overview */}
        <div className="p-6 border-b border-purple-500/30">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{progressStats.totalStars}</div>
              <div className="text-sm text-gray-300">Total Stars</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{progressStats.levelsCompleted}</div>
              <div className="text-sm text-gray-300">Levels Completed</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{progressStats.worldsCompleted}</div>
              <div className="text-sm text-gray-300">Worlds Completed</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{progressStats.progressPercentage.toFixed(1)}%</div>
              <div className="text-sm text-gray-300">Overall Progress</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressStats.progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* World Selection */}
          <div className="w-1/3 border-r border-purple-500/30 p-6 overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-4">Divine Realms</h3>
            <div className="space-y-3">
              {worlds.map(world => (
                <div
                  key={world.id}
                  onClick={() => handleWorldSelect(world as GameWorld)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    world.isUnlocked
                      ? selectedWorld?.id === world.id
                        ? 'bg-purple-500/20 border-purple-400'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                      : 'bg-gray-800/50 border-gray-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{world.symbol}</span>
                      <div>
                        <div className="font-semibold text-white">{world.name}</div>
                        <div className="text-sm text-gray-300">{world.theme}</div>
                      </div>
                    </div>
                    {!world.isUnlocked && <Lock className="w-4 h-4 text-gray-400" />}
                    {world.isCompleted && <Trophy className="w-4 h-4 text-yellow-400" />}
                  </div>
                  
                  <div className="text-xs text-gray-400 mb-2">{world.description}</div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-300">
                      {world.levelsCompleted}/{world.totalLevels} levels
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(world.starsEarned, world.totalLevels * 3)}
                      <span className="text-xs text-gray-400 ml-1">
                        {world.starsEarned}/{world.totalLevels * 3}
                      </span>
                    </div>
                  </div>
                  
                  {world.isUnlocked && (
                    <div className="mt-2 w-full bg-gray-700 rounded-full h-1">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full transition-all duration-500"
                        style={{ width: `${(world.levelsCompleted / world.totalLevels) * 100}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Level Selection */}
          {selectedWorld && (
            <div className="w-1/3 border-r border-purple-500/30 p-6 overflow-y-auto">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-white">{selectedWorld.name}</h3>
                <p className="text-gray-300 text-sm">{selectedWorld.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {selectedWorld.levels.map(level => (
                  <div
                    key={level.id}
                    onClick={() => handleLevelSelect(level)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      level.isUnlocked
                        ? selectedLevel?.id === level.id
                          ? 'bg-blue-500/20 border-blue-400'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                        : 'bg-gray-800/50 border-gray-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`${getLevelTypeColor(level.type)}`}>
                          {getLevelTypeIcon(level.type)}
                        </span>
                        <span className="font-medium text-white">{level.id}</span>
                      </div>
                      {!level.isUnlocked && <Lock className="w-3 h-3 text-gray-400" />}
                      {level.isCompleted && <Trophy className="w-3 h-3 text-yellow-400" />}
                    </div>
                    
                    <div className="text-sm font-medium text-white mb-1">{level.name}</div>
                    <div className="text-xs text-gray-400 mb-2">{level.type}</div>
                    
                    {level.isCompleted && (
                      <div className="flex justify-between items-center">
                        {renderStars(level.stars)}
                        <div className="text-xs text-gray-300">
                          {level.bestScore.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Level Details */}
          {selectedLevel && showLevelDetails && (
            <div className="w-1/3 p-6 overflow-y-auto">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`${getLevelTypeColor(selectedLevel.type)}`}>
                    {getLevelTypeIcon(selectedLevel.type)}
                  </span>
                  <h3 className="text-xl font-semibold text-white">{selectedLevel.name}</h3>
                </div>
                <p className="text-gray-300 text-sm">{selectedLevel.description}</p>
              </div>

              {/* Objectives */}
              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-white mb-3">Objectives</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Target Score:</span>
                    <span className="text-white">{selectedLevel.targetScore.toLocaleString()}</span>
                  </div>
                  {selectedLevel.maxMoves && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Max Moves:</span>
                      <span className="text-white">{selectedLevel.maxMoves}</span>
                    </div>
                  )}
                  {selectedLevel.timeLimit && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Time Limit:</span>
                      <span className="text-white">{selectedLevel.timeLimit}s</span>
                    </div>
                  )}
                  {selectedLevel.clearTarget && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Clear Target:</span>
                      <span className="text-white">
                        {selectedLevel.clearTarget.count} {selectedLevel.clearTarget.gemType} gems
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Star Requirements */}
              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-white mb-3">Star Requirements</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(selectedLevel.starRequirements).map(([star, req]) => {
                    const requirement = req as { score: number; moves?: number; time?: number }
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <div className="flex">
                          {renderStars(star === 'onestar' ? 1 : star === 'twostar' ? 2 : 3)}
                        </div>
                        <span className="text-gray-300">
                          {requirement.score.toLocaleString()} points
                          {requirement.moves && ` in ≤${requirement.moves} moves`}
                          {requirement.time && ` in ≤${requirement.time}s`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Rewards */}
              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-white mb-3">Rewards</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Divine Essence:</span>
                    <span className="text-purple-400">{selectedLevel.rewards.essence}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Experience:</span>
                    <span className="text-green-400">{selectedLevel.rewards.experience}</span>
                  </div>
                  {selectedLevel.rewards.gems && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Gems:</span>
                      <span className="text-blue-400">{selectedLevel.rewards.gems}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Best */}
              {selectedLevel.isCompleted && (
                <div className="bg-white/5 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-white mb-3">Personal Best</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Best Score:</span>
                      <span className="text-white">{selectedLevel.bestScore.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Best Moves:</span>
                      <span className="text-white">{selectedLevel.bestMoves}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Stars Earned:</span>
                      <div>{renderStars(selectedLevel.stars)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleStartLevel}
                disabled={!selectedLevel.isUnlocked}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  selectedLevel.isUnlocked
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {selectedLevel.isUnlocked 
                  ? selectedLevel.isCompleted ? 'Replay Level' : 'Start Level'
                  : 'Level Locked'
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CampaignInterface 