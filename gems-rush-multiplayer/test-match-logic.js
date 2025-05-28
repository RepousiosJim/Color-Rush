// Test script to verify match-3 logic
// This demonstrates that only gems in 3+ matches are removed

// Mock data structures
const GEM_TYPES = {
  fire: { emoji: '🔥' },
  water: { emoji: '💧' },
  earth: { emoji: '🌍' },
  air: { emoji: '💨' },
  lightning: { emoji: '⚡' },
  nature: { emoji: '🌿' },
  magic: { emoji: '🔮' }
}

// Create test board with specific pattern
function createTestBoard() {
  return [
    ['fire', 'water', 'earth', 'air', 'lightning', 'nature', 'magic', 'fire'],
    ['water', 'fire', 'fire', 'fire', 'lightning', 'nature', 'magic', 'water'], // 3 fire gems in a row
    ['earth', 'water', 'earth', 'air', 'lightning', 'nature', 'magic', 'earth'],
    ['air', 'water', 'earth', 'air', 'water', 'nature', 'magic', 'air'], // water column match
    ['lightning', 'water', 'earth', 'air', 'water', 'nature', 'magic', 'lightning'], // water column match
    ['nature', 'water', 'earth', 'air', 'water', 'nature', 'magic', 'nature'], // water column match
    ['magic', 'earth', 'earth', 'air', 'lightning', 'nature', 'magic', 'magic'],
    ['fire', 'water', 'earth', 'air', 'lightning', 'nature', 'magic', 'fire']
  ]
}

// Find matches function (simplified version of the actual logic)
function findMatches(board) {
  const matches = []
  const boardSize = board.length

  // Find horizontal matches
  for (let row = 0; row < boardSize; row++) {
    let currentMatch = []
    let currentType = null

    for (let col = 0; col <= boardSize; col++) {
      const gemType = col < boardSize ? board[row][col] : null

      if (gemType === currentType) {
        currentMatch.push({ row, col: col - 1, type: gemType })
      } else {
        if (currentMatch.length >= 3) {
          matches.push([...currentMatch])
        }
        currentMatch = gemType ? [{ row, col, type: gemType }] : []
        currentType = gemType
      }
    }
  }

  // Find vertical matches
  for (let col = 0; col < boardSize; col++) {
    let currentMatch = []
    let currentType = null

    for (let row = 0; row <= boardSize; row++) {
      const gemType = row < boardSize ? board[row][col] : null

      if (gemType === currentType) {
        currentMatch.push({ row: row - 1, col, type: gemType })
      } else {
        if (currentMatch.length >= 3) {
          matches.push([...currentMatch])
        }
        currentMatch = gemType ? [{ row, col, type: gemType }] : []
        currentType = gemType
      }
    }
  }

  return matches
}

// Test the logic
function testMatchLogic() {
  console.log('🎮 Testing Match-3 Logic\n')
  
  const board = createTestBoard()
  
  console.log('📋 Initial Board:')
  board.forEach((row, i) => {
    console.log(`Row ${i}: ${row.map(gem => GEM_TYPES[gem].emoji).join(' ')}`)
  })
  
  console.log('\n🔍 Finding Matches...')
  const matches = findMatches(board)
  
  console.log(`\n✅ Found ${matches.length} match groups:`)
  matches.forEach((match, i) => {
    console.log(`Match ${i + 1}: ${match.length} ${match[0].type} gems`)
    match.forEach(gem => {
      console.log(`  - Row ${gem.row}, Col ${gem.col}: ${GEM_TYPES[gem.type].emoji}`)
    })
  })
  
  // Simulate removal of only matched gems
  console.log('\n🗑️ Removing ONLY matched gems...')
  const newBoard = board.map(row => [...row])
  
  matches.forEach(match => {
    match.forEach(gem => {
      newBoard[gem.row][gem.col] = null
    })
  })
  
  console.log('\n📋 Board after removing matches (null = empty):')
  newBoard.forEach((row, i) => {
    console.log(`Row ${i}: ${row.map(gem => gem ? GEM_TYPES[gem].emoji : '⬜').join(' ')}`)
  })
  
  console.log('\n💡 Expected Behavior:')
  console.log('- Only gems in 3+ consecutive lines should be removed (show as ⬜)')
  console.log('- All other gems should remain in place')
  console.log('- After gravity, remaining gems would fall down to fill empty spaces')
  console.log('- New gems would be generated at the top to fill remaining empty spaces')
}

// Run the test
testMatchLogic() 