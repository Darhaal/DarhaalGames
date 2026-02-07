# 🎮 Darhaal Games (Online Gaming Platform)

![Version](https://img.shields.io/badge/version-1.4.5-blue.svg)
![License](https://img.shields.io/badge/license-Non--Commercial-red.svg)
![Status](https://img.shields.io/badge/status-Active_Development-success.svg)

**Darhaal Games** is a production-ready SPA platform for real-time multiplayer browser games. The project combines classic game mechanics with a modern tech stack, featuring a robust lobby system, optimistic UI updates, and WebSocket-based state synchronization via Supabase.

🔗 **Live Demo:** [online-games-phi.vercel.app](https://online-games-phi.vercel.app)

---

## ✨ Key Features

* **Realtime Multiplayer:** Instant synchronization of game states, turns, and lobby events using Supabase Realtime channels.
* **Universal Lobby System:** A unified architecture for room creation, matchmaking, and player management across different game modes.
* **Authentication & Profiles:** Supports Guest Mode, Email/Password, and OAuth (Google). Persistent player stats and avatar customization.
* **Responsive UX:** Fully adaptive interface optimized for both desktop (mouse/keyboard) and mobile (touch) experiences.

---

## 🕹️ Game Modes

### 1. 🚩 Flager (Geography Quiz)
A unique take on trivia games featuring a **Pixel Match** mechanic.
* **Core Mechanic:** Players guess the country while the flag is progressively revealed through "digital noise" on an HTML5 Canvas.
* **Tech:** Custom image processing algorithm for pixel comparison, round-based synchronization.

### 2. 💣 Minesweeper (Co-op/Versus)
Advanced implementation of the classic puzzle on an infinite-feeling board.
* **Core Mechanic:** Custom viewport engine supporting zoom and pan (transform/scale logic).
* **Features:** "First click safe" guarantee, chording mechanics, and conflict resolution for multiplayer interactions.

### 3. ⚓ Battleship (Strategy)
Real-time tactical warfare.
* **Core Mechanic:** Drag-and-drop ship placement with rotation support.
* **Features:** Optimistic UI for instant shot feedback, server-authoritative turn timers, and fleet status tracking.

### 4. 🎭 Coup (Social Deduction)
A digital adaptation of the psychological card game involving bluffing and deduction.
* **Core Mechanic:** Complex State Machine handling nested game phases (Action -> Challenge -> Block -> Resolution).
* **Features:** Full log history, action validation, and AFK protection mechanisms.

---

## 🛠️ Tech Stack

| Category | Technologies |
|-----------|------------|
| **Core** | [Next.js 14 (App Router)](https://nextjs.org/), React 18, TypeScript |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/), Lucide React (Icons) |
| **Backend / DB** | [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime) |
| **State Mgmt** | Custom React Hooks, Optimistic Updates |
| **Deployment** | Vercel |

---

## 🚀 Local Development

### Prerequisites
* Node.js 18+
* Supabase Account

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/online-games.git](https://github.com/your-username/online-games.git)
    cd online-games
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 📄 License

This project is licensed under a **Non-Commercial License**.

* ✅ **Free** for personal, educational, and non-profit use.
* 🚫 **Commercial use** (selling, paid services, ads, etc.) is **strictly prohibited** without a separate license.

To obtain a commercial license, please contact: **medius.org@gmail.com**

See the [LICENSE](LICENSE) file for full details.

---

**Developed with ❤️ by Darhaal Games**
