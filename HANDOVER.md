# HANDOVER.md — MiniRamadan Arabic
> Status: IN PROGRESS

## What This Product Is
MiniRamadan Arabic is the Arabic-language version of the MiniRamadan family Ramadan companion app. It is a full RTL (right-to-left) translation of the English MiniRamadan app, targeting Arabic-speaking families. It shares the same Supabase backend/database as the English version but is deployed as a separate site. Features mirror the English version: fasting tracking, wonder cards, kindness missions, iftar messages, family star sky, and payment via Stripe with geo-based pricing.

## Tech Stack
- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database / Auth**: Supabase (shared with English MiniRamadan)
- **Payments**: Stripe + RevenueCat (iOS/Android IAP)
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **Mobile**: Capacitor (iOS + Android native wrappers)
- **Hosting**: Vercel (miniramadanarabic.vercel.app)

## What Is Built and Working
- Full Arabic RTL translation of core MiniRamadan features
- Authentication flow (signup, login, email confirmation)
- Family account system with profiles
- Fasting tracker, suhoor logger
- Wonder cards and kindness missions in Arabic
- Little Star dua feature (Arabic)
- Iftar messaging
- Star sky and constellations
- Stripe payment integration
- Geo-based pricing based on user country
- Stickiness features synced from English version
- Capacitor native builds for iOS and Android
- Deployed on Vercel

## What Is Unfinished
- Only 7 commits total -- the codebase was forked/translated from the English version and has fewer iterations of polish
- Push notifications not wired up
- Year-on-year timeline not implemented
- Audio story library not built
- Printable certificates not built
- Weekly insights not built
- Less bug-fixing iteration compared to English version

## Known Bugs
- Geo-price API had TypeScript errors (fixed in recent commits)
- LittleStarDua property naming was inconsistent (english vs transliteration vs meaning -- fixed)
- May inherit any unfixed bugs from the English version's codebase

## Project Structure
```
miniramadanarabic/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth pages (login, signup, onboarding)
│   │   ├── (dashboard)/       # Main app pages
│   │   ├── api/               # API routes
│   │   ├── debug/             # Debug endpoints
│   │   ├── privacy/           # Privacy policy
│   │   └── terms/             # Terms of service
│   ├── components/            # UI and feature components
│   ├── data/                  # Arabic static content
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and Supabase clients
│   ├── store/                 # Zustand store
│   └── types/                 # TypeScript type definitions
├── android/                   # Capacitor Android project
├── ios/                       # Capacitor iOS project
├── public/                    # Static assets
├── supabase/                  # Database schema SQL
└── scripts/                   # Build/deploy scripts
```

## How to Run It
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in values (same Supabase project as English version)
3. `npm run dev` -- opens at http://localhost:3000
4. For mobile: `npm run app:ios` or `npm run app:android`

**Environment variables (names only):**
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_RAMADAN_PASS_PRICE_ID
- STRIPE_WEBHOOK_SECRET
- NEXT_PUBLIC_APP_URL
- NEXT_PUBLIC_REVENUECAT_IOS_KEY (optional)
- NEXT_PUBLIC_REVENUECAT_ANDROID_KEY (optional)
- APP_STORE_SHARED_SECRET (optional)
- GOOGLE_SERVICE_ACCOUNT_EMAIL (optional)
- GOOGLE_SERVICE_ACCOUNT_KEY (optional)
- NEXT_PUBLIC_GA_ID (optional)

## Next Steps (In Order)
1. Port remaining bug fixes and polish from English version
2. Thorough RTL layout testing and refinement
3. Implement push notifications
4. Add year-on-year timeline
5. Build audio story library in Arabic
6. Add printable certificates

## Key Documentation
- `/Users/hassanyasin/miniramadanarabic/README.md` -- Project overview (same structure as English)
- `/Users/hassanyasin/miniramadanarabic/.env.example` -- All environment variables documented
- `/Users/hassanyasin/miniramadanarabic/STRIPE_SETUP.md` -- Stripe configuration
- `/Users/hassanyasin/miniramadanarabic/supabase/` -- Database schema (shared with English)
