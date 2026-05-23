'use client';

import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { Search, Compass, BookMarked, Info, Settings, LogIn, LogOut, X, Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
    const unsub = onAuthStateChanged(auth, (u) => { 
      setUser(!!u); 
      setLoading(false); 
    });
    return unsub;
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

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
            <Image
              src="/logo.png"
              alt=""
              width={28}
              height={28}
              className="object-contain rounded-[4px] transition-all duration-300 group-hover:opacity-80"
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
              className="fixed top-14 inset-x-0 z-[95] glass-strong border-b border-[var(--border-subtle)] md:hidden max-h-[calc(100svh-3.5rem)] overflow-y-auto"
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
                    <button onClick={handleSignOut} className="btn btn-secondary text-xs py-2 px-4 text-[var(--text-primary)]">
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
