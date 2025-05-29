'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { settingsManager } from '@/lib/settings/SettingsManager'
import { SETTINGS_CATEGORIES, THEME_CONFIGS, THEME_PREVIEWS } from '@/lib/settings/constants'
import { GameSettings, SettingsCategory, ThemeType } from '@/types/settings'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface SettingsTabProps {
  category: SettingsCategory
  settings: GameSettings
  onUpdateSettings: (category: keyof GameSettings, updates: any) => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<GameSettings>(settingsManager.getSettings())
  const [activeTab, setActiveTab] = useState<string>('audio')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Load settings on mount
  useEffect(() => {
    const handleSettingsUpdate = (updatedSettings: GameSettings) => {
      setSettings(updatedSettings)
      setHasUnsavedChanges(false)
    }

    settingsManager.on('settings:updated', handleSettingsUpdate)
    settingsManager.on('settings:reset', handleSettingsUpdate)

    return () => {
      settingsManager.off('settings:updated', handleSettingsUpdate)
      settingsManager.off('settings:reset', handleSettingsUpdate)
    }
  }, [])

  // Handle settings updates
  const handleUpdateSettings = useCallback((category: keyof GameSettings, updates: any) => {
    settingsManager.updateSettings(category, updates)
    setHasUnsavedChanges(true)
  }, [])

  // Handle reset settings
  const handleResetSettings = useCallback((category?: keyof GameSettings) => {
    if (confirm('Are you sure you want to reset these settings to default?')) {
      settingsManager.resetSettings(category)
      setHasUnsavedChanges(false)
    }
  }, [])

  // Handle export settings
  const handleExportSettings = useCallback(() => {
    try {
      const exportData = settingsManager.exportSettings()
      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gems-rush-settings-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      alert('Failed to export settings')
    }
  }, [])

  // Handle import settings
  const handleImportSettings = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const success = settingsManager.importSettings(content)
        if (success) {
          alert('Settings imported successfully!')
          setSettings(settingsManager.getSettings())
        } else {
          alert('Failed to import settings. Please check the file format.')
        }
      } catch (error) {
        alert('Failed to read settings file')
      }
    }
    reader.readAsText(file)
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return

      if (event.key === 'Escape') {
        onClose()
      } else if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault()
            // Settings are auto-saved
            break
          case 'r':
            event.preventDefault()
            handleResetSettings()
            break
          case 'e':
            event.preventDefault()
            handleExportSettings()
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, handleResetSettings, handleExportSettings])

  // Filter categories based on search and advanced settings
  const filteredCategories = SETTINGS_CATEGORIES.filter(category => {
    const matchesSearch = searchQuery === '' || 
      category.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesAdvanced = showAdvanced || !category.isAdvanced

    return matchesSearch && matchesAdvanced
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="text-2xl">⚙️</div>
            <div>
              <h2 className="text-2xl font-bold text-white">Settings</h2>
              <p className="text-slate-400 text-sm">Customize your Gems Rush experience</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                Auto-saved
              </div>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Close settings"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-80 bg-slate-800/50 border-r border-slate-700 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-slate-700">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search settings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <label className="flex items-center gap-2 mt-3 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={showAdvanced}
                  onChange={(e) => setShowAdvanced(e.target.checked)}
                  className="rounded text-blue-500 focus:ring-blue-500"
                />
                Show advanced settings
              </label>
            </div>

            {/* Categories */}
            <div className="flex-1 overflow-y-auto p-2">
              {filteredCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    activeTab === category.id
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{category.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{category.displayName}</div>
                    <div className="text-xs text-slate-400">{category.description}</div>
                  </div>
                  {category.isAdvanced && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                      Advanced
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-slate-700 space-y-2">
              <button
                onClick={() => handleResetSettings()}
                className="w-full px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
              >
                Reset All Settings
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={handleExportSettings}
                  className="flex-1 px-3 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm"
                >
                  Export
                </button>
                
                <label className="flex-1 px-3 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm cursor-pointer text-center">
                  Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportSettings}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {filteredCategories.map((category) => (
              activeTab === category.id && (
                <SettingsTab
                  key={category.id}
                  category={category}
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                />
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Settings Tab Component
const SettingsTab: React.FC<SettingsTabProps> = ({ category, settings, onUpdateSettings }) => {
  const renderSettings = () => {
    switch (category.id) {
      case 'audio':
        return <AudioSettings settings={settings.audio} onUpdate={(updates) => onUpdateSettings('audio', updates)} />
      case 'visual':
        return <VisualSettings settings={settings.visual} onUpdate={(updates) => onUpdateSettings('visual', updates)} />
      case 'gameplay':
        return <GameplaySettings settings={settings.gameplay} onUpdate={(updates) => onUpdateSettings('gameplay', updates)} />
      case 'theme':
        return <ThemeSettings settings={settings.theme} onUpdate={(updates) => onUpdateSettings('theme', updates)} />
      case 'accessibility':
        return <AccessibilitySettings settings={settings.accessibility} onUpdate={(updates) => onUpdateSettings('accessibility', updates)} />
      case 'input':
        return <InputSettings settings={settings.input} onUpdate={(updates) => onUpdateSettings('input', updates)} />
      case 'performance':
        return <PerformanceSettings settings={settings.performance} onUpdate={(updates) => onUpdateSettings('performance', updates)} />
      case 'privacy':
        return <PrivacySettings settings={settings.privacy} onUpdate={(updates) => onUpdateSettings('privacy', updates)} />
      default:
        return <div className="p-6 text-slate-400">Settings category not implemented yet.</div>
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">{category.icon}</span>
          {category.displayName}
        </h3>
        <p className="text-slate-400 mt-1">{category.description}</p>
      </div>
      
      {renderSettings()}
    </div>
  )
}

// Audio Settings Component
const AudioSettings: React.FC<{
  settings: GameSettings['audio']
  onUpdate: (updates: Partial<GameSettings['audio']>) => void
}> = ({ settings, onUpdate }) => {
  return (
    <div className="space-y-6">
      {/* Volume Controls */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Volume</h4>
        
        <SettingsSlider
          label="Master Volume"
          value={settings.masterVolume}
          onChange={(value) => onUpdate({ masterVolume: value })}
          min={0}
          max={100}
          unit="%"
          icon="🔊"
        />
        
        <SettingsSlider
          label="Sound Effects"
          value={settings.soundEffects}
          onChange={(value) => onUpdate({ soundEffects: value })}
          min={0}
          max={100}
          unit="%"
          icon="🎵"
        />
        
        <SettingsSlider
          label="Background Music"
          value={settings.backgroundMusic}
          onChange={(value) => onUpdate({ backgroundMusic: value })}
          min={0}
          max={100}
          unit="%"
          icon="🎶"
        />
        
        <SettingsSlider
          label="Voice Over"
          value={settings.voiceOver}
          onChange={(value) => onUpdate({ voiceOver: value })}
          min={0}
          max={100}
          unit="%"
          icon="🎤"
        />
      </div>

      {/* Audio Options */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Audio Options</h4>
        
        <SettingsToggle
          label="Enable Audio"
          description="Master audio toggle for the entire game"
          checked={settings.audioEnabled}
          onChange={(checked) => onUpdate({ audioEnabled: checked })}
          icon="🔊"
        />
        
        <SettingsToggle
          label="UI Sounds"
          description="Button clicks and interface sounds"
          checked={settings.uiSounds}
          onChange={(checked) => onUpdate({ uiSounds: checked })}
          icon="🖱️"
        />
        
        <SettingsToggle
          label="Match Sounds"
          description="Sound effects when making matches"
          checked={settings.matchSounds}
          onChange={(checked) => onUpdate({ matchSounds: checked })}
          icon="💎"
        />
        
        <SettingsToggle
          label="Power-up Sounds"
          description="Sound effects for power-up activations"
          checked={settings.powerUpSounds}
          onChange={(checked) => onUpdate({ powerUpSounds: checked })}
          icon="⚡"
        />
        
        <SettingsToggle
          label="Ambient Sounds"
          description="Background environmental sounds"
          checked={settings.ambientSounds}
          onChange={(checked) => onUpdate({ ambientSounds: checked })}
          icon="🌊"
        />
        
        <SettingsToggle
          label="Mute on Focus Loss"
          description="Automatically mute when the game window loses focus"
          checked={settings.muteOnFocusLoss}
          onChange={(checked) => onUpdate({ muteOnFocusLoss: checked })}
          icon="🔇"
        />
      </div>
    </div>
  )
}

// Visual Settings Component  
const VisualSettings: React.FC<{
  settings: GameSettings['visual']
  onUpdate: (updates: Partial<GameSettings['visual']>) => void
}> = ({ settings, onUpdate }) => {
  return (
    <div className="space-y-6">
      {/* Effects */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Visual Effects</h4>
        
        <SettingsToggle
          label="Animations"
          description="Enable smooth animations and transitions"
          checked={settings.animations}
          onChange={(checked) => onUpdate({ animations: checked })}
          icon="🎭"
        />
        
        <SettingsToggle
          label="Particle Effects"
          description="Sparkles and particle systems"
          checked={settings.particleEffects}
          onChange={(checked) => onUpdate({ particleEffects: checked })}
          icon="✨"
        />
        
        <SettingsToggle
          label="Screen Shake"
          description="Screen shake effects for big matches"
          checked={settings.screenShake}
          onChange={(checked) => onUpdate({ screenShake: checked })}
          icon="📳"
        />
        
        <SettingsToggle
          label="Visual Effects"
          description="Advanced visual effects and shaders"
          checked={settings.visualEffects}
          onChange={(checked) => onUpdate({ visualEffects: checked })}
          icon="🎨"
        />
      </div>

      {/* Display Settings */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Display</h4>
        
        <SettingsSlider
          label="Brightness"
          value={settings.brightness}
          onChange={(value) => onUpdate({ brightness: value })}
          min={0}
          max={200}
          unit="%"
          icon="☀️"
        />
        
        <SettingsSlider
          label="Saturation"
          value={settings.saturation}
          onChange={(value) => onUpdate({ saturation: value })}
          min={0}
          max={200}
          unit="%"
          icon="🌈"
        />
        
        <SettingsSlider
          label="Background Opacity"
          value={settings.backgroundOpacity}
          onChange={(value) => onUpdate({ backgroundOpacity: value })}
          min={0}
          max={100}
          unit="%"
          icon="🖼️"
        />
        
        <SettingsSlider
          label="Gem Size"
          value={settings.gemSize}
          onChange={(value) => onUpdate({ gemSize: value })}
          min={50}
          max={150}
          unit="%"
          icon="💎"
        />
      </div>

      {/* Accessibility */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Accessibility</h4>
        
        <SettingsToggle
          label="High Contrast"
          description="Increase contrast for better visibility"
          checked={settings.highContrast}
          onChange={(checked) => onUpdate({ highContrast: checked })}
          icon="🔲"
        />
        
        <SettingsToggle
          label="Reduced Motion"
          description="Minimize animations for sensitive users"
          checked={settings.reducedMotion}
          onChange={(checked) => onUpdate({ reducedMotion: checked })}
          icon="🐌"
        />
        
        <SettingsSelect
          label="Color Blind Mode"
          value={settings.colorBlindMode}
          onChange={(value) => onUpdate({ colorBlindMode: value as any })}
          options={[
            { value: 'none', label: 'None' },
            { value: 'protanopia', label: 'Protanopia (Red-Green)' },
            { value: 'deuteranopia', label: 'Deuteranopia (Red-Green)' },
            { value: 'tritanopia', label: 'Tritanopia (Blue-Yellow)' }
          ]}
          icon="👁️"
        />
      </div>

      {/* Helpers */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">Game Helpers</h4>
        
        <SettingsToggle
          label="Show Grid"
          description="Display grid lines on the game board"
          checked={settings.showGrid}
          onChange={(checked) => onUpdate({ showGrid: checked })}
          icon="📏"
        />
        
        <SettingsToggle
          label="Show Hints"
          description="Visual hints for possible moves"
          checked={settings.showHints}
          onChange={(checked) => onUpdate({ showHints: checked })}
          icon="💡"
        />
        
        <SettingsToggle
          label="Show Trajectory"
          description="Show gem movement paths"
          checked={settings.showTrajectory}
          onChange={(checked) => onUpdate({ showTrajectory: checked })}
          icon="🎯"
        />
      </div>
    </div>
  )
}

// Reusable Components
const SettingsSlider: React.FC<{
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  unit?: string
  icon?: string
  description?: string
}> = ({ label, value, onChange, min, max, unit = '', icon, description }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <div>
            <div className="text-white font-medium">{label}</div>
            {description && <div className="text-xs text-slate-400">{description}</div>}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 min-w-0 ml-4">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 min-w-32 accent-blue-500"
        />
        <div className="text-white font-mono text-sm min-w-12 text-right">
          {value}{unit}
        </div>
      </div>
    </div>
  )
}

const SettingsToggle: React.FC<{
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
  icon?: string
}> = ({ label, description, checked, onChange, icon }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
      <div className="flex items-center gap-3 flex-1">
        {icon && <span className="text-lg">{icon}</span>}
        <div>
          <div className="text-white font-medium">{label}</div>
          <div className="text-xs text-slate-400">{description}</div>
        </div>
      </div>
      
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={`w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-blue-500' : 'bg-slate-600'
        }`}>
          <div className={`w-5 h-5 bg-white rounded-full transition-transform transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          } mt-0.5 ml-0.5`} />
        </div>
      </label>
    </div>
  )
}

const SettingsSelect: React.FC<{
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  icon?: string
  description?: string
}> = ({ label, value, onChange, options, icon, description }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
      <div className="flex items-center gap-3 flex-1">
        {icon && <span className="text-lg">{icon}</span>}
        <div>
          <div className="text-white font-medium">{label}</div>
          {description && <div className="text-xs text-slate-400">{description}</div>}
        </div>
      </div>
      
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-700 text-white rounded-lg px-3 py-2 min-w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// Placeholder components for other tabs
const GameplaySettings: React.FC<{
  settings: GameSettings['gameplay']
  onUpdate: (updates: Partial<GameSettings['gameplay']>) => void
}> = ({ settings, onUpdate }) => {
  return (
    <div className="text-slate-400">
      Gameplay settings will be implemented next...
    </div>
  )
}

const ThemeSettings: React.FC<{
  settings: GameSettings['theme']
  onUpdate: (updates: Partial<GameSettings['theme']>) => void
}> = ({ settings, onUpdate }) => {
  return (
    <div className="text-slate-400">
      Theme settings will be implemented next...
    </div>
  )
}

const AccessibilitySettings: React.FC<{
  settings: GameSettings['accessibility']
  onUpdate: (updates: Partial<GameSettings['accessibility']>) => void
}> = ({ settings, onUpdate }) => {
  return (
    <div className="text-slate-400">
      Accessibility settings will be implemented next...
    </div>
  )
}

const InputSettings: React.FC<{
  settings: GameSettings['input']
  onUpdate: (updates: Partial<GameSettings['input']>) => void
}> = ({ settings, onUpdate }) => {
  return (
    <div className="text-slate-400">
      Input settings will be implemented next...
    </div>
  )
}

const PerformanceSettings: React.FC<{
  settings: GameSettings['performance']
  onUpdate: (updates: Partial<GameSettings['performance']>) => void
}> = ({ settings, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Graphics Quality</h3>
        
        <SettingsSelect
          label="Quality Level"
          value={settings?.qualityLevel || 'high'}
          onChange={(value) => onUpdate({ qualityLevel: value as any })}
          options={[
            { value: 'minimal', label: 'Minimal - Best Performance' },
            { value: 'low', label: 'Low - Good Performance' },
            { value: 'medium', label: 'Medium - Balanced' },
            { value: 'high', label: 'High - Good Quality' },
            { value: 'ultra', label: 'Ultra - Best Quality' }
          ]}
          icon="🎨"
          description="Set graphics quality level for stable performance"
        />
        
        <SettingsToggle
          label="Auto Quality Adjustment"
          description="Automatically adjust quality based on performance (may cause fluctuations)"
          checked={settings?.autoQuality ?? false}
          onChange={(checked) => onUpdate({ autoQuality: checked })}
          icon="🔄"
        />
        
        <SettingsToggle
          label="Enable Visual Effects"
          description="Show particle effects, glows, and animations"
          checked={settings?.enableEffects ?? true}
          onChange={(checked) => onUpdate({ enableEffects: checked })}
          icon="✨"
        />
        
        <SettingsToggle
          label="Enable Animations"
          description="Show smooth transitions and movements"
          checked={settings?.enableAnimations ?? true}
          onChange={(checked) => onUpdate({ enableAnimations: checked })}
          icon="🎬"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Performance Optimization</h3>
        
        <SettingsSlider
          label="Max Visual Effects"
          value={settings?.maxEffects ?? 15}
          onChange={(value) => onUpdate({ maxEffects: value })}
          min={2}
          max={50}
          icon="💫"
          description="Maximum number of visual effects shown simultaneously"
        />
        
        <SettingsSlider
          label="Frame Rate Target"
          value={settings?.targetFPS ?? 60}
          onChange={(value) => onUpdate({ targetFPS: value })}
          min={30}
          max={120}
          unit=" FPS"
          icon="📈"
          description="Target frame rate for performance optimization"
        />
        
        <SettingsToggle
          label="Hardware Acceleration"
          description="Use GPU acceleration for better performance"
          checked={settings?.hardwareAcceleration ?? true}
          onChange={(checked) => onUpdate({ hardwareAcceleration: checked })}
          icon="⚡"
        />
      </div>

      <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
        <div className="flex items-center gap-2 text-blue-400 mb-2">
          <span>💡</span>
          <span className="font-medium">Performance Tips</span>
        </div>
        <ul className="text-sm text-slate-300 space-y-1">
          <li>• Disable "Auto Quality" to prevent quality fluctuations during gameplay</li>
          <li>• Use "High" quality for the best balance of performance and visuals</li>
          <li>• Lower "Max Visual Effects" if experiencing lag</li>
          <li>• Enable "Hardware Acceleration" for smooth animations</li>
        </ul>
      </div>
    </div>
  )
}

const PrivacySettings: React.FC<{
  settings: GameSettings['privacy']
  onUpdate: (updates: Partial<GameSettings['privacy']>) => void
}> = ({ settings, onUpdate }) => {
  return (
    <div className="text-slate-400">
      Privacy settings will be implemented next...
    </div>
  )
}

export default SettingsModal 