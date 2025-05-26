// Audio System Module
// Handles all sound effects, music, and audio management

export class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.masterVolume = 0.75;
        this.sounds = {};
        this.isInitialized = false;
    }

    // Initialize audio system
    async initialize() {
        try {
            // Create audio context (but don't start it yet - requires user gesture)
            if (window.AudioContext || window.webkitAudioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                // Note: Audio context will be resumed on first user interaction
            }

            // Load sound settings
            this.loadAudioSettings();
            
            // Setup click listener to resume audio context
            this.setupAudioContextResume();
            
            this.isInitialized = true;
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize Audio System:', error);
            return false;
        }
    }

    // Setup audio context resume on user interaction
    setupAudioContextResume() {
        const resumeAudio = () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    document.removeEventListener('click', resumeAudio);
                    document.removeEventListener('keydown', resumeAudio);
                    document.removeEventListener('touchstart', resumeAudio);
                });
            }
        };

        document.addEventListener('click', resumeAudio);
        document.addEventListener('keydown', resumeAudio);
        document.addEventListener('touchstart', resumeAudio);
    }

    // Resume audio context
    async resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
            } catch (error) {
                console.warn('⚠️ Could not resume audio context:', error);
            }
        }
    }

    // Create sound with Web Audio API
    createSound(frequency, duration, type = 'sine', volume = 0.3) {
        if (!this.audioContext || !this.soundEnabled) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;

            // Volume envelope
            const adjustedVolume = volume * this.masterVolume;
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(adjustedVolume, this.audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);

            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + duration);

        } catch (error) {
            console.warn('⚠️ Could not create sound:', error);
        }
    }

    // Play sound effect by type
    playSound(type) {
        if (!this.soundEnabled) return;

        const soundConfigs = {
            match: { frequency: 440, duration: 0.15, type: 'sine' },
            cascade: { frequency: 660, duration: 0.2, type: 'triangle' },
            powerup: { frequency: 880, duration: 0.3, type: 'sawtooth' },
            levelComplete: { frequency: 523, duration: 0.5, type: 'sine' },
            gameOver: { frequency: 220, duration: 0.8, type: 'sawtooth' },
            click: { frequency: 300, duration: 0.1, type: 'square' },
            swap: { frequency: 350, duration: 0.12, type: 'sine' },
            invalidMove: { frequency: 150, duration: 0.25, type: 'sawtooth' },
            hint: { frequency: 600, duration: 0.2, type: 'triangle' },
            achievement: { frequency: 800, duration: 0.4, type: 'sine' }
        };

        const config = soundConfigs[type];
        if (config) {
            this.createSound(config.frequency, config.duration, config.type);
        }
    }

    // Play complex sound sequences
    playComplexSound(type) {
        if (!this.soundEnabled) return;

        switch (type) {
            case 'bigMatch':
                // Multiple ascending tones
                setTimeout(() => this.playSound('match'), 0);
                setTimeout(() => this.createSound(550, 0.15, 'sine'), 100);
                setTimeout(() => this.createSound(660, 0.15, 'sine'), 200);
                break;

            case 'levelUp':
                // Triumphant ascending sequence
                const notes = [523, 659, 784, 1047]; // C, E, G, C octave
                notes.forEach((freq, index) => {
                    setTimeout(() => this.createSound(freq, 0.3, 'sine', 0.4), index * 150);
                });
                break;

            case 'gameStart':
                // Welcoming sound
                this.createSound(440, 0.2, 'sine', 0.3);
                setTimeout(() => this.createSound(554, 0.2, 'sine', 0.3), 200);
                break;
        }
    }

    // Set master volume
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.saveAudioSettings();
    }

    // Toggle sound effects
    toggleSoundEffects(enabled) {
        this.soundEnabled = enabled;
        this.saveAudioSettings();
        
        // Play confirmation sound if enabling
        if (enabled) {
            setTimeout(() => this.playSound('click'), 100);
        }
    }

    // Toggle background music
    toggleBackgroundMusic(enabled) {
        this.musicEnabled = enabled;
        this.saveAudioSettings();
        
        if (enabled) {
            // Could start background music here
            console.log('🎵 Background music enabled');
        } else {
            // Stop background music
            console.log('🔇 Background music disabled');
        }
    }

    // Save audio settings
    saveAudioSettings() {
        const settings = {
            soundEnabled: this.soundEnabled,
            musicEnabled: this.musicEnabled,
            masterVolume: this.masterVolume
        };
        
        try {
            localStorage.setItem('gemsRush_audioSettings', JSON.stringify(settings));
        } catch (error) {
            console.warn('⚠️ Could not save audio settings:', error);
        }
    }

    // Load audio settings
    loadAudioSettings() {
        try {
            const saved = localStorage.getItem('gemsRush_audioSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.soundEnabled = settings.soundEnabled !== false;
                this.musicEnabled = settings.musicEnabled !== false;
                this.masterVolume = settings.masterVolume || 0.75;
            }
        } catch (error) {
            console.warn('⚠️ Could not load audio settings:', error);
        }
    }

    // Get current audio state
    getAudioState() {
        return {
            isInitialized: this.isInitialized,
            soundEnabled: this.soundEnabled,
            musicEnabled: this.musicEnabled,
            masterVolume: this.masterVolume,
            contextState: this.audioContext?.state || 'unavailable'
        };
    }

    // Test audio system
    testAudio() {
        console.log('🔊 Testing audio system...');
        this.playSound('match');
        setTimeout(() => this.playSound('cascade'), 300);
        setTimeout(() => this.playSound('powerup'), 600);
    }
}

// Global audio system instance
export const audioSystem = new AudioSystem();

// Note: Initialization handled by main.js 