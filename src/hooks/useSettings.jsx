import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";

const SettingsContext = createContext(null);

const SETTINGS_KEY = "netflyer_settings";

const defaultSettings = {
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

export const SettingsProvider = ({ children }) => {
  const [settings, setSettingsState] = useState(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettingsState({ ...defaultSettings, ...parsed });
        }
      } catch (e) {
        console.error("Failed to parse settings:", e);
      }
      setIsLoaded(true);
    };

    loadSettings();

    // Listen for storage changes from other tabs
    const handleStorageChange = (e) => {
      if (e.key === SETTINGS_KEY) {
        loadSettings();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Save settings to localStorage
  const setSettings = useCallback(
    (newSettings) => {
      const updatedSettings = { ...settings, ...newSettings };
      setSettingsState(updatedSettings);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
    },
    [settings]
  );

  // Update a single setting
  const updateSetting = useCallback(
    (key, value) => {
      const updatedSettings = { ...settings, [key]: value };
      setSettingsState(updatedSettings);
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
    },
    [settings]
  );

  // Get image URL with appropriate quality
  const getImageUrl = useCallback(
    (path, type = "poster") => {
      if (!path) return "/not-found.png";

      let quality = settings.imageQuality;

      // Auto mode: detect connection speed
      if (quality === "auto") {
        const connection =
          navigator.connection ||
          navigator.mozConnection ||
          navigator.webkitConnection;
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
      }

      // Data saver overrides quality
      if (settings.dataSaver) {
        quality = "low";
      }

      const size = imageSizes[quality]?.[type] || imageSizes.medium[type];
      return `https://image.tmdb.org/t/p/${size}${path}`;
    },
    [settings.imageQuality, settings.dataSaver]
  );

  // Check if reduced motion is preferred
  const prefersReducedMotion = useCallback(() => {
    return (
      settings.reduceMotion ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, [settings.reduceMotion]);

  // Get animation props based on reduced motion preference
  const getAnimationProps = useCallback(
    (props = {}) => {
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

  // Clear all cached data
  const clearCache = useCallback(() => {
    const currentSettings = localStorage.getItem(SETTINGS_KEY);
    localStorage.clear();
    if (currentSettings) {
      localStorage.setItem(SETTINGS_KEY, currentSettings);
    }
    return true;
  }, []);

  // Calculate storage usage
  const getStorageUsage = useCallback(() => {
    let total = 0;
    for (let key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        total += localStorage[key].length * 2; // UTF-16 encoding
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
