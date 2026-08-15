'use client';

import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MagnifyingGlass,
  Compass,
  Bookmarks,
  Info,
  Gear,
  SignIn,
  SignOut,
  X,
  House,
  User as UserIcon,
  CaretRight,
  FilmStrip,
  List,
  GearSix,
  Question,
} from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const DESKTOP_NAV_ITEMS = [
  { path: "/",          label: "Home",      icon: House },
  { path: "/discover",  label: "Discover",  icon: Compass },
  { path: "/search",    label: "Search",    icon: MagnifyingGlass },
  { path: "/watchlist", label: "Watchlist", icon: Bookmarks },
];

const MOBILE_NAV_ITEMS = [
  { path: "/",          label: "Home",      icon: House },
  { path: "/discover",  label: "Discover",  icon: Compass },
  { path: "/search",    label: "Search",    icon: MagnifyingGlass },
  { path: "/watchlist", label: "Watchlist", icon: Bookmarks },
  { path: "/settings",  label: "Settings",  icon: GearSix },
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const drawerScrollRef = useRef<HTMLDivElement>(null);
  const [drawerScroll, setDrawerScroll] = useState({ scrollable: false, atTop: true });
  const pathname = usePathname();
  const router = useRouter();

  // Apple sheets: dragging the sheet only takes over when its content is
  // scrolled to the top — once you scroll the list, the sheet stops capturing
  const handleDrawerScroll = useCallback(() => {
    const el = drawerScrollRef.current;
    if (!el) return;
    setDrawerScroll({
      scrollable: el.scrollHeight > el.clientHeight + 1,
      atTop: el.scrollTop <= 2,
    });
  }, []);

  useEffect(() => {
    if (drawerOpen) {
      const frame = requestAnimationFrame(handleDrawerScroll);
      return () => cancelAnimationFrame(frame);
    }
  }, [drawerOpen, handleDrawerScroll]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const userDisplayName = user?.displayName || user?.email?.split("@")[0] || "User";

  return (
    <>
      {/* DESKTOP HEADER */}
      <header
        className={`fixed top-0 inset-x-0 z-[100] hidden md:block transition-all duration-500 animate-slide-down ${
          scrolled
            ? "h-[72px] glass-strong shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            : "h-[72px] bg-gradient-to-b from-black/85 via-black/20 to-transparent"
        }`}
      >
        <div className="container h-full flex items-center justify-between gap-8">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="relative">
              <Image
                src="/logo.png"
                alt="Tarkosi"
                width={30}
                height={30}
                className="object-contain rounded-[4px] transition-all duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_16px_var(--accent-glow)]" />
            </div>
            <span
              className="text-white tracking-[0.2em] font-bold transition-all duration-300"
              style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '1.15rem' }}
            >
              TARKOSI
            </span>
          </Link>

          {/* Navigation Links with sliding pill hover */}
          <nav
            className="flex items-center gap-1 relative"
            onMouseLeave={() => setHoveredPath(null)}
          >
            {DESKTOP_NAV_ITEMS.map(({ path, label, icon: Icon }) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  href={path}
                  onMouseEnter={() => setHoveredPath(path)}
                  className={`relative px-4 py-2 text-xs font-semibold tracking-widest uppercase transition-colors duration-300 active:scale-95 rounded-[var(--radius-sm)] select-none flex items-center gap-2 ${
                    active
                      ? "text-white"
                      : "text-[var(--text-secondary)] hover:text-white"
                  }`}
                >
                  <Icon weight={active ? "fill" : "regular"} className="w-4 h-4" />
                  <span className="relative z-10">{label}</span>

                  {/* Sliding hover pill */}
                  {hoveredPath === path && (
                    <div
                      className="absolute inset-0 bg-white/[0.05] border border-white/[0.03] rounded-[var(--radius-sm)] z-0 animate-fade-in"
                    />
                  )}

                  {/* Active indicator — slides between items with a spring
                      (Apple: spatial consistency — the underline physically moves) */}
                  {active && (
                    <motion.div
                      layoutId="desktop-nav-active"
                      transition={{ type: "spring", stiffness: 480, damping: 36 }}
                      className="absolute bottom-0 inset-x-4 h-[2px] bg-[var(--accent)] rounded-full shadow-[0_0_8px_var(--accent)]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Auth or Dropdown */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {loading ? (
              <div className="w-10 h-10 rounded-full skeleton" />
            ) : user ? (
              /* User Profile Widget */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 group cursor-pointer focus:outline-none"
                  aria-label="User menu"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent)] to-[#600000] border border-white/20 flex items-center justify-center text-white text-xs font-bold shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:border-[var(--accent)] group-hover:shadow-[0_0_12px_var(--accent-glow)]">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={userDisplayName}
                        width={36}
                        height={36}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      getInitials()
                    )}
                  </div>
                </button>

                {/* Profile Dropdown — springs in from the trigger (anchored origin) */}
                <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    style={{ transformOrigin: "top right" }}
                    className="absolute right-0 top-12 w-64 glass-strong rounded-[var(--radius-md)] shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-4 flex flex-col gap-3.5 z-[110]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[#600000] border border-white/10 flex items-center justify-center text-white text-sm font-bold shadow-inner">
                        {user.photoURL ? (
                          <Image
                            src={user.photoURL}
                            alt={userDisplayName}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          getInitials()
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-white text-sm font-bold truncate leading-tight">
                          {userDisplayName}
                        </p>
                        <p className="text-[var(--text-secondary)] text-[11px] truncate leading-tight mt-0.5">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="h-px bg-white/[0.06]" />

                    <div className="flex flex-col gap-1">
                      <Link
                        href="/watchlist"
                        className="flex items-center gap-3 px-2.5 py-2 rounded-[var(--radius-sm)] text-xs font-semibold text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.04] transition-all duration-200"
                      >
                        <Bookmarks className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                        My Watchlist
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-2.5 py-2 rounded-[var(--radius-sm)] text-xs font-semibold text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.04] transition-all duration-200"
                      >
                        <GearSix className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                        Settings
                      </Link>
                      <Link
                        href="/about"
                        className="flex items-center gap-3 px-2.5 py-2 rounded-[var(--radius-sm)] text-xs font-semibold text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.04] transition-all duration-200"
                      >
                        <Info className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                        About Tarkosi
                      </Link>
                    </div>

                    <div className="h-px bg-white/[0.06]" />

                    <button
                      onClick={handleSignOut}
                      className="flex items-center justify-center gap-2 w-full py-2 bg-white/[0.03] border border-white/[0.06] hover:bg-[var(--accent)]/20 hover:border-[var(--accent)]/40 hover:text-white rounded-[var(--radius-sm)] text-xs font-bold text-[var(--text-primary)] transition-all duration-200 cursor-pointer"
                    >
                      <SignOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className="btn btn-primary text-xs py-2 px-5 font-bold flex items-center gap-2 shadow-[0_0_15px_var(--accent-glow)]"
              >
                <SignIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* MOBILE TOP BAR */}
      <div
        className={`fixed top-0 inset-x-0 z-[100] md:hidden h-14 flex items-center justify-between px-4 transition-all duration-300 animate-slide-down ${
          scrolled
            ? "glass-strong shadow-md"
            : "bg-gradient-to-b from-black/80 to-transparent"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Tarkosi"
            width={24}
            height={24}
            className="object-contain rounded-[4px]"
          />
          <span
            className="text-white tracking-[0.2em] font-bold"
            style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '1rem' }}
          >
            TARKOSI
          </span>
        </Link>

        {/* User Profile Trigger / Login Button */}
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="w-7 h-7 rounded-full skeleton" />
          ) : user ? (
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[#600000] border border-white/20 flex items-center justify-center text-white text-[10px] font-bold shadow-md cursor-pointer"
              aria-label="Open profile menu"
            >
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={userDisplayName}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
              ) : (
                getInitials()
              )}
            </button>
          ) : (
            <Link
              href="/login"
              className="btn btn-primary text-[10px] py-1.5 px-3.5 font-bold flex items-center gap-1.5 shadow-[0_0_10px_var(--accent-glow)]"
            >
              <SignIn className="w-3 h-3" weight="bold" />
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* MOBILE BOTTOM DOCK */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden pointer-events-none">
        <div 
          className="mx-3 mb-3 pointer-events-auto glass-strong bg-[var(--bg-surface)]/95 backdrop-blur-xl border border-white/[0.1] shadow-[0_-4px_30px_rgba(0,0,0,0.5)] rounded-2xl py-2 px-3 flex justify-between items-center max-w-md"
          style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0.5rem))" }}
        >
          {MOBILE_NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                href={path}
                className="relative flex flex-col items-center justify-center flex-1 py-1.5 cursor-pointer"
              >
                {/* Bubble Highlight — slides between tabs like an iOS tab bar */}
                {active && (
                  <motion.div
                    layoutId="mobile-dock-active"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-x-1.5 inset-y-0.5 bg-[var(--accent)]/15 border border-[var(--accent)]/20 rounded-xl -z-10"
                  />
                )}

                <div
                  className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                    active ? "text-[var(--accent)] scale-105 -translate-y-0.5" : "text-[var(--text-secondary)] hover:text-white"
                  }`}
                >
                  <Icon weight={active ? "fill" : "regular"} className="w-5 h-5" />
                  <span className="text-[9px] font-bold tracking-wider uppercase select-none">
                    {label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* MOBILE PROFILE DRAWER — a real bottom sheet: spring in/out,
          rubber-bands past the bottom edge, drag-to-dismiss with velocity */}
      <AnimatePresence>
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-sm md:hidden"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Bottom Sheet */}
          <motion.div
            key="drawer-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            drag={drawerScroll.scrollable && !drawerScroll.atTop ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 90 || info.velocity.y > 500) setDrawerOpen(false);
            }}
            className="fixed bottom-0 inset-x-0 z-[130] bg-[var(--bg-surface)] border-t border-white/[0.08] rounded-t-2xl md:hidden max-h-[80vh] flex flex-col will-change-transform"
          >
            {/* Drag handle decoration */}
            <div className="py-3 flex justify-center cursor-grab active:cursor-grabbing" onClick={() => setDrawerOpen(false)}>
              <div className="w-12 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Drawer Header */}
            <div className="px-5 pb-5 flex justify-between items-center border-b border-[var(--border-faint)]">
              <span className="t-label text-[10px]">
                Account Profile
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div ref={drawerScrollRef} onScroll={handleDrawerScroll} className="p-5 flex flex-col gap-6 overflow-y-auto flex-grow pb-10">
              {user && (
                <div className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent)] to-[#600000] border border-white/10 flex items-center justify-center text-white text-base font-bold shadow-inner">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={userDisplayName}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      getInitials()
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-white text-base font-bold truncate leading-tight">
                      {userDisplayName}
                    </p>
                    <p className="text-[var(--text-secondary)] text-xs truncate leading-tight mt-1">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Links list */}
              <div className="flex flex-col gap-2.5">
                <Link
                  href="/watchlist"
                  className="flex items-center justify-between p-3.5 bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] rounded-xl text-sm font-bold text-white transition-all"
                  onClick={() => setDrawerOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <Bookmarks className="w-4 h-4 text-[var(--accent)]" />
                    <span>My Watchlist</span>
                  </div>
                  <CaretRight className="w-4 h-4 text-white/30" />
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center justify-between p-3.5 bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] rounded-xl text-sm font-bold text-white transition-all"
                  onClick={() => setDrawerOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <GearSix className="w-4 h-4 text-[var(--accent)]" />
                    <span>Settings</span>
                  </div>
                  <CaretRight className="w-4 h-4 text-white/30" />
                </Link>

                <Link
                  href="/about"
                  className="flex items-center justify-between p-3.5 bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] rounded-xl text-sm font-bold text-white transition-all"
                  onClick={() => setDrawerOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <Info className="w-4 h-4 text-[var(--accent)]" />
                    <span>About Tarkosi</span>
                  </div>
                  <CaretRight className="w-4 h-4 text-white/30" />
                </Link>
              </div>

              {/* Sign Out Button */}
              {user && (
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 hover:border-red-500/30 text-red-400 rounded-xl text-sm font-bold transition-all cursor-pointer mt-2"
                >
                  <SignOut className="w-4 h-4" />
                  Sign Out of Tarkosi
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>
    </>
  );
}
