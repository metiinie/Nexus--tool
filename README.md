# NEXUS - Holo Productivity

> **A futuristic, holographic-themed productivity suite with real-time collaboration, gamification, and enterprise-grade security.**

![Status](https://img.shields.io/badge/status-production--ready-success)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🌟 Overview

**NEXUS** is a next-generation productivity platform that combines task management, habit tracking, team collaboration, and gamification into a stunning holographic interface. Built with modern web technologies and enterprise-grade architecture, NEXUS transforms productivity into an engaging, collaborative experience.

### ✨ Key Highlights

- 🎨 **Stunning UI**: Glassmorphic design with holographic effects and smooth animations
- 🔐 **Secure Authentication**: JWT-based auth with httpOnly cookies
- 🎮 **Gamification**: XP system, levels, and achievement tracking
- 👥 **Team Collaboration**: Real-time squadrons with shared tasks and activity feeds
- 📊 **Smart Analytics**: Derived metrics and intelligent insights
- 🛡️ **Anti-Cheat**: Server-side validation for all game mechanics
- 💾 **Dual Persistence**: Optimistic UI updates with authoritative backend sync

---

## 🚀 Features

### Core Productivity
- ✅ **Task Management**: Create, organize, and track tasks with priorities and statuses
- 🔄 **Habit Tracking**: Daily habit logging with automatic streak calculation
- 📈 **Analytics Dashboard**: Visual insights into productivity patterns
- 🎯 **Smart Filtering**: Organize tasks by status, priority, and due date

### Gamification System
- ⚡ **XP & Leveling**: Earn experience points for completing tasks and habits
- 🏆 **Achievement System**: Track milestones and celebrate progress
- 📊 **Progress Visualization**: Real-time XP bars and level indicators
- 🎖️ **Audit Trail**: Complete history of all XP events

### Team Collaboration (Squadron Hub)
- 🏢 **Team Creation**: Create squadrons with unique invite codes
- 👥 **Member Management**: Role-based access (Owner, Admin, Member)
- 📋 **Shared Tasks**: Collaborate on team objectives
- 📡 **Activity Feed**: Real-time updates on team activities
- 🎉 **Social Features**: Celebrate team member achievements

### Security & Performance
- 🔒 **JWT Authentication**: Secure token-based authentication
- 🍪 **HttpOnly Cookies**: XSS-proof token storage
- 🛡️ **Server-Side Validation**: All business logic on backend
- ⚡ **Optimistic Updates**: Instant UI feedback with background sync
- 📝 **Audit Logging**: Complete XP and activity history

---

## 🏗️ Architecture

### Technology Stack

#### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **State Management**: Zustand with persistence
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with custom glassmorphic components
- **Animations**: Framer Motion
- **Icons**: Lucide React

#### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Prisma 6
- **Authentication**: Passport.js + JWT
- **Security**: bcrypt, cookie-parser

### Design Principles

1. **Boring Correctness**: Streaks and metrics are derived, never stored
2. **Server Authority**: All business logic lives on the backend
3. **Optimistic UI**: Instant feedback with background synchronization
4. **Security First**: Zero trust - validate everything server-side
5. **Audit Everything**: Complete event logging for accountability

---

## 📁 Project Structure

```
OrionTracking/
├── 📂 backend/                     # NestJS Backend
│   ├── 📂 prisma/
│   │   ├── schema.prisma          # Database schema
│   ├── 📂 src/
│   │   ├── main.ts                # Application entry point
│   │   ├── app.module.ts          # Root module
│   │   ├── prisma.service.ts      # Database service
│   │   ├── auth.controller.ts     # Authentication endpoints
│   │   ├── auth.service.ts        # Auth business logic
│   │   ├── auth.module.ts         # Auth module
│   │   ├── jwt.strategy.ts        # JWT validation strategy
│   │   ├── tasks.controller.ts    # Task endpoints
│   │   ├── tasks.service.ts       # Task business logic
│   │   ├── habits.controller.ts   # Habit endpoints
│   │   ├── habits.service.ts      # Habit business logic
│   │   ├── game.service.ts        # XP, leveling, streaks
│   │   ├── teams.controller.ts    # Team collaboration endpoints
│   │   ├── teams.service.ts       # Team business logic
│   │   ├── user.controller.ts     # User profile endpoints
│   │   └── health.controller.ts   # Health check
│   └── package.json
│
├── 📂 frontend/                    # React Feature Components
│   ├── 📂 auth/                   # Login/Register UI
│   ├── 📂 tasks/                  # Task board components
│   ├── 📂 habits/                 # Habit tracking UI
│   ├── 📂 analytics/              # Statistics and Charts
│   ├── 📂 gamification/           # Level and XP bars
│   └── 📂 teams/                  # Squadron collaboration
│
├── 📂 components/                  # Shared UI components
│   └── 📂 ui/
│       └── GlassCard.tsx          # Reusable glassmorphic container
│
├── 📄 App.tsx                      # Main app component with routing
├── 📄 store.ts                     # Zustand state management (Auth + Data)
├── 📄 constants.ts                 # App-wide constants & types
├── 📄 package.json                 # Monorepo dependencies
└── 📄 vercel.json                  # Deployment configuration
```

---

## 🗄️ Database Schema

### Core Models

#### User
- `id` (UUID) - Primary key
- `email` (String, unique) - User email
- `passwordHash` (String) - Bcrypt hashed password
- `xp` (Int) - Current experience points
- `level` (Int) - Current level
- Relations: tasks, habits, xpEvents, teamMembers

#### Task
- `id` (UUID) - Primary key
- `userId` (String) - Owner
- `teamId` (String, optional) - Team assignment
- `title`, `status`, `priority`, `dueDate`
- `order` (Int) - Display order

#### Habit
- `id` (UUID) - Primary key
- `userId` (String) - Owner
- `title`, `frequency`
- Relations: logs (HabitLog[])

#### HabitLog
- `id` (UUID) - Primary key
- `habitId` (String) - Parent habit
- `date` (DateTime) - Log date
- `completed` (Boolean)
- Unique constraint: [habitId, date]

#### Team
- `id` (UUID) - Primary key
- `name` (String) - Team name
- `code` (String, unique) - 6-char invite code
- Relations: members, tasks, activities

#### TeamMember
- `userId`, `teamId` - Junction table
- `role` (String) - owner | admin | member
- Unique constraint: [userId, teamId]

#### Activity
- `id` (UUID) - Primary key
- `teamId`, `actorId` - References
- `type` (String) - Event type
- `metadata` (JSON) - Event details

#### XpEvent
- `id` (UUID) - Primary key
- `userId` (String) - Recipient
- `source` (String) - task | habit
- `value` (Int) - XP amount
- Audit log for all XP gains

---

## 🎮 Game Mechanics

### XP System
- **Task Completion**: 50 XP
- **Habit Completion**: 20 XP
- **Level Formula**: `nextLevelXP = 100 × (1.2 ^ (level - 1))`
- **Anti-Cheat**: No XP refunds on un-completion

### Streak Calculation
Streaks are **derived** from HabitLog entries:
1. Sort logs by date (descending)
2. Check if last completion was today or yesterday
3. Count consecutive days backward
4. Return 0 if streak is broken

**Why derived?**
- Prevents data corruption
- Always accurate
- No manual recalculation needed

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login (sets httpOnly cookie)
- `POST /api/auth/logout` - Logout (clears cookie)
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - List user's tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task (awards XP on completion)
- `DELETE /api/tasks/:id` - Delete task

### Habits
- `GET /api/habits` - List habits with computed streaks
- `POST /api/habits` - Create habit
- `POST /api/habits/:id/toggle` - Toggle completion (awards XP)

### Teams
- `GET /api/teams` - List user's teams
- `POST /api/teams` - Create team
- `POST /api/teams/join` - Join via code
- `DELETE /api/teams/:id/leave` - Leave team
- `GET /api/teams/:id/members` - List members
- `GET /api/teams/:id/tasks` - List shared tasks
- `POST /api/teams/:id/tasks` - Create shared task
- `GET /api/teams/:id/activity` - Activity feed

### User
- `GET /api/user/profile` - Get profile with computed nextLevelXP

### Health
- `GET /api/health` - Server health check

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
### Installation

1. **Clone and Install**
```bash
git clone <repository-url>
cd OrionTracking
npm install
```

2. **Set up Environment**
Create `backend/.env`:
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
RESEND_API_KEY="re_..."
```

3. **Database Setup**
```bash
npx prisma generate --schema=backend/prisma/schema.prisma
```

### Running the Application

**Development Mode:**

Terminal 1 (Backend):
```bash
cd backend
npm run start:dev
```

Terminal 2 (Frontend):
```bash
npm run dev
```

Access the app at: **http://localhost:5173**

**Production Build (Manual):**

```bash
# Full build (Frontend + Prisma)
npm run build

# Start backend prod
cd backend
npm run start:prod
```

---

## 🎨 UI Components

### Design System
- **Colors**: Cyan, Fuchsia, Emerald accents on dark slate base
- **Effects**: Glassmorphism, gradients, shadows, blur
- **Typography**: System fonts with mono accents
- **Animations**: Smooth transitions, hover effects, micro-interactions

### Key Components
- `GlassCard` - Reusable glassmorphic container
- `NavItem` - Animated sidebar navigation
- `GamificationBar` - XP progress display
- `TaskBoard` - Kanban-style task management
- `HabitGrid` - Calendar-based habit tracking
- `TeamsPage` - Collaboration hub

---

## 🔒 Security Features

1. **Password Security**: Bcrypt hashing with salt rounds
2. **JWT Tokens**: Signed with secret, 7-day expiration
3. **HttpOnly Cookies**: Prevents XSS token theft
4. **CORS Protection**: Whitelisted origins only
5. **Server Validation**: All business logic server-side
6. **SQL Injection**: Prisma ORM prevents injection
7. **Audit Logging**: Complete XP and activity history

---

## 📊 Performance Optimizations

- **Optimistic Updates**: Instant UI feedback
- **Background Sync**: Non-blocking API calls
- **Derived Metrics**: Computed on-demand, not stored
- **Lazy Loading**: Code splitting with React Router
- **Persistent State**: Zustand with localStorage
- **Efficient Queries**: Prisma query optimization

---

## 🛠️ Development Workflow

### Phase 1: Backend Skeleton ✅
- NestJS setup
- Database connection
- Health check endpoint

### Phase 2: Data Model ✅
- Prisma schema design
- Migration setup
- Type generation

### Phase 3: Authentication ✅
- JWT implementation
- Register/Login/Logout
- Protected routes

### Phase 4: Dual Persistence ✅
- API integration
- Optimistic updates
- Background sync

### Phase 5: Server-Side Logic ✅
- XP calculation
- Leveling system
- Streak derivation
- Anti-cheat measures

### Phase 6: Collaboration ✅
- Team creation
- Shared tasks
- Activity feeds
- Role management

---

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📧 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built with ❤️ using React, NestJS, and modern web technologies.**
