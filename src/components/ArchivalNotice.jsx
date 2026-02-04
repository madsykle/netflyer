import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Github, ExternalLink, X } from "lucide-react";
import { Button } from "@heroui/react";

const ArchivalNotice = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenNotice = localStorage.getItem("netflyer_archival_notice_seen");
    if (!hasSeenNotice) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("netflyer_archival_notice_seen", "true");
  };

  const handleNewProject = () => {
    window.open("https://github.com/madsykle", "_blank");
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 pb-0 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-500/10 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                    Project Archived
                  </h2>
                  <p className="text-sm text-[var(--color-text-tertiary)]">
                    Important Notice
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[var(--color-text-tertiary)]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-[var(--color-text-secondary)] leading-relaxed mb-6">
                <strong>Netflyer is no longer actively maintained.</strong>
                <br />
                <br />
                Streaming sources may stop working over time, and the application
                will not receive further updates or bug fixes.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="flex-1 font-semibold"
                  color="primary"
                  onPress={handleNewProject}
                  startContent={<ExternalLink className="w-4 h-4" />}
                >
                  View My New Work
                </Button>
                <Button
                  className="flex-1 font-semibold"
                  variant="bordered"
                  onPress={() => window.open("https://github.com/madsykle", "_blank")}
                  startContent={<Github className="w-4 h-4" />}
                >
                  GitHub Profile
                </Button>
              </div>
              
              <div className="mt-3">
                <Button
                  className="w-full text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
                  variant="light"
                  onPress={handleClose}
                >
                  Continue Anyway
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ArchivalNotice;
