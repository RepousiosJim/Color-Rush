'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnOverlay?: boolean
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlay = true
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      firstElement?.focus()
    }
  }, [isOpen])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'max-w-md'
      case 'md': return 'max-w-lg'
      case 'lg': return 'max-w-2xl'
      case 'xl': return 'max-w-4xl'
      default: return 'max-w-lg'
    }
  }

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlay && event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleOverlayClick}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className={`bg-white/20 backdrop-blur-md rounded-lg border border-white/30 shadow-2xl w-full ${getSizeClasses()} max-h-[90vh] overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-white/10 border-b border-white/20 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] text-white">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Settings Modal Component
export function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    musicEnabled: true,
    soundVolume: 70,
    musicVolume: 50,
    showAnimations: true,
    showHints: true,
    autoSave: true,
    difficulty: 'normal' as 'easy' | 'normal' | 'hard',
    theme: 'divine' as 'divine' | 'classic' | 'nature'
  })

  const handleSettingChange = (key: string, value: boolean | number | string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const resetSettings = () => {
    setSettings({
      soundEnabled: true,
      musicEnabled: true,
      soundVolume: 70,
      musicVolume: 50,
      showAnimations: true,
      showHints: true,
      autoSave: true,
      difficulty: 'normal',
      theme: 'divine'
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⚙️ Settings" size="lg">
      <div className="space-y-6">
        
        {/* Audio Settings */}
        <div className="settings-section">
          <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
            <span>🔊</span>
            Audio Settings
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-white">Sound Effects</label>
              <button
                onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.soundEnabled ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.soundEnabled ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <div className="space-y-2">
              <label className="text-white block">Sound Volume: {settings.soundVolume}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.soundVolume}
                onChange={(e) => handleSettingChange('soundVolume', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                disabled={!settings.soundEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-white">Background Music</label>
              <button
                onClick={() => handleSettingChange('musicEnabled', !settings.musicEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.musicEnabled ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.musicEnabled ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <div className="space-y-2">
              <label className="text-white block">Music Volume: {settings.musicVolume}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.musicVolume}
                onChange={(e) => handleSettingChange('musicVolume', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                disabled={!settings.musicEnabled}
              />
            </div>
          </div>
        </div>

        {/* Visual Settings */}
        <div className="settings-section border-t border-white/20 pt-6">
          <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
            <span>🎨</span>
            Visual Settings
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-white">Show Animations</label>
              <button
                onClick={() => handleSettingChange('showAnimations', !settings.showAnimations)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.showAnimations ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.showAnimations ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <div className="space-y-2">
              <label className="text-white block">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="w-full p-2 bg-white/20 border border-white/30 rounded-lg text-white"
              >
                <option value="divine">Divine (Purple/Blue)</option>
                <option value="classic">Classic (Multi-color)</option>
                <option value="nature">Nature (Green/Brown)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Gameplay Settings */}
        <div className="settings-section border-t border-white/20 pt-6">
          <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
            <span>🎮</span>
            Gameplay Settings
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-white">Show Hints</label>
              <button
                onClick={() => handleSettingChange('showHints', !settings.showHints)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.showHints ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.showHints ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <div className="space-y-2">
              <label className="text-white block">Difficulty</label>
              <select
                value={settings.difficulty}
                onChange={(e) => handleSettingChange('difficulty', e.target.value)}
                className="w-full p-2 bg-white/20 border border-white/30 rounded-lg text-white"
              >
                <option value="easy">Easy (More time, easier targets)</option>
                <option value="normal">Normal (Balanced gameplay)</option>
                <option value="hard">Hard (Less time, higher targets)</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-white">Auto-Save Progress</label>
              <button
                onClick={() => handleSettingChange('autoSave', !settings.autoSave)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.autoSave ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.autoSave ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-white/20 pt-6 flex justify-between">
          <button
            onClick={resetSettings}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Reset to Defaults
          </button>
          
          <div className="space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Save settings logic would go here
                console.log('Saving settings:', settings)
                onClose()
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

// Game Guide Modal Component
export function GameGuideModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('basics')

  const tabs = [
    { id: 'basics', label: 'Basics', icon: '🎯' },
    { id: 'gems', label: 'Divine Gems', icon: '💎' },
    { id: 'powerups', label: 'Power-ups', icon: '⚡' },
    { id: 'modes', label: 'Game Modes', icon: '🎮' }
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📖 Game Guide" size="xl">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Tab Navigation */}
        <div className="lg:w-1/4">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full p-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-purple-300 hover:bg-white/20'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="lg:w-3/4">
          {activeTab === 'basics' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-purple-300 mb-4">Game Basics</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">🎯 Objective</h4>
                  <p className="text-purple-200">
                    Match 3 or more identical divine gems in a row (horizontally or vertically) to clear them from the board and score points. Reach the target score to advance to the next divine realm.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">🎮 How to Play</h4>
                  <ul className="text-purple-200 space-y-2">
                    <li>• Click on a gem to select it (it will glow yellow)</li>
                    <li>• Click on an adjacent gem to swap their positions</li>
                    <li>• Swaps are only allowed if they create a match of 3+ gems</li>
                    <li>• When gems are matched, they disappear and new gems fall down</li>
                    <li>• Chain reactions create combo multipliers for bonus points</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">⚡ Divine Rush System</h4>
                  <p className="text-purple-200">
                    Create chain reactions for massive point bonuses! Each cascade increases your Rush Multiplier, dramatically boosting your score.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gems' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-purple-300 mb-4">Divine Gems</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">🔥</span>
                    <div>
                      <h4 className="font-semibold text-orange-400">Fire Gem</h4>
                      <p className="text-sm text-orange-200">Divine passion & energy</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">💧</span>
                    <div>
                      <h4 className="font-semibold text-blue-400">Water Gem</h4>
                      <p className="text-sm text-blue-200">Divine flow & adaptability</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">🌍</span>
                    <div>
                      <h4 className="font-semibold text-yellow-600">Earth Gem</h4>
                      <p className="text-sm text-yellow-200">Divine strength & endurance</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">💨</span>
                    <div>
                      <h4 className="font-semibold text-cyan-400">Air Gem</h4>
                      <p className="text-sm text-cyan-200">Divine freedom & movement</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">⚡</span>
                    <div>
                      <h4 className="font-semibold text-yellow-400">Lightning Gem</h4>
                      <p className="text-sm text-yellow-200">Divine power & speed</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">🌿</span>
                    <div>
                      <h4 className="font-semibold text-green-400">Nature Gem</h4>
                      <p className="text-sm text-green-200">Divine growth & harmony</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4 md:col-span-2">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">🔮</span>
                    <div>
                      <h4 className="font-semibold text-purple-400">Magic Gem</h4>
                      <p className="text-sm text-purple-200">Divine mystery & infinite potential</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'powerups' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-purple-300 mb-4">Power-ups & Special Effects</h3>
              
              <div className="space-y-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">💣 Gem Bomb</h4>
                  <p className="text-purple-200">Destroys a 3x3 area around the target. Perfect for clearing difficult areas!</p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">🔥 Row Blaster</h4>
                  <p className="text-purple-200">Clears an entire row of gems instantly. Great for creating space for new combos.</p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">⚡ Column Crusher</h4>
                  <p className="text-purple-200">Eliminates a complete column. Use strategically to set up cascade opportunities.</p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">🌈 Color Bomb</h4>
                  <p className="text-purple-200">Removes all gems of the selected color from the board. Massive score potential!</p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">🔄 Divine Shuffle</h4>
                  <p className="text-purple-200">Shuffles the entire board when you&apos;re stuck. New opportunities await!</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'modes' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-purple-300 mb-4">Game Modes</h3>
              
              <div className="space-y-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🎯</span>
                    <h4 className="font-semibold text-white">Normal Mode</h4>
                  </div>
                  <p className="text-purple-200">
                    Classic match-3 gameplay with no time pressure. Focus on strategy and planning your moves carefully.
                  </p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">⏱️</span>
                    <h4 className="font-semibold text-white">Time Attack</h4>
                  </div>
                  <p className="text-purple-200">
                    Race against the clock! Score as many points as possible before time runs out. Fast thinking required!
                  </p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📅</span>
                    <h4 className="font-semibold text-white">Daily Challenge</h4>
                  </div>
                  <p className="text-purple-200">
                    New challenges every day with special objectives and limited moves. Earn exclusive rewards!
                  </p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">⚔️</span>
                    <h4 className="font-semibold text-white">Divine Conquest</h4>
                  </div>
                  <p className="text-purple-200">
                    Epic campaign mode with progressive difficulty and boss battles. Conquer the divine realms!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

// Credits Modal Component
export function CreditsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="👥 Credits" size="lg">
      <div className="space-y-6 text-center">
        
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-purple-300 mb-2">🔮 Gems Rush: Divine Teams</h3>
          <p className="text-purple-200">Epic Match-3 Adventure Game</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white/10 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-3">🎮 Game Development</h4>
            <div className="space-y-2 text-purple-200">
              <p><strong>Game Design:</strong> Divine Studios</p>
              <p><strong>Programming:</strong> Next.js & TypeScript</p>
              <p><strong>UI/UX Design:</strong> Tailwind CSS & Framer Motion</p>
              <p><strong>Game Engine:</strong> Custom Match-3 Engine</p>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-3">🎨 Art & Design</h4>
            <div className="space-y-2 text-purple-200">
              <p><strong>Divine Gem Icons:</strong> Unicode Emoji Consortium</p>
              <p><strong>Background Effects:</strong> CSS Gradients & Animations</p>
              <p><strong>Color Palette:</strong> Divine Purple/Blue Theme</p>
              <p><strong>Typography:</strong> System Fonts</p>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-3">🛠️ Technology Stack</h4>
            <div className="space-y-2 text-purple-200">
              <p><strong>Frontend:</strong> Next.js 14, React 18, TypeScript</p>
              <p><strong>Styling:</strong> Tailwind CSS</p>
              <p><strong>Animations:</strong> Framer Motion</p>
              <p><strong>Database:</strong> PostgreSQL with Prisma</p>
              <p><strong>Real-time:</strong> Socket.io (Coming Soon)</p>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-3">🙏 Special Thanks</h4>
            <div className="space-y-2 text-purple-200">
              <p>• The React & Next.js community</p>
              <p>• Open source contributors</p>
              <p>• Match-3 game pioneers</p>
              <p>• Players providing feedback</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-6">
          <p className="text-purple-300 text-sm">
            Made with ❤️ using modern web technologies
          </p>
          <p className="text-purple-400 text-xs mt-2">
            Version 1.0.0 • © 2024 Gems Rush Divine Teams
          </p>
        </div>
      </div>
    </Modal>
  )
} 