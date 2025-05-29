'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface MainMenuProps {
  onModeSelect: (mode: string) => void
  onShowSettings: () => void
  onShowGuide: () => void
  onShowCredits: () => void
  onShowStats: () => void
  currentStage: number
}

const gameModesData = [
  { id: 'normal', icon: '🎯', label: 'Normal', badge: 'ACTIVE' },
  { id: 'timeAttack', icon: '⏱️', label: 'Time Attack', badge: 'FAST' },
  { id: 'dailyChallenge', icon: '📅', label: 'Daily Quest', badge: 'NEW' },
  { id: 'campaign', icon: '⚔️', label: 'Campaign', badge: 'EPIC' }
]

const floatingGems = [
  { emoji: '🔥', color: '#FF4500', delay: 0 },
  { emoji: '💧', color: '#1E90FF', delay: 0.5 },
  { emoji: '🌍', color: '#8B4513', delay: 1 },
  { emoji: '💨', color: '#87CEEB', delay: 1.5 },
  { emoji: '⚡', color: '#FFD700', delay: 2 },
  { emoji: '🌿', color: '#32CD32', delay: 2.5 },
  { emoji: '🔮', color: '#9932CC', delay: 3 }
]

export default function MainMenu({ 
  onModeSelect, 
  onShowSettings, 
  onShowGuide, 
  onShowCredits, 
  onShowStats, 
  currentStage 
}: MainMenuProps) {
  const [selectedModeIndex, setSelectedModeIndex] = useState(0)
  const [animatingSelection, setAnimatingSelection] = useState(false)
  
  const selectedMode = gameModesData[selectedModeIndex]

  const handleModeSelect = (mode: string) => {
    setAnimatingSelection(true)
    setTimeout(() => {
      onModeSelect(mode)
      setAnimatingSelection(false)
    }, 1200)
  }

  const navigateMode = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setSelectedModeIndex(prev => prev === 0 ? gameModesData.length - 1 : prev - 1)
    } else {
      setSelectedModeIndex(prev => prev === gameModesData.length - 1 ? 0 : prev + 1)
    }
  }

  // Keyboard navigation would be implemented here if needed

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Floating Gems */}
        <div className="floating-gems absolute inset-0">
          {floatingGems.map((gem, index) => (
            <motion.div
              key={index}
              className="absolute text-4xl opacity-30"
              style={{ 
                color: gem.color,
                left: `${10 + (index * 12)}%`,
                top: `${20 + (index % 3) * 20}%`
              }}
              animate={{
                y: [-20, 20, -20],
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 4 + gem.delay,
                repeat: Infinity,
                ease: "easeInOut",
                delay: gem.delay
              }}
            >
              {gem.emoji}
            </motion.div>
          ))}
        </div>

        {/* Particle Field */}
        <div className="particle-field absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        {/* Divine Aura */}
        <div className="divine-aura absolute inset-0 bg-gradient-radial from-purple-500/20 via-transparent to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="relative">
            <motion.h1 
              className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-purple-400 to-blue-400 mb-4"
              animate={{
                backgroundPosition: ['0%', '100%', '0%']
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              ⚡ GEMS RUSH ⚡
            </motion.h1>
            <motion.div 
              className="text-2xl md:text-3xl text-purple-300 font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              DIVINE TEAMS
            </motion.div>
          </div>
          
          <motion.p 
            className="text-lg text-purple-200 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Epic Match-3 Adventure • Divine Powers • Legendary Battles
          </motion.p>

          {/* Hero Stats */}
          <motion.div 
            className="flex justify-center gap-8 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <div className="text-center">
              <div className="text-2xl">💎</div>
              <div className="text-sm text-purple-300">7 Divine Gems</div>
            </div>
            <div className="text-center">
              <div className="text-2xl">🏆</div>
              <div className="text-sm text-purple-300">4 Epic Modes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl">⚔️</div>
              <div className="text-sm text-purple-300">Infinite Realms</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Stage Map Section */}
        <div className="stage-container flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-6xl">
          
          {/* Left Controls */}
          <motion.div 
            className="left-controls flex flex-col gap-4"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5 }}
          >
            <button
              className="control-btn p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 flex flex-col items-center gap-2"
              onClick={() => handleModeSelect('timeAttack')}
            >
              <div className="text-2xl">⏱️</div>
              <div className="text-sm text-white">Time Attack</div>
            </button>
            
            <button
              className="control-btn p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 flex flex-col items-center gap-2"
              onClick={() => handleModeSelect('dailyChallenge')}
            >
              <div className="text-2xl">📅</div>
              <div className="text-sm text-white">Daily Quest</div>
            </button>
            
            <button
              className="control-btn p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 flex flex-col items-center gap-2"
              onClick={onShowGuide}
            >
              <div className="text-2xl">📖</div>
              <div className="text-sm text-white">Guide</div>
            </button>
            
            <button
              className="control-btn p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 flex flex-col items-center gap-2"
              onClick={onShowSettings}
            >
              <div className="text-2xl">⚙️</div>
              <div className="text-sm text-white">Settings</div>
            </button>
          </motion.div>

          {/* Central Map Area */}
          <motion.div 
            className="stage-map-center flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.8 }}
          >
            {/* Stage Header */}
            <div className="stage-header text-center mb-6">
              <h2 className="text-3xl font-bold text-white">
                <span className="text-purple-300">Stage {currentStage}</span>
                <br />
                <span className="text-xl text-purple-400">Divine Realm</span>
              </h2>
            </div>

            {/* Map Display */}
            <div className="stage-map-display relative">
              <div className="w-64 h-64 bg-gradient-to-br from-purple-600/30 to-blue-600/30 rounded-full border-4 border-purple-400/50 flex items-center justify-center relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-radial from-purple-400/20 to-transparent animate-pulse" />
                
                {/* Current Stage Marker */}
                <motion.div 
                  className="relative z-10 text-center"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                >
                  <div className="text-6xl mb-2">⚡</div>
                  <div className="text-white font-bold">Stage {currentStage}</div>
                  <div className="text-purple-300 text-sm">Target: 1,000</div>
                </motion.div>

                {/* Floating Essence */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-purple-400 rounded-full"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`
                    }}
                    animate={{
                      opacity: [0.3, 0.8, 0.3],
                      scale: [1, 1.5, 1],
                      x: [0, Math.random() * 20 - 10, 0],
                      y: [0, Math.random() * 20 - 10, 0]
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: i * 0.3
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Play Button */}
            <motion.button
              className="play-button mt-8 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-bold text-xl border-2 border-purple-400 shadow-lg hover:shadow-purple-500/50 transition-all duration-200"
              onClick={() => handleModeSelect(selectedMode.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={animatingSelection ? {
                scale: [1, 1.2, 1],
                boxShadow: ['0 0 20px rgba(147, 51, 234, 0.5)', '0 0 40px rgba(147, 51, 234, 1)', '0 0 20px rgba(147, 51, 234, 0.5)']
              } : {}}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">▶️</div>
                <div>PLAY</div>
              </div>
            </motion.button>
          </motion.div>

          {/* Right Controls */}
          <motion.div 
            className="right-controls flex flex-col gap-4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2 }}
          >
            {/* Game Mode Selector */}
            <div className="game-mode-selector bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => navigateMode('left')}
                  className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors"
                >
                  ◀
                </button>
                
                <div className="text-center px-4">
                  <div className="text-2xl mb-1">{selectedMode.icon}</div>
                  <div className="text-white font-semibold">{selectedMode.label}</div>
                  <div className="text-xs text-purple-300 bg-purple-600/30 px-2 py-1 rounded-full">
                    {selectedMode.badge}
                  </div>
                </div>
                
                <button
                  onClick={() => navigateMode('right')}
                  className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors"
                >
                  ▶
                </button>
              </div>
            </div>
            
            <button
              className="control-btn p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 flex flex-col items-center gap-2"
              onClick={onShowStats}
            >
              <div className="text-2xl">🗺️</div>
              <div className="text-sm text-white">Map</div>
            </button>
            
            <button
              className="control-btn p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 flex flex-col items-center gap-2"
              onClick={onShowCredits}
            >
              <div className="text-2xl">👥</div>
              <div className="text-sm text-white">Credits</div>
            </button>
            
            <button
              className="control-btn p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 flex flex-col items-center gap-2"
              onClick={onShowStats}
            >
              <div className="text-2xl">📊</div>
              <div className="text-sm text-white">Stats</div>
            </button>
          </motion.div>
        </div>

        {/* Stage Progress */}
        <motion.div 
          className="stage-progress mt-8 w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2 }}
        >
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-purple-300 text-sm">Stage Progress</span>
              <span className="text-white text-sm">{currentStage}/∞</span>
            </div>
            <div className="w-full bg-purple-800/30 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((currentStage / 10) * 100, 100)}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Keyboard Navigation Hint */}
      <div className="absolute bottom-4 left-4 text-purple-300 text-xs opacity-70">
        Use arrow keys to navigate • Enter to select
      </div>
    </div>
  )
} 