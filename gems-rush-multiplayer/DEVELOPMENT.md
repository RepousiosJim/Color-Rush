# 🛠️ Development Guide

## 🎯 **Current Status**

You now have a **fully functional match-3 game** running at `http://localhost:3000`! 

### ✅ **What Works Right Now**
- **8x8 game board** with beautiful gem graphics
- **Click to select gems** (highlighted in yellow)
- **Click adjacent gems** to swap and create matches
- **Automatic cascade system** when matches are found
- **Real-time scoring** with combo multipliers
- **Level progression** (reach 1000 points to win)

## 🚀 **Next Implementation Steps**

### **Step 1: Test the Current Game** (5 minutes)

1. **Open your browser** to `http://localhost:3000`
2. **Play the game**:
   - Click a gem to select it
   - Click an adjacent gem to swap
   - Watch for 3+ matches horizontally/vertically
   - Try to reach 1000 points!

### **Step 2: Set Up Database** (15 minutes)

```bash
# Install PostgreSQL (if not already installed)
# Windows: Download from postgresql.org
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql

# Create database
createdb gems_rush_game

# Update .env.local with your database URL
DATABASE_URL="postgresql://username:password@localhost:5432/gems_rush_game"

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# Optional: Open Prisma Studio to see your database
npx prisma studio
```

### **Step 3: Implement Authentication** (2-3 hours)

#### **3.1 Install Auth Dependencies**
```bash
npm install next-auth @auth/prisma-adapter
npm install --save-dev @types/bcryptjs
```

#### **3.2 Create Auth Configuration**
```typescript
// src/lib/auth/config.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/database/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        
        if (!user) return null
        
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) return null
        
        return {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName
        }
      }
    })
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register'
  }
}
```

#### **3.3 Create Auth API Routes**
```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth/config'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

#### **3.4 Create Login Page**
```typescript
// src/app/auth/login/page.tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false
    })
    
    if (result?.ok) {
      router.push('/dashboard')
    } else {
      alert('Login failed')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          🔮 Login to Gems Rush
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p className="text-center text-white/80 mt-4">
          Don't have an account?{' '}
          <a href="/auth/register" className="text-purple-300 hover:text-purple-200">
            Register here
          </a>
        </p>
      </div>
    </div>
  )
}
```

### **Step 4: Create Multiplayer Rooms** (3-4 hours)

#### **4.1 Install Socket.io**
```bash
npm install socket.io socket.io-client
```

#### **4.2 Create Room Management**
```typescript
// src/lib/multiplayer/RoomManager.ts
import { GameRoom, Player } from '@/types/game'
import { prisma } from '@/lib/database/prisma'

export class RoomManager {
  private rooms = new Map<string, GameRoom>()
  
  async createRoom(hostId: string, settings: any): Promise<GameRoom> {
    const roomCode = this.generateRoomCode()
    
    const room: GameRoom = {
      id: crypto.randomUUID(),
      code: roomCode,
      hostId,
      players: [],
      maxPlayers: settings.maxPlayers || 2,
      currentPlayers: 0,
      status: 'waiting',
      isPrivate: settings.isPrivate || false,
      gameMode: settings.gameMode,
      settings,
      createdAt: new Date()
    }
    
    this.rooms.set(room.id, room)
    
    // Save to database
    await prisma.gameRoom.create({
      data: {
        id: room.id,
        roomCode: room.code,
        hostId: room.hostId,
        maxPlayers: room.maxPlayers,
        status: room.status,
        isPrivate: room.isPrivate,
        settings: room.settings
      }
    })
    
    return room
  }
  
  private generateRoomCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }
}
```

### **Step 5: Add Real-time Multiplayer** (4-5 hours)

#### **5.1 Create Socket Server**
```typescript
// src/lib/multiplayer/SocketServer.ts
import { Server } from 'socket.io'
import { GameEngine } from '@/lib/game/GameEngine'
import { RoomManager } from './RoomManager'

export class SocketServer {
  private io: Server
  private roomManager = new RoomManager()
  private gameEngines = new Map<string, GameEngine>()
  
  constructor(server: any) {
    this.io = new Server(server, {
      cors: { origin: "*" }
    })
    
    this.setupEventHandlers()
  }
  
  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Player connected:', socket.id)
      
      socket.on('create-room', async (data) => {
        const room = await this.roomManager.createRoom(socket.data.user.id, data)
        socket.join(room.id)
        socket.emit('room-created', { room })
      })
      
      socket.on('join-room', async (data) => {
        // Handle room joining logic
      })
      
      socket.on('game-move', async (data) => {
        // Handle game moves and sync to all players
      })
    })
  }
}
```

## 🎯 **Development Priorities**

### **Week 1: Foundation**
- ✅ Game engine (DONE)
- ✅ Database schema (DONE)
- ✅ Basic UI (DONE)
- 🔄 Authentication system
- 🔄 User registration/login

### **Week 2: Multiplayer Core**
- 🔄 Room creation and joining
- 🔄 Socket.io integration
- 🔄 Real-time game synchronization
- 🔄 Player lobby system

### **Week 3: Game Features**
- 🔄 Power-ups system
- 🔄 Achievement tracking
- 🔄 Leaderboards
- 🔄 Friend system

### **Week 4: Polish & Deploy**
- 🔄 Mobile optimization
- 🔄 Performance improvements
- 🔄 Production deployment
- 🔄 Testing and bug fixes

## 🔧 **Useful Commands**

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run lint                   # Check code quality

# Database
npx prisma generate           # Generate Prisma client
npx prisma db push           # Push schema changes
npx prisma studio            # Open database browser
npx prisma db seed           # Seed database with test data

# Testing
npm run test                  # Run tests (when added)
npm run test:watch           # Watch mode testing
```

## 🐛 **Common Issues & Solutions**

### **Database Connection Issues**
```bash
# Check if PostgreSQL is running
pg_ctl status

# Start PostgreSQL
pg_ctl start

# Create database if it doesn't exist
createdb gems_rush_game
```

### **TypeScript Errors**
```bash
# Regenerate Prisma client
npx prisma generate

# Check TypeScript
npx tsc --noEmit
```

### **Socket.io Connection Issues**
```bash
# Make sure ports are available
netstat -an | grep 3000
netstat -an | grep 3001
```

## 📚 **Learning Resources**

- **Next.js 14**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **Socket.io**: https://socket.io/docs/v4/
- **NextAuth.js**: https://next-auth.js.org/
- **Tailwind CSS**: https://tailwindcss.com/docs

## 🎉 **You're Ready!**

The foundation is solid and the game is already playable! Start with authentication, then move to multiplayer features. Each step builds on the previous one, so take your time and test thoroughly.

**Happy coding!** 🚀 