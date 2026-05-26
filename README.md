# LearnRise

An AI-powered learning platform that generates personalized, week-by-week courses on any topic in seconds.

## What it does

Tell LearnRise what you want to learn, how much time you have, and why — and the AI builds you a complete structured course with lessons, daily tasks, projects, curated resources, and weekly checkpoints. Check in daily to earn XP, level up, and track your streak.

## Features

- **AI course generation** — enter a topic, timeframe, and goal; get a full multi-week curriculum with lessons, exercises, and projects
- **Skill-level targeting** — Beginner, Intermediate, or Advanced tailoring
- **Course regeneration** — not quite right? Give feedback and regenerate
- **Daily check-ins** — earn +10 XP per check-in, build streaks, level up
- **Public profiles** — shareable learning profiles with XP, level, and course history
- **Community** — activity feed and XP/streak leaderboard
- **Pricing tiers** — Free (1 course) and Premium ($20/mo, unlimited courses + extras) via Stripe

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Auth & Database | Supabase (Postgres + Auth) |
| AI | Google Gemini (`generateContent`) |
| Payments | Stripe |
| Styling | CSS Modules |

## Project structure

```
app/
  dashboard/        # Main course view, check-ins, week navigation
  onboarding/       # New user walkthrough
  profile/
    [username]/     # Public profile page
    edit/           # Profile settings
  social/           # Activity feed + leaderboard
  pricing/          # Free vs Premium plans
  login/
  signup/
  api/
    generate/       # POST — AI course generation
    checkin/        # POST — daily check-in, XP/streak update
```

## Getting started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Google AI](https://ai.google.dev) API key (Gemini)
- A [Stripe](https://stripe.com) account (for payments)

### Setup

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

3. Set up Supabase tables: `profiles`, `courses`, `checkins`, `activity_feed`. Enable Google OAuth in the Supabase Auth dashboard if desired.

4. Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How course generation works

`POST /api/generate` takes `{ topic, time, goal, skillLevel, regenerateWith? }`, sends a structured prompt to Gemini, and returns a JSON course plan with weeks, lessons, resources, projects, and checkpoints. The response is validated, week numbers are corrected if needed, and resource URLs are auto-built before saving to Supabase.

## Gamification

- **Check-in**: `POST /api/checkin` inserts a daily record, then calls the `update_streak_and_xp` Supabase RPC to atomically update streak and XP on the user's profile.
- **Leveling**: handled server-side in the RPC.
- **Leaderboard**: queries public profiles ordered by XP.
