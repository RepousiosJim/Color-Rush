'use client'

import { useState, useEffect } from 'react'
import { energyManager } from '@/lib/game/EnergySystem'

interface EnergyDisplayProps {
  energy: number
  maxEnergy: number
  lastEnergyUpdate: number
  onRefillEnergy?: () => void
  showRefillOption?: boolean
}

const EnergyDisplay: React.FC<EnergyDisplayProps> = ({
  energy,
  maxEnergy,
  lastEnergyUpdate,
  onRefillEnergy,
  showRefillOption = true
}) => {
  const [energyStatus, setEnergyStatus] = useState(
    energyManager.getEnergyStatus(energy, lastEnergyUpdate, maxEnergy)
  )

  useEffect(() => {
    const updateStatus = () => {
      const status = energyManager.getEnergyStatus(energy, lastEnergyUpdate, maxEnergy)
      setEnergyStatus(status)
    }

    updateStatus()
    const interval = setInterval(updateStatus, 1000) // Update every second

    return () => clearInterval(interval)
  }, [energy, lastEnergyUpdate, maxEnergy])

  const getEnergyColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 50) return 'bg-yellow-500'
    if (percentage >= 20) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getEnergyEmoji = (percentage: number) => {
    if (percentage >= 80) return '⚡'
    if (percentage >= 50) return '🔋'
    if (percentage >= 20) return '⚠️'
    return '🪫'
  }

  return (
    <div className="energy-display bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getEnergyEmoji(energyStatus.percentage)}</span>
          <span className="text-white font-bold">Energy</span>
        </div>
        
        <div className="text-white font-mono">
          {energyStatus.currentEnergy}/{energyStatus.maxEnergy}
        </div>
      </div>

      {/* Energy Bar */}
      <div className="w-full bg-gray-700 rounded-full h-3 mb-3 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${getEnergyColor(energyStatus.percentage)}`}
          style={{ width: `${energyStatus.percentage}%` }}
        />
      </div>

      {/* Status Information */}
      <div className="space-y-1 text-sm">
        {!energyStatus.isFull && (
          <>
            <div className="text-gray-300">
              Next energy: <span className="text-white font-mono">{energyStatus.timeToNextEnergy}</span>
            </div>
            <div className="text-gray-300">
              Full energy: <span className="text-white font-mono">{energyStatus.timeToFullEnergy}</span>
            </div>
          </>
        )}
        
        {energyStatus.isFull && (
          <div className="text-green-400 font-medium">
            ✨ Energy Full - Ready to play!
          </div>
        )}
        
        {energyStatus.isEmpty && (
          <div className="text-red-400 font-medium">
            💤 No energy - Wait or refill to continue
          </div>
        )}
      </div>

      {/* Refill Option */}
      {showRefillOption && !energyStatus.isFull && onRefillEnergy && (
        <button
          onClick={onRefillEnergy}
          className="w-full mt-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
                     text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 
                     transform hover:scale-105 active:scale-95"
        >
          <span className="flex items-center justify-center gap-2">
            💎 Refill Energy (50 gems)
          </span>
        </button>
      )}

      {/* Game Status */}
      <div className="mt-2 text-center">
        {energyStatus.canPlayGame ? (
          <span className="text-green-400 text-sm">✅ Ready to play</span>
        ) : (
          <span className="text-red-400 text-sm">❌ Need more energy</span>
        )}
      </div>
    </div>
  )
}

export default EnergyDisplay 