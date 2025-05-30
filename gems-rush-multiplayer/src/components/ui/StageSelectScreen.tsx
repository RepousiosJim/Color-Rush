'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { stageSystem, Stage } from '@/lib/game/StageSystem'

interface StageSelectScreenProps {
  onStageSelect: (stageNumber: number) => void
  onBackToMenu: () => void
}

export default function StageSelectScreen({ onStageSelect, onBackToMenu }: StageSelectScreenProps) {
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null)
  const allStages = stageSystem.getAllStages()
  const stageProgress = stageSystem.getProgress()

  const handleStageClick = (stage: Stage) => {
    if (stageSystem.isStageUnlocked(stage.id)) {
      setSelectedStage(stage)
    }
  }

  const handlePlayStage = () => {
    if (selectedStage) {
      onStageSelect(selectedStage.id)
    }
  }

  const renderStageCard = (stage: Stage) => {
    const isUnlocked = stageSystem.isStageUnlocked(stage.id)
    const isCompleted = stageSystem.isStageCompleted(stage.id)
    const stars = stageSystem.getStageStars(stage.id)
    const isCurrent = stageProgress.currentStage === stage.id
    const isSelected = selectedStage?.id === stage.id

    return (
      <motion.div
        key={stage.id}
        className={`
          relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300
          ${isUnlocked 
            ? isSelected 
              ? 'border-yellow-400 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 shadow-lg shadow-yellow-400/30'
              : 'border-white/20 bg-gradient-to-br from-purple-600/20 to-blue-600/20 hover:border-white/40 hover:shadow-lg'
            : 'border-gray-600 bg-gray-800/50 cursor-not-allowed opacity-60'
          }
          ${stage.isBoss ? 'ring-2 ring-red-500/50' : ''}
        `}
        onClick={() => handleStageClick(stage)}
        whileHover={isUnlocked ? { scale: 1.05, y: -5 } : {}}
        whileTap={isUnlocked ? { scale: 0.95 } : {}}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: stage.id * 0.05 }}
      >
        {/* Stage number */}
        <div className="text-center mb-2">
          <div className={`
            text-2xl font-bold
            ${stage.isBoss ? 'text-red-400' : isCompleted ? 'text-green-400' : 'text-white'}
          `}>
            {stage.id}
          </div>
          {stage.isBoss && (
            <div className="text-xs text-red-300 font-semibold">BOSS</div>
          )}
        </div>

        {/* Stage icon */}
        <div className="text-center mb-3">
          <div className="text-4xl">
            {stage.isBoss 
              ? '👑' 
              : isCompleted 
                ? '✅' 
                : isUnlocked 
                  ? '💎' 
                  : '🔒'
            }
          </div>
        </div>

        {/* Stage name */}
        <div className="text-center mb-2">
          <div className="text-sm font-semibold text-white/90 truncate">
            {stage.name}
          </div>
        </div>

        {/* Stars */}
        {isCompleted && (
          <div className="flex justify-center gap-1 mb-2">
            {[1, 2, 3].map(starNum => (
              <span
                key={starNum}
                className={`text-lg ${starNum <= stars ? 'text-yellow-400' : 'text-gray-600'}`}
              >
                ⭐
              </span>
            ))}
          </div>
        )}

        {/* Current indicator */}
        {isCurrent && isUnlocked && (
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
            CURRENT
          </div>
        )}

        {/* Difficulty indicator */}
        <div className="absolute bottom-2 left-2">
          <div className={`
            text-xs px-2 py-1 rounded-full font-semibold
            ${stage.difficulty === 'easy' ? 'bg-green-600 text-white' :
              stage.difficulty === 'medium' ? 'bg-yellow-600 text-white' :
              stage.difficulty === 'hard' ? 'bg-red-600 text-white' :
              'bg-purple-600 text-white'}
          `}>
            {stage.difficulty.toUpperCase()}
          </div>
        </div>

        {/* Theme indicator */}
        <div className="absolute bottom-2 right-2">
          <div className="text-lg">
            {stage.backgroundTheme === 'forest' ? '🌲' :
             stage.backgroundTheme === 'ocean' ? '🌊' :
             stage.backgroundTheme === 'mountain' ? '⛰️' :
             stage.backgroundTheme === 'volcano' ? '🌋' :
             '✨'}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between mb-6"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/20 transition-all text-white"
        >
          <span className="text-xl">🏠</span>
          <span>Back to Menu</span>
        </button>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Stage Select</h1>
          <div className="text-white/70">
            Progress: {stageProgress.completedStages.length}/20 stages completed
          </div>
          <div className="text-yellow-400 font-semibold">
            ⭐ {stageProgress.totalStars} total stars
          </div>
        </div>

        <div className="text-right text-white/70">
          <div className="text-sm">Completion: {Math.round(stageSystem.getCompletionPercentage())}%</div>
        </div>
      </motion.div>

      <div className="flex gap-6">
        {/* Stage grid */}
        <div className="flex-1">
          <motion.div 
            className="grid grid-cols-5 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {allStages.map(stage => renderStageCard(stage))}
          </motion.div>
        </div>

        {/* Stage details panel */}
        <AnimatePresence>
          {selectedStage && (
            <motion.div
              className="w-96 bg-black/30 backdrop-blur-md rounded-2xl border border-white/20 p-6"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
            >
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedStage.name}
                </h2>
                {selectedStage.isBoss && (
                  <div className="text-red-400 font-semibold mb-2">👑 BOSS STAGE 👑</div>
                )}
                <div className="text-6xl mb-4">
                  {selectedStage.backgroundTheme === 'forest' ? '🌲' :
                   selectedStage.backgroundTheme === 'ocean' ? '🌊' :
                   selectedStage.backgroundTheme === 'mountain' ? '⛰️' :
                   selectedStage.backgroundTheme === 'volcano' ? '🌋' :
                   '✨'}
                </div>
              </div>

              {/* Stage description */}
              <div className="mb-4">
                <p className="text-white/80 text-sm leading-relaxed">
                  {selectedStage.description}
                </p>
              </div>

              {/* Objectives */}
              <div className="mb-6 space-y-3">
                <div className="text-white font-semibold mb-2">Objectives:</div>
                
                <div className="flex justify-between items-center bg-white/10 rounded-lg p-3">
                  <span className="text-white/80">Target Score:</span>
                  <span className="text-yellow-400 font-bold">
                    {selectedStage.targetScore.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-white/10 rounded-lg p-3">
                  <span className="text-white/80">Max Moves:</span>
                  <span className="text-blue-400 font-bold">
                    {selectedStage.maxMoves}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-white/10 rounded-lg p-3">
                  <span className="text-white/80">Blocks to Break:</span>
                  <span className="text-green-400 font-bold">
                    {selectedStage.blocksToBreak}
                  </span>
                </div>

                {/* Special objectives */}
                {selectedStage.specialObjectives && (
                  <div className="bg-purple-600/20 rounded-lg p-3">
                    <div className="text-purple-300 font-semibold mb-2">Special:</div>
                    {selectedStage.specialObjectives.greenBlocks && (
                      <div className="text-sm text-white/80">
                        🟢 Destroy {selectedStage.specialObjectives.greenBlocks} green blocks
                      </div>
                    )}
                    {selectedStage.specialObjectives.blueBlocks && (
                      <div className="text-sm text-white/80">
                        🔵 Destroy {selectedStage.specialObjectives.blueBlocks} blue blocks
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Rewards */}
              <div className="mb-6">
                <div className="text-white font-semibold mb-2">Rewards:</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-yellow-600/20 rounded-lg p-2 text-center">
                    <div className="text-yellow-400 font-bold">{selectedStage.rewards.coins}</div>
                    <div className="text-white/70">Coins</div>
                  </div>
                  <div className="bg-purple-600/20 rounded-lg p-2 text-center">
                    <div className="text-purple-400 font-bold">{selectedStage.rewards.gems}</div>
                    <div className="text-white/70">Gems</div>
                  </div>
                  <div className="bg-blue-600/20 rounded-lg p-2 text-center">
                    <div className="text-blue-400 font-bold">{selectedStage.rewards.xp}</div>
                    <div className="text-white/70">XP</div>
                  </div>
                  <div className="bg-yellow-600/20 rounded-lg p-2 text-center">
                    <div className="text-yellow-400 font-bold">⭐ Up to 3</div>
                    <div className="text-white/70">Stars</div>
                  </div>
                </div>
              </div>

              {/* Progress */}
              {stageSystem.isStageCompleted(selectedStage.id) && (
                <div className="mb-4">
                  <div className="text-white font-semibold mb-2">Best Performance:</div>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3].map(starNum => (
                      <span
                        key={starNum}
                        className={`text-2xl ${starNum <= stageSystem.getStageStars(selectedStage.id) ? 'text-yellow-400' : 'text-gray-600'}`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Play button */}
              <motion.button
                onClick={handlePlayStage}
                disabled={!stageSystem.isStageUnlocked(selectedStage.id)}
                className={`
                  w-full py-3 rounded-xl font-semibold transition-all duration-200
                  ${stageSystem.isStageUnlocked(selectedStage.id)
                    ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }
                `}
                whileHover={stageSystem.isStageUnlocked(selectedStage.id) ? { scale: 1.05 } : {}}
                whileTap={stageSystem.isStageUnlocked(selectedStage.id) ? { scale: 0.95 } : {}}
              >
                {stageSystem.isStageUnlocked(selectedStage.id) ? '🎮 Play Stage' : '🔒 Locked'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 