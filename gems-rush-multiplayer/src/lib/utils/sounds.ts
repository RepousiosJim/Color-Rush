// Sound System Utility
// Manages audio effects and background music for the game

export class SoundSystem {
  private audioContext: AudioContext | null = null
  private sounds: Map<string, AudioBuffer> = new Map()
  private soundEnabled: boolean = true
  private musicEnabled: boolean = true
  private soundVolume: number = 0.7
  private musicVolume: number = 0.5

  constructor() {
    this.initialize()
  }

  private async initialize() {
    try {
      // Initialize Web Audio API (only in browser)
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        this.audioContext = new AudioContext()
      }
    } catch (error) {
      console.warn('Audio context not supported:', error)
    }
  }

  // Enable/disable sound effects
  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled
  }

  // Enable/disable background music
  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled
  }

  // Set sound effects volume (0-1)
  setSoundVolume(volume: number) {
    this.soundVolume = Math.max(0, Math.min(1, volume))
  }

  // Set background music volume (0-1)
  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume))
  }

  // Play gem match sound
  playGemMatch(comboLevel: number = 1) {
    if (!this.soundEnabled) return
    
    // Generate simple match sound using Web Audio API
    this.playTone(440 + (comboLevel * 110), 0.1, 'sine')
  }

  // Play gem select sound
  playGemSelect() {
    if (!this.soundEnabled) return
    
    this.playTone(600, 0.05, 'sine')
  }

  // Play gem swap sound
  playGemSwap() {
    if (!this.soundEnabled) return
    
    this.playTone(300, 0.1, 'square')
  }

  // Play level complete sound
  playLevelComplete() {
    if (!this.soundEnabled) return
    
    // Play ascending melody
    const notes = [440, 554, 659, 880]
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 0.3, 'sine')
      }, index * 150)
    })
  }

  // Play game over sound
  playGameOver() {
    if (!this.soundEnabled) return
    
    // Play descending melody
    const notes = [880, 659, 554, 440]
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 0.2, 'sawtooth')
      }, index * 100)
    })
  }

  // Play power-up sound
  playPowerUp() {
    if (!this.soundEnabled) return
    
    this.playTone(800, 0.2, 'triangle')
  }

  // Play button click sound
  playButtonClick() {
    if (!this.soundEnabled) return
    
    this.playTone(400, 0.05, 'square')
  }

  // Play notification sound
  playNotification() {
    if (!this.soundEnabled) return
    
    this.playTone(500, 0.1, 'sine')
  }

  // Generate and play a simple tone
  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.audioContext) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
      oscillator.type = type

      // Envelope for smooth sound
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(this.soundVolume * 0.3, this.audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration)

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + duration)
    } catch (error) {
      console.warn('Error playing tone:', error)
    }
  }

  // Clean up audio context
  cleanup() {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}

// Global sound system instance
export const soundSystem = new SoundSystem()

// Sound effects hooks for React components
export const useSounds = () => {
  return {
    playGemMatch: soundSystem.playGemMatch.bind(soundSystem),
    playGemSelect: soundSystem.playGemSelect.bind(soundSystem),
    playGemSwap: soundSystem.playGemSwap.bind(soundSystem),
    playLevelComplete: soundSystem.playLevelComplete.bind(soundSystem),
    playGameOver: soundSystem.playGameOver.bind(soundSystem),
    playPowerUp: soundSystem.playPowerUp.bind(soundSystem),
    playButtonClick: soundSystem.playButtonClick.bind(soundSystem),
    playNotification: soundSystem.playNotification.bind(soundSystem),
    setSoundEnabled: soundSystem.setSoundEnabled.bind(soundSystem),
    setMusicEnabled: soundSystem.setMusicEnabled.bind(soundSystem),
    setSoundVolume: soundSystem.setSoundVolume.bind(soundSystem),
    setMusicVolume: soundSystem.setMusicVolume.bind(soundSystem)
  }
} 