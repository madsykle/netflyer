'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface Settings {
  imageQuality: "low" | "medium" | "high" | "auto";
  autoplayTrailers: boolean;
  defaultVideoQuality: string;
  reduceMotion: boolean;
  compactMode: boolean;
  showScrollIndicators: boolean;
  dataSaver: boolean;
}

interface SettingsContextValue {
  settings: Settings;
  setSettings: (newSettings: Partial<Settings>) => void;
  updateSetting: (key: keyof Settings, value: boolean | string) => void;
  getImageUrl: (path: string | null | undefined, type?: "poster" | "backdrop" | "profile" | "still") => string;
  prefersReducedMotion: () => boolean;
  getAnimationProps: (props?: Record<string, unknown>) => Record<string, unknown>;
  isLoaded: boolean;
  imageSizes: typeof imageSizes;
  clearCache: () => Promise<boolean>;
  getStorageUsage: () => Promise<string>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const SETTINGS_KEY = "tarkosi_settings";

const defaultSettings: Settings = {
  imageQuality: "high",
  autoplayTrailers: false,
  defaultVideoQuality: "auto",
  reduceMotion: false,
  compactMode: false,
  showScrollIndicators: true,
  dataSaver: false,
};

// TMDB image sizes based on quality setting
const imageSizes = {
  low: {
    poster: "w185",
    backdrop: "w300",
    profile: "w185",
    still: "w185",
  },
  medium: {
    poster: "w342",
    backdrop: "w780",
    profile: "w185",
    still: "w300",
  },
  high: {
    poster: "w500",
    backdrop: "w1280",
    profile: "h632",
    still: "w500",
  },
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettingsState] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync settings helper
  const syncWithFirestore = useCallback(async (updatedSettings: Settings) => {
    try {
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userDocRef, { settings: updatedSettings }, { merge: true });
      }
    } catch (err) {
      console.error("Failed to sync settings with Firestore:", err);
    }
  }, []);

  // Load settings from localStorage and Firestore on mount / auth change
  useEffect(() => {
    let unsubscribeAuth: () => void;

    const loadSettings = () => {
      // 1. First load from localStorage to get initial UI state fast
      try {
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettingsState((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error("Failed to parse local settings:", e);
      }
      setIsLoaded(true);

      // 2. Set up Firebase Auth listener to sync settings with DB
      try {
        unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
          if (user) {
            try {
              const userDocRef = doc(db, "users", user.uid);
              const userDocSnap = await getDoc(userDocRef);
              if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                if (userData.settings) {
                  // Merge DB settings into state and save to local storage
                  setSettingsState((prev) => {
                    const merged = { ...prev, ...userData.settings };
                    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
                    return merged;
                  });
                } else {
                  // DB is empty, push current settings to DB
                  setSettingsState((current) => {
                    setDoc(userDocRef, { settings: current }, { merge: true });
                    return current;
                  });
                }
              }
            } catch (err) {
              console.error("Error fetching user settings from Firestore:", err);
            }
          } else {
            // When logged out, reset to local storage values
            try {
              const saved = localStorage.getItem(SETTINGS_KEY);
              if (saved) {
                setSettingsState({ ...defaultSettings, ...JSON.parse(saved) });
              } else {
                setSettingsState(defaultSettings);
              }
            } catch (e) {
              setSettingsState(defaultSettings);
            }
          }
        });
      } catch (err) {
        console.error("Firebase auth/firestore not available in SettingsProvider:", err);
      }
    };

    loadSettings();

    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SETTINGS_KEY) {
        try {
          const parsed = JSON.parse(e.newValue || "{}");
          setSettingsState((prev) => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error("Failed to parse storage settings event:", e);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, []);

  // HTML tag side-effect for Compact Mode
  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (settings.compactMode) {
        root.classList.add("compact-mode");
      } else {
        root.classList.remove("compact-mode");
      }
    }
  }, [settings.compactMode]);

  // Save settings to localStorage and Firestore
  const setSettings = useCallback(
    (newSettings: Partial<Settings>) => {
      setSettingsState((prev) => {
        const updatedSettings = { ...prev, ...newSettings };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
        syncWithFirestore(updatedSettings);
        return updatedSettings;
      });
    },
    [syncWithFirestore]
  );

  // Update a single setting
  const updateSetting = useCallback(
    (key: keyof Settings, value: boolean | string) => {
      setSettingsState((prev) => {
        const updatedSettings = { ...prev, [key]: value };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
        syncWithFirestore(updatedSettings);
        return updatedSettings;
      });
    },
    [syncWithFirestore]
  );

  // Get image URL with appropriate quality
  const getImageUrl = useCallback(
    (path: string | null | undefined, type: "poster" | "backdrop" | "profile" | "still" = "poster") => {
      if (!path) return "/not-found.png";

      let quality = settings.imageQuality;

      // Auto mode: detect connection speed
      if (quality === "auto") {
        if (typeof navigator !== 'undefined') {
          const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
          if (connection) {
            if (
              connection.saveData ||
              connection.effectiveType === "2g" ||
              connection.effectiveType === "slow-2g"
            ) {
              quality = "low";
            } else if (connection.effectiveType === "3g") {
              quality = "medium";
            } else {
              quality = "high";
            }
          } else {
            quality = "medium";
          }
        } else {
          quality = "medium";
        }
      }

      // Data saver overrides quality
      if (settings.dataSaver) {
        quality = "low";
      }

      const size = imageSizes[quality as keyof typeof imageSizes]?.[type] || imageSizes.medium[type];
      return `https://image.tmdb.org/t/p/${size}${path}`;
    },
    [settings.imageQuality, settings.dataSaver]
  );

  // Check if reduced motion is preferred
  const prefersReducedMotion = useCallback(() => {
    return (
      settings.reduceMotion ||
      settings.dataSaver || // Data saver automatically reduces animations
      (typeof window !== 'undefined' && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    );
  }, [settings.reduceMotion, settings.dataSaver]);

  // Get animation props based on reduced motion preference
  const getAnimationProps = useCallback(
    (props: Record<string, unknown> = {}) => {
      if (prefersReducedMotion()) {
        return {
          initial: false,
          animate: false,
          transition: { duration: 0 },
          ...props,
        };
      }
      return props;
    },
    [prefersReducedMotion]
  );

  // Clear all cached data (LocalStorage + Service Worker Cache)
  // Returns a promise that resolves once caches are actually deleted,
  // so callers can re-measure storage usage accurately afterwards.
  const clearCache = useCallback(async () => {
    const currentSettings = localStorage.getItem(SETTINGS_KEY);
    localStorage.clear();
    if (currentSettings) {
      localStorage.setItem(SETTINGS_KEY, currentSettings);
    }

    // Delete Service Worker Caches and wait for the deletions to finish
    if (typeof window !== "undefined" && "caches" in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      } catch (e) {
        console.error("Failed to clear service worker caches:", e);
      }
    }
    return true;
  }, []);

  // Calculate real storage usage: localStorage + Cache Storage + IndexedDB
  const getStorageUsage = useCallback(async () => {
    let total = 0;

    // 1. localStorage (UTF-16: 2 bytes per char)
    if (typeof localStorage !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          total += (localStorage.getItem(key)?.length || 0) * 2;
        }
      }
    }

    // 2. Browser storage estimate — includes Cache Storage (service worker),
    //    IndexedDB and other origins storage. This is the number users actually care about.
    if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        if (estimate.usage) {
          total = Math.max(total, estimate.usage);
        }
      } catch (e) {
        console.error('Failed to estimate storage usage:', e);
      }
    }

    return (total / 1024 / 1024).toFixed(2);
  }, []);

  const value = {
    settings,
    setSettings,
    updateSetting,
    getImageUrl,
    prefersReducedMotion,
    getAnimationProps,
    isLoaded,
    imageSizes,
    clearCache,
    getStorageUsage,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
