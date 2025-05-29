'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { GemType } from '@/types/game'

export type ThemeVariant = 
  | 'classic' 
  | 'neon' 
  | 'nature' 
  | 'space' 
  | 'fire' 
  | 'ocean' 
  | 'mystic' 
  | 'crystal'

export interface GameTheme {
  id: ThemeVariant
  name: string
  description: string
  icon: string
  unlockLevel: number
  isPremium: boolean
  backgrounds: {
    primary: string
    secondary: string
    accent: string
    overlay?: string
    pattern?: string
  }
  gemStyles: Record<GemType, {
    colors: {
      primary: string
      secondary: string
      glow: string
      shadow: string
    }
    effects: {
      glow: boolean
      particles: boolean
      animation: 'standard' | 'pulse' | 'rotate' | 'float'
      specialFx?: string
    }
  }>
  boardStyles: {
    background: string
    border: string
    shadow: string
    glow?: string
    pattern?: string
  }
  uiStyles: {
    panels: {
      background: string
      border: string
      blur: string
    }
    buttons: {
      primary: string
      secondary: string
      accent: string
    }
    text: {
      primary: string
      secondary: string
      accent: string
    }
  }
  particles: {
    ambient: {
      colors: string[]
      density: 'low' | 'medium' | 'high'
      types: string[]
    }
    effects: {
      colors: string[]
      intensity: number
    }
  }
  sounds?: {
    match: string
    combo: string
    powerup: string
    ambient?: string
  }
}

const GAME_THEMES: Record<ThemeVariant, GameTheme> = {
  classic: {
    id: 'classic',
    name: 'Classic Divine',
    description: 'The original celestial theme with divine gem aesthetics',
    icon: '✨',
    unlockLevel: 1,
    isPremium: false,
    backgrounds: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      accent: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    gemStyles: {
      fire: {
        colors: { primary: '#FF4500', secondary: '#DC143C', glow: '#FF6347', shadow: '#B22222' },
        effects: { glow: true, particles: true, animation: 'pulse' }
      },
      water: {
        colors: { primary: '#1E90FF', secondary: '#4169E1', glow: '#87CEEB', shadow: '#000080' },
        effects: { glow: true, particles: true, animation: 'float' }
      },
      earth: {
        colors: { primary: '#8B4513', secondary: '#A0522D', glow: '#D2691E', shadow: '#654321' },
        effects: { glow: true, particles: true, animation: 'standard' }
      },
      air: {
        colors: { primary: '#87CEEB', secondary: '#B0E0E6', glow: '#E0F6FF', shadow: '#4682B4' },
        effects: { glow: true, particles: true, animation: 'float' }
      },
      lightning: {
        colors: { primary: '#FFD700', secondary: '#FFA500', glow: '#FFFF00', shadow: '#FF8C00' },
        effects: { glow: true, particles: true, animation: 'pulse', specialFx: 'electric' }
      },
      nature: {
        colors: { primary: '#32CD32', secondary: '#228B22', glow: '#90EE90', shadow: '#006400' },
        effects: { glow: true, particles: true, animation: 'float' }
      },
      magic: {
        colors: { primary: '#9932CC', secondary: '#8A2BE2', glow: '#DDA0DD', shadow: '#4B0082' },
        effects: { glow: true, particles: true, animation: 'rotate', specialFx: 'sparkle' }
      }
    },
    boardStyles: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    },
    uiStyles: {
      panels: { background: 'rgba(255, 255, 255, 0.1)', border: 'rgba(255, 255, 255, 0.2)', blur: 'backdrop-blur-md' },
      buttons: { primary: '#8B5CF6', secondary: '#3B82F6', accent: '#10B981' },
      text: { primary: '#FFFFFF', secondary: '#E5E7EB', accent: '#F59E0B' }
    },
    particles: {
      ambient: { colors: ['#8B5CF6', '#3B82F6', '#10B981'], density: 'medium', types: ['sparkle', 'star'] },
      effects: { colors: ['#FFD700', '#FF6B6B', '#4ECDC4'], intensity: 1 }
    }
  },

  neon: {
    id: 'neon',
    name: 'Neon Cyber',
    description: 'Futuristic cyberpunk theme with glowing neon effects',
    icon: '🌈',
    unlockLevel: 5,
    isPremium: false,
    backgrounds: {
      primary: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      secondary: 'linear-gradient(135deg, #ff006e 0%, #fb5607 50%, #ffbe0b 100%)',
      accent: 'linear-gradient(135deg, #8338ec 0%, #3a86ff 100%)',
      pattern: 'radial-gradient(circle at 50% 50%, rgba(255, 0, 110, 0.1) 0%, transparent 50%)'
    },
    gemStyles: {
      fire: {
        colors: { primary: '#ff006e', secondary: '#fb5607', glow: '#ff0080', shadow: '#c7006e' },
        effects: { glow: true, particles: true, animation: 'pulse', specialFx: 'neon-flicker' }
      },
      water: {
        colors: { primary: '#3a86ff', secondary: '#06ffa5', glow: '#00d9ff', shadow: '#0077be' },
        effects: { glow: true, particles: true, animation: 'float', specialFx: 'electric-blue' }
      },
      earth: {
        colors: { primary: '#ffbe0b', secondary: '#fb8500', glow: '#ffd60a', shadow: '#d68100' },
        effects: { glow: true, particles: true, animation: 'pulse' }
      },
      air: {
        colors: { primary: '#8338ec', secondary: '#a663cc', glow: '#c77dff', shadow: '#6929c4' },
        effects: { glow: true, particles: true, animation: 'float' }
      },
      lightning: {
        colors: { primary: '#06ffa5', secondary: '#00f5ff', glow: '#00ff9f', shadow: '#00cc78' },
        effects: { glow: true, particles: true, animation: 'pulse', specialFx: 'cyber-lightning' }
      },
      nature: {
        colors: { primary: '#32ff32', secondary: '#00ff00', glow: '#7fff00', shadow: '#00cc00' },
        effects: { glow: true, particles: true, animation: 'float', specialFx: 'matrix-code' }
      },
      magic: {
        colors: { primary: '#ff00ff', secondary: '#bf00ff', glow: '#ff80ff', shadow: '#9900cc' },
        effects: { glow: true, particles: true, animation: 'rotate', specialFx: 'hologram' }
      }
    },
    boardStyles: {
      background: 'rgba(0, 0, 0, 0.4)',
      border: 'rgba(255, 0, 110, 0.6)',
      shadow: '0 0 30px rgba(255, 0, 110, 0.4)',
      glow: 'rgba(255, 0, 110, 0.8)'
    },
    uiStyles: {
      panels: { background: 'rgba(0, 0, 0, 0.6)', border: 'rgba(255, 0, 110, 0.4)', blur: 'backdrop-blur-lg' },
      buttons: { primary: '#ff006e', secondary: '#8338ec', accent: '#06ffa5' },
      text: { primary: '#ffffff', secondary: '#06ffa5', accent: '#ff006e' }
    },
    particles: {
      ambient: { colors: ['#ff006e', '#8338ec', '#06ffa5'], density: 'high', types: ['energy', 'glow'] },
      effects: { colors: ['#ff0080', '#00ff9f', '#c77dff'], intensity: 1.5 }
    }
  },

  nature: {
    id: 'nature',
    name: 'Enchanted Forest',
    description: 'Mystical forest theme with natural earth tones',
    icon: '🌿',
    unlockLevel: 10,
    isPremium: false,
    backgrounds: {
      primary: 'linear-gradient(135deg, #2d5016 0%, #3a5998 50%, #1e3c72 100%)',
      secondary: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
      accent: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      pattern: 'radial-gradient(circle at 30% 70%, rgba(86, 171, 47, 0.3) 0%, transparent 50%)'
    },
    gemStyles: {
      fire: {
        colors: { primary: '#ff7f50', secondary: '#ff6347', glow: '#ffa07a', shadow: '#cd5c5c' },
        effects: { glow: true, particles: true, animation: 'pulse', specialFx: 'flame-dance' }
      },
      water: {
        colors: { primary: '#4682b4', secondary: '#5f9ea0', glow: '#87ceeb', shadow: '#2f4f4f' },
        effects: { glow: true, particles: true, animation: 'float', specialFx: 'water-ripple' }
      },
      earth: {
        colors: { primary: '#8b4513', secondary: '#cd853f', glow: '#daa520', shadow: '#654321' },
        effects: { glow: true, particles: true, animation: 'standard', specialFx: 'earth-crumble' }
      },
      air: {
        colors: { primary: '#98fb98', secondary: '#90ee90', glow: '#f0fff0', shadow: '#228b22' },
        effects: { glow: true, particles: true, animation: 'float', specialFx: 'wind-swirl' }
      },
      lightning: {
        colors: { primary: '#9acd32', secondary: '#adff2f', glow: '#7fff00', shadow: '#556b2f' },
        effects: { glow: true, particles: true, animation: 'pulse', specialFx: 'bio-electric' }
      },
      nature: {
        colors: { primary: '#228b22', secondary: '#32cd32', glow: '#90ee90', shadow: '#006400' },
        effects: { glow: true, particles: true, animation: 'float', specialFx: 'growth-spiral' }
      },
      magic: {
        colors: { primary: '#9370db', secondary: '#ba55d3', glow: '#dda0dd', shadow: '#4b0082' },
        effects: { glow: true, particles: true, animation: 'rotate', specialFx: 'fairy-dust' }
      }
    },
    boardStyles: {
      background: 'rgba(34, 139, 34, 0.15)',
      border: 'rgba(144, 238, 144, 0.4)',
      shadow: '0 8px 32px rgba(34, 139, 34, 0.3)'
    },
    uiStyles: {
      panels: { background: 'rgba(34, 139, 34, 0.2)', border: 'rgba(144, 238, 144, 0.3)', blur: 'backdrop-blur-md' },
      buttons: { primary: '#228b22', secondary: '#32cd32', accent: '#9acd32' },
      text: { primary: '#f0fff0', secondary: '#90ee90', accent: '#adff2f' }
    },
    particles: {
      ambient: { colors: ['#228b22', '#32cd32', '#9acd32'], density: 'medium', types: ['sparkle', 'leaf'] },
      effects: { colors: ['#90ee90', '#adff2f', '#7fff00'], intensity: 1 }
    }
  },

  space: {
    id: 'space',
    name: 'Cosmic Void',
    description: 'Deep space theme with stellar effects and cosmic colors',
    icon: '🌌',
    unlockLevel: 15,
    isPremium: true,
    backgrounds: {
      primary: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)',
      secondary: 'linear-gradient(135deg, #e056fd 0%, #f8acff 100%)',
      accent: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      pattern: 'radial-gradient(circle at 20% 80%, rgba(224, 86, 253, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(102, 126, 234, 0.2) 0%, transparent 50%)'
    },
    gemStyles: {
      fire: {
        colors: { primary: '#ff4757', secondary: '#ff3838', glow: '#ff6b7a', shadow: '#c44569' },
        effects: { glow: true, particles: true, animation: 'pulse', specialFx: 'solar-flare' }
      },
      water: {
        colors: { primary: '#3742fa', secondary: '#2f3542', glow: '#70a1ff', shadow: '#57606f' },
        effects: { glow: true, particles: true, animation: 'float', specialFx: 'nebula-drift' }
      },
      earth: {
        colors: { primary: '#ffa502', secondary: '#ff6348', glow: '#ffb142', shadow: '#e55039' },
        effects: { glow: true, particles: true, animation: 'standard', specialFx: 'asteroid-spin' }
      },
      air: {
        colors: { primary: '#7bed9f', secondary: '#70a1ff', glow: '#a4b0be', shadow: '#57606f' },
        effects: { glow: true, particles: true, animation: 'float', specialFx: 'cosmic-wind' }
      },
      lightning: {
        colors: { primary: '#eccc68', secondary: '#ffa502', glow: '#f1c40f', shadow: '#f39c12' },
        effects: { glow: true, particles: true, animation: 'pulse', specialFx: 'cosmic-storm' }
      },
      nature: {
        colors: { primary: '#7bed9f', secondary: '#2ed573', glow: '#7bed9f', shadow: '#2ed573' },
        effects: { glow: true, particles: true, animation: 'float', specialFx: 'alien-growth' }
      },
      magic: {
        colors: { primary: '#e056fd', secondary: '#f8acff', glow: '#f8acff', shadow: '#c44569' },
        effects: { glow: true, particles: true, animation: 'rotate', specialFx: 'quantum-flux' }
      }
    },
    boardStyles: {
      background: 'rgba(0, 0, 0, 0.6)',
      border: 'rgba(224, 86, 253, 0.5)',
      shadow: '0 0 40px rgba(224, 86, 253, 0.3)',
      glow: 'rgba(224, 86, 253, 0.8)'
    },
    uiStyles: {
      panels: { background: 'rgba(0, 0, 0, 0.7)', border: 'rgba(224, 86, 253, 0.4)', blur: 'backdrop-blur-xl' },
      buttons: { primary: '#e056fd', secondary: '#3742fa', accent: '#7bed9f' },
      text: { primary: '#ffffff', secondary: '#a4b0be', accent: '#e056fd' }
    },
    particles: {
      ambient: { colors: ['#e056fd', '#3742fa', '#7bed9f'], density: 'high', types: ['star', 'cosmic'] },
      effects: { colors: ['#f8acff', '#70a1ff', '#7bed9f'], intensity: 1.8 }
    }
  },

  fire: {
    id: 'fire',
    name: 'Infernal Realm',
    description: 'Blazing fire theme with volcanic aesthetics',
    icon: '🔥',
    unlockLevel: 20,
    isPremium: true,
    backgrounds: {
      primary: 'linear-gradient(135deg, #2c1810 0%, #8b1538 50%, #d2001f 100%)',
      secondary: 'linear-gradient(135deg, #ff4757 0%, #ff3838 100%)',
      accent: 'linear-gradient(135deg, #ffa502 0%, #ff6348 100%)'
    },
    gemStyles: {
      fire: {
        colors: { primary: '#ff4757', secondary: '#ff3838', glow: '#ff6b7a', shadow: '#c44569' },
        effects: { glow: true, particles: true, animation: 'pulse', specialFx: 'inferno' }
      },
      water: {
        colors: { primary: '#ff6b7a', secondary: '#ff5252', glow: '#ff8a80', shadow: '#d32f2f' },
        effects: { glow: true, particles: true, animation: 'float', specialFx: 'steam' }
      },
      earth: {
        colors: { primary: '#ffa502', secondary: '#ff6348', glow: '#ffb142', shadow: '#e55039' },
        effects: { glow: true, particles: true, animation: 'standard', specialFx: 'lava-burst' }
      },
      air: {
        colors: { primary: '#ff7675', secondary: '#fd79a8', glow: '#fdcb6e', shadow: '#e84393' },
        effects: { glow: true, particles: true, animation: 'float', specialFx: 'heat-wave' }
      },
      lightning: {
        colors: { primary: '#fdcb6e', secondary: '#e17055', glow: '#f39c12', shadow: '#d63031' },
        effects: { glow: true, particles: true, animation: 'pulse', specialFx: 'fire-lightning' }
      },
      nature: {
        colors: { primary: '#e17055', secondary: '#d63031', glow: '#fab1a0', shadow: '#a29bfe' },
        effects: { glow: true, particles: true, animation: 'float', specialFx: 'burning-leaves' }
      },
      magic: {
        colors: { primary: '#fd79a8', secondary: '#e84393', glow: '#fdcb6e', shadow: '#6c5ce7' },
        effects: { glow: true, particles: true, animation: 'rotate', specialFx: 'fire-magic' }
      }
    },
    boardStyles: {
      background: 'rgba(255, 71, 87, 0.2)',
      border: 'rgba(255, 107, 122, 0.6)',
      shadow: '0 0 40px rgba(255, 71, 87, 0.4)'
    },
    uiStyles: {
      panels: { background: 'rgba(139, 21, 56, 0.3)', border: 'rgba(255, 107, 122, 0.4)', blur: 'backdrop-blur-md' },
      buttons: { primary: '#ff4757', secondary: '#ffa502', accent: '#fd79a8' },
      text: { primary: '#ffffff', secondary: '#fdcb6e', accent: '#ff6b7a' }
    },
    particles: {
      ambient: { colors: ['#ff4757', '#ffa502', '#fd79a8'], density: 'high', types: ['flame', 'ember'] },
      effects: { colors: ['#ff6b7a', '#ffb142', '#fdcb6e'], intensity: 2 }
    }
  },

  ocean: {
    id: 'ocean',
    name: 'Abyssal Depths',
    description: 'Deep ocean theme with aquatic effects',
    icon: '🌊',
    unlockLevel: 25,
    isPremium: true,
    backgrounds: {
      primary: 'linear-gradient(135deg, #0f3460 0%, #16537e 50%, #0c4271 100%)',
      secondary: 'linear-gradient(135deg, #00b8d4 0%, #0097a7 100%)',
      accent: 'linear-gradient(135deg, #26c6da 0%, #00acc1 100%)'
    },
    gemStyles: {
      fire: {
        colors: { primary: '#26c6da', secondary: '#00bcd4', glow: '#4dd0e1', shadow: '#0097a7' },
        effects: { glow: true, particles: true, animation: 'pulse', specialFx: 'thermal-vent' }
      },
      water: {
        colors: { primary: '#00b8d4', secondary: '#0097a7', glow: '#26c6da', shadow: '#006064' },
        effects: { glow: true, particles: true, animation: 'float', specialFx: 'bubble-stream' }
      },
      earth: {
        colors: { primary: '#4db6ac', secondary: '#26a69a', glow: '#80cbc4', shadow: '#00695c' },
        effects: { glow: true, particles: true, animation: 'standard', specialFx: 'coral-growth' }
      },
      air: {
        colors: { primary: '#81c784', secondary: '#66bb6a', glow: '#a5d6a7', shadow: '#388e3c' },
        effects: { glow: true, particles: true, animation: 'float', specialFx: 'underwater-current' }
      },
      lightning: {
        colors: { primary: '#29b6f6', secondary: '#039be5', glow: '#4fc3f7', shadow: '#0277bd' },
        effects: { glow: true, particles: true, animation: 'pulse', specialFx: 'bio-luminescence' }
      },
      nature: {
        colors: { primary: '#66bb6a', secondary: '#4caf50', glow: '#81c784', shadow: '#2e7d32' },
        effects: { glow: true, particles: true, animation: 'float', specialFx: 'seaweed-sway' }
      },
      magic: {
        colors: { primary: '#7986cb', secondary: '#5c6bc0', glow: '#9fa8da', shadow: '#3f51b5' },
        effects: { glow: true, particles: true, animation: 'rotate', specialFx: 'deep-magic' }
      }
    },
    boardStyles: {
      background: 'rgba(0, 184, 212, 0.15)',
      border: 'rgba(38, 198, 218, 0.5)',
      shadow: '0 8px 40px rgba(0, 184, 212, 0.3)'
    },
    uiStyles: {
      panels: { background: 'rgba(15, 52, 96, 0.4)', border: 'rgba(38, 198, 218, 0.3)', blur: 'backdrop-blur-lg' },
      buttons: { primary: '#00b8d4', secondary: '#26c6da', accent: '#4db6ac' },
      text: { primary: '#e1f5fe', secondary: '#80deea', accent: '#26c6da' }
    },
    particles: {
      ambient: { colors: ['#00b8d4', '#26c6da', '#4db6ac'], density: 'medium', types: ['bubble', 'flow'] },
      effects: { colors: ['#4dd0e1', '#80cbc4', '#a5d6a7'], intensity: 1.2 }
    }
  },

  mystic: {
    id: 'mystic',
    name: 'Arcane Sanctum',
    description: 'Mystical magic theme with ethereal effects',
    icon: '🔮',
    unlockLevel: 30,
    isPremium: true,
    backgrounds: {
      primary: 'linear-gradient(135deg, #2d1b69 0%, #11998e 50%, #38ef7d 100%)',
      secondary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      accent: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    gemStyles: {
      fire: {
        colors: { primary: '#8e44ad', secondary: '#9b59b6', glow: '#bb8fce', shadow: '#6c3483' },
        effects: { glow: true, particles: true, animation: 'pulse', specialFx: 'mystic-flame' }
      },
      water: {
        colors: { primary: '#3498db', secondary: '#5dade2', glow: '#85c1e9', shadow: '#2471a3' },
        effects: { glow: true, particles: true, animation: 'float', specialFx: 'spirit-water' }
      },
      earth: {
        colors: { primary: '#f39c12', secondary: '#f4d03f', glow: '#f7dc6f', shadow: '#d68910' },
        effects: { glow: true, particles: true, animation: 'standard', specialFx: 'crystal-formation' }
      },
      air: {
        colors: { primary: '#17a2b8', secondary: '#5499c7', glow: '#7fb3d3', shadow: '#1b4f72' },
        effects: { glow: true, particles: true, animation: 'float', specialFx: 'ethereal-wind' }
      },
      lightning: {
        colors: { primary: '#e74c3c', secondary: '#ec7063', glow: '#f1948a', shadow: '#c0392b' },
        effects: { glow: true, particles: true, animation: 'pulse', specialFx: 'arcane-lightning' }
      },
      nature: {
        colors: { primary: '#27ae60', secondary: '#58d68d', glow: '#7dcea0', shadow: '#1e8449' },
        effects: { glow: true, particles: true, animation: 'float', specialFx: 'life-force' }
      },
      magic: {
        colors: { primary: '#9b59b6', secondary: '#bb8fce', glow: '#d7bde2', shadow: '#7d3c98' },
        effects: { glow: true, particles: true, animation: 'rotate', specialFx: 'pure-magic' }
      }
    },
    boardStyles: {
      background: 'rgba(155, 89, 182, 0.2)',
      border: 'rgba(187, 143, 206, 0.5)',
      shadow: '0 0 50px rgba(155, 89, 182, 0.4)'
    },
    uiStyles: {
      panels: { background: 'rgba(45, 27, 105, 0.4)', border: 'rgba(187, 143, 206, 0.4)', blur: 'backdrop-blur-xl' },
      buttons: { primary: '#9b59b6', secondary: '#3498db', accent: '#27ae60' },
      text: { primary: '#f8f9fa', secondary: '#d7bde2', accent: '#bb8fce' }
    },
    particles: {
      ambient: { colors: ['#9b59b6', '#3498db', '#27ae60'], density: 'high', types: ['mystic', 'aura'] },
      effects: { colors: ['#bb8fce', '#85c1e9', '#7dcea0'], intensity: 1.5 }
    }
  },

  crystal: {
    id: 'crystal',
    name: 'Crystal Caverns',
    description: 'Crystalline theme with prismatic effects',
    icon: '💎',
    unlockLevel: 35,
    isPremium: true,
    backgrounds: {
      primary: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)',
      secondary: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
      accent: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)'
    },
    gemStyles: {
      fire: {
        colors: { primary: '#ff5722', secondary: '#ff7043', glow: '#ff8a65', shadow: '#d84315' },
        effects: { glow: true, particles: true, animation: 'pulse', specialFx: 'crystal-fire' }
      },
      water: {
        colors: { primary: '#2196f3', secondary: '#42a5f5', glow: '#64b5f6', shadow: '#1565c0' },
        effects: { glow: true, particles: true, animation: 'float', specialFx: 'crystal-water' }
      },
      earth: {
        colors: { primary: '#8bc34a', secondary: '#9ccc65', glow: '#aed581', shadow: '#689f38' },
        effects: { glow: true, particles: true, animation: 'standard', specialFx: 'crystal-growth' }
      },
      air: {
        colors: { primary: '#00bcd4', secondary: '#26c6da', glow: '#4dd0e1', shadow: '#0097a7' },
        effects: { glow: true, particles: true, animation: 'float', specialFx: 'crystal-wind' }
      },
      lightning: {
        colors: { primary: '#ffc107', secondary: '#ffca28', glow: '#ffd54f', shadow: '#f57f17' },
        effects: { glow: true, particles: true, animation: 'pulse', specialFx: 'crystal-lightning' }
      },
      nature: {
        colors: { primary: '#4caf50', secondary: '#66bb6a', glow: '#81c784', shadow: '#2e7d32' },
        effects: { glow: true, particles: true, animation: 'float', specialFx: 'crystal-nature' }
      },
      magic: {
        colors: { primary: '#9c27b0', secondary: '#ab47bc', glow: '#ba68c8', shadow: '#6a1b9a' },
        effects: { glow: true, particles: true, animation: 'rotate', specialFx: 'prismatic-magic' }
      }
    },
    boardStyles: {
      background: 'rgba(255, 255, 255, 0.3)',
      border: 'rgba(156, 39, 176, 0.4)',
      shadow: '0 8px 50px rgba(156, 39, 176, 0.2)'
    },
    uiStyles: {
      panels: { background: 'rgba(255, 255, 255, 0.2)', border: 'rgba(156, 39, 176, 0.3)', blur: 'backdrop-blur-md' },
      buttons: { primary: '#9c27b0', secondary: '#2196f3', accent: '#4caf50' },
      text: { primary: '#263238', secondary: '#455a64', accent: '#9c27b0' }
    },
    particles: {
      ambient: { colors: ['#9c27b0', '#2196f3', '#4caf50'], density: 'medium', types: ['crystal', 'prism'] },
      effects: { colors: ['#ba68c8', '#64b5f6', '#81c784'], intensity: 1.3 }
    }
  }
}

interface ThemeContextType {
  currentTheme: GameTheme
  setTheme: (themeId: ThemeVariant) => void
  availableThemes: GameTheme[]
  unlockedThemes: ThemeVariant[]
  isThemeUnlocked: (themeId: ThemeVariant) => boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
  initialTheme?: ThemeVariant
  userLevel?: number
  hasPremium?: boolean
}

export const ThemeProvider = ({ 
  children, 
  initialTheme = 'classic',
  userLevel = 1,
  hasPremium = false 
}: ThemeProviderProps) => {
  const [currentThemeId, setCurrentThemeId] = useState<ThemeVariant>(initialTheme)

  const availableThemes = Object.values(GAME_THEMES)
  
  const unlockedThemes = availableThemes
    .filter(theme => 
      userLevel >= theme.unlockLevel && 
      (!theme.isPremium || hasPremium)
    )
    .map(theme => theme.id)

  const isThemeUnlocked = (themeId: ThemeVariant): boolean => {
    const theme = GAME_THEMES[themeId]
    return userLevel >= theme.unlockLevel && (!theme.isPremium || hasPremium)
  }

  const setTheme = (themeId: ThemeVariant) => {
    if (isThemeUnlocked(themeId)) {
      setCurrentThemeId(themeId)
      // Save to localStorage
      localStorage.setItem('gameTheme', themeId)
    }
  }

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('gameTheme') as ThemeVariant
    if (savedTheme && isThemeUnlocked(savedTheme)) {
      setCurrentThemeId(savedTheme)
    }
  }, [userLevel, hasPremium])

  const currentTheme = GAME_THEMES[currentThemeId]

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      setTheme,
      availableThemes,
      unlockedThemes,
      isThemeUnlocked
    }}>
      <div
        className="min-h-screen transition-all duration-1000"
        style={{
          background: currentTheme.backgrounds.primary,
          backgroundImage: currentTheme.backgrounds.pattern
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

interface ThemeSelectorProps {
  onThemeSelect?: (theme: GameTheme) => void
  showLocked?: boolean
  compact?: boolean
}

export const ThemeSelector = ({ 
  onThemeSelect, 
  showLocked = true,
  compact = false 
}: ThemeSelectorProps) => {
  const { currentTheme, setTheme, availableThemes, isThemeUnlocked } = useTheme()
  const [selectedPreview, setSelectedPreview] = useState<ThemeVariant | null>(null)

  const handleThemeSelect = (theme: GameTheme) => {
    if (isThemeUnlocked(theme.id)) {
      setTheme(theme.id)
      onThemeSelect?.(theme)
    }
  }

  return (
    <div className="w-full">
      <div className={`grid gap-4 ${compact ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {availableThemes.map(theme => {
          const isUnlocked = isThemeUnlocked(theme.id)
          const isSelected = currentTheme.id === theme.id
          const isPreviewing = selectedPreview === theme.id

          if (!isUnlocked && !showLocked) return null

          return (
            <motion.div
              key={theme.id}
              className={`relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all duration-300 ${
                isSelected ? 'border-yellow-400 ring-2 ring-yellow-400/50' :
                isUnlocked ? 'border-white/20 hover:border-white/40' :
                'border-gray-600 opacity-60'
              }`}
              style={{
                background: theme.backgrounds.primary,
                backgroundImage: theme.backgrounds.pattern
              }}
              whileHover={isUnlocked ? { scale: 1.02 } : {}}
              whileTap={isUnlocked ? { scale: 0.98 } : {}}
              onClick={() => handleThemeSelect(theme)}
              onMouseEnter={() => setSelectedPreview(theme.id)}
              onMouseLeave={() => setSelectedPreview(null)}
            >
              {/* Theme Preview */}
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{theme.icon}</span>
                  <div>
                    <h3 className={`font-bold ${compact ? 'text-sm' : 'text-lg'}`} style={{ color: theme.uiStyles.text.primary }}>
                      {theme.name}
                    </h3>
                    {!compact && (
                      <p className="text-xs opacity-80" style={{ color: theme.uiStyles.text.secondary }}>
                        {theme.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Gem Preview */}
                <div className="grid grid-cols-4 gap-1 mb-3">
                  {(['fire', 'water', 'earth', 'lightning'] as GemType[]).map(gemType => (
                    <div
                      key={gemType}
                      className="aspect-square rounded border"
                      style={{
                        background: `linear-gradient(45deg, ${theme.gemStyles[gemType].colors.primary}, ${theme.gemStyles[gemType].colors.secondary})`,
                        borderColor: theme.gemStyles[gemType].colors.glow,
                        boxShadow: `0 0 8px ${theme.gemStyles[gemType].colors.glow}50`
                      }}
                    />
                  ))}
                </div>

                {/* Unlock Status */}
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: theme.uiStyles.text.secondary }}>
                    Level {theme.unlockLevel}+
                  </span>
                  {theme.isPremium && (
                    <span className="bg-yellow-400 text-black px-2 py-0.5 rounded-full font-bold">
                      PREMIUM
                    </span>
                  )}
                  {isSelected && (
                    <span className="bg-green-400 text-black px-2 py-0.5 rounded-full font-bold">
                      ACTIVE
                    </span>
                  )}
                  {!isUnlocked && (
                    <span className="bg-gray-600 text-white px-2 py-0.5 rounded-full">
                      LOCKED
                    </span>
                  )}
                </div>
              </div>

              {/* Lock Overlay */}
              {!isUnlocked && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-3xl mb-2">🔒</div>
                    <div className="text-sm font-bold">
                      {theme.isPremium ? 'Premium Required' : `Level ${theme.unlockLevel} Required`}
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Effect */}
              <AnimatePresence>
                {isPreviewing && isUnlocked && (
                  <motion.div
                    className="absolute inset-0 bg-white/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export { GAME_THEMES } 