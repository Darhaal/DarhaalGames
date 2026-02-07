# 🎮 Darhaal Games  
**Online Multiplayer Gaming Platform**

![Version](https://img.shields.io/badge/version-1.5.4-blue.svg) ![License](https://img.shields.io/badge/license-Non--Commercial-red.svg) ![Status](https://img.shields.io/badge/status-Active_Development-success.svg)

Darhaal Games is a production-ready SPA platform for real-time multiplayer browser games. The project combines classic game mechanics with a modern tech stack, featuring a robust lobby system, optimistic UI updates, and WebSocket-based state synchronization via Supabase.

🔗 **Live Demo:**  
👉 https://online-games-phi.vercel.app

---

## ✨ Key Features

### ⚡ Real-Time Multiplayer
- Instant synchronization of game states, turns, timers, and lobby events  
- Powered by **Supabase Realtime channels**

### 🏛️ Universal Lobby System
- Unified architecture for:
  - Room creation  
  - Matchmaking  
  - Player management  
- Shared logic across all game modes

### 👤 Authentication & Profiles
- Guest Mode  
- Email / Password  
- OAuth (Google)  
- Persistent profiles, statistics, and avatar customization

### 📱 Responsive UX
- Fully adaptive interface  
- Optimized for:
  - Desktop (mouse & keyboard)  
  - Mobile (touch)

---

## 🕹️ Game Modes

### 🚩 Flager — *Geography Quiz*
A unique trivia experience built around visual deduction.

**Core Mechanics**
- Guess the country while the flag is gradually revealed through digital noise  
- Pixel-by-pixel comparison unlocks correct fragments

**Technical Highlights**
- Custom HTML5 Canvas image processing  
- Round-based multiplayer synchronization

---

### 💣 Minesweeper — *Co-op / Versus*
A modern multiplayer interpretation of the classic puzzle.

**Core Mechanics**
- Infinite-feeling board with zoom and pan support  
- Custom viewport engine using transform / scale logic

**Features**
- First-click safety guarantee  
- Chording mechanics  
- Multiplayer conflict resolution

---

### ⚓ Battleship — *Strategy*
Real-time tactical naval warfare.

**Core Mechanics**
- Drag-and-drop ship placement  
- Rotation support during deployment

**Features**
- Optimistic UI for instant shot feedback  
- Server-authoritative turn timers  
- Fleet status tracking

---

### 🎭 Coup — *Social Deduction*
A digital adaptation of the bluff-heavy card game.

**Core Mechanics**
- Complex state machine handling nested phases  
  *(Action → Challenge → Block → Resolution)*

**Features**
- Full action log history  
- Strict action validation  
- AFK protection mechanisms

---

### 🕵️ Spyfall — *Social*
A conversation-driven game of deception and deduction.

**Core Mechanics**
- Hidden role distribution  
- Location guessing under time pressure

**Features**
- Synchronized timers  
- Voting system  
- Dynamic location and card packs

---

## 🛠️ Tech Stack

| Category        | Technologies |
|-----------------|--------------|
| **Core**        | Next.js 14 (App Router), React 18, TypeScript |
| **Styling**     | Tailwind CSS, Lucide React |
| **Backend / DB**| Supabase (PostgreSQL, Auth, Realtime) |
| **State Mgmt**  | Custom React Hooks, Optimistic Updates |
| **Deployment**  | Vercel |

---

## 🚀 Local Development

### Prerequisites
- Node.js **18+**  
- Supabase account

### Installation

Clone the repository:
```bash
git clone https://github.com/your-username/online-games.git
cd online-games
```

## Install dependencies:

```bash
npm install
# or
yarn install
```

### Environment Setup
Create a .env.local file in the project root:


```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run the development server:
```bash
npm run dev
```

## 📄 License

This project is licensed under a **Non-Commercial License**.

✅ Free for personal, educational, and non-profit use
🚫 Commercial use (sales, paid services, ads) is **not allowed** without a separate agreement

📧 For commercial licensing, contact: medius.org@gmail.com

See the **LICENSE** file for full details.

Developed with ❤️ by Darhaal Games
