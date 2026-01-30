import Navbar from "../components/Navbar";
import { useSettings } from "../hooks/useSettings";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Wifi,
  Monitor,
  ChevronRight,
  Check,
  Trash2,
  Download,
  ArrowLeft,
  LayoutGrid,
  Film,
  Zap,
  Settings2,
  Database,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createToast } from "vercel-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { settings, updateSetting, getStorageUsage, clearCache } =
    useSettings();

  const [activeSection, setActiveSection] = useState("general");
  const [storageUsed, setStorageUsed] = useState("0.00");
  const [expandedQuality, setExpandedQuality] = useState(false);

  useEffect(() => {
    setStorageUsed(getStorageUsage());
  }, [getStorageUsage]);

  const handleClearCache = () => {
    if (confirm("Are you sure you want to clear all cached data?")) {
      clearCache();
      setStorageUsed(getStorageUsage());
      createToast("Cache cleared successfully", {
        type: "success",
        timeout: 3000,
      });
    }
  };

  const handleToggle = (key) => {
    const newValue = !settings[key];
    updateSetting(key, newValue);

    const label = key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());

    createToast(`${label} ${newValue ? "enabled" : "disabled"}`, {
      type: "success",
      timeout: 2000,
    });
  };

  const handleQualityChange = (value) => {
    updateSetting("imageQuality", value);
    setExpandedQuality(false);

    const option = imageQualityOptions.find((opt) => opt.value === value);
    createToast(`Image quality set to ${option.label}`, {
      type: "success",
      timeout: 2000,
    });
  };

  const imageQualityOptions = [
    { value: "low", label: "Data Saver", description: "Saves ~70% data" },
    { value: "medium", label: "Balanced", description: "Good quality balance" },
    { value: "high", label: "High Quality", description: "Best visuals" },
    { value: "auto", label: "Auto", description: "Adapts to connection" },
  ];

  const sections = [
    { id: "general", label: "General", icon: Settings2 },
    { id: "playback", label: "Playback", icon: Film },
    { id: "storage", label: "Storage", icon: Database },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors mb-6 md:mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 md:mb-10"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-text-primary)] mb-2">
            Settings
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Customize your Netflyer experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? "bg-[var(--color-accent-primary)] text-[var(--color-text-primary)]"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]"
                    }`}
                    whileHover={{ x: isActive ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeSection"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-bone)] hidden lg:block"
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>
          </motion.div>

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <AnimatePresence mode="wait">
              {/* General Settings */}
              {activeSection === "general" && (
                <motion.div
                  key="general"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 md:space-y-6"
                >
                  {/* Image Quality - Dropdown */}
                  <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-5 md:p-6 border border-[var(--color-border)]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-primary)]/20 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-[var(--color-bone)]" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                          Image Quality
                        </h2>
                        <p className="text-sm text-[var(--color-text-tertiary)]">
                          Choose your preferred image loading quality
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setExpandedQuality(!expandedQuality)}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-border-hover)] bg-[var(--color-bg-tertiary)] transition-all"
                      >
                        <div className="flex items-center gap-3">
                          {settings.imageQuality === "low" && (
                            <Download className="w-5 h-5 text-[var(--color-text-secondary)]" />
                          )}
                          {settings.imageQuality === "medium" && (
                            <Wifi className="w-5 h-5 text-[var(--color-text-secondary)]" />
                          )}
                          {settings.imageQuality === "high" && (
                            <ImageIcon className="w-5 h-5 text-[var(--color-text-secondary)]" />
                          )}
                          {settings.imageQuality === "auto" && (
                            <Monitor className="w-5 h-5 text-[var(--color-text-secondary)]" />
                          )}
                          <div className="text-left">
                            <span className="font-medium text-[var(--color-text-primary)] block">
                              {
                                imageQualityOptions.find(
                                  (opt) => opt.value === settings.imageQuality
                                )?.label
                              }
                            </span>
                            <span className="text-sm text-[var(--color-text-tertiary)]">
                              {
                                imageQualityOptions.find(
                                  (opt) => opt.value === settings.imageQuality
                                )?.description
                              }
                            </span>
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-[var(--color-text-tertiary)] transition-transform ${
                            expandedQuality ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {expandedQuality && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 space-y-1 overflow-hidden"
                          >
                            {imageQualityOptions.map((option) => {
                              const isSelected =
                                settings.imageQuality === option.value;
                              return (
                                <motion.button
                                  key={option.value}
                                  onClick={() =>
                                    handleQualityChange(option.value)
                                  }
                                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                                    isSelected
                                      ? "bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]"
                                      : "bg-[var(--color-bg-tertiary)] border border-transparent hover:bg-[var(--color-bg-elevated)]"
                                  }`}
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.99 }}
                                >
                                  <div className="text-left">
                                    <span
                                      className={`font-medium block ${
                                        isSelected
                                          ? "text-[var(--color-text-primary)]"
                                          : "text-[var(--color-text-secondary)]"
                                      }`}
                                    >
                                      {option.label}
                                    </span>
                                    <span className="text-sm text-[var(--color-text-tertiary)]">
                                      {option.description}
                                    </span>
                                  </div>
                                  {isSelected && (
                                    <Check className="w-4 h-4 text-[var(--color-bone)]" />
                                  )}
                                </motion.button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Compact Mode */}
                  <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-5 md:p-6 border border-[var(--color-border)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-primary)]/20 flex items-center justify-center">
                          <LayoutGrid className="w-5 h-5 text-[var(--color-bone)]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[var(--color-text-primary)]">
                            Compact Mode
                          </h3>
                          <p className="text-sm text-[var(--color-text-tertiary)]">
                            Show more content with less spacing
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggle("compactMode")}
                        className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                          settings.compactMode
                            ? "bg-[var(--color-accent-primary)]"
                            : "bg-[var(--color-bg-tertiary)]"
                        }`}
                      >
                        <motion.div
                          className="absolute top-1 left-1 w-5 h-5 bg-[var(--color-text-primary)] rounded-full shadow-md"
                          animate={{ x: settings.compactMode ? 28 : 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Scroll Indicators */}
                  <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-5 md:p-6 border border-[var(--color-border)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-primary)]/20 flex items-center justify-center">
                          <ChevronRight className="w-5 h-5 text-[var(--color-bone)]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[var(--color-text-primary)]">
                            Scroll Indicators
                          </h3>
                          <p className="text-sm text-[var(--color-text-tertiary)]">
                            Show arrows on scrollable content
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggle("showScrollIndicators")}
                        className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                          settings.showScrollIndicators
                            ? "bg-[var(--color-accent-primary)]"
                            : "bg-[var(--color-bg-tertiary)]"
                        }`}
                      >
                        <motion.div
                          className="absolute top-1 left-1 w-5 h-5 bg-[var(--color-text-primary)] rounded-full shadow-md"
                          animate={{
                            x: settings.showScrollIndicators ? 28 : 0,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Data Saver Mode */}
                  <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-5 md:p-6 border border-[var(--color-border)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-primary)]/20 flex items-center justify-center">
                          <Download className="w-5 h-5 text-[var(--color-bone)]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[var(--color-text-primary)]">
                            Data Saver Mode
                          </h3>
                          <p className="text-sm text-[var(--color-text-tertiary)]">
                            Reduce data usage across the app
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggle("dataSaver")}
                        className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                          settings.dataSaver
                            ? "bg-[var(--color-accent-primary)]"
                            : "bg-[var(--color-bg-tertiary)]"
                        }`}
                      >
                        <motion.div
                          className="absolute top-1 left-1 w-5 h-5 bg-[var(--color-text-primary)] rounded-full shadow-md"
                          animate={{ x: settings.dataSaver ? 28 : 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Playback Settings */}
              {activeSection === "playback" && (
                <motion.div
                  key="playback"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 md:space-y-6"
                >
                  {/* Reduce Motion */}
                  <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-5 md:p-6 border border-[var(--color-border)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-primary)]/20 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-[var(--color-bone)]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[var(--color-text-primary)]">
                            Reduce Motion
                          </h3>
                          <p className="text-sm text-[var(--color-text-tertiary)]">
                            Minimize animations for accessibility
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggle("reduceMotion")}
                        className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                          settings.reduceMotion
                            ? "bg-[var(--color-accent-primary)]"
                            : "bg-[var(--color-bg-tertiary)]"
                        }`}
                      >
                        <motion.div
                          className="absolute top-1 left-1 w-5 h-5 bg-[var(--color-text-primary)] rounded-full shadow-md"
                          animate={{ x: settings.reduceMotion ? 28 : 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Storage Settings */}
              {activeSection === "storage" && (
                <motion.div
                  key="storage"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 md:space-y-6"
                >
                  <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-5 md:p-6 border border-[var(--color-border)]">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-primary)]/20 flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-[var(--color-bone)]" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                          Storage
                        </h2>
                        <p className="text-sm text-[var(--color-text-tertiary)]">
                          Manage cached data and storage
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-[var(--color-border)]">
                        <span className="text-[var(--color-text-secondary)]">
                          Local Storage Used
                        </span>
                        <span className="text-[var(--color-text-primary)] font-medium">
                          {storageUsed} MB
                        </span>
                      </div>

                      <motion.button
                        onClick={handleClearCache}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[var(--color-accent-primary)]/10 text-[var(--color-bone)] rounded-xl border border-[var(--color-accent-primary)]/20 hover:bg-[var(--color-accent-primary)]/20 transition-colors"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear Cache
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
