'use client';

import { HeroUIProvider } from "@heroui/react";
import { SettingsProvider } from "../hooks/useSettings";
import { ToastProvider } from "../components/ToastProvider";
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

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
    <HeroUIProvider navigate={router.push}>
      <SettingsProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </SettingsProvider>
    </HeroUIProvider>
  );
}
