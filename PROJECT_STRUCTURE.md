# Next.js Multiplayer Match-3 Game Project Structure

## 📁 **Complete Folder Structure**

```
gems-rush-multiplayer/
├── 📁 app/                              # Next.js 14 App Router
│   ├── 📁 (auth)/                       # Route groups for auth pages
│   │   ├── 📁 login/
│   │   │   └── 📄 page.tsx              # Login page
│   │   ├── 📁 register/
│   │   │   └── 📄 page.tsx              # Registration page
│   │   └── 📄 layout.tsx                # Auth layout
│   ├── 📁 (dashboard)/                  # Protected routes
│   │   ├── 📁 profile/
│   │   │   └── 📄 page.tsx              # User profile
│   │   ├── 📁 leaderboards/
│   │   │   └── 📄 page.tsx              # Leaderboards
│   │   ├── 📁 friends/
│   │   │   └── 📄 page.tsx              # Friends management
│   │   └── 📄 layout.tsx                # Dashboard layout
│   ├── 📁 game/                         # Game routes
│   │   ├── 📁 solo/
│   │   │   └── 📄 page.tsx              # Solo game
│   │   ├── 📁 multiplayer/
│   │   │   ├── 📄 page.tsx              # Multiplayer lobby
│   │   │   └── 📁 room/
│   │   │       └── 📁 [roomId]/
│   │   │           └── 📄 page.tsx       # Game room
│   │   └── 📄 layout.tsx                # Game layout
│   ├── 📁 api/                          # API Routes
│   │   ├── 📁 auth/
│   │   │   ├── 📄 login/route.ts
│   │   │   ├── 📄 register/route.ts
│   │   │   └── 📄 logout/route.ts
│   │   ├── 📁 game/
│   │   │   ├── 📄 solo/route.ts
│   │   │   ├── 📄 rooms/route.ts
│   │   │   └── 📁 moves/
│   │   │       └── 📄 route.ts
│   │   ├── 📁 leaderboards/
│   │   │   └── 📄 route.ts
│   │   ├── 📁 users/
│   │   │   ├── 📄 profile/route.ts
│   │   │   └── 📄 friends/route.ts
│   │   └── 📁 admin/
│   │       ├── 📄 users/route.ts
│   │       └── 📄 reports/route.ts
│   ├── 📄 page.tsx                      # Home page
│   ├── 📄 layout.tsx                    # Root layout
│   ├── 📄 loading.tsx                   # Global loading UI
│   ├── 📄 error.tsx                     # Global error UI
│   └── 📄 not-found.tsx                 # 404 page
├── 📁 components/                       # React Components
│   ├── 📁 ui/                          # Reusable UI components
│   │   ├── 📄 button.tsx
│   │   ├── 📄 input.tsx
│   │   ├── 📄 modal.tsx
│   │   ├── 📄 tooltip.tsx
│   │   └── 📄 loading-spinner.tsx
│   ├── 📁 game/                        # Game-specific components
│   │   ├── 📄 GameBoard.tsx
│   │   ├── 📄 GamePiece.tsx
│   │   ├── 📄 ScoreDisplay.tsx
│   │   ├── 📄 PowerUps.tsx
│   │   └── 📄 GameHUD.tsx
│   ├── 📁 multiplayer/                 # Multiplayer components
│   │   ├── 📄 GameRoom.tsx
│   │   ├── 📄 PlayerList.tsx
│   │   ├── 📄 RoomLobby.tsx
│   │   └── 📄 GameChat.tsx
│   ├── 📁 auth/                        # Authentication components
│   │   ├── 📄 LoginForm.tsx
│   │   ├── 📄 RegisterForm.tsx
│   │   └── 📄 AuthProvider.tsx
│   ├── 📁 layout/                      # Layout components
│   │   ├── 📄 Header.tsx
│   │   ├── 📄 Sidebar.tsx
│   │   ├── 📄 Footer.tsx
│   │   └── 📄 Navigation.tsx
│   └── 📁 dashboard/                   # Dashboard components
│       ├── 📄 ProfileCard.tsx
│       ├── 📄 StatsCard.tsx
│       ├── 📄 LeaderboardTable.tsx
│       └── 📄 FriendsList.tsx
├── 📁 lib/                             # Utility libraries
│   ├── 📁 auth/                        # Authentication logic
│   │   ├── 📄 config.ts                # Auth configuration
│   │   ├── 📄 middleware.ts            # Auth middleware
│   │   └── 📄 providers.ts             # Auth providers
│   ├── 📁 database/                    # Database utilities
│   │   ├── 📄 connection.ts            # DB connection
│   │   ├── 📄 schema.ts                # Prisma schema types
│   │   └── 📄 migrations.ts            # Migration helpers
│   ├── 📁 game/                        # Game logic
│   │   ├── 📄 GameEngine.ts            # Core game engine
│   │   ├── 📄 GameState.ts             # Game state management
│   │   ├── 📄 GameLogic.ts             # Match-3 logic
│   │   ├── 📄 PowerUps.ts              # Power-up system
│   │   └── 📄 Scoring.ts               # Scoring system
│   ├── 📁 multiplayer/                 # Multiplayer logic
│   │   ├── 📄 RoomManager.ts           # Room management
│   │   ├── 📄 GameSync.ts              # Game synchronization
│   │   └── 📄 MatchMaking.ts           # Matchmaking system
│   ├── 📁 real-time/                   # Real-time features
│   │   ├── 📄 socket-client.ts         # Socket.io client
│   │   ├── 📄 socket-server.ts         # Socket.io server
│   │   └── 📄 events.ts                # Event definitions
│   ├── 📁 utils/                       # General utilities
│   │   ├── 📄 validation.ts            # Form validation
│   │   ├── 📄 formatting.ts            # Data formatting
│   │   ├── 📄 constants.ts             # App constants
│   │   └── 📄 helpers.ts               # Helper functions
│   └── 📁 stores/                      # State management
│       ├── 📄 auth-store.ts            # Authentication state
│       ├── 📄 game-store.ts            # Game state
│       ├── 📄 user-store.ts            # User data state
│       └── 📄 socket-store.ts          # Socket connection state
├── 📁 hooks/                           # Custom React hooks
│   ├── 📄 useAuth.ts                   # Authentication hook
│   ├── 📄 useSocket.ts                 # Socket connection hook
│   ├── 📄 useGameState.ts              # Game state hook
│   ├── 📄 useLeaderboard.ts            # Leaderboard hook
│   └── 📄 useLocalStorage.ts           # Local storage hook
├── 📁 types/                           # TypeScript definitions
│   ├── 📄 auth.ts                      # Auth types
│   ├── 📄 game.ts                      # Game types
│   ├── 📄 user.ts                      # User types
│   ├── 📄 api.ts                       # API types
│   └── 📄 socket.ts                    # Socket event types
├── 📁 styles/                          # Styling
│   ├── 📄 globals.css                  # Global styles
│   ├── 📄 components.css               # Component styles
│   └── 📄 themes.css                   # Theme variables
├── 📁 public/                          # Static assets
│   ├── 📁 images/
│   │   ├── 📁 gems/                    # Gem sprites
│   │   ├── 📁 avatars/                 # User avatars
│   │   └── 📁 backgrounds/             # Background images
│   ├── 📁 sounds/                      # Audio files
│   │   ├── 📄 match.mp3
│   │   ├── 📄 combo.mp3
│   │   └── 📄 background.mp3
│   └── 📁 icons/                       # App icons
├── 📁 prisma/                          # Database schema
│   ├── 📄 schema.prisma                # Prisma schema
│   ├── 📁 migrations/                  # Database migrations
│   └── 📄 seed.ts                      # Database seeding
├── 📁 socket-server/                   # Socket.io server (if separate)
│   ├── 📄 index.ts                     # Server entry point
│   ├── 📄 handlers.ts                  # Event handlers
│   └── 📄 middleware.ts                # Socket middleware
├── 📁 tests/                           # Testing
│   ├── 📁 components/                  # Component tests
│   ├── 📁 api/                         # API tests
│   ├── 📁 game/                        # Game logic tests
│   └── 📄 setup.ts                     # Test setup
├── 📄 package.json                     # Dependencies
├── 📄 tsconfig.json                    # TypeScript config
├── 📄 tailwind.config.js               # Tailwind CSS config
├── 📄 next.config.js                   # Next.js config
├── 📄 .env.local                       # Environment variables
├── 📄 .env.example                     # Environment template
├── 📄 socket-io.config.js              # Socket.io config
└── 📄 README.md                        # Documentation
```

## 🚀 **Migration Steps**

### **Phase 1: Project Setup (Week 1)**

1. **Initialize Next.js Project**
```bash
npx create-next-app@latest gems-rush-multiplayer --typescript --tailwind --app
cd gems-rush-multiplayer
```

2. **Install Dependencies**
```bash
# Core dependencies
npm install prisma @prisma/client
npm install next-auth
npm install socket.io socket.io-client
npm install zustand
npm install bcryptjs jsonwebtoken
npm install zod
npm install @hookform/resolvers react-hook-form

# UI dependencies
npm install @radix-ui/react-dialog @radix-ui/react-select
npm install framer-motion
npm install react-hot-toast

# Development dependencies
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
npm install --save-dev jest @testing-library/react
npm install --save-dev eslint-config-prettier prettier
```

3. **Database Setup**
```bash
# Initialize Prisma
npx prisma init
# Copy schema from database-schema.sql and convert to Prisma format
npx prisma migrate dev --name init
npx prisma generate
```

### **Phase 2: Core Systems (Week 2-3)**

1. **Authentication System**
   - Set up NextAuth.js with credentials provider
   - Create login/register API routes
   - Implement protected route middleware

2. **Database Layer**
   - Set up Prisma with PostgreSQL
   - Create database models
   - Implement CRUD operations

3. **Game Engine Migration**
   - Convert vanilla JS game logic to TypeScript
   - Create React components for game board
   - Implement state management with Zustand

### **Phase 3: Multiplayer Features (Week 4-5)**

1. **Real-time Communication**
   - Set up Socket.io server
   - Implement room management
   - Create game synchronization

2. **Matchmaking System**
   - Room creation and joining
   - Player matching algorithms
   - Game state synchronization

### **Phase 4: Social Features (Week 6)**

1. **User Profiles**
   - Profile management
   - Avatar uploads
   - Statistics tracking

2. **Friends System**
   - Friend requests
   - Friends list
   - Private game invitations

3. **Leaderboards**
   - Global leaderboards
   - Periodic leaderboards
   - Achievement system

### **Phase 5: Advanced Features (Week 7-8)**

1. **Tournaments**
   - Tournament system
   - Brackets and elimination
   - Prize distribution

2. **Power-ups & Economy**
   - Item system
   - Virtual currency
   - Store implementation

3. **Daily Challenges**
   - Challenge generation
   - Progress tracking
   - Reward distribution

## 🔧 **Key Configuration Files**

### **Environment Variables (.env.local)**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/gems_rush"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Socket.io
SOCKET_SERVER_URL="http://localhost:3001"

# Uploads
UPLOAD_THING_SECRET="your-uploadthing-secret"
UPLOAD_THING_APP_ID="your-uploadthing-app-id"
```

### **Next.js Config (next.config.js)**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['uploadthing.com', 'lh3.googleusercontent.com'],
  },
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    return config;
  },
};

module.exports = nextConfig;
```

This structure provides a scalable foundation for your multiplayer match-3 game with all the features you mentioned! 