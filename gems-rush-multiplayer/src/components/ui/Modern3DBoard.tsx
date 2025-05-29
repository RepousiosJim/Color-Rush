'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import ModernGamePanel from './ModernGamePanel'
import ParticleSystem from './ParticleSystem'

interface Modern3DBoardProps {
  children: React.ReactNode
  size: { width: number; height: number }
  className?: string
  enableParticles?: boolean
  enable3D?: boolean
}

const Modern3DBoard = ({ 
  children, 
  size, 
  className = '',
  enableParticles = true,
  enable3D = true
}: Modern3DBoardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enable3D) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY
    
    setMousePosition({
      x: (mouseX / rect.width) * 20, // Reduced intensity for subtlety
      y: (mouseY / rect.height) * 20
    })
  }

  const board3DStyle = enable3D ? {
    transform: `perspective(1000px) rotateY(${mousePosition.x}deg) rotateX(${-mousePosition.y}deg)`,
    transformStyle: 'preserve-3d' as const
  } : {}

  return (
    <div className={`relative ${className}`}>
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-indigo-500/20 rounded-3xl blur-xl scale-110" />
      
      {/* Main Board Container */}
      <motion.div
        className="relative"
        style={board3DStyle}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setMousePosition({ x: 0, y: 0 })
        }}
        whileHover={enable3D ? { 
          scale: 1.02,
          transition: { type: "spring", stiffness: 300, damping: 30 }
        } : undefined}
      >
        <ModernGamePanel
          variant="neumorph"
          blur="lg"
          glow={isHovered}
          className="p-6 transition-all duration-500"
        >
          {/* Board Frame */}
          <div className="relative">
            {/* Inner Border Glow */}
            <div 
              className="absolute inset-0 rounded-2xl"
              style={{
                background: 'linear-gradient(45deg, rgba(147, 51, 234, 0.3), rgba(59, 130, 246, 0.3), rgba(16, 185, 129, 0.3), rgba(245, 158, 11, 0.3))',
                backgroundSize: '400% 400%',
                animation: 'gradientShift 4s ease infinite'
              }}
            />
            
            {/* Game Board Content */}
            <div 
              className="relative bg-black/30 backdrop-blur-sm rounded-2xl p-3 border-2 border-white/20 overflow-hidden"
              style={{ width: size.width, height: size.height }}
            >
              {/* Particle System */}
              {enableParticles && (
                <ParticleSystem
                  active={true}
                  type="ambient"
                  intensity="low"
                  className="z-0"
                />
              )}
              
              {/* Board Grid */}
              <div className="relative z-10 h-full">
                {children}
              </div>
              
              {/* Hover Overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </ModernGamePanel>
      </motion.div>
      
      {/* CSS for gradient animation */}
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  )
}

export default Modern3DBoard 