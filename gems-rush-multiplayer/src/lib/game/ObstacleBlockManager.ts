import { ObstacleBlock, BlockType, Gem } from '@/types/game'

export class ObstacleBlockManager {
  private nextId = 1

  // Generate obstacle blocks for a stage
  generateObstacleBlocks(
    stageNumber: number, 
    boardSize: number, 
    gemBoard: (Gem | null)[][]
  ): ObstacleBlock[] {
    const obstacles: ObstacleBlock[] = []
    
    // Determine how many blocks to spawn based on stage
    const greenBlockCount = this.getGreenBlockCount(stageNumber)
    const blueBlockCount = this.getBlueBlockCount(stageNumber)
    
    // Generate green blocks (appear starting stage 3)
    if (stageNumber >= 3 && greenBlockCount > 0) {
      const greenBlocks = this.generateBlockLines(
        'green', 
        greenBlockCount, 
        boardSize, 
        gemBoard,
        obstacles
      )
      obstacles.push(...greenBlocks)
    }
    
    // Generate blue blocks (appear starting stage 4)
    if (stageNumber >= 4 && blueBlockCount > 0) {
      const blueBlocks = this.generateBlockLines(
        'blue', 
        blueBlockCount, 
        boardSize, 
        gemBoard,
        obstacles
      )
      obstacles.push(...blueBlocks)
    }
    
    return obstacles
  }

  private getGreenBlockCount(stageNumber: number): number {
    if (stageNumber < 3) return 0
    if (stageNumber <= 5) return 1
    if (stageNumber <= 10) return 2
    if (stageNumber <= 15) return 3
    return 4
  }

  private getBlueBlockCount(stageNumber: number): number {
    if (stageNumber < 4) return 0
    if (stageNumber <= 6) return 1
    if (stageNumber <= 12) return 2
    if (stageNumber <= 18) return 3
    return 4
  }

  private generateBlockLines(
    blockType: BlockType,
    count: number,
    boardSize: number,
    gemBoard: (Gem | null)[][],
    existingObstacles: ObstacleBlock[]
  ): ObstacleBlock[] {
    const blocks: ObstacleBlock[] = []
    const maxAttempts = 50 // Prevent infinite loops
    
    for (let i = 0; i < count; i++) {
      let attempts = 0
      let placed = false
      
      while (!placed && attempts < maxAttempts) {
        attempts++
        
        // Randomly choose orientation
        const orientation: 'horizontal' | 'vertical' = Math.random() < 0.5 ? 'horizontal' : 'vertical'
        
        if (orientation === 'horizontal') {
          // Create horizontal line
          const row = Math.floor(Math.random() * boardSize)
          const startCol = Math.floor(Math.random() * (boardSize - 2)) // Ensure at least 3 blocks
          const length = Math.min(3 + Math.floor(Math.random() * 3), boardSize - startCol) // 3-5 blocks
          
          if (this.canPlaceHorizontalLine(row, startCol, length, boardSize, gemBoard, existingObstacles)) {
            for (let col = startCol; col < startCol + length; col++) {
              blocks.push({
                id: `${blockType}-${this.nextId++}`,
                type: blockType,
                row,
                col,
                orientation,
                health: blockType === 'blue' ? 2 : 1 // Blue blocks are tougher
              })
            }
            placed = true
          }
        } else {
          // Create vertical line
          const col = Math.floor(Math.random() * boardSize)
          const startRow = Math.floor(Math.random() * (boardSize - 2))
          const length = Math.min(3 + Math.floor(Math.random() * 3), boardSize - startRow)
          
          if (this.canPlaceVerticalLine(col, startRow, length, boardSize, gemBoard, existingObstacles)) {
            for (let row = startRow; row < startRow + length; row++) {
              blocks.push({
                id: `${blockType}-${this.nextId++}`,
                type: blockType,
                row,
                col,
                orientation,
                health: blockType === 'blue' ? 2 : 1
              })
            }
            placed = true
          }
        }
      }
    }
    
    return blocks
  }

  private canPlaceHorizontalLine(
    row: number,
    startCol: number,
    length: number,
    boardSize: number,
    gemBoard: (Gem | null)[][],
    existingObstacles: ObstacleBlock[]
  ): boolean {
    // Check bounds
    if (row < 0 || row >= boardSize || startCol < 0 || startCol + length > boardSize) {
      return false
    }
    
    // Check for existing obstacles in the same positions
    for (let col = startCol; col < startCol + length; col++) {
      if (existingObstacles.some(block => block.row === row && block.col === col)) {
        return false
      }
    }
    
    return true
  }

  private canPlaceVerticalLine(
    col: number,
    startRow: number,
    length: number,
    boardSize: number,
    gemBoard: (Gem | null)[][],
    existingObstacles: ObstacleBlock[]
  ): boolean {
    // Check bounds
    if (col < 0 || col >= boardSize || startRow < 0 || startRow + length > boardSize) {
      return false
    }
    
    // Check for existing obstacles in the same positions
    for (let row = startRow; row < startRow + length; row++) {
      if (existingObstacles.some(block => block.row === row && block.col === col)) {
        return false
      }
    }
    
    return true
  }

  // Check if obstacle blocks should be destroyed when gems are matched
  checkObstacleDestruction(
    matchedGems: Gem[],
    obstacleBlocks: ObstacleBlock[]
  ): {
    destroyedBlocks: ObstacleBlock[]
    remainingBlocks: ObstacleBlock[]
  } {
    const destroyedBlocks: ObstacleBlock[] = []
    const remainingBlocks: ObstacleBlock[] = []
    
    for (const block of obstacleBlocks) {
      if (block.isDestroyed) {
        continue // Already destroyed
      }
      
      // Check if any matched gem is adjacent to this block
      const isAdjacent = matchedGems.some(gem => 
        this.areAdjacent(gem.row, gem.col, block.row, block.col)
      )
      
      if (isAdjacent) {
        const updatedBlock = { ...block }
        
        // Reduce health
        const currentHealth = updatedBlock.health || 1
        const newHealth = currentHealth - 1
        
        if (newHealth <= 0) {
          // Block is destroyed
          updatedBlock.isDestroyed = true
          destroyedBlocks.push(updatedBlock)
        } else {
          // Block takes damage but survives
          updatedBlock.health = newHealth
          remainingBlocks.push(updatedBlock)
        }
      } else {
        // Block is unaffected
        remainingBlocks.push(block)
      }
    }
    
    return { destroyedBlocks, remainingBlocks }
  }

  private areAdjacent(row1: number, col1: number, row2: number, col2: number): boolean {
    const rowDiff = Math.abs(row1 - row2)
    const colDiff = Math.abs(col1 - col2)
    
    // Adjacent means exactly one cell away horizontally or vertically
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
  }

  // Get all blocks at a specific position
  getBlocksAtPosition(row: number, col: number, obstacleBlocks: ObstacleBlock[]): ObstacleBlock[] {
    return obstacleBlocks.filter(
      block => block.row === row && block.col === col && !block.isDestroyed
    )
  }

  // Check if a position has any obstacle blocks
  hasObstacleAtPosition(row: number, col: number, obstacleBlocks: ObstacleBlock[]): boolean {
    return this.getBlocksAtPosition(row, col, obstacleBlocks).length > 0
  }

  // Get visual representation for rendering
  getBlockVisualData(block: ObstacleBlock) {
    return {
      type: block.type,
      orientation: block.orientation,
      health: block.health || 1,
      maxHealth: block.type === 'blue' ? 2 : 1,
      isDestroyed: block.isDestroyed || false,
      emoji: block.type === 'green' ? '🟢' : '🔵',
      color: block.type === 'green' ? '#22C55E' : '#3B82F6',
      damaged: (block.health || 1) < (block.type === 'blue' ? 2 : 1)
    }
  }

  // Count remaining blocks by type (for stage objectives)
  countRemainingBlocks(obstacleBlocks: ObstacleBlock[], blockType?: BlockType): number {
    return obstacleBlocks.filter(block => 
      !block.isDestroyed && 
      (blockType ? block.type === blockType : true)
    ).length
  }

  // Count destroyed blocks by type (for stage completion)
  countDestroyedBlocks(obstacleBlocks: ObstacleBlock[], blockType?: BlockType): number {
    return obstacleBlocks.filter(block => 
      block.isDestroyed && 
      (blockType ? block.type === blockType : true)
    ).length
  }

  // Generate random placement avoiding certain areas
  generateAvoidingGems(
    blockType: BlockType,
    count: number,
    boardSize: number,
    gemBoard: (Gem | null)[][],
    avoidPositions: { row: number; col: number }[] = []
  ): ObstacleBlock[] {
    const blocks: ObstacleBlock[] = []
    const maxAttempts = 100
    
    for (let i = 0; i < count; i++) {
      let attempts = 0
      let placed = false
      
      while (!placed && attempts < maxAttempts) {
        attempts++
        
        const orientation: 'horizontal' | 'vertical' = Math.random() < 0.5 ? 'horizontal' : 'vertical'
        const length = 2 + Math.floor(Math.random() * 3) // 2-4 blocks
        
        let startRow: number, startCol: number
        
        if (orientation === 'horizontal') {
          startRow = Math.floor(Math.random() * boardSize)
          startCol = Math.floor(Math.random() * (boardSize - length + 1))
        } else {
          startRow = Math.floor(Math.random() * (boardSize - length + 1))
          startCol = Math.floor(Math.random() * boardSize)
        }
        
        // Check if placement is valid
        let canPlace = true
        const positions: { row: number; col: number }[] = []
        
        for (let j = 0; j < length; j++) {
          const row = orientation === 'horizontal' ? startRow : startRow + j
          const col = orientation === 'horizontal' ? startCol + j : startCol
          
          positions.push({ row, col })
          
          // Check bounds
          if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) {
            canPlace = false
            break
          }
          
          // Check avoid positions
          if (avoidPositions.some(pos => pos.row === row && pos.col === col)) {
            canPlace = false
            break
          }
          
          // Check existing blocks
          if (blocks.some(block => block.row === row && block.col === col)) {
            canPlace = false
            break
          }
        }
        
        if (canPlace) {
          for (const pos of positions) {
            blocks.push({
              id: `${blockType}-${this.nextId++}`,
              type: blockType,
              row: pos.row,
              col: pos.col,
              orientation,
              health: blockType === 'blue' ? 2 : 1
            })
          }
          placed = true
        }
      }
    }
    
    return blocks
  }
}

export const obstacleBlockManager = new ObstacleBlockManager() 