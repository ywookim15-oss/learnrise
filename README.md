# LearnRise

AI-powered learning companion. Enter what you want to learn, and LearnRise builds you a structured course with real resources — in seconds.

## Tech Stack

- **Frontend & Backend**: Next.js 14 (App Router)
- **AI**: Google Gemini 2.0 Flash (free tier)
- **Hosting**: Vercel (free tier)
- **Database**: Supabase (coming soon)

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/learnrise.git
cd learnrise
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Then fill in your keys in `.env.local`:

- **GEMINI_API_KEY** — Get free at [aistudio.google.com](https://aistudio.google.com)
- **NEXT_PUBLIC_SUPABASE_URL** — Get free at [supabase.com](https://supabase.com)
- **NEXT_PUBLIC_SUPABASE_ANON_KEY** — From your Supabase project settings

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repo
3. Add your environment variables in Vercel's project settings
4. Deploy — done!

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/pricing` | Pricing plans |
| `/login` | Sign in |
| `/signup` | Create account |
| `/dashboard` | User dashboard + course generation |
| `/api/generate` | Gemini API route |

## Roadmap

- [ ] Supabase auth (email + Google)
- [ ] Save courses to database
- [ ] Streaks & XP system
- [ ] Public user profiles
- [ ] Social feed & leaderboard
- [ ] Stripe subscription (Premium plan)
