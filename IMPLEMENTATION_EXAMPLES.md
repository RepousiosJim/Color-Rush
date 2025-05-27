# Implementation Examples for Multiplayer Match-3 Game

## 🔐 **Authentication System**

### **1. NextAuth Configuration (lib/auth/config.ts)**

```typescript
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/database/connection'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.users.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            username: true,
            display_name: true,
            avatar_url: true,
            password_hash: true,
            level: true
          }
        })

        if (!user || !await bcrypt.compare(credentials.password, user.password_hash)) {
          return null
        }

        // Update last active
        await prisma.users.update({
          where: { id: user.id },
          data: { last_active: new Date(), is_online: true }
        })

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.display_name,
          avatar: user.avatar_url,
          level: user.level
        }
      }
    })
  ],
  
  session: { strategy: 'jwt' },
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.displayName = user.displayName
        token.level = user.level
      }
      return token
    },
    
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.username = token.username as string
      session.user.displayName = token.displayName as string
      session.user.level = token.level as number
      return session
    }
  },
  
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register'
  }
}
```

### **2. Registration API Route (app/api/auth/register/route.ts)**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/database/connection'

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8),
  displayName: z.string().min(1).max(50)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 12)

    // Create user
    const user = await prisma.users.create({
      data: {
        email: validatedData.email,
        username: validatedData.username,
        password_hash: passwordHash,
        display_name: validatedData.displayName,
        preferences: {
          theme: 'space',
          notifications: true,
          sound: true
        },
        stats: {
          gamesPlayed: 0,
          gamesWon: 0,
          totalScore: 0,
          bestScore: 0
        }
      },
      select: {
        id: true,
        email: true,
        username: true,
        display_name: true,
        level: true
      }
    })

    return NextResponse.json({ user }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## 🎮 **Game Engine Migration**

### **3. Game State Management (lib/stores/game-store.ts)**

```typescript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type GemType = 'fire' | 'water' | 'earth' | 'air' | 'lightning' | 'nature' | 'magic'

export interface Gem {
  type: GemType
  id: string
  row: number
  col: number
  isMatched?: boolean
  isAnimating?: boolean
}

export interface GameState {
  // Game board
  board: (Gem | null)[][]
  boardSize: number
  
  // Game status
  score: number
  level: number
  moves: number
  targetScore: number
  gameStatus: 'idle' | 'playing' | 'paused' | 'completed' | 'failed'
  
  // Selection and animation
  selectedGem: { row: number; col: number } | null
  isAnimating: boolean
  matchesFound: Gem[][]
  
  // Multiplayer
  isMultiplayer: boolean
  roomId?: string
  players: Player[]
  
  // Power-ups
  powerUps: PowerUp[]
  activePowerUp?: PowerUp
  
  // Actions
  initializeGame: (boardSize?: number) => void
  selectGem: (row: number, col: number) => void
  makeMove: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void
  findMatches: () => void
  removeMatches: () => void
  applyGravity: () => void
  fillEmptySpaces: () => void
  usePowerUp: (powerUpId: string, targetRow?: number, targetCol?: number) => void
  pauseGame: () => void
  resumeGame: () => void
  resetGame: () => void
}

export interface Player {
  id: string
  username: string
  displayName: string
  avatar?: string
  score: number
  isReady: boolean
  isOnline: boolean
}

export interface PowerUp {
  id: string
  type: 'bomb' | 'row_clear' | 'col_clear' | 'color_blast' | 'shuffle'
  name: string
  description: string
  uses: number
}

export const useGameStore = create<GameState>()(
  devtools(
    (set, get) => ({
      // Initial state
      board: [],
      boardSize: 8,
      score: 0,
      level: 1,
      moves: 0,
      targetScore: 1000,
      gameStatus: 'idle',
      selectedGem: null,
      isAnimating: false,
      matchesFound: [],
      isMultiplayer: false,
      players: [],
      powerUps: [],
      
      // Initialize game
      initializeGame: (boardSize = 8) => {
        const board = createInitialBoard(boardSize)
        set({
          board,
          boardSize,
          score: 0,
          moves: 0,
          gameStatus: 'playing',
          selectedGem: null,
          isAnimating: false,
          matchesFound: []
        })
      },
      
      // Select gem
      selectGem: (row: number, col: number) => {
        const state = get()
        if (state.isAnimating || state.gameStatus !== 'playing') return
        
        const currentSelected = state.selectedGem
        
        // If no gem selected, select this one
        if (!currentSelected) {
          set({ selectedGem: { row, col } })
          return
        }
        
        // If same gem clicked, deselect
        if (currentSelected.row === row && currentSelected.col === col) {
          set({ selectedGem: null })
          return
        }
        
        // Check if gems are adjacent
        const isAdjacent = Math.abs(currentSelected.row - row) + Math.abs(currentSelected.col - col) === 1
        
        if (isAdjacent) {
          // Attempt move
          get().makeMove(currentSelected.row, currentSelected.col, row, col)
        } else {
          // Select new gem
          set({ selectedGem: { row, col } })
        }
      },
      
      // Make move
      makeMove: (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
        const state = get()
        if (state.isAnimating) return
        
        set({ isAnimating: true, selectedGem: null })
        
        // Swap gems
        const newBoard = [...state.board.map(row => [...row])]
        const temp = newBoard[fromRow][fromCol]
        newBoard[fromRow][fromCol] = newBoard[toRow][toCol]
        newBoard[toRow][toCol] = temp
        
        // Update positions
        if (newBoard[fromRow][fromCol]) {
          newBoard[fromRow][fromCol]!.row = fromRow
          newBoard[fromRow][fromCol]!.col = fromCol
        }
        if (newBoard[toRow][toCol]) {
          newBoard[toRow][toCol]!.row = toRow
          newBoard[toRow][toCol]!.col = toCol
        }
        
        set({ board: newBoard })
        
        // Check for matches
        setTimeout(() => {
          get().findMatches()
        }, 300)
      },
      
      // Find matches
      findMatches: () => {
        const state = get()
        const matches = findMatchesOnBoard(state.board)
        
        if (matches.length > 0) {
          set({ matchesFound: matches })
          setTimeout(() => {
            get().removeMatches()
          }, 500)
        } else {
          set({ isAnimating: false, moves: state.moves + 1 })
        }
      },
      
      // Remove matches
      removeMatches: () => {
        const state = get()
        let newBoard = [...state.board.map(row => [...row])]
        let scoreIncrease = 0
        
        state.matchesFound.forEach(match => {
          match.forEach(gem => {
            newBoard[gem.row][gem.col] = null
            scoreIncrease += 50 * match.length // Base score * match size
          })
        })
        
        set({
          board: newBoard,
          score: state.score + scoreIncrease,
          matchesFound: []
        })
        
        setTimeout(() => {
          get().applyGravity()
        }, 200)
      },
      
      // Apply gravity
      applyGravity: () => {
        const state = get()
        const newBoard = applyGravityToBoard(state.board)
        
        set({ board: newBoard })
        
        setTimeout(() => {
          get().fillEmptySpaces()
        }, 300)
      },
      
      // Fill empty spaces
      fillEmptySpaces: () => {
        const state = get()
        const newBoard = fillBoardEmptySpaces(state.board, state.boardSize)
        
        set({ board: newBoard })
        
        setTimeout(() => {
          // Check for new matches
          const matches = findMatchesOnBoard(newBoard)
          if (matches.length > 0) {
            set({ matchesFound: matches })
            setTimeout(() => {
              get().removeMatches()
            }, 500)
          } else {
            set({ isAnimating: false, moves: state.moves + 1 })
            
            // Check win condition
            if (state.score >= state.targetScore) {
              set({ gameStatus: 'completed' })
            }
          }
        }, 300)
      },
      
      // Use power-up
      usePowerUp: (powerUpId: string, targetRow?: number, targetCol?: number) => {
        const state = get()
        const powerUp = state.powerUps.find(p => p.id === powerUpId)
        
        if (!powerUp || powerUp.uses <= 0) return
        
        // Apply power-up effect based on type
        let newBoard = [...state.board.map(row => [...row])]
        
        switch (powerUp.type) {
          case 'bomb':
            if (targetRow !== undefined && targetCol !== undefined) {
              // Remove 3x3 area around target
              for (let r = targetRow - 1; r <= targetRow + 1; r++) {
                for (let c = targetCol - 1; c <= targetCol + 1; c++) {
                  if (r >= 0 && r < state.boardSize && c >= 0 && c < state.boardSize) {
                    newBoard[r][c] = null
                  }
                }
              }
            }
            break
            
          case 'row_clear':
            if (targetRow !== undefined) {
              for (let c = 0; c < state.boardSize; c++) {
                newBoard[targetRow][c] = null
              }
            }
            break
            
          case 'col_clear':
            if (targetCol !== undefined) {
              for (let r = 0; r < state.boardSize; r++) {
                newBoard[r][targetCol] = null
              }
            }
            break
        }
        
        // Update power-up uses
        const updatedPowerUps = state.powerUps.map(p =>
          p.id === powerUpId ? { ...p, uses: p.uses - 1 } : p
        )
        
        set({
          board: newBoard,
          powerUps: updatedPowerUps,
          isAnimating: true
        })
        
        setTimeout(() => {
          get().applyGravity()
        }, 300)
      },
      
      // Game control
      pauseGame: () => set({ gameStatus: 'paused' }),
      resumeGame: () => set({ gameStatus: 'playing' }),
      resetGame: () => get().initializeGame()
    }),
    { name: 'game-store' }
  )
)

// Helper functions
function createInitialBoard(size: number): (Gem | null)[][] {
  const gemTypes: GemType[] = ['fire', 'water', 'earth', 'air', 'lightning', 'nature', 'magic']
  const board: (Gem | null)[][] = []
  
  for (let row = 0; row < size; row++) {
    board[row] = []
    for (let col = 0; col < size; col++) {
      let gemType: GemType
      
      // Ensure no initial matches
      do {
        gemType = gemTypes[Math.floor(Math.random() * gemTypes.length)]
      } while (
        (col >= 2 && board[row][col-1]?.type === gemType && board[row][col-2]?.type === gemType) ||
        (row >= 2 && board[row-1]?.[col]?.type === gemType && board[row-2]?.[col]?.type === gemType)
      )
      
      board[row][col] = {
        type: gemType,
        id: `${row}-${col}-${Date.now()}`,
        row,
        col
      }
    }
  }
  
  return board
}

function findMatchesOnBoard(board: (Gem | null)[][]): Gem[][] {
  const matches: Gem[][] = []
  const boardSize = board.length
  
  // Check horizontal matches
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col <= boardSize - 3; col++) {
      const gem1 = board[row][col]
      const gem2 = board[row][col + 1]
      const gem3 = board[row][col + 2]
      
      if (gem1 && gem2 && gem3 && gem1.type === gem2.type && gem2.type === gem3.type) {
        const match = [gem1, gem2, gem3]
        
        // Extend match if possible
        let extendCol = col + 3
        while (extendCol < boardSize && board[row][extendCol]?.type === gem1.type) {
          match.push(board[row][extendCol]!)
          extendCol++
        }
        
        matches.push(match)
        col = extendCol - 1 // Skip checked gems
      }
    }
  }
  
  // Check vertical matches
  for (let col = 0; col < boardSize; col++) {
    for (let row = 0; row <= boardSize - 3; row++) {
      const gem1 = board[row][col]
      const gem2 = board[row + 1][col]
      const gem3 = board[row + 2][col]
      
      if (gem1 && gem2 && gem3 && gem1.type === gem2.type && gem2.type === gem3.type) {
        const match = [gem1, gem2, gem3]
        
        // Extend match if possible
        let extendRow = row + 3
        while (extendRow < boardSize && board[extendRow][col]?.type === gem1.type) {
          match.push(board[extendRow][col]!)
          extendRow++
        }
        
        matches.push(match)
        row = extendRow - 1 // Skip checked gems
      }
    }
  }
  
  return matches
}

function applyGravityToBoard(board: (Gem | null)[][]): (Gem | null)[][] {
  const newBoard = board.map(row => [...row])
  const boardSize = newBoard.length
  
  for (let col = 0; col < boardSize; col++) {
    // Get all non-null gems in column
    const gems = []
    for (let row = boardSize - 1; row >= 0; row--) {
      if (newBoard[row][col]) {
        gems.push(newBoard[row][col])
        newBoard[row][col] = null
      }
    }
    
    // Place gems at bottom
    for (let i = 0; i < gems.length; i++) {
      const newRow = boardSize - 1 - i
      newBoard[newRow][col] = gems[i]
      if (newBoard[newRow][col]) {
        newBoard[newRow][col]!.row = newRow
      }
    }
  }
  
  return newBoard
}

function fillBoardEmptySpaces(board: (Gem | null)[][], boardSize: number): (Gem | null)[][] {
  const gemTypes: GemType[] = ['fire', 'water', 'earth', 'air', 'lightning', 'nature', 'magic']
  const newBoard = board.map(row => [...row])
  
  for (let col = 0; col < boardSize; col++) {
    for (let row = 0; row < boardSize; row++) {
      if (!newBoard[row][col]) {
        const gemType = gemTypes[Math.floor(Math.random() * gemTypes.length)]
        newBoard[row][col] = {
          type: gemType,
          id: `${row}-${col}-${Date.now()}`,
          row,
          col
        }
      }
    }
  }
  
  return newBoard
}
```

## 🌐 **Real-time Multiplayer**

### **4. Socket.io Server Setup (lib/real-time/socket-server.ts)**

```typescript
import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/database/connection'

export interface SocketUser {
  id: string
  username: string
  displayName: string
  socketId: string
}

export interface GameRoom {
  id: string
  code: string
  hostId: string
  players: SocketUser[]
  gameState: any
  status: 'waiting' | 'starting' | 'active' | 'completed'
  maxPlayers: number
}

export class GameSocketServer {
  private io: SocketIOServer
  private rooms: Map<string, GameRoom> = new Map()
  private userSockets: Map<string, string> = new Map() // userId -> socketId

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    })

    this.setupSocketHandlers()
  }

  private setupSocketHandlers() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token
        if (!token) {
          return next(new Error('Authentication error'))
        }

        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as any
        const user = await prisma.users.findUnique({
          where: { id: decoded.id },
          select: { id: true, username: true, display_name: true, is_online: true }
        })

        if (!user) {
          return next(new Error('User not found'))
        }

        socket.data.user = {
          id: user.id,
          username: user.username,
          displayName: user.display_name
        }

        next()
      } catch (error) {
        next(new Error('Authentication error'))
      }
    })

    this.io.on('connection', (socket) => {
      console.log(`User ${socket.data.user.username} connected`)
      
      // Store user socket mapping
      this.userSockets.set(socket.data.user.id, socket.id)
      
      // Update user online status
      this.updateUserOnlineStatus(socket.data.user.id, true)

      // Socket event handlers
      socket.on('create-room', (data) => this.handleCreateRoom(socket, data))
      socket.on('join-room', (data) => this.handleJoinRoom(socket, data))
      socket.on('leave-room', () => this.handleLeaveRoom(socket))
      socket.on('ready-up', () => this.handleReadyUp(socket))
      socket.on('game-move', (data) => this.handleGameMove(socket, data))
      socket.on('chat-message', (data) => this.handleChatMessage(socket, data))
      
      socket.on('disconnect', () => {
        console.log(`User ${socket.data.user.username} disconnected`)
        this.handleDisconnect(socket)
      })
    })
  }

  private async handleCreateRoom(socket: any, data: { maxPlayers: number; isPrivate: boolean }) {
    try {
      const roomCode = this.generateRoomCode()
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const user: SocketUser = {
        ...socket.data.user,
        socketId: socket.id
      }

      const room: GameRoom = {
        id: roomId,
        code: roomCode,
        hostId: user.id,
        players: [user],
        gameState: null,
        status: 'waiting',
        maxPlayers: data.maxPlayers || 2
      }

      this.rooms.set(roomId, room)
      socket.join(roomId)

      // Save to database
      await prisma.game_rooms.create({
        data: {
          id: roomId,
          room_code: roomCode,
          host_id: user.id,
          max_players: data.maxPlayers || 2,
          is_private: data.isPrivate || false,
          status: 'waiting'
        }
      })

      socket.emit('room-created', { room: this.sanitizeRoom(room) })
      
    } catch (error) {
      socket.emit('error', { message: 'Failed to create room' })
    }
  }

  private async handleJoinRoom(socket: any, data: { roomCode: string }) {
    try {
      const room = Array.from(this.rooms.values()).find(r => r.code === data.roomCode)
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' })
        return
      }

      if (room.players.length >= room.maxPlayers) {
        socket.emit('error', { message: 'Room is full' })
        return
      }

      if (room.status !== 'waiting') {
        socket.emit('error', { message: 'Game already in progress' })
        return
      }

      const user: SocketUser = {
        ...socket.data.user,
        socketId: socket.id
      }

      room.players.push(user)
      socket.join(room.id)

      // Update database
      await prisma.game_participants.create({
        data: {
          room_id: room.id,
          user_id: user.id,
          position: room.players.length,
          status: 'waiting'
        }
      })

      // Notify all players in room
      this.io.to(room.id).emit('player-joined', {
        room: this.sanitizeRoom(room),
        player: user
      })

    } catch (error) {
      socket.emit('error', { message: 'Failed to join room' })
    }
  }

  private handleLeaveRoom(socket: any) {
    const room = this.findRoomBySocket(socket.id)
    if (!room) return

    // Remove player from room
    room.players = room.players.filter(p => p.socketId !== socket.id)
    socket.leave(room.id)

    if (room.players.length === 0) {
      // Delete empty room
      this.rooms.delete(room.id)
    } else {
      // If host left, assign new host
      if (room.hostId === socket.data.user.id && room.players.length > 0) {
        room.hostId = room.players[0].id
      }

      // Notify remaining players
      this.io.to(room.id).emit('player-left', {
        room: this.sanitizeRoom(room),
        playerId: socket.data.user.id
      })
    }
  }

  private async handleReadyUp(socket: any) {
    const room = this.findRoomBySocket(socket.id)
    if (!room) return

    // Update player ready status in database
    await prisma.game_participants.updateMany({
      where: {
        room_id: room.id,
        user_id: socket.data.user.id
      },
      data: { status: 'ready' }
    })

    // Check if all players are ready
    const participants = await prisma.game_participants.findMany({
      where: { room_id: room.id }
    })

    const allReady = participants.every(p => p.status === 'ready')

    if (allReady && room.players.length >= 2) {
      // Start game
      room.status = 'starting'
      
      this.io.to(room.id).emit('game-starting', {
        countdown: 3
      })

      setTimeout(() => {
        this.startGame(room)
      }, 3000)
    }

    this.io.to(room.id).emit('player-ready', {
      playerId: socket.data.user.id,
      allReady
    })
  }

  private async startGame(room: GameRoom) {
    room.status = 'active'
    
    // Initialize game state for all players
    const gameState = {
      board: this.generateRandomBoard(),
      scores: room.players.reduce((acc, player) => {
        acc[player.id] = 0
        return acc
      }, {} as Record<string, number>),
      moves: room.players.reduce((acc, player) => {
        acc[player.id] = 0
        return acc
      }, {} as Record<string, number>),
      timeLimit: 180, // 3 minutes
      startTime: Date.now()
    }

    room.gameState = gameState

    // Update database
    await prisma.game_rooms.update({
      where: { id: room.id },
      data: { 
        status: 'active',
        started_at: new Date()
      }
    })

    // Notify all players
    this.io.to(room.id).emit('game-started', {
      gameState: gameState
    })

    // Set game timer
    setTimeout(() => {
      this.endGame(room)
    }, gameState.timeLimit * 1000)
  }

  private async handleGameMove(socket: any, data: any) {
    const room = this.findRoomBySocket(socket.id)
    if (!room || room.status !== 'active') return

    const userId = socket.data.user.id

    // Validate and process move
    const moveResult = this.processGameMove(room.gameState, userId, data)
    
    if (moveResult.valid) {
      // Update game state
      room.gameState = moveResult.newGameState

      // Save move to database
      await prisma.game_moves.create({
        data: {
          room_id: room.id,
          user_id: userId,
          move_number: room.gameState.moves[userId],
          move_type: data.type,
          move_data: data,
          result_data: moveResult
        }
      })

      // Broadcast move to all players
      this.io.to(room.id).emit('game-move-update', {
        playerId: userId,
        move: data,
        result: moveResult,
        gameState: room.gameState
      })

      // Check for game end conditions
      this.checkGameEndConditions(room)
    } else {
      socket.emit('invalid-move', { reason: moveResult.reason })
    }
  }

  private async endGame(room: GameRoom) {
    room.status = 'completed'
    
    // Calculate final scores and rankings
    const finalScores = room.gameState.scores
    const rankings = Object.entries(finalScores)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .map(([playerId], index) => ({ playerId, rank: index + 1 }))

    const winnerId = rankings[0]?.playerId

    // Update database
    await prisma.game_rooms.update({
      where: { id: room.id },
      data: {
        status: 'completed',
        ended_at: new Date(),
        winner_id: winnerId
      }
    })

    // Update participant records
    for (const ranking of rankings) {
      await prisma.game_participants.updateMany({
        where: {
          room_id: room.id,
          user_id: ranking.playerId
        },
        data: {
          final_ranking: ranking.rank,
          score: finalScores[ranking.playerId],
          status: 'finished',
          finished_at: new Date()
        }
      })
    }

    // Notify all players
    this.io.to(room.id).emit('game-ended', {
      rankings,
      finalScores,
      winnerId
    })

    // Clean up room after 30 seconds
    setTimeout(() => {
      this.rooms.delete(room.id)
    }, 30000)
  }

  // Helper methods
  private generateRoomCode(): string {
    return Math.random().toString(36).substr(2, 6).toUpperCase()
  }

  private generateRandomBoard() {
    // Generate 8x8 board with random gems (ensuring no initial matches)
    const gemTypes = ['fire', 'water', 'earth', 'air', 'lightning', 'nature', 'magic']
    const board = []
    
    for (let row = 0; row < 8; row++) {
      board[row] = []
      for (let col = 0; col < 8; col++) {
        let gemType
        do {
          gemType = gemTypes[Math.floor(Math.random() * gemTypes.length)]
        } while (
          (col >= 2 && board[row][col-1] === gemType && board[row][col-2] === gemType) ||
          (row >= 2 && board[row-1]?.[col] === gemType && board[row-2]?.[col] === gemType)
        )
        board[row][col] = gemType
      }
    }
    
    return board
  }

  private findRoomBySocket(socketId: string): GameRoom | undefined {
    return Array.from(this.rooms.values()).find(room =>
      room.players.some(player => player.socketId === socketId)
    )
  }

  private sanitizeRoom(room: GameRoom) {
    return {
      id: room.id,
      code: room.code,
      hostId: room.hostId,
      players: room.players.map(p => ({
        id: p.id,
        username: p.username,
        displayName: p.displayName
      })),
      status: room.status,
      maxPlayers: room.maxPlayers,
      currentPlayers: room.players.length
    }
  }

  private processGameMove(gameState: any, userId: string, moveData: any) {
    // Implement game move validation and processing logic
    // This should match your existing game logic
    return {
      valid: true,
      newGameState: gameState,
      scoreChange: 50,
      matchesFound: []
    }
  }

  private checkGameEndConditions(room: GameRoom) {
    // Check if game should end (time limit, score targets, etc.)
    const elapsed = Date.now() - room.gameState.startTime
    if (elapsed >= room.gameState.timeLimit * 1000) {
      this.endGame(room)
    }
  }

  private async updateUserOnlineStatus(userId: string, isOnline: boolean) {
    await prisma.users.update({
      where: { id: userId },
      data: {
        is_online: isOnline,
        last_active: new Date()
      }
    })
  }

  private handleChatMessage(socket: any, data: { message: string }) {
    const room = this.findRoomBySocket(socket.id)
    if (!room) return

    const chatMessage = {
      id: Date.now().toString(),
      userId: socket.data.user.id,
      username: socket.data.user.username,
      message: data.message,
      timestamp: new Date()
    }

    this.io.to(room.id).emit('chat-message', chatMessage)
  }

  private handleDisconnect(socket: any) {
    this.userSockets.delete(socket.data.user.id)
    this.updateUserOnlineStatus(socket.data.user.id, false)
    this.handleLeaveRoom(socket)
  }
}
```

This implementation provides a solid foundation for your multiplayer match-3 game with all the core features you mentioned. The modular structure makes it easy to extend and maintain as you add more features. 