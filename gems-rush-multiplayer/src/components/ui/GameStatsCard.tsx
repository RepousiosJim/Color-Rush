'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface GameStatsCardProps {
  title: string
  stats: Array<{
    label: string
    value: string | number
    icon?: string
    color?: string
    highlight?: boolean
    trend?: 'up' | 'down' | 'neutral'
  }>
  progress?: {
    label: string
    current: number
    target: number
    showPercentage?: boolean
  }
  className?: string
}

export default function GameStatsCard({ 
  title, 
  stats, 
  progress, 
  className 
}: GameStatsCardProps) {
  const formatNumber = (num: number | string): string => {
    if (typeof num === 'string') return num
    return num.toLocaleString()
  }

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return '📈'
      case 'down': return '📉'
      case 'neutral': return '➡️'
      default: return ''
    }
  }

  const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return 'text-green-400'
      case 'down': return 'text-red-400'
      case 'neutral': return 'text-yellow-400'
      default: return 'text-white'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("group", className)}
    >
      <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <motion.span
              animate={{ 
                textShadow: [
                  '0 0 5px rgba(147, 51, 234, 0.5)',
                  '0 0 10px rgba(147, 51, 234, 0.8)',
                  '0 0 5px rgba(147, 51, 234, 0.5)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {title}
            </motion.span>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="text-purple-400"
            >
              ⭐
            </motion.div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Stats Grid */}
          <div className="space-y-3">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg transition-all duration-200",
                  stat.highlight && "bg-white/10 border border-white/20"
                )}
              >
                <div className="flex items-center gap-2">
                  {stat.icon && (
                    <span className="text-lg">{stat.icon}</span>
                  )}
                  <span className="text-purple-200 text-sm">{stat.label}</span>
                  {stat.trend && (
                    <span className={cn("text-xs", getTrendColor(stat.trend))}>
                      {getTrendIcon(stat.trend)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <motion.span 
                    className={cn(
                      "font-bold",
                      stat.color || "text-white",
                      stat.highlight && "text-yellow-400"
                    )}
                    key={stat.value}
                    initial={{ scale: 1.2, color: '#FFD700' }}
                    animate={{ scale: 1, color: stat.color || '#FFFFFF' }}
                    transition={{ duration: 0.3 }}
                  >
                    {formatNumber(stat.value)}
                  </motion.span>
                  
                  {stat.highlight && (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      ✨
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Progress Section */}
          {progress && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-purple-200 text-sm">{progress.label}</span>
                <span className="text-white text-sm font-medium">
                  {formatNumber(progress.current)} / {formatNumber(progress.target)}
                  {progress.showPercentage && (
                    <span className="text-purple-300 ml-1">
                      ({Math.round((progress.current / progress.target) * 100)}%)
                    </span>
                  )}
                </span>
              </div>
              
              <div className="relative">
                <Progress 
                  value={(progress.current / progress.target) * 100} 
                  className="h-3 bg-purple-800/30"
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full opacity-20"
                  animate={{
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1, 1.02, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* Decorative Elements */}
          <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="text-purple-300 text-xs"
            >
              ✨
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
} 