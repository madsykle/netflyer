'use client';

import { Github, Code, Server, Database, Layers, Archive, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-white pb-20 pt-24">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container relative z-10 max-w-5xl"
      >
        {/* Header */}
        <motion.section variants={itemVariants} className="text-center mb-20">
          <h1 className="heading-1 mb-6 drop-shadow-lg uppercase tracking-widest">
            About Netflyer
          </h1>
          <p className="text-xl text-[var(--color-text-secondary)] max-w-3xl mx-auto leading-relaxed font-medium">
            An open-source streaming interface for discovering and organizing
            movies and TV shows. Immersive, cinematic, and private.
          </p>
        </motion.section>

        {/* Project Status - ARCHIVED */}
        <motion.section variants={itemVariants} className="mb-16">
          <div className="glass-panel border-yellow-500/20 rounded-2xl p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Archive className="w-32 h-32 text-yellow-500" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                  <Archive className="w-6 h-6 text-yellow-500" />
                </div>
                <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
                  Project Status: Archived
                </h2>
              </div>
              <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed mb-6 font-medium max-w-3xl">
                Netflyer is no longer actively maintained. This project serves as a
                portfolio piece demonstrating modern web development capabilities.
                While the application is fully functional, it will not receive
                future updates or new features.
              </p>
              <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] text-xs font-bold uppercase tracking-widest">
                <span>Last Updated: March 2026</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Transparency */}
        <motion.section variants={itemVariants} className="mb-16">
          <h2 className="heading-3 mb-10 flex items-center gap-4 uppercase tracking-widest">
            <div className="w-10 h-1 h-1 bg-[var(--color-accent-primary)] rounded-full"></div>
            How it Works
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-light border-white/5 rounded-xl p-8 hover:border-white/10 transition-all group">
              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[var(--color-accent-primary)]/10 transition-colors">
                <Server className="w-6 h-6 text-[var(--color-accent-primary)]" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-wider">Content Aggregation</h3>
              <p className="text-[var(--color-text-secondary)] text-base leading-relaxed font-medium">
                Netflyer does not host any content. It acts as a search engine and
                interface, aggregating metadata from TMDB (The Movie Database) and
                embedding streams from third-party providers.
              </p>
            </div>
            <div className="glass-light border-white/5 rounded-xl p-8 hover:border-white/10 transition-all group">
              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[var(--color-accent-primary)]/10 transition-colors">
                <Github className="w-6 h-6 text-[var(--color-accent-primary)]" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-wider">Disclaimer</h3>
              <p className="text-[var(--color-text-secondary)] text-base leading-relaxed font-medium">
                We do not control or verify the content provided by third-party
                stream sources. Use at your own risk. This project is for
                educational purposes only.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Tech Stack */}
        <motion.section variants={itemVariants} className="mb-20">
          <h2 className="heading-3 mb-10 flex items-center gap-4 uppercase tracking-widest">
            <div className="w-10 h-1 h-1 bg-[var(--color-accent-primary)] rounded-full"></div>
            Technology Stack
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { name: "Next.js 15", icon: "⚛️" },
              { name: "Tailwind 4", icon: "🎨" },
              { name: "Firebase", icon: "🔥" },
              { name: "Framer Motion", icon: "✨" },
              { name: "TMDB API", icon: "🎬" },
              { name: "HeroUI", icon: "🧩" },
              { name: "TypeScript", icon: "TS" },
              { name: "Bun", icon: "🍞" },
            ].map((tech) => (
              <div
                key={tech.name}
                className="glass-panel border-white/5 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-[var(--color-accent-primary)] hover:bg-white/5 transition-all duration-300"
              >
                <span className="text-3xl mb-3" role="img" aria-label={tech.name}>
                  {tech.icon}
                </span>
                <span className="font-bold text-xs uppercase tracking-widest text-[var(--color-text-secondary)]">{tech.name}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Links */}
        <motion.section variants={itemVariants} className="text-center">
          <div className="flex flex-wrap justify-center gap-6">
            <a
              href="https://github.com/madsykle/netflyer"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary px-10 py-4"
            >
              <Github className="w-5 h-5 mr-2" />
              <span>Source Code</span>
            </a>
            <a
              href="https://github.com/madsykle"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary px-10 py-4"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              <span>More Projects</span>
            </a>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
