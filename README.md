<div align="center">

# 🎪 Lumina Studio
### *AI-Powered Celebration & Event Architect*

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini_AI-3.5_Flash-4285F4?style=for-the-badge&logo=google)](https://aistudio.google.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

**PromptWars — Challenge 5: Celebration & Event Planner**  
*A bespoke, GenAI-powered planning platform that helps users organize weddings, birthdays, anniversaries, and community festivals with intelligent budgets, countdown timelines, vendor negotiation checklists, and personalized creative ideas.*

[Live Demo](#-deployment-to-vercel) • [Features](#-features) • [Architecture](#-project-architecture) • [Database Setup](#-database-schema--supabase-setup) • [Quickstart](#-quickstart--local-development)

---

</div>

## 📖 Overview

Most AI planning tools look identical: generic dark-purple neon gradients, centered robotic copy, and a basic chatbot widget. 

**Lumina Studio** was built from the ground up to feel like an **editorial, tactile celebration command center** (combining the craft of Notion, the precision of Linear, and the warmth of boutique event design). Whether planning a 500-guest heritage wedding, an intimate milestone birthday, or a neighborhood festival, Lumina Studio coordinates every logistical and aesthetic layer with zero friction.

---

## ✨ Features

### 1. 🤖 GenAI Event Architect
- **Multi-Step Intuitive Wizard**: Tailored planning based on Event Type, Target Date, Guest Headcount, Budget Ceiling, City, and Theme/Vibe.
- **Instant Plan Generation**: Powered by Google Gemini AI with intelligent fallbacks to generate personalized concepts, budget splits, key milestones, and vendor recommendations.

### 2. ⏳ Milestone Timeline & Run of Show
- **Phase-Based Countdown**:
  - `6+ Months Out` — Venue acquisition, principal vendor bookings, theme concept.
  - `3–6 Months Out` — Menu tastings, invitations, music curation.
  - `Final Weeks` — Headcount lockdown, seating charts, run-of-show handoffs.
  - `Day-of Run of Show` — Hourly agenda (e.g. *10:00 AM Hair & Makeup*, *05:00 PM Welcome Drinks*, *06:00 PM Ceremony*).
- **Interactive Tracking**: Real-time progress bar, priority tags (*Low*, *Medium*, *High*, *Critical*), time slots, and completion toggles.

### 3. 💰 Dynamic Budget Matrix
- **Category Math**: Automatic allocation across *Venue*, *Catering & Food*, *Photography & Video*, *Music & Entertainment*, *Decorations & Flowers*, *Attire*, *Invitations*, and *Contingency*.
- **Variance Tracking**: Compare estimated vs. actual expenses with dynamic remaining budget calculations and color-coded status meters.
- **Payment Status**: Mark individual vendor items as paid or pending.

### 4. 🏪 Vendor Hub & Pipeline
- **Status Pipeline**: Progress vendors through a 4-step pipeline: `Researching` ➔ `Contacted` ➔ `Contract Signed` ➔ `Paid`.
- **Vendor Profiles**: Keep track of primary contacts, phone numbers, emails, quotes, and custom negotiation notes.

### 5. 👥 Guest RSVP & Seating Manager
- **RSVP Tracker**: Real-time status cards for `Confirmed`, `Pending`, and `Declined` guests.
- **Dietary & Table Tagging**: Log vegan/vegetarian/halal/allergy notes, plus-ones math, and table assignments.

### 6. 💡 AI Creative Studio
- Generate 5 customized creative concepts on demand across 7 specialized domains:
  - 🎨 *Decor & Styling*
  - 🍽️ *Food & Culinary Menus*
  - 🍸 *Signature Drinks & Mocktails*
  - 🎵 *Playlists & Entertainment*
  - 💌 *Personalized Invitation Wording*
  - 🎮 *Interactive Activities & Ice-Breakers*
  - 🎭 *Theme & Color Palette Concepts*

### 7. 💬 Live AI Copilot ("Ask Lumina AI")
- An embedded conversational assistant inside every event dashboard with deep contextual awareness of your specific event details, ready to brainstorm cost-cutting solutions, draft vendor emails, and solve timeline bottlenecks.

---

## 📁 Project Architecture

The repository enforces strict separation of concerns into dedicated directories for **Frontend**, **Backend**, and **Database**:

```text
Lumina-Studio/
├── supabase/                          # 🗄️ DATABASE
│   └── schema.sql                     # Full PostgreSQL DDL, foreign keys & RLS security policies
│
├── src/
│   ├── lib/
│   │   ├── database/                  # 🔌 DATABASE CLIENT & CRUD
│   │   │   ├── supabase.ts            # Supabase client initialization
│   │   │   ├── types.ts               # Domain interfaces & TypeScript types
│   │   │   └── queries.ts             # Resilient CRUD queries (Supabase + LocalStorage fallback)
│   │   │
│   │   ├── backend/                   # 🧠 BACKEND & AI ENGINE
│   │   │   └── gemini.ts              # Google Gemini AI integration & prompt orchestration
│   │   │
│   │   └── frontend/                  # 🎨 FRONTEND UTILITIES
│   │       ├── utils.ts               # Currency, date, and event-theme color harmonizers
│   │       ├── hooks.ts               # Custom React hooks (useLoading)
│   │       └── constants.ts           # Design system labels, phase tags, and RSVP badges
│   │
│   ├── components/
│   │   ├── ui/                        # 🧩 ATOMIC UI COMPONENTS
│   │   │   ├── Button.tsx             # Interactive button with loader states
│   │   │   ├── Card.tsx               # Elevated tactile card
│   │   │   ├── Badge.tsx              # Status pills and categorical badges
│   │   │   ├── Input.tsx              # Styled text/number inputs
│   │   │   ├── Select.tsx             # Accessible select dropdown
│   │   │   ├── Textarea.tsx           # Auto-styled textarea
│   │   │   ├── Modal.tsx              # Keyboard-accessible dialog modal
│   │   │   ├── EmptyState.tsx         # Engaging zero-state screens
│   │   │   └── ProgressBar.tsx        # Animated progress indicators
│   │   │
│   │   └── features/                  # 🚀 FEATURE MODULES
│   │       ├── Navbar.tsx             # Global application navigation
│   │       ├── EventCard.tsx          # Dynamic event card with countdown
│   │       ├── CreateEventForm.tsx    # 3-step AI Event Architect wizard
│   │       └── EventDashboard.tsx     # Comprehensive event command center (All 6 tabs)
│   │
│   └── app/                           # 🌐 NEXT.JS 16 APP ROUTER
│       ├── layout.tsx                 # Root layout with Geist typography
│       ├── globals.css                # Tailwind CSS v4 styling & animations
│       ├── page.tsx                   # Events listing homepage
│       ├── create/page.tsx            # New event creation page
│       ├── event/[id]/page.tsx        # Dynamic event command center page
│       └── api/ai/                    # Backend API route handlers
│           ├── plan/route.ts          # Comprehensive blueprint generator endpoint
│           └── generate/route.ts      # Conversational assistant & ideas generator endpoint
│
├── .env.example                       # Environment variables template
├── package.json
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | **Next.js 16 (App Router)** | Server Components, Route Handlers, Turbopack |
| **Frontend UI** | **React 19 + Tailwind CSS v4** | Modern component architecture & utility styling |
| **Icons** | **Lucide React** | Clean, consistent SVG iconography |
| **Database** | **Supabase (PostgreSQL)** | Relational tables, Row-Level Security, public anon access |
| **GenAI Engine** | **Google Gemini AI** | Fast event plan generation & conversational guidance |
| **Deployment** | **Vercel** | Edge network hosting & serverless function execution |

---

## 🗄️ Database Schema & Supabase Setup

The database is built on PostgreSQL hosted on **Supabase** (100% Free tier):

### Tables Overview
1. `events`: Stores core event metadata (title, type, date, budget, guest count, city, theme, AI summary).
2. `timeline_items`: Milestones categorized by planning phases with priority and completion states.
3. `budget_items`: Itemized expenses grouped by category with estimated vs. actual math and payment toggles.
4. `vendors`: Vendor contact cards, quoted fees, notes, and 4-step pipeline status.
5. `ideas_and_mood`: AI-generated creative concepts organized by tags and categories.
6. `guests`: Full guest list with RSVP status, dietary notes, table numbers, and plus-ones.

### 1-Click Supabase Initialization
1. Create a free project at [supabase.com](https://supabase.com).
2. Navigate to the **SQL Editor** (`>_`) in your Supabase dashboard.
3. Open [`supabase/schema.sql`](supabase/schema.sql), copy its contents, paste them into the SQL editor, and click **Run**.

*(Note: Lumina Studio also features an automatic local storage fallback layer, so the app remains fully functional even in offline environments or before cloud tables are provisioned!)*

---

## 🚀 Quickstart & Local Development

### 1. Clone the repository
```bash
git clone https://github.com/PrianshuKumarSahu/Lumina-Studio.git
cd Lumina-Studio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file in the root directory:
```bash
# Supabase Configuration (from supabase.com project settings)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Gemini AI Key (free tier from aistudio.google.com)
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deployment to Vercel

1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select your GitHub repository (`Lumina-Studio`).
4. In the **Environment Variables** configuration, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_GEMINI_API_KEY`
5. Click **Deploy**. Your application will be live across Vercel's global CDN in seconds!

---

## 🔒 Security & Privacy

- All sensitive keys (`.env`, `.env.local`) are strictly excluded via `.gitignore`.
- Database access uses Supabase Row-Level Security (RLS) policies.
- AI route handlers sanitize and format prompts safely on the backend server before delegating to Google Gemini.

---

<div align="center">

Built with ❤️ for **PromptWars** • Powered by **Next.js 16**, **Supabase**, and **Google Gemini**

</div>
