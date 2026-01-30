import { auth } from "../services/Firebase";
import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@heroui/react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { FiEye, FiList, FiSearch, FiSettings } from "react-icons/fi";
import { MdQuestionMark } from "react-icons/md";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createToast } from "vercel-toast";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(!!user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Track scroll for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
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
        navigate("/");
      })
      .catch((error) => {
        createToast(error.message, { type: "error", timeout: 3000 });
      });
  };

  const handleWatchlist = () => {
    if (user) {
      navigate("/watchlist");
    } else {
      createToast("Sign in to access your watchlist", {
        action: {
          text: "Login",
          callback(toast) {
            navigate("/login");
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

  const isActive = (path) => {
    if (path === "/watchlist") return location.pathname === "/watchlist";
    return location.pathname.startsWith(path);
  };

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <Navbar
        className={`transition-all duration-300 ${
          scrolled
            ? "bg-[var(--color-bg-primary)]/95 backdrop-blur-xl shadow-lg"
            : "bg-transparent"
        }`}
        isBlurred={false}
        isBordered={false}
        onMenuOpenChange={setIsMenuOpen}
        maxWidth="2xl"
      >
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden text-white"
          />
          <NavbarBrand>
            <Link to="/" className="flex items-center">
              <motion.img
                src="/logo.png"
                alt="Netflyer"
                className="h-10 w-10 md:h-12 md:w-12 object-contain rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
              <span className="ml-2 text-xl font-bold hidden md:block text-white">
                Netflyer
              </span>
            </Link>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden sm:flex gap-1" justify="center">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <NavbarItem key={item.path}>
                <motion.button
                  onClick={() =>
                    item.action ? item.action() : navigate(item.path)
                  }
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                    active
                      ? "text-white"
                      : "text-[var(--color-text-secondary)] hover:text-white"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {active && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-[var(--color-bg-tertiary)] rounded-full"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="text-lg" />
                    {item.label}
                  </span>
                </motion.button>
              </NavbarItem>
            );
          })}
        </NavbarContent>

        <NavbarContent justify="end" className="gap-2">
          {/* Settings button */}
          <NavbarItem className="hidden sm:flex">
            <motion.button
              onClick={() => navigate("/settings")}
              className={`p-2 rounded-full transition-colors duration-200 ${
                location.pathname === "/settings"
                  ? "bg-[var(--color-bg-tertiary)] text-white"
                  : "text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-bg-tertiary)]"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Settings"
            >
              <FiSettings className="w-5 h-5" />
            </motion.button>
          </NavbarItem>

          {loading ? (
            <NavbarItem>
              <div className="w-20 h-9 bg-[var(--color-bg-tertiary)] rounded-full skeleton" />
            </NavbarItem>
          ) : user ? (
            <NavbarItem>
              <motion.button
                onClick={handleSignOut}
                className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] rounded-full hover:opacity-90 transition-opacity"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Sign Out
              </motion.button>
            </NavbarItem>
          ) : (
            <NavbarItem>
              <motion.button
                onClick={() => navigate("/login")}
                className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] rounded-full hover:opacity-90 transition-opacity"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Login
              </motion.button>
            </NavbarItem>
          )}
        </NavbarContent>

        {/* Mobile Menu with Animation */}
        <NavbarMenu className="bg-[var(--color-bg-primary)]/98 backdrop-blur-xl pt-4">
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <NavbarMenuItem key={item.path}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Button
                          onClick={() => {
                            setIsMenuOpen(false);
                            item.action ? item.action() : navigate(item.path);
                          }}
                          variant="flat"
                          className={`w-full justify-start text-base font-medium py-3 mb-1 ${
                            active
                              ? "bg-[var(--color-bg-tertiary)] text-white"
                              : "text-[var(--color-text-secondary)] hover:text-white"
                          }`}
                          startContent={<Icon className="mr-2 text-lg" />}
                        >
                          {item.label}
                        </Button>
                      </motion.div>
                    </NavbarMenuItem>
                  );
                })}

                {/* Settings in mobile menu */}
                <NavbarMenuItem>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{
                      duration: 0.3,
                      delay: navItems.length * 0.05,
                    }}
                  >
                    <Button
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/settings");
                      }}
                      variant="flat"
                      className={`w-full justify-start text-base font-medium py-3 mb-1 ${
                        location.pathname === "/settings"
                          ? "bg-[var(--color-bg-tertiary)] text-white"
                          : "text-[var(--color-text-secondary)] hover:text-white"
                      }`}
                      startContent={<FiSettings className="mr-2 text-lg" />}
                    >
                      Settings
                    </Button>
                  </motion.div>
                </NavbarMenuItem>

                <NavbarMenuItem className="mt-4 pt-4 border-t border-[var(--color-border)]">
                  {loading ? (
                    <div className="w-full h-12 bg-[var(--color-bg-tertiary)] rounded-lg skeleton" />
                  ) : user ? (
                    <Button
                      color="primary"
                      variant="flat"
                      className="w-full py-3 text-base font-medium"
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleSignOut();
                      }}
                    >
                      Sign Out
                    </Button>
                  ) : (
                    <Button
                      color="primary"
                      variant="flat"
                      className="w-full py-3 text-base font-medium"
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate("/login");
                      }}
                    >
                      Login
                    </Button>
                  )}
                </NavbarMenuItem>
              </motion.div>
            )}
          </AnimatePresence>
        </NavbarMenu>
      </Navbar>
    </motion.div>
  );
};

export default Header;
