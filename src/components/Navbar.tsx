'use client';

import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Compass, 
  BookMarked, 
  Info, 
  Settings, 
  LogIn, 
  LogOut, 
  X, 
  Home, 
  User as UserIcon,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const DESKTOP_NAV_ITEMS = [
  { path: "/",          label: "Home",      icon: Home },
  { path: "/discover",  label: "Discover",  icon: Compass },
  { path: "/search",    label: "Search",    icon: Search },
  { path: "/watchlist", label: "Watchlist", icon: BookMarked },
];

const MOBILE_NAV_ITEMS = [
  { path: "/",          label: "Home",      icon: Home },
  { path: "/discover",  label: "Discover",  icon: Compass },
  { path: "/search",    label: "Search",    icon: Search },
  { path: "/watchlist", label: "Watchlist", icon: BookMarked },
  { path: "/settings",  label: "Settings",  icon: Settings },
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Disable body scroll when mobile drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Close menus on route change
  useEffect(() => {
    setDropdownOpen(false);
    setDrawerOpen(false);
  }, [pathname]);

  // Click outside to close desktop profile dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    setDropdownOpen(false);
    setDrawerOpen(false);
    router.push("/");
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(path);
  };

  const getInitials = () => {
    if (!user) return "";
    if (user.displayName) {
      const parts = user.displayName.split(" ");
      if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return user.displayName.substring(0, 2).toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const userDisplayName = user?.displayName || user?.email?.split("@")[0] || "User";

  return (
    <>
      {/* DESKTOP HEADER */}
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 inset-x-0 z-[100] hidden md:block transition-all duration-500 ease-out-expo ${
          scrolled
            ? "h-16 bg-[var(--bg-base)]/85 backdrop-blur-md border-b border-white/[0.05] shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            : "h-16 bg-gradient-to-b from-black/85 via-black/20 to-transparent border-b border-transparent"
        }`}
      >
        <div className="container h-full flex items-center justify-between gap-8">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <Image
              src="/logo.png"
              alt="Netflyer"
              width={30}
              height={30}
              className="object-contain rounded-[4px] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_12px_rgba(229,9,20,0.5)]"
            />
            <span
              className="text-white tracking-[0.2em] font-bold transition-all duration-300"
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.25rem' }}
            >
              NETFLYER
            </span>
          </Link>

          {/* Navigation Links with sliding pill hover */}
          <nav 
            className="flex items-center gap-1.5 relative"
            onMouseLeave={() => setHoveredPath(null)}
          >
            {DESKTOP_NAV_ITEMS.map(({ path, label }) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  href={path}
                  onMouseEnter={() => setHoveredPath(path)}
                  className={`relative px-4 py-2 text-xs font-semibold tracking-widest uppercase transition-colors duration-300 rounded-md select-none ${
                    active
                      ? "text-white"
                      : "text-[var(--text-secondary)] hover:text-white"
                  }`}
                >
                  <span className="relative z-10">{label}</span>
                  
                  {/* Sliding hover pill */}
                  {hoveredPath === path && (
                    <motion.div
                      layoutId="hover-pill"
                      className="absolute inset-0 bg-white/[0.05] border border-white/[0.03] rounded-md z-0"
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    />
                  )}

                  {/* Active indicator */}
                  {active && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute bottom-0 inset-x-4 h-[2px] bg-[var(--accent)] rounded-full shadow-[0_0_8px_var(--accent)]"
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
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
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent)] to-[#600000] border border-white/20 flex items-center justify-center text-white text-xs font-bold shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:border-[var(--accent)] group-hover:shadow-[0_0_12px_rgba(229,9,20,0.4)]">
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

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 top-12 w-64 bg-[#0a0a0f] border border-white/[0.08] rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-4 flex flex-col gap-3.5 z-[110]"
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
                          className="flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-semibold text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.04] transition-all duration-200"
                        >
                          <BookMarked className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                          My Watchlist
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-semibold text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.04] transition-all duration-200"
                        >
                          <Settings className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                          Settings
                        </Link>
                        <Link
                          href="/about"
                          className="flex items-center gap-3 px-2.5 py-2 rounded-md text-xs font-semibold text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.04] transition-all duration-200"
                        >
                          <Info className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                          About Netflyer
                        </Link>
                      </div>

                      <div className="h-px bg-white/[0.06]" />

                      <button
                        onClick={handleSignOut}
                        className="flex items-center justify-center gap-2 w-full py-2 bg-white/[0.03] border border-white/[0.06] hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 rounded-md text-xs font-bold text-[var(--text-primary)] transition-all duration-200 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
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
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </Link>
            )}
          </div>

        </div>
      </motion.header>

      {/* MOBILE TOP BAR */}
      <motion.div
        initial={{ y: -56 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 inset-x-0 z-[100] md:hidden h-14 flex items-center justify-between px-4 transition-all duration-300 ${
          scrolled
            ? "bg-[var(--bg-base)]/90 backdrop-blur-md border-b border-white/[0.04] shadow-md"
            : "bg-gradient-to-b from-black/80 to-transparent"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Netflyer"
            width={24}
            height={24}
            className="object-contain rounded-[4px]"
          />
          <span
            className="text-white tracking-[0.2em] font-bold"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem' }}
          >
            NETFLYER
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
              <LogIn className="w-3 h-3" />
              Sign In
            </Link>
          )}
        </div>
      </motion.div>

      {/* MOBILE BOTTOM DOCK */}
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-4 inset-x-4 z-[100] md:hidden"
      >
        <div className="glass-strong bg-black/60 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6)] rounded-2xl py-2 px-3 flex justify-between items-center max-w-md mx-auto">
          {MOBILE_NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                href={path}
                className="relative flex flex-col items-center justify-center flex-1 py-1.5 cursor-pointer"
              >
                {/* Bubble Highlight */}
                {active && (
                  <motion.div
                    layoutId="mobile-active-bubble"
                    className="absolute inset-x-1.5 inset-y-0.5 bg-[var(--accent)]/15 border border-[var(--accent)]/20 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 26 }}
                  />
                )}
                
                <motion.div
                  animate={active ? { scale: 1.05, y: -1 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className={`flex flex-col items-center gap-1 transition-colors ${
                    active ? "text-[var(--accent)]" : "text-[var(--text-secondary)] hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] font-bold tracking-wider uppercase select-none">
                    {label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* MOBILE PROFILE DRAWER */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-sm md:hidden"
              onClick={() => setDrawerOpen(false)}
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              className="fixed bottom-0 inset-x-0 z-[130] bg-[#0c0c10] border-t border-white/[0.08] rounded-t-2xl md:hidden max-h-[80vh] flex flex-col"
            >
              {/* Drag handle decoration */}
              <div className="py-3 flex justify-center cursor-pointer" onClick={() => setDrawerOpen(false)}>
                <div className="w-12 h-1 bg-white/20 rounded-full" />
              </div>

              {/* Drawer Header */}
              <div className="px-5 pb-5 flex justify-between items-center border-b border-white/[0.06]">
                <span className="text-sm font-bold tracking-wider uppercase text-[var(--text-secondary)]">
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
              <div className="p-5 flex flex-col gap-6 overflow-y-auto flex-grow pb-10">
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
                      <BookMarked className="w-4 h-4 text-[var(--accent)]" />
                      <span>My Watchlist</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/30" />
                  </Link>
                  
                  <Link
                    href="/settings"
                    className="flex items-center justify-between p-3.5 bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] rounded-xl text-sm font-bold text-white transition-all"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="w-4 h-4 text-[var(--accent)]" />
                      <span>Settings</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/30" />
                  </Link>

                  <Link
                    href="/about"
                    className="flex items-center justify-between p-3.5 bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] rounded-xl text-sm font-bold text-white transition-all"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <Info className="w-4 h-4 text-[var(--accent)]" />
                      <span>About Netflyer</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/30" />
                  </Link>
                </div>

                {/* Sign Out Button */}
                {user && (
                  <button
                    onClick={handleSignOut}
                    className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 hover:border-red-500/30 text-red-400 rounded-xl text-sm font-bold transition-all cursor-pointer mt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out of Netflyer
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
