'use client';

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CaretRight, Eye, EyeSlash, FilmStrip, UserPlus } from "@phosphor-icons/react";

interface AuthExperienceProps {
  mode: "login" | "signup";
  backdrop: string;
  movieTitle: string;
  username?: string;
  setUsername?: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isVisible: boolean;
  toggleVisibility: () => void;
  submitting: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onResetPassword?: () => void;
}

export default function AuthExperience({
  mode,
  backdrop,
  movieTitle,
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  isVisible,
  toggleVisibility,
  submitting,
  onSubmit,
  onResetPassword,
}: AuthExperienceProps) {
  const isSignup = mode === "signup";

  return (
    <main className="auth-experience min-h-screen bg-[#08090b] text-white">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.08fr)_minmax(440px,.92fr)]">
        <section className="relative min-h-[38svh] overflow-hidden border-b border-white/[0.08] lg:min-h-screen lg:border-b-0 lg:border-r">
          <div className="absolute inset-0 bg-[#101216]">
            {backdrop && <Image src={backdrop.replace("/original/", "/w1280/")} alt="" fill priority sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover opacity-55" quality={88} />}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,11,.35)_0%,rgba(8,9,11,.2)_35%,#08090b_100%)] lg:bg-[linear-gradient(90deg,rgba(8,9,11,.1)_0%,rgba(8,9,11,.12)_45%,#08090b_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.12),transparent_35%)]" />
          </div>

          <Link href="/" className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3.5 py-2 text-xs font-semibold text-white/80 backdrop-blur-xl transition hover:bg-white/10 hover:text-white lg:left-10 lg:top-9"><ArrowLeft className="h-3.5 w-3.5" /> Back to cinema</Link>

          <div className="absolute bottom-7 left-5 right-5 z-10 lg:bottom-12 lg:left-10 lg:right-16">
            <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45"><FilmStrip className="h-3.5 w-3.5 text-white/70" /> Tarkosi / {isSignup ? "Join" : "Welcome back"}</div>
            <h1 className="max-w-3xl text-[clamp(2.25rem,6vw,6.75rem)] font-semibold leading-[.94] tracking-[-.04em] text-white">{movieTitle || "A world of cinema"}</h1>
            <p className="mt-5 hidden max-w-md text-sm leading-relaxed text-white/55 lg:block">{isSignup ? "Build a personal cinema shelf, keep track of what you love, and pick up exactly where you left off." : "Your watchlist and your next great film are waiting."}</p>
          </div>
        </section>

        <section className="relative flex items-center px-5 py-10 sm:px-10 lg:px-16 xl:px-24">
          <div className="mx-auto w-full max-w-[440px]">
            <div className="mb-9 lg:mb-11"><div className="mb-7 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.08] shadow-[0_12px_30px_rgba(0,0,0,.25)]"><FilmStrip className="h-5 w-5 text-white" weight="fill" /></div><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{isSignup ? "Create your space" : "Your cinema, continued"}</p><h2 className="text-4xl font-semibold tracking-[-.04em] text-white sm:text-5xl">{isSignup ? "Join Tarkosi" : "Welcome back"}</h2><p className="mt-3 text-sm leading-relaxed text-white/45">{isSignup ? "A few details, then the good part begins." : "Sign in to return to your saved cinema."}</p></div>

            <form onSubmit={onSubmit} className="space-y-5">
              {isSignup && <label className="block"><span className="mb-2 block pl-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Username</span><div className="auth-field"><UserPlus className="h-4 w-4 text-white/30" /><input id="username" type="text" value={username || ""} onChange={(event) => setUsername?.(event.target.value)} placeholder="cinephile_24" autoComplete="username" required /></div></label>}
              <label className="block"><span className="mb-2 block pl-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Email address</span><div className="auth-field"><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" autoComplete="email" required /></div></label>
              <label className="block"><span className="mb-2 flex items-center justify-between pl-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45"><span>Password</span>{!isSignup && onResetPassword && <button type="button" onClick={onResetPassword} className="normal-case tracking-normal text-white/45 transition hover:text-white">Forgot password?</button>}</span><div className="auth-field"><input id="password" type={isVisible ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" autoComplete={isSignup ? "new-password" : "current-password"} minLength={isSignup ? 6 : undefined} required /><button type="button" onClick={toggleVisibility} aria-label={isVisible ? "Hide password" : "Show password"} className="text-white/35 transition hover:text-white">{isVisible ? <EyeSlash className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>{isSignup && <span className="mt-2 block pl-1 font-mono text-[10px] text-white/30">6 characters minimum</span>}</label>

              <button type="submit" disabled={submitting} className="mt-3 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:bg-white/90 active:translate-y-0 disabled:cursor-wait disabled:opacity-55">{submitting ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />{isSignup ? "Creating account" : "Signing in"}</> : <>{isSignup ? "Create account" : "Sign in"}<CaretRight className="h-4 w-4" weight="bold" /></>}</button>
            </form>

            <div className="mt-9 border-t border-white/[0.08] pt-7 text-sm text-white/45">{isSignup ? <>Already have an account? <Link href="/login" className="font-semibold text-white transition hover:text-white/70">Sign in instead</Link></> : <>New to Tarkosi? <Link href="/signup" className="font-semibold text-white transition hover:text-white/70">Create an account</Link></>}</div>
            <p className="mt-8 text-[11px] leading-relaxed text-white/25">By continuing, you agree to keep this space respectful and use it to discover great stories.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
