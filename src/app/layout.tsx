import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import NavbarWrapper from "../components/NavbarWrapper";
import FooterWrapper from "../components/FooterWrapper";
import { ErrorBoundary } from "../components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Tarkosi | Cinematic Streaming",
  description: "Tarkosi is a free cinematic streaming platform for movies, anime, and TV shows.",
  applicationName: "Tarkosi",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tarkosi",
  },
  openGraph: {
    title: "Tarkosi | Cinematic Streaming",
    description: "A calm, cinematic home for the films and series you want to watch.",
    siteName: "Tarkosi",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tarkosi | Cinematic Streaming",
    description: "A calm, cinematic home for the films and series you want to watch.",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.fontshare.com" />
      </head>
      <body className="bg-[var(--bg-base)] text-[var(--text-primary)] min-h-screen flex flex-col antialiased pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
        <Providers>
          <NavbarWrapper />
          <ErrorBoundary>
            <main className="flex-grow">{children}</main>
          </ErrorBoundary>
          <FooterWrapper />
        </Providers>
      </body>
    </html>
  );
}
