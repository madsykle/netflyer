'use client';

import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { FiEye, FiList, FiSearch, FiSettings } from "react-icons/fi";
import { MdQuestionMark } from "react-icons/md";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "./ToastProvider";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { createToast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(!!user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        createToast("Signed out successfully", {
          type: "success",
          timeout: 2000,
        });
        router.push("/");
      })
      .catch((error: any) => {
        createToast(error.message, { type: "error", timeout: 3000 });
      });
  };

  const handleWatchlist = () => {
    if (user) {
      router.push("/watchlist");
    } else {
      createToast("Sign in to access your watchlist", {
        action: {
          text: "Login",
          callback(toast) {
            router.push("/login");
            toast.destroy();
          },
        },
        timeout: 3000,
        cancel: "Cancel",
        type: "dark",
      });
    }
  };

  const navItems = [
    { path: "/search", label: "Search", icon: FiSearch },
    { path: "/discover", label: "Discover", icon: FiEye },
    {
      path: "/watchlist",
      label: "Watchlist",
      icon: FiList,
      action: handleWatchlist,
    },
    { path: "/about", label: "About", icon: MdQuestionMark },
  ];

  const isActive = (path: string) => {
    if (!pathname) return false;
    if (path === "/watchlist") return pathname === "/watchlist";
    return pathname.startsWith(path);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
        scrolled
          ? "bg-[rgba(10,10,11,0.85)] backdrop-blur-xl border-b border-white/5 shadow-2xl py-3"
          : "bg-gradient-to-b from-[var(--color-bg-primary)]/80 to-transparent py-5"
      }`}
    >
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center">
        {/* Mobile Menu Toggle */}
        <div className="flex-1 flex justify-start sm:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white relative z-50 w-8 h-8 flex flex-col items-center justify-center gap-1.5 focus:outline-none"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <motion.span
              animate={isMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              className="w-6 h-[1px] bg-white block transition-transform"
            ></motion.span>
            <motion.span
              animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="w-6 h-[1px] bg-white block transition-opacity"
            ></motion.span>
            <motion.span
              animate={isMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              className="w-6 h-[1px] bg-white block transition-transform"
            ></motion.span>
          </button>
        </div>

        {/* Logo */}
        <div className="flex-1 sm:flex-none flex justify-center sm:justify-start">
          <Link href="/" className="relative z-40 flex items-center group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative h-10 w-10 md:h-12 md:w-12 rounded-lg drop-shadow-[0_0_10px_rgba(229,9,20,0.5)] transition-all duration-300 group-hover:drop-shadow-[0_0_20px_rgba(229,9,20,0.8)]"
            >
              <Image
                src="/logo.png"
                alt="Netflyer"
                fill
                className="object-contain"
                priority
              />
            </motion.div>
            <span className="ml-3 text-2xl font-bold font-display uppercase tracking-widest hidden md:block text-white">
              Netflyer
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden sm:flex flex-1 items-center justify-center gap-8">
          {navItems.map((item) => {
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => (item.action ? item.action() : router.push(item.path))}
                className={`relative py-2 text-sm font-medium transition-colors duration-200 ${
                  active ? "text-white" : "text-[var(--color-text-secondary)] hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <item.icon className={`text-lg ${active ? "text-[var(--color-accent-primary)]" : ""}`} />
                  {item.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-accent-primary)]"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section */}
        <div className="flex-1 flex justify-end items-center gap-2 sm:gap-4">
          <button
            onClick={() => router.push("/settings")}
            className={`hidden sm:flex p-2.5 rounded-full transition-colors duration-200 border border-transparent flex-shrink-0 ${
              pathname === "/settings"
                ? "bg-white/10 text-white border-white/20"
                : "text-[var(--color-text-secondary)] hover:text-white hover:bg-white/5"
            }`}
            aria-label="Settings"
          >
            <FiSettings className="w-5 h-5" />
          </button>

          {loading ? (
            <div className="w-16 sm:w-20 h-9 bg-white/5 animate-pulse rounded-md flex-shrink-0" />
          ) : user ? (
            <button onClick={handleSignOut} className="btn btn-secondary px-3 sm:px-4 py-2 text-xs flex-shrink-0">
              Sign Out
            </button>
          ) : (
            <button onClick={() => router.push("/login")} className="btn btn-primary px-3 sm:px-5 py-2 text-xs flex-shrink-0">
              Login
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute top-full left-0 w-full glass-panel border-t border-white/10 overflow-hidden sm:hidden"
          >
            <div className="flex flex-col py-4 px-6 gap-2">
              {navItems.map((item, index) => {
                const active = isActive(item.path);

                return (
                  <motion.button
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => {
                      setIsMenuOpen(false);
                      item.action ? item.action() : router.push(item.path);
                    }}
                    className={`flex items-center gap-3 py-4 text-left text-base font-medium border-b border-white/5 ${
                      active ? "text-white" : "text-[var(--color-text-secondary)]"
                    }`}
                  >
                    <item.icon className={`text-xl ${active ? "text-[var(--color-accent-primary)]" : ""}`} />
                    {item.label}
                  </motion.button>
                );
              })}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: navItems.length * 0.05 }}
                onClick={() => {
                  setIsMenuOpen(false);
                  router.push("/settings");
                }}
                className={`flex items-center gap-3 py-4 text-left text-base font-medium ${
                  pathname === "/settings" ? "text-white" : "text-[var(--color-text-secondary)]"
                }`}
              >
                <FiSettings className="text-xl" />
                Settings
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;