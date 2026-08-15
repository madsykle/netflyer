'use client';

import { SettingsProvider } from "../hooks/useSettings";
import { ToastProvider } from "../components/ToastProvider";
import { MotionConfig } from "framer-motion";
import React, { useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          },
          (err) => {
            console.error('ServiceWorker registration failed: ', err);
          }
        );
      });
    }
  }, []);

  return (
    // reducedMotion="user" makes every framer-motion animation across the app
    // respect prefers-reduced-motion (Apple: gentler, non-vestibular motion)
    <MotionConfig reducedMotion="user">
      <SettingsProvider>
        <ToastProvider>{children}</ToastProvider>
      </SettingsProvider>
    </MotionConfig>
  );
}
