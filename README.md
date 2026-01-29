# MiniRamadan 🌙

A family Ramadan companion app that helps children aged 4-12 and their parents experience Ramadan together. Unlike existing apps that optimize for adults, MiniRamadan creates a **family operating layer** for Ramadan—where parents and children participate as equals.

## Features

### Core Features
- **Family Accounts** - Single login with up to 6 profiles (2 adults + 4 children)
- **Three Profile Types**:
  - **Little Star (4-6)** - Simple "I helped today!" button for youngest children
  - **Child (7-12)** - Full Ramadan companion with fasting, missions, and check-ins
  - **Adult** - Parent profiles that model behavior and send encouraging messages

### Daily Activities
- **Fasting Tracker** - Four modes: Full, Partial, Tried, Not Today (effort-based, no shame)
- **Suhoor Logger** - Log food groups with optional photos
- **Wonder Cards** - 30 beautiful facts about Ramadan, one per day
- **Kindness Missions** - Daily acts of kindness including secret "Quiet Star" missions
- **Iftar Messages** - Send kind messages to family members, delivered at iftar
- **Feelings Check-in** - Evening reflection with vocabulary building

### Family Features
- **Star Sky** - Visual representation of family's collective stars
- **Constellations** - Team achievements (Patience, Generosity, Courage, etc.)
- **Year-on-Year Memory** - Track growth across Ramadan years

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + Auth)
- **Payments**: Stripe
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account (for payments)

### Installation

1. **Clone and install dependencies**:
```bash
cd miniramadan
npm install
```

2. **Set up Supabase**:
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run the schema in `supabase/schema.sql`
   - Copy your project URL and anon key from Settings > API

3. **Set up Stripe** (optional for subscriptions):
   - Create a Stripe account
   - Create a product called "Ramadan Pass" with a yearly price (£9.99)
   - Copy your API keys

4. **Configure environment variables**:
```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. **Run the development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
miniramadan/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth pages (login, signup, onboarding)
│   │   ├── (dashboard)/       # Main app pages (family, sky, messages, settings)
│   │   └── api/               # API routes (auth callback, Stripe)
│   ├── components/
│   │   ├── ui/                # Base UI components (Button, Card, etc.)
│   │   ├── features/          # Feature components (FastingTracker, etc.)
│   │   └── layout/            # Layout components (Header, BottomNav)
│   ├── data/                  # Static content (wonder cards, missions)
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and Supabase clients
│   ├── store/                 # Zustand store
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
├── supabase/                  # Database schema
└── ...
```

## Content

### Wonder Cards (30 days)
Age-appropriate facts about Ramadan, Islamic culture, and community. Each card includes:
- A wonder-inducing fact
- "Tell someone" prompt for iftar conversation
- Today's word (Arabic vocabulary)

### Kindness Missions (30 days)
Daily acts of kindness across four categories:
- **Home** - Helping at home
- **Social** - Kind interactions with others
- **Spiritual** - Reflection and prayer
- **Charity** - Giving to others

Includes 5 "Quiet Star" missions for secret acts of kindness.

## Pricing

### Free Tier
- 1 child profile
- Basic fasting + suhoor logging
- Daily wonder cards
- Simple star chart
- Iftar messages

### Ramadan Pass (£9.99/year)
- Up to 4 children
- Family constellations
- Full audio story library
- Weekly insights
- Printable certificates
- Year-on-year timeline

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Other Platforms
The app is a standard Next.js application and can be deployed to any platform that supports Node.js.

## Mobile Apps

This web app is designed mobile-first and works great as a PWA. For native iOS/Android apps:
1. The app already supports PWA installation
2. For native wrappers, consider Capacitor or Expo

## Design Principles

1. **Effort Over Perfection** - Every attempt counts, no shame for partial fasts
2. **Family Togetherness** - Parents participate alongside children
3. **Privacy Respected** - Feelings check-ins are private
4. **Age Appropriate** - Little Stars get simple interactions, older children get depth
5. **Beautiful & Warm** - Night sky theme with gentle animations
6. **No Dark Patterns** - No gamification pressure, no guilt for skipped days

---

Built with ❤️ for families during Ramadan.
