'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ModernGamePanelProps {
  children: ReactNode
  className?: string
  variant?: 'glass' | 'neumorph' | 'floating' | 'gradient'
  blur?: 'sm' | 'md' | 'lg' | 'xl'
  glow?: boolean
  interactive?: boolean
}

const ModernGamePanel = ({ 
  children, 
  className = '', 
  variant = 'glass',
  blur = 'md',
  glow = false,
  interactive = false
}: ModernGamePanelProps) => {
  const getVariantStyles = () => {
    const baseStyles = 'rounded-2xl border transition-all duration-300'
    
    switch (variant) {
      case 'glass':
        return `${baseStyles} bg-white/10 backdrop-blur-${blur} border-white/20 shadow-2xl`
      
      case 'neumorph':
        return `${baseStyles} bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-${blur} border-white/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_20px_25px_-5px_rgba(0,0,0,0.4)]`
      
      case 'floating':
        return `${baseStyles} bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-${blur} border-purple-300/30 shadow-[0_25px_50px_-12px_rgba(147,51,234,0.5)]`
      
      case 'gradient':
        return `${baseStyles} bg-gradient-to-br from-purple-600/30 via-blue-600/20 to-indigo-600/30 backdrop-blur-${blur} border-gradient border-white/40`
      
      default:
        return `${baseStyles} bg-white/10 backdrop-blur-${blur} border-white/20`
    }
  }

  const getGlowStyles = () => {
    if (!glow) return ''
    return 'shadow-[0_0_30px_rgba(147,51,234,0.3),0_0_60px_rgba(59,130,246,0.2)]'
  }

  const getInteractiveStyles = () => {
    if (!interactive) return ''
    return 'hover:bg-white/15 hover:border-white/30 hover:shadow-[0_25px_50px_-12px_rgba(147,51,234,0.4)] hover:scale-[1.02] cursor-pointer'
  }

  return (
    <motion.div
      className={`${getVariantStyles()} ${getGlowStyles()} ${getInteractiveStyles()} ${className}`}
      whileHover={interactive ? { y: -2 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  )
}

export default ModernGamePanel 