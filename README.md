# Tarkosi

**Tarkosi** is a premium, free movie and series streaming platform with a high-fidelity cinematic editorial UI.

Rebuilt from the ground up for maximum performance, global scalability, and security.

## Features
- 🎬 **Extensive Library:** Movies, TV Shows, and Anime powered by TMDB.
- 📺 **Theater Mode:** Immersive, edge-to-edge video player with multiple server fallbacks.
- 🚀 **Global Caching:** Ultra-fast response times via Upstash Redis global edge caching.
- 📱 **Cinematic Design:** Editorial-style layouts with Bebas Neue typography and liquid animations.
- 🔖 **User Accounts:** Firebase authentication with watch history and custom watchlists.
- 💬 **Critique System:** Community reviews and ratings with built-in profanity filtering.
- 🛡️ **Hardened Security:** Server-side API proxying, strict CSP headers, and locked-down Firestore rules.

## Tech Stack
- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, React 19)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Caching/Rate-Limiting:** [Upstash Redis](https://upstash.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Backend:** [Firebase](https://firebase.google.com/) (Auth, Firestore with Offline Persistence)
- **Data:** [TMDB API](https://developer.themoviedb.org/docs)

## Setup & Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/madsykle/netflyer.git
   cd netflyer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env.local` file in the root directory. Use `.env.example` as a template.
   ```env
   # TMDB (Securely proxied)
   TMDB_API_KEY=your_key
   NEXT_PUBLIC_TMDB_API_KEY=your_key

   # Firebase (Client SDK)
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

   # Upstash Redis
   UPSTASH_REDIS_REST_URL=...
   UPSTASH_REDIS_REST_TOKEN=...

   # App
   NEXT_PUBLIC_WEBSITE_URL=http://localhost:3001
   NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## License
MIT License. See [LICENSE](LICENSE) for details.
