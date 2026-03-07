# Netflyer

**Netflyer** is a premium, free, and ad-free movie and series streaming platform with a cinematic dark-mode UI. 

Recently rebuilt from the ground up for maximum performance and SEO.

## Features
- 🎬 **Extensive Library:** Movies, TV Shows, and Anime.
- 📺 **Multiple Sources:** Built-in video players with multiple streaming provider fallbacks.
- ⚡ **Lightning Fast:** Server-Side Rendered (SSR) with Next.js 15.
- 📱 **Responsive Design:** Beautiful, fluid UI across desktop, tablet, and mobile.
- 🔖 **User Accounts:** Firebase authentication, watch history tracking, and custom watchlists.
- 💬 **Community:** User reviews and ratings for all media.
- ⌨️ **Keyboard Shortcuts:** Quick playback controls (Fullscreen, Reload, Source Switching).

## Tech Stack
- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, React 19)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/) & React Icons
- **Backend/Auth:** [Firebase](https://firebase.google.com/) (Auth & Firestore)
- **Data Source:** [TMDB API](https://developer.themoviedb.org/docs)

## Setup & Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/madsykle/netflyer.git
   cd netflyer
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Environment Variables:**
   Create a `.env.local` file in the root directory and add the following keys. You can use `.env.example` as a template.
   ```env
   # TMDB
   TMDB_API_KEY=your_tmdb_api_key
   NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key

   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # App
   NEXT_PUBLIC_WEBSITE_URL=http://localhost:3001
   ```

4. **Start the development server:**
   ```bash
   yarn dev
   ```
   *The app will run on [http://localhost:3001](http://localhost:3001) by default.*

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
