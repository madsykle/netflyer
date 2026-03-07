import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ErrorBoundary } from "../components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Netflyer | Cinematic Streaming",
  description: "Netflyer is a free movie streaming platform. Watch your favorite movies, anime and TV shows online for free.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[var(--bg-base)] text-[var(--text-primary)] min-h-screen flex flex-col antialiased">
        <Providers>
          <Navbar />
          <ErrorBoundary>
            <main className="flex-grow">
              {children}
            </main>
          </ErrorBoundary>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}