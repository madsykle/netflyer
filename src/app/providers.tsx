'use client';

import { HeroUIProvider } from "@heroui/react";
import { SettingsProvider } from "../hooks/useSettings";
import { ToastProvider } from "../components/ToastProvider";
import { useRouter } from 'next/navigation';

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

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
