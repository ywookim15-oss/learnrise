# LearnRise 🚀

**AI-powered learning companion.** Tell us what you want to learn, and LearnRise builds you a structured course with real resources — in seconds.

🌐 **Live at:** [learnrise-eight.vercel.app](https://learnrise-eight.vercel.app)

---

## What LearnRise Does

Most people struggle to learn new things not because they lack motivation — but because resources are scattered everywhere. LearnRise solves this by:

1. Taking 3 simple inputs from the user (what to learn, time available, and their goal)
2. Using AI to find the best real resources on the internet
3. Organizing everything into a structured, week-by-week course
4. Tracking progress with streaks, XP, and a social learning profile

---

## What's Built So Far

### ✅ Landing Page (`/`)
- Hero section with clear value proposition
- "How it works" 3-step section
- Features grid (6 key features)
- CTA banner
- Footer

### ✅ Pricing Page (`/pricing`)
- Free plan — 1 AI-generated course, streaks & XP, public profile
- Premium plan — $20/month, unlimited courses, streak protection, progress export

### ✅ Authentication
- Email signup with confirmation via Supabase Auth
- Email/password login
- Google OAuth login
- Protected dashboard route (redirects to login if not authenticated)
- Sign out

### ✅ Dashboard (`/dashboard`)
- Personalized greeting with user's real name
- Stats cards (streak, XP, level, course count)
- Course list pulled from Supabase database
- Click a course to view its full plan
- New learning plan form (3 prompts)

### ✅ AI Course Generation (`/api/generate`)
- Powered by **Google Gemini 2.5 Flash** (free tier)
- Takes 3 user inputs: topic, schedule, goal
- Returns a structured JSON plan with weekly blocks and real resources
- Saves generated courses to Supabase automatically

---

## Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | TypeScript |
| Hosting | Vercel | Free tier, auto-deploys from GitHub |
| AI | Google Gemini 2.5 Flash | Free tier via Google AI Studio |
| Database & Auth | Supabase | Free tier, Postgres + Auth |
| Styling | CSS Modules | Royal blue + white theme |
| Fonts | Sora + Lora | via Google Fonts |

---

## Project Structure

```
learnrise/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── page.module.css
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles + CSS variables
│   ├── pricing/
│   │   ├── page.tsx              # Pricing page
│   │   └── pricing.module.css
│   ├── login/
│   │   ├── page.tsx              # Login page (Supabase auth)
│   │   └── auth.module.css
│   ├── signup/
│   │   └── page.tsx              # Signup page (Supabase auth)
│   ├── dashboard/
│   │   ├── page.tsx              # User dashboard + course generation
│   │   └── dashboard.module.css
│   └── api/
│       └── generate/
│           └── route.ts          # Gemini API route
├── components/
│   ├── Navbar.tsx                # Shared navbar
│   └── Navbar.module.css
├── lib/
│   └── supabase.ts               # Supabase client
├── package.json
├── tsconfig.json
└── next.config.js
```

---

## Database Schema

### `courses` table (Supabase)
```sql
create table courses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  meta text,
  plan jsonb,
  created_at timestamp with time zone default now()
);
```

---

## Local Development

### 1. Clone the repo
```bash
git clone https://github.com/ywookim15-oss/learnrise.git
cd learnrise
npm install
```

### 2. Set up environment variables
Create a `.env.local` file in the root:
```
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

- **Gemini API key** → [aistudio.google.com](https://aistudio.google.com)
- **Supabase keys** → [supabase.com](https://supabase.com) → Settings → API

### 3. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## Deployment

Hosted on **Vercel** with automatic deploys on every push to `main`.

Environment variables set in Vercel → Settings → Environment Variables:
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Roadmap

- [ ] Streaks & XP system (daily check-ins, points, level ups)
- [ ] Public user profiles (`/u/username`)
- [ ] Social feed (see what others are learning)
- [ ] Leaderboard (top streaks, top XP)
- [ ] Stripe subscription (Premium plan gating)
- [ ] Beehiiv email integration (welcome + re-engagement emails)
- [ ] Mobile polish
- [ ] Onboarding flow for new users
