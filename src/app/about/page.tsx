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
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] pb-20 pt-32">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container relative z-10 max-w-5xl"
      >
        {/* Header */}
        <motion.section variants={itemVariants} className="text-left mb-20">
          <h1 className="t-title text-6xl mb-6 uppercase tracking-wider">
            About Netflyer
          </h1>
          <p className="t-body text-xl text-[var(--text-secondary)] max-w-3xl leading-relaxed">
            A premium, open-source cinematic interface for discovering and organizing
            the world's films and series. Designed for enthusiasts who value 
            minimalism, speed, and privacy.
          </p>
        </motion.section>

        {/* Vision Section */}
        <motion.section variants={itemVariants} className="mb-24">
          <div className="surface p-10 rounded-[var(--radius-md)] border-[var(--border-subtle)] relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <Layers className="w-48 h-48 text-white" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-lg bg-[var(--accent-dim)] flex items-center justify-center border border-[var(--accent)]/20">
                  <Code className="w-6 h-6 text-[var(--accent)]" />
                </div>
                <h2 className="t-label text-sm text-white">Project Vision: v2.0</h2>
              </div>
              <p className="t-body text-lg text-[var(--text-secondary)] leading-relaxed mb-8 max-w-3xl">
                Netflyer v2 is a complete ground-up rebuild focusing on a high-fidelity 
                cinematic experience. Every interaction has been refined to provide 
                buttery-smooth performance and a focused, editorial aesthetic that 
                lets the cinema speak for itself.
              </p>
              <div className="flex items-center gap-4 text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest">
                <span>Active Development</span>
                <span className="opacity-20">|</span>
                <span>Last Updated: March 2026</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Transparency */}
        <motion.section variants={itemVariants} className="mb-24">
          <h2 className="t-label mb-10 flex items-center gap-4">
            <div className="w-12 h-px bg-[var(--accent)]"></div>
            Core Principles
          </h2>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="surface border-[var(--border-subtle)] rounded-[var(--radius-md)] p-10 hover:border-[var(--border-visible)] transition-all group">
              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-8 group-hover:bg-[var(--accent-dim)] transition-colors">
                <Server className="w-6 h-6 text-[var(--text-secondary)] group-hover:text-[var(--accent)]" />
              </div>
              <h3 className="t-label text-sm mb-4 text-white">Aggregated Intelligence</h3>
              <p className="t-body text-[var(--text-secondary)] leading-relaxed">
                Netflyer does not host any content. It acts as a sophisticated indexing 
                layer, aggregating metadata from TMDB and facilitating access to 
                third-party cinematic streams.
              </p>
            </div>
            <div className="surface border-[var(--border-subtle)] rounded-[var(--radius-md)] p-10 hover:border-[var(--border-visible)] transition-all group">
              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-8 group-hover:bg-[var(--accent-dim)] transition-colors">
                <Database className="w-6 h-6 text-[var(--text-secondary)] group-hover:text-[var(--accent)]" />
              </div>
              <h3 className="t-label text-sm mb-4 text-white">Privacy First</h3>
              <p className="t-body text-[var(--text-secondary)] leading-relaxed">
                Your cinematic journey is your own. We prioritize local storage and 
                secure authentication to ensure your watchlist and history remain 
                private and under your control.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Tech Stack */}
        <motion.section variants={itemVariants} className="mb-24">
          <h2 className="t-label mb-10 flex items-center gap-4">
            <div className="w-12 h-px bg-[var(--accent)]"></div>
            Technological Foundation
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
                className="surface border-[var(--border-subtle)] rounded-[var(--radius-md)] p-8 flex flex-col items-center justify-center text-center hover:border-[var(--accent)] hover:bg-[var(--accent-dim)] transition-all duration-500"
              >
                <span className="text-3xl mb-4" role="img" aria-label={tech.name}>
                  {tech.icon}
                </span>
                <span className="t-meta text-[10px] font-bold uppercase">{tech.name}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Links */}
        <motion.section variants={itemVariants} className="text-left pt-12 border-t border-[var(--border-faint)]">
          <div className="flex flex-wrap gap-6">
            <a
              href="https://github.com/madsykle/netflyer"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary px-12 h-14 text-base"
            >
              <Github className="w-5 h-5 mr-2.5" />
              <span>Repository</span>
            </a>
            <a
              href="https://github.com/madsykle"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary px-12 h-14 text-base"
            >
              <ExternalLink className="w-5 h-5 mr-2.5" />
              <span>More Projects</span>
            </a>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
      </motion.div>
    </div>
  );
}
