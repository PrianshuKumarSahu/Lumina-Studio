# 🎪 FêteCraft Studio — AI Celebration & Event Planner
> **PromptWars Challenge 5: Celebration & Event Planner**  
> A bespoke, GenAI-powered planning assistant that helps users organize weddings, birthdays, and community events with budgets, timelines, vendor checklists, and personalized creative ideas.

---

## ✨ Features

- 💍 **Tailored for All Celebrations**: Specialized workflows for Weddings, Birthdays, Anniversaries, Community Festivals, Baby Showers, and Corporate gatherings.
- 🤖 **GenAI Event Architect**: Generates complete event blueprints tailored to event type, guest count, city, and budget cap.
- ⏳ **Milestone Timeline & Run of Show**: Categorized into 4 phases (*6+ Months Out*, *3–6 Months Out*, *Final Weeks*, *Day-of Run of Show*) with time slots and progress tracking.
- 💰 **Smart Budget Matrix**: Tracks estimated vs. actual expenses across categories (*Venue*, *Catering*, *Photography*, *Music*, *Decorations*, etc.) with dynamic remaining budget calculations.
- 🏪 **Vendor Management Hub**: Quotation tracking, contact cards, and a 4-stage pipeline (*Researching* → *Contacted* → *Contract Signed* → *Paid*).
- 👥 **Guest RSVP & Seating Tracker**: Track confirmed/pending/declined RSVPs, dietary requirements, group/table assignments, and plus-ones.
- 💡 **AI Creative Studio**: On-demand idea generator for *Decor*, *Food & Menus*, *Signature Drinks*, *Playlists*, *Invitation Copy*, and *Activities*.
- 💬 **Interactive AI Event Assistant**: Live conversational assistant in each event dashboard to brainstorm solutions, negotiate vendor quotes, and solve logistical dilemmas.

---

## 📁 Project Architecture

The codebase is organized with clear separation of concerns across Frontend, Backend, and Database:

```
promptwars5/
├── supabase/                          # 🗄️ DATABASE
│   └── schema.sql                     # Full PostgreSQL DDL schema & Row Level Security policies
│
├── src/
│   ├── lib/
│   │   ├── database/                  # 🔌 DATABASE CLIENT & CRUD
│   │   │   ├── supabase.ts            # Supabase client initialization
│   │   │   ├── types.ts               # TypeScript data models & domain constants
│   │   │   └── queries.ts             # Resilient CRUD queries (Supabase + LocalStorage fallback)
│   │   │
│   │   ├── backend/                   # 🧠 BACKEND & AI LOGIC
│   │   │   └── gemini.ts              # Google Gemini AI integration & prompt orchestration
│   │   │
│   │   └── frontend/                  # 🎨 FRONTEND UTILITIES
│   │       ├── utils.ts               # Currency, date, and event theme color helpers
│   │       ├── hooks.ts               # Custom React hooks (useLoading)
│   │       └── constants.ts           # Design system labels, phase tags, and RSVP configs
│   │
│   ├── components/
│   │   ├── ui/                        # 🧩 REUSABLE UI PRIMITIVES
│   │   │   ├── Button.tsx             # Polished button with loading states
│   │   │   ├── Card.tsx               # Elevated cards with subtle hover effects
│   │   │   ├── Badge.tsx              # Status pills and tags
│   │   │   ├── Input.tsx              # Accessible form input
│   │   │   ├── Select.tsx             # Custom select dropdown
│   │   │   ├── Textarea.tsx           # Auto-resizing textarea
│   │   │   ├── Modal.tsx              # Accessible modal dialog
│   │   │   ├── EmptyState.tsx         # Engaging zero-state screens
│   │   │   └── ProgressBar.tsx        # Animated progress indicator
│   │   │
│   │   └── features/                  # 🚀 FEATURE MODULES
│   │       ├── Navbar.tsx             # Top navigation bar
│   │       ├── EventCard.tsx          # Dynamic event card with countdown
│   │       ├── CreateEventForm.tsx    # Multi-step AI event wizard
│   │       └── EventDashboard.tsx     # Comprehensive event dashboard (Tabs 1-6)
│   │
│   └── app/                           # 🌐 NEXT.JS APP ROUTER
│       ├── layout.tsx                 # Root layout with Geist typography
│       ├── page.tsx                   # Events listing homepage
│       ├── create/page.tsx            # Event creation wizard page
│       ├── event/[id]/page.tsx        # Event details & command center
│       └── api/ai/
│           ├── plan/route.ts          # AI comprehensive blueprint generator endpoint
│           └── generate/route.ts      # AI chat & creative idea generation endpoint
│
├── .env.example                       # Environment variables template
└── package.json
```

---

## 🚀 Quickstart & Setup

### 1. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd promptwars5
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file with your credentials:
```bash
# Supabase (free tier from supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Gemini API (free tier from aistudio.google.com)
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```

### 3. Setup Database (Supabase)
1. Open your project on [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in the left sidebar.
3. Paste the contents of `supabase/schema.sql` and click **Run**.

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deploying to Vercel (1-Click)

1. Push this repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Add the 4 environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_GEMINI_API_KEY`
5. Click **Deploy**! 🚀
