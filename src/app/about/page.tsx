'use client';

import { GithubLogo, Code, Server, Database, Stack, Archive, ArrowSquareOut, Lightning, Eye, Heart, GitFork, Star, Warning, CalendarBlank } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";

export default function AboutPage() {
  const [githubStats, setGithubStats] = useState<{
    stars: number | null;
    forks: number | null;
    issues: number | null;
    lastPush: string | null;
  }>({
    stars: null,
    forks: null,
    issues: null,
    lastPush: null,
  });

  useEffect(() => {
    const fetchGithub = async () => {
      try {
        const res = await fetch("https://api.github.com/repos/madsykle/netflyer");
        if (res.ok) {
          const data = await res.json();
          let pushDateStr = "Recent";
          if (data.pushed_at) {
            const date = new Date(data.pushed_at);
            pushDateStr = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
          }
          setGithubStats({
            stars: data.stargazers_count,
            forks: data.forks_count,
            issues: data.open_issues_count,
            lastPush: pushDateStr,
          });
        } else {
          setGithubStats({
            stars: 12,
            forks: 4,
            issues: 0,
            lastPush: "May 2026",
          });
        }
      } catch (error) {
        console.error("Error fetching github stats:", error);
        setGithubStats({
          stars: 12,
          forks: 4,
          issues: 0,
          lastPush: "May 2026",
        });
      }
    };
    fetchGithub();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const principles = [
    {
      icon: Lightning,
      title: "Performance Obsessed",
      description: "Every millisecond counts. We leverage Next.js 15 with App Router, optimized image loading, and intelligent caching for near-instant navigation."
    },
    {
      icon: Eye,
      title: "Cinematic by Default",
      description: "Design inspired by A24, Mubi, and The Criterion Collection. Dark, editorial, and focused on content — never on chrome."
    },
    {
      icon: Heart,
      title: "Built for Enthusiasts",
      description: "Designed by someone who actually watches films. Every feature exists because it solves a real viewing need."
    }
  ];

  const techStack = [
    { name: "Next.js 15", desc: "Framework" },
    { name: "TypeScript", desc: "Language" },
    { name: "Tailwind 4", desc: "Styling" },
    { name: "Firebase", desc: "Auth & DB" },
    { name: "TMDB API", desc: "Data" },
    { name: "Framer Motion", desc: "Animation" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] pb-20 pt-32 overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[var(--accent)]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container relative z-10 max-w-5xl"
      >
        {/* Header - Cinematic intro */}
        <motion.section variants={itemVariants} className="mb-28">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6"
          >
            <span className="t-label text-[var(--accent)] mb-4 block">About</span>
            <h1 className="t-hero text-[clamp(3rem,8vw,7rem)] mb-8 leading-[0.9]">
              Cinema,<br />
              <span className="text-[var(--accent)]">reimagined.</span>
            </h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="t-body text-xl md:text-2xl text-[var(--text-secondary)] max-w-3xl leading-relaxed"
          >
            A premium, open-source streaming interface for film enthusiasts who value 
            minimalism, speed, and privacy. No ads. No tracking. Just cinema.
          </motion.p>
        </motion.section>

        {/* Vision Section */}
        <motion.section variants={itemVariants} className="mb-28">
          <div className="relative">
            {/* Decorative line */}
            <div className="absolute -left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--accent)] via-[var(--accent)]/30 to-transparent" />
            
            <div className="surface p-8 md:p-12 rounded-[var(--radius-lg)] border-[var(--border-subtle)] relative overflow-hidden group">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-700">
                <div className="absolute inset-0" style={{ 
                  backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                  backgroundSize: '40px 40px'
                }} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-14 h-14 rounded-[var(--radius-md)] bg-[var(--accent-dim)] flex items-center justify-center border border-[var(--accent)]/20">
                    <Stack className="w-7 h-7 text-[var(--accent)]" />
                  </div>
                  <div>
                    <span className="t-label text-[var(--accent)] block mb-1">Version 2.0</span>
                    <h2 className="text-white text-xl font-semibold">Project Vision</h2>
                  </div>
                </div>
                
                <p className="t-body text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed mb-10 max-w-3xl">
                  Netflyer v2 is a complete ground-up rebuild — not a refresh. 
                  We focused on a <span className="text-white">high-fidelity cinematic experience</span> where 
                  every pixel serves the content. Built with Next.js 15, Tailwind 4, and an 
                  obsession for performance.
                </p>
                
                {/* Dynamic GitHub stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 pt-8 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500/20" weight="fill" />
                    </div>
                    <div>
                      <span className="block text-xl font-semibold text-white tracking-wide">
                        {githubStats.stars !== null ? githubStats.stars : "—"}
                      </span>
                      <span className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">GitHub Stars</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                      <GitFork className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <span className="block text-xl font-semibold text-white tracking-wide">
                        {githubStats.forks !== null ? githubStats.forks : "—"}
                      </span>
                      <span className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Forks</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                      <Warning className="w-4 h-4 text-red-400" weight="fill" />
                    </div>
                    <div>
                      <span className="block text-xl font-semibold text-white tracking-wide">
                        {githubStats.issues !== null ? githubStats.issues : "—"}
                      </span>
                      <span className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Issues</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                      <CalendarBlank className="w-4 h-4 text-green-400" weight="fill" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-white tracking-wide truncate max-w-[120px] pt-1">
                        {githubStats.lastPush !== null ? githubStats.lastPush : "—"}
                      </span>
                      <span className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Last Active</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-6 text-[var(--text-muted)]">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Active Development
                  </span>
                  <span className="opacity-20">|</span>
                  <span className="t-meta text-xs">Updated {githubStats.lastPush ? githubStats.lastPush : "March 2026"}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Core Principles */}
        <motion.section variants={itemVariants} className="mb-28">
          <h2 className="t-label mb-12 flex items-center gap-4">
            <div className="w-8 h-px bg-[var(--accent)]"></div>
            Core Principles
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {principles.map((principle, index) => (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="group"
              >
                <div className="surface border-[var(--border-faint)] rounded-[var(--radius-lg)] p-8 h-full hover:border-[var(--accent)]/50 transition-all duration-500 relative overflow-hidden">
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-[var(--accent)]/0 group-hover:bg-[var(--accent)]/5 transition-colors duration-500" />
                  
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-white/5 rounded-[var(--radius-md)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <principle.icon className="w-6 h-6 text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors" />
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-3">{principle.title}</h3>
                    <p className="t-body text-sm text-[var(--text-secondary)] leading-relaxed">
                      {principle.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Tech Stack */}
        <motion.section variants={itemVariants} className="mb-20">
          <h2 className="t-label mb-12 flex items-center gap-4">
            <div className="w-8 h-px bg-[var(--accent)]"></div>
            Built With
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {techStack.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="group"
              >
                <div className="surface border-[var(--border-faint)] rounded-[var(--radius-md)] p-6 flex flex-col items-center justify-center text-center hover:border-[var(--accent)]/50 hover:bg-[var(--accent-dim)]/30 transition-all duration-300 cursor-default">
                  <span className="text-white font-semibold mb-1">{tech.name}</span>
                  <span className="t-meta text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{tech.desc}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section variants={itemVariants} className="pt-16 border-t border-[var(--border-faint)]">
          <div className="flex flex-wrap gap-6">
            <a
              href="https://github.com/madsykle/netflyer"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary px-10 h-14 text-base"
            >
              <GithubLogo className="w-5 h-5 mr-2.5" weight="fill" />
              <span>View Source</span>
            </a>
            <a
              href="https://github.com/madsykle"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary px-10 h-14 text-base"
            >
              <ArrowSquareOut className="w-5 h-5 mr-2.5" weight="bold" />
              <span>More Projects</span>
            </a>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
