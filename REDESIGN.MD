# NETFLYER v2 — COMPLETE REBUILD PROMPT
### Fix Everything. Make It Actually Good.

---

## WHAT YOU'RE LOOKING AT RIGHT NOW (AND WHY IT'S BAD)

Before touching any code, understand what's wrong:

1. **The navbar is broken in structure.** Hamburger left, logo center, "Sign Out" floating right as a standalone dark pill — these three elements have zero visual relationship to each other. It looks assembled, not designed.

2. **The hero buttons are wrong for a streaming platform.** Two full-width stacked pill buttons (Play Now / More Info) look like a fintech onboarding screen. Streaming platforms use inline side-by-side buttons, left-aligned, with the play button dominant.

3. **The info page is a centered column of text.** Centered title, centered tags, centered overview — it reads like a Wikipedia mobile page. The poster is floating in the middle of the screen with no compositional relationship to anything. The HeroUI chip components for genres were never restyled and look like default component library output.

4. **The "N" avatar in the bottom-left of every screen** is a rogue Firebase anonymous user avatar that was never hidden. It overlaps content on every page. Fix it.

5. **The genre/meta chips on the info page** (yellow star, colored pill borders) are visually noisy. Four different colors fighting for attention.

6. **Card corners are too rounded** (`rounded-xl` or higher) — gives a soft, toy-like feel that conflicts with the cinematic direction.

7. **Typography has no hierarchy.** Body text, labels, and titles are all roughly the same visual weight. Nothing dominates.

8. **The mobile layout collapses everything to centered text.** Left-aligned text almost always reads better on mobile for body content.

---

## DESIGN SYSTEM — ESTABLISH THIS FIRST, EVERYTHING DERIVES FROM IT

### Aesthetic Direction
**Cinematic editorial dark.** Reference: *A24's website*, *Mubi*, *early Letterboxd*, *The Criterion Collection*. Not Netflix. Not a generic dark SaaS dashboard. The feeling should be: a serious person who watches serious films built this.

### Typography (REPLACE WHAT'S THERE)

```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
```

- **Display/Hero titles:** `Bebas Neue` — condensed, cinematic, loud. This is the Netflyer voice.
- **UI / Body:** `DM Sans` — clean, humanist, readable at small sizes.
- **Meta / Code / Labels:** `DM Mono` — for ratings, year, episode numbers, runtime. Gives a filmic data aesthetic.

### Full `globals.css` — Replace Completely

```css
@import "tailwindcss";

@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

/* ================================
   TOKENS
   ================================ */
:root {
  /* Backgrounds — layered, never pure black */
  --bg-base:        #080809;
  --bg-surface:     #0f0f11;
  --bg-raised:      #161619;
  --bg-overlay:     #1e1e22;

  /* Text */
  --text-primary:   #f2f2f4;
  --text-secondary: #8a8a96;
  --text-muted:     #4a4a54;

  /* Accent — use sparingly */
  --accent:         #e5091a;
  --accent-dim:     rgba(229, 9, 26, 0.18);
  --accent-glow:    rgba(229, 9, 26, 0.35);

  /* Borders */
  --border-faint:   rgba(255,255,255,0.05);
  --border-subtle:  rgba(255,255,255,0.09);
  --border-visible: rgba(255,255,255,0.15);

  /* Radii — restrained */
  --radius-sm:  4px;
  --radius-md:  8px;
  --radius-lg:  12px;

  /* Easing */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-expo:  cubic-bezier(0.7, 0, 0.84, 0);
}

/* ================================
   BASE
   ================================ */
*, *::before, *::after { box-sizing: border-box; }

html {
  font-family: 'DM Sans', -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: var(--bg-base);
  color: var(--text-primary);
}

body { min-height: 100svh; }

::selection {
  background: var(--accent);
  color: white;
}

::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: var(--bg-base); }
::-webkit-scrollbar-thumb { background: var(--bg-overlay); border-radius: 2px; }

/* ================================
   TYPOGRAPHY SCALE
   ================================ */

/* Hero title — Bebas, massive, cinematic */
.t-hero {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(3.5rem, 10vw, 8rem);
  line-height: 0.95;
  letter-spacing: 0.02em;
  color: var(--text-primary);
}

/* Section/page title */
.t-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(2rem, 5vw, 3.5rem);
  line-height: 1;
  letter-spacing: 0.03em;
  color: var(--text-primary);
}

/* Row/section labels */
.t-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

/* Meta data — years, ratings, runtime */
.t-meta {
  font-family: 'DM Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  color: var(--text-secondary);
}

/* Body */
.t-body {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--text-secondary);
}

/* ================================
   LAYOUT
   ================================ */
.container {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding-left: clamp(1rem, 4vw, 3rem);
  padding-right: clamp(1rem, 4vw, 3rem);
}

/* ================================
   GLASS / SURFACE
   ================================ */
.surface {
  background: var(--bg-surface);
  border: 1px solid var(--border-faint);
}

.glass {
  background: rgba(8, 8, 9, 0.75);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid var(--border-faint);
}

.glass-strong {
  background: rgba(8, 8, 9, 0.92);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid var(--border-subtle);
}

/* ================================
   BUTTONS
   ================================ */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  border-radius: var(--radius-sm);
  transition: all 180ms var(--ease-out-expo);
  cursor: pointer;
  white-space: nowrap;
  border: 1px solid transparent;
}

/* Sharp corners on buttons — no pill shapes anywhere */
.btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.btn-primary {
  background: var(--accent);
  color: #fff;
  padding: 0.75rem 1.75rem;
}
.btn-primary:hover {
  background: #ff1a2a;
  box-shadow: 0 0 24px var(--accent-glow);
  transform: translateY(-1px);
}
.btn-primary:active { transform: translateY(0); box-shadow: none; }

.btn-secondary {
  background: rgba(255,255,255,0.07);
  color: var(--text-primary);
  border-color: var(--border-subtle);
  padding: 0.75rem 1.75rem;
}
.btn-secondary:hover {
  background: rgba(255,255,255,0.11);
  border-color: var(--border-visible);
  transform: translateY(-1px);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
}
.btn-ghost:hover {
  background: rgba(255,255,255,0.05);
  color: var(--text-primary);
}

.btn-icon {
  width: 40px;
  height: 40px;
  padding: 0;
  background: rgba(255,255,255,0.06);
  color: var(--text-secondary);
  border-color: var(--border-faint);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}
.btn-icon:hover {
  background: rgba(255,255,255,0.1);
  color: var(--text-primary);
  border-color: var(--border-subtle);
}

/* ================================
   CARDS
   ================================ */
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-faint);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color 250ms var(--ease-out-expo),
              transform 250ms var(--ease-out-expo),
              box-shadow 250ms var(--ease-out-expo);
}
.card:hover {
  border-color: var(--border-subtle);
  box-shadow: 0 16px 40px rgba(0,0,0,0.5);
}

/* ================================
   SKELETON
   ================================ */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-raised) 0%,
    var(--bg-overlay) 40%,
    var(--bg-raised) 100%
  );
  background-size: 300% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}
@keyframes shimmer {
  0%   { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

/* ================================
   UTILITIES
   ================================ */
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }

.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border-width: 0;
}

/* Tab underline nav pattern */
.tab-item {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 0.75rem 0;
  border-bottom: 2px solid transparent;
  transition: color 150ms ease, border-color 150ms ease;
  cursor: pointer;
}
.tab-item.active {
  color: var(--text-primary);
  border-bottom-color: var(--accent);
}
.tab-item:hover:not(.active) {
  color: var(--text-secondary);
}

/* Meta chip — no colors, just monochrome */
.meta-chip {
  font-family: 'DM Mono', monospace;
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
  border: 1px solid var(--border-faint);
  border-radius: var(--radius-sm);
  padding: 0.2rem 0.5rem;
  white-space: nowrap;
}

/* Genre chip — accent outline only for genres */
.genre-chip {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  border: 1px solid rgba(229,9,26,0.3);
  border-radius: var(--radius-sm);
  padding: 0.2rem 0.5rem;
  white-space: nowrap;
}

/* Rating — gold, monospaced */
.rating-chip {
  font-family: 'DM Mono', monospace;
  font-size: 0.75rem;
  font-weight: 500;
  color: #c9a227;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
```

---

## COMPONENT REBUILDS — DO THESE IN ORDER

---

### 1. `src/components/Navbar.tsx` — COMPLETE REWRITE

**The problem:** Floating Sign Out button, centered logo with hamburger left creating a 3-zone layout that doesn't cohere.

**The solution:** Full-width fixed bar. Logo left. Nav items center (desktop). Auth right. On mobile: logo left, auth icon right (not text), hamburger right-most. Everything on one horizontal plane.

**Kill all HeroUI Navbar imports.** Replace with this structure:

```tsx
'use client';

import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import { Search, Compass, BookMarked, Info, Settings, LogIn, LogOut, X, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { path: "/search",    label: "Search",    icon: Search },
  { path: "/discover",  label: "Discover",  icon: Compass },
  { path: "/watchlist", label: "Watchlist", icon: BookMarked },
  { path: "/about",     label: "About",     icon: Info },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser]         = useState(false);
  const [loading, setLoading]   = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(!!u); setLoading(false); });
    return unsub;
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  const isActive = (path: string) =>
    path === "/watchlist" ? pathname === path : pathname?.startsWith(path);

  return (
    <>
      <motion.header
        initial={{ y: -56 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: [0.16,1,0.3,1] }}
        className={`fixed top-0 inset-x-0 z-[100] h-14 transition-all duration-300 ${
          scrolled
            ? "glass-strong border-b border-[var(--border-faint)]"
            : "bg-gradient-to-b from-black/60 to-transparent border-b border-transparent"
        }`}
      >
        <div className="container h-full flex items-center justify-between gap-4">

          {/* LEFT — Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <img
              src="/logo.png"
              alt=""
              className="w-7 h-7 object-contain rounded-[4px] transition-all duration-300 group-hover:opacity-80"
            />
            <span
              className="hidden sm:block text-white tracking-[0.18em] text-sm font-bold"
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.2em', fontSize: '1.05rem' }}
            >
              NETFLYER
            </span>
          </Link>

          {/* CENTER — Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ path, label }) => (
              <Link
                key={path}
                href={path}
                className={`relative px-4 py-1.5 text-xs font-semibold tracking-widest uppercase transition-colors duration-150 rounded-[4px] ${
                  isActive(path)
                    ? "text-white bg-white/8"
                    : "text-[var(--text-secondary)] hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
                {isActive(path) && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 inset-x-4 h-px bg-[var(--accent)]"
                    transition={{ type: "spring", stiffness: 600, damping: 40 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* RIGHT — Auth + Settings + Mobile Hamburger */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Settings icon — desktop only */}
            <Link
              href="/settings"
              className={`btn btn-icon hidden md:flex ${pathname === "/settings" ? "text-white border-[var(--border-subtle)]" : ""}`}
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>

            {/* Auth */}
            {loading ? (
              <div className="w-20 h-8 skeleton rounded-[4px]" />
            ) : user ? (
              <button
                onClick={handleSignOut}
                className="btn btn-secondary hidden md:inline-flex text-xs py-1.5 px-3"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            ) : (
              <Link href="/login" className="btn btn-primary hidden md:inline-flex text-xs py-1.5 px-4">
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
            )}

            {/* Mobile hamburger — rightmost */}
            <button
              className="btn btn-icon md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={menuOpen ? "x" : "menu"}
                  initial={{ opacity: 0, rotate: menuOpen ? -90 : 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMenuOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16,1,0.3,1] }}
              className="fixed top-14 inset-x-0 z-[95] glass-strong border-b border-[var(--border-subtle)] md:hidden"
            >
              <div className="container py-4 flex flex-col gap-1">
                {NAV_ITEMS.map(({ path, label, icon: Icon }, i) => (
                  <motion.div
                    key={path}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.2 }}
                  >
                    <Link
                      href={path}
                      className={`flex items-center gap-3 px-3 py-3 rounded-[6px] text-sm font-medium transition-colors ${
                        isActive(path)
                          ? "text-white bg-white/8"
                          : "text-[var(--text-secondary)] hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive(path) ? "text-[var(--accent)]" : ""}`} />
                      {label}
                    </Link>
                  </motion.div>
                ))}
                <div className="mt-3 pt-3 border-t border-[var(--border-faint)] flex items-center gap-2">
                  <Link href="/settings" className="btn btn-ghost flex-1 justify-start text-xs gap-2">
                    <Settings className="w-3.5 h-3.5" /> Settings
                  </Link>
                  {user ? (
                    <button onClick={handleSignOut} className="btn btn-secondary text-xs py-2 px-4">
                      Sign Out
                    </button>
                  ) : (
                    <Link href="/login" className="btn btn-primary text-xs py-2 px-4">
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
```

---

### 2. `src/components/Hero.tsx` — FULL REWRITE

**Problems:** Stacked full-width pill buttons. No cinematic presence. Backdrop too dark. Title font generic.

**Rebuild rules:**
- `Bebas Neue` for the title via `.t-hero` class
- Backdrop at `opacity-60`, not 70. Let the image breathe.
- Gradient: heavy bottom fade, moderate left fade, NO top fade (let the backdrop show through the navbar)
- Buttons: left-aligned, side by side, NOT full-width, NOT pills — `border-radius: 4px` matching the design system
- Meta row: left-aligned, `DM Mono`, monospaced, pipe `|` separators, small caps
- On mobile: everything still left-aligned. Never center-align hero content.

```tsx
// In the return statement, replace the button section with:

<div className="flex items-center gap-3 flex-wrap">
  <button
    onClick={handlePlay}
    className="btn btn-primary"
  >
    <FaPlay className="text-xs" />
    Play Now
  </button>
  <button
    onClick={handleInfo}
    className="btn btn-secondary"
  >
    More Info
  </button>
</div>

// Replace the title with:
<h1 className="t-hero mb-4 drop-shadow-[0_2px_20px_rgba(0,0,0,0.9)]">
  {title}
</h1>

// Replace the meta badges (remove the "Featured" badge entirely) with:
<div className="flex items-center gap-2 mb-3 flex-wrap">
  {releaseYear && <span className="t-meta">{releaseYear}</span>}
  <span className="t-meta text-[var(--border-visible)]">|</span>
  {movie.vote_average > 0 && (
    <span className="rating-chip">
      <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {movie.vote_average.toFixed(1)}
    </span>
  )}
  <span className="t-meta text-[var(--border-visible)]">|</span>
  <span className="meta-chip">{isTV ? "Series" : "Film"}</span>
</div>
```

---

### 3. `src/components/MovieRow.tsx` — TARGETED FIXES

**The section header needs to be rebuilt:**

```tsx
// Replace the heading section with this layout:
{title && (
  <div className="flex items-center justify-between mb-5 ml-1">
    <div className="flex items-center gap-3">
      <span className="t-label">{title}</span>
      {items?.length > 0 && (
        <span className="t-meta text-[var(--text-muted)]">({items.length})</span>
      )}
    </div>
    <button className="t-label text-[var(--accent)] hover:opacity-75 transition-opacity">
      See all →
    </button>
  </div>
)}
```

**Card corner radius — change from rounded-xl to:**
```tsx
// In RowCard, the image container currently has no explicit radius class — add:
className="relative w-40 h-[240px] md:w-48 md:h-[288px] overflow-hidden bg-[var(--bg-raised)] rounded-[var(--radius-md)]"
// NOT rounded-xl, NOT rounded-2xl
```

**Card hover overlay — replace the text overlay:**
```tsx
// Replace the cinematic overlay div content with:
<div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
  <div className="absolute bottom-0 left-0 right-0 p-3">
    <p className="text-white text-sm font-semibold line-clamp-2 leading-tight mb-1">
      {title}
    </p>
    <div className="flex items-center gap-1.5">
      {releaseDate && (
        <span className="t-meta">{new Date(releaseDate).getFullYear()}</span>
      )}
      {item.vote_average > 0 && (
        <span className="rating-chip text-[10px]">★ {item.vote_average.toFixed(1)}</span>
      )}
    </div>
  </div>
</div>
```

---

### 4. `src/app/info/[type]/[id]/InfoClient.tsx` — MAJOR LAYOUT OVERHAUL

**The core layout problem:** Everything is centered. On mobile you get a centered poster over centered text. This needs to be restructured.

**New mobile layout structure:**
1. Full-width backdrop at top (40vh), heavily faded
2. Poster in the bottom-left of the backdrop zone, jutting out slightly below
3. Title and meta to the right of the poster OR below on very small screens
4. All text LEFT-ALIGNED

**Specific changes:**

```tsx
// TOP SECTION — replace with this structure:
<div className="relative">
  {/* Backdrop */}
  <div className="relative w-full h-[45vw] min-h-[220px] max-h-[380px] overflow-hidden">
    <img
      src={getImageUrl(details.backdrop_path, "backdrop")}
      alt=""
      className="w-full h-full object-cover object-top"
      style={{ opacity: imageLoaded.backdrop ? 0.45 : 0 }}
      onLoad={() => setImageLoaded(p => ({...p, backdrop: true}))}
    />
    {/* Gradient fades */}
    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/30 to-transparent" />
    <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-base)]/60 to-transparent" />
  </div>

  {/* Content — overlaps the backdrop */}
  <div className="container relative -mt-24 sm:-mt-32 z-10">
    <div className="flex gap-5 sm:gap-8 items-end">

      {/* Poster */}
      <div className="flex-shrink-0 w-28 sm:w-40 md:w-48">
        <div className="relative aspect-[2/3] rounded-[var(--radius-md)] overflow-hidden border border-[var(--border-subtle)] shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
          <img
            src={getImageUrl(details.poster_path, "poster")}
            alt={title}
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(p => ({...p, poster: true}))}
          />
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 pb-2">
        {/* Title */}
        <h1
          className="text-white font-bold leading-tight mb-2 line-clamp-3"
          style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1.75rem, 5vw, 3rem)', letterSpacing: '0.02em' }}
        >
          {title}
        </h1>

        {/* Tagline */}
        {(details as any).tagline && (
          <p className="text-[var(--text-muted)] italic text-sm mb-3 line-clamp-1">
            "{(details as any).tagline}"
          </p>
        )}

        {/* Meta row — monospaced, pipe separated */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          <span className="t-meta">{new Date(releaseDate).getFullYear()}</span>
          {runtime && <><span className="t-meta opacity-40">|</span><span className="t-meta">{runtime}</span></>}
          {(details as any).vote_average > 0 && (
            <><span className="t-meta opacity-40">|</span>
            <span className="rating-chip">★ {(details as any).vote_average.toFixed(1)}</span></>
          )}
        </div>

        {/* Genre chips — accent outline, NO colored fills */}
        <div className="flex flex-wrap gap-1.5">
          {(details as any).genres?.slice(0, 3).map((g: any) => (
            <span key={g.id} className="genre-chip">{g.name}</span>
          ))}
        </div>
      </div>
    </div>

    {/* Overview — full width, left aligned, NOT centered */}
    <p className="t-body mt-5 max-w-2xl">
      {showFullText ? details.overview : details.overview?.slice(0, 220) + (details.overview?.length > 220 ? '...' : '')}
    </p>
    {details.overview?.length > 220 && (
      <button
        onClick={() => setShowFullText(!showFullText)}
        className="t-label text-[var(--accent)] mt-2 hover:opacity-75 transition-opacity"
      >
        {showFullText ? '↑ Less' : 'Read more →'}
      </button>
    )}

    {/* Action buttons — left-aligned, side by side, NOT full-width */}
    <div className="flex items-center gap-3 mt-6 flex-wrap">
      <button
        onClick={() => router.push(type === 'tv' ? `/watch/tv/${id}/1/1` : `/watch/movie/${id}`)}
        className="btn btn-primary"
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        Play Now
      </button>

      {watchlistLoading ? (
        <div className="w-32 h-10 skeleton rounded-[4px]" />
      ) : (
        <button
          onClick={handleWatchlistToggle}
          className="btn btn-secondary"
        >
          {watchlist
            ? <><Trash2 className="w-3.5 h-3.5" /> Remove</>
            : <><Plus className="w-3.5 h-3.5" /> Watchlist</>
          }
        </button>
      )}

      {/* Trailer button — ghost, no bg */}
      <button
        onClick={handleTrailer}
        className="btn btn-ghost text-xs"
      >
        ▶ Trailer
      </button>
    </div>
  </div>
</div>
```

**Tab navigation — fix the styling:**

```tsx
// Replace the tabs with:
<div className="container mt-8">
  <div className="flex gap-6 border-b border-[var(--border-faint)]">
    {tabs.map(tab => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`tab-item ${activeTab === tab ? 'active' : ''}`}
      >
        {tab}
      </button>
    ))}
  </div>
</div>
```

**Genre chips — REMOVE all colored outlines and fills. The current info page has HORROR in red, ACTION & ADVENTURE in red, MYSTERY in red-outline, CRIME in red-outline — all fighting. Use only `genre-chip` class (one consistent style). NEVER set different colors per genre.**

---

### 5. Kill the Firebase Anonymous "N" Avatar

This rogue element is the `<Avatar>` or similar component being rendered for an anonymous Firebase user. Find every file that renders a user avatar/initials and add a guard:

```tsx
// Add this check everywhere a user avatar is rendered:
{user && user.displayName && (
  <Avatar ... />
)}
// OR if it's a Firebase UI component, add to layout.tsx:
// Make sure no Firebase UI library is auto-rendering anything
```

Also check if `@heroui/react`'s Avatar component is being rendered somewhere with a fallback "N" initial. In `InfoClient.tsx` the review form likely renders an Avatar for the current user. Add null checks:

```tsx
// In the reviews form section:
{user && (
  <Avatar
    name={userName || undefined}  // NOT 'N' fallback
    src={user.photoURL || undefined}
    className="w-8 h-8 flex-shrink-0"
  />
)}
```

---

### 6. `src/app/discover/page.tsx` — TARGETED FIXES

The current discover page is decent but needs:

**Fix the card grid** — on mobile 2 cols is fine, but the cards have a "title + year below the poster" layout that wastes space and makes them look like the $5 bin at a record store. Tighten it:

```tsx
// Card in discover grid — replace the bottom label with a hover-only overlay
// Same pattern as MovieRow RowCard
// Remove the visible title/year below the poster — it creates a messy grid
// The title/year should only appear on hover overlay
```

**Fix the filter panel** — the `ADVANCED FILTERS` heading in all-caps bold looks like a cheap modal. Replace:

```tsx
// Replace heading:
<h2 style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em', fontSize: '1.5rem' }}>
  Advanced Filters
</h2>
```

**Fix the result count** — `1,326,765 RESULTS FOUND` is ugly placeholder text. If the API returns a `total_results` number, format it properly. If not, remove the count entirely.

---

### 7. `src/app/search/page.tsx` — TARGETED FIXES

The search input needs to be the hero of the page, not a small form element:

```tsx
// Search input section:
<div className="container pt-24 pb-8">
  <div className="max-w-2xl">
    <label className="t-label block mb-3">Search</label>
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Title, actor, genre..."
        autoFocus
        className="w-full pl-11 pr-4 py-3.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] font-['DM_Sans'] text-base focus:outline-none focus:border-[var(--border-visible)] transition-colors"
      />
    </div>
  </div>
</div>
```

---

### 8. `src/components/Footer.tsx` — REBUILD IF MINIMAL

The current footer (as seen in screenshot) is clean but the "NETFLYER" wordmark needs to use Bebas Neue:

```tsx
<footer className="border-t border-[var(--border-faint)] mt-20">
  <div className="container py-12">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">

      {/* Brand */}
      <div>
        <p
          className="text-white mb-2 tracking-widest"
          style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.25rem', letterSpacing: '0.2em' }}
        >
          NETFLYER
        </p>
        <p className="t-body text-sm italic">Cinema, anytime. Anywhere.</p>
      </div>

      {/* Navigation */}
      <div>
        <p className="t-label mb-4">Navigation</p>
        <nav className="flex flex-col gap-2.5">
          {['/', '/discover', '/search', '/watchlist', '/settings'].map((path, i) => (
            <Link key={path} href={path} className="t-body text-sm hover:text-[var(--text-primary)] transition-colors">
              {['Home', 'Discover', 'Search', 'Watchlist', 'Settings'][i]}
            </Link>
          ))}
        </nav>
      </div>

      {/* Legal */}
      <div>
        <p className="t-label mb-4">Legal & Open Source</p>
        <div className="flex flex-col gap-2.5">
          <a href="https://github.com/madsykle/netflyer" target="_blank" rel="noopener noreferrer"
             className="t-body text-sm hover:text-[var(--text-primary)] transition-colors flex items-center gap-2">
            GitHub Repository ↗
          </a>
        </div>
        <p className="t-body text-xs mt-4 leading-relaxed opacity-60">
          Netflyer does not host any files. All content is provided by non-affiliated third parties.
        </p>
      </div>
    </div>

    <div className="mt-10 pt-6 border-t border-[var(--border-faint)] flex items-center justify-between">
      <p className="t-meta">© 2026 Netflyer. MIT License.</p>
      <p className="t-meta">v2.0.0</p>
    </div>
  </div>
</footer>
```

---

## WHAT NOT TO TOUCH

- `src/lib/tmdb.ts` — working, leave it
- `src/lib/firebase.ts` — working, leave it
- `src/hooks/useSettings.tsx` — working, leave it
- `src/lib/embed.ts` — working, leave it
- `src/app/watch/[...params]/page.tsx` — working well, minor styling only
- `next.config.mjs` — already fixed in v1 prompt
- `vercel.json` — leave it

---

## SPECIFIC VISUAL RULES — NON-NEGOTIABLE

These apply to every component, every page. If something violates these, fix it:

1. **NO pill/fully-rounded buttons anywhere.** `border-radius: 4px` maximum on interactive elements.

2. **NO multiple accent colors.** The only accent is `--accent: #e5091a`. Yellow is ONLY for star ratings (and only the `rating-chip` class). Nothing else gets a color.

3. **NO centered body text on mobile.** Hero content, info page content, all left-aligned.

4. **NO text directly on a colored background** unless it's a `btn-primary`. All other chips/badges are monochrome.

5. **NO `rounded-xl` or `rounded-2xl`** anywhere. `rounded-[8px]` (var(--radius-md)) for cards. `rounded-[4px]` (var(--radius-sm)) for buttons, chips, inputs. `rounded-full` is banned except for avatar images.

6. **NO font size below 11px** for anything the user needs to read. Labels and meta can go to `0.6875rem` (11px) but never smaller.

7. **The navbar height is 56px (`h-14`).** All `pt-*` values for page content should account for this: minimum `pt-20` on pages.

8. **Images get `object-cover` always.** Never `object-contain` except the logo.

---

## QUICK WINS — DO THESE IN 10 MINUTES

These are tiny changes with high visual impact:

```tsx
// 1. In layout.tsx body tag, remove any bg-black and ensure:
className="bg-[var(--bg-base)] text-[var(--text-primary)] min-h-screen flex flex-col antialiased"

// 2. In home page.tsx, remove the "min-h-screen bg-black" wrapper:
// Change: <div className="min-h-screen bg-black">
// To: <div>

// 3. In every page that has a page title (Discover, Watchlist, Settings, Search):
// Add pt-20 and use Bebas Neue for the heading:
<h1 style={{ fontFamily: "'Bebas Neue', sans-serif" }} className="text-5xl text-white tracking-wide">
  Discover
</h1>

// 4. The "NETFLYER" text in the navbar center (if it remains):
// Must use Bebas Neue, tracking-widest, not font-bold on a sans-serif font

// 5. Settings page — the "← BACK" button:
// It's currently plain text with an arrow. Make it:
<button onClick={() => router.back()} className="flex items-center gap-2 t-label hover:text-[var(--text-secondary)] transition-colors mb-8">
  <ArrowLeft className="w-3.5 h-3.5" /> Back
</button>

// 6. Watchlist page heading:
// "My Watchlist" should be left-aligned with a subtitle showing count:
<h1 style={{ fontFamily: "'Bebas Neue', sans-serif" }} className="text-5xl text-white">
  Watchlist
</h1>
<p className="t-meta mt-1">{items.length} titles saved</p>
```

---

## THE SINGLE MOST IMPORTANT THING

If you only do one thing from this entire prompt, **do the navbar rewrite**. The current navbar with the floating "Sign Out" pill destroys first impressions. Everything else can be iterative — the navbar is seen on every single page.

Second most important: **kill the centered layout on the info page**. Move to the left-anchored poster + right-side details layout described in section 4.

Third: **replace the font stack** with Bebas Neue + DM Sans + DM Mono. This single change makes the platform look like it was actually designed, not scaffolded.

Everything else in this prompt is refinement around those three pillars.

