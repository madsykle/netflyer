import Header from "../components/Navbar";
import { motion } from "framer-motion";
import { Github, Code, Server, Database, Layers, Archive, ExternalLink } from "lucide-react";

const About = () => {
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
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] pb-20">
      <Header />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-6 pt-24 max-w-4xl"
      >
        {/* Header */}
        <motion.section variants={itemVariants} className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            About Netflyer
          </h1>
          <p className="text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed">
            An open-source streaming interface for discovering and organizing
            movies and TV shows.
          </p>
        </motion.section>

        {/* Project Status - ARCHIVED */}
        <motion.section variants={itemVariants} className="mb-12">
          <div className="bg-[var(--color-bg-secondary)] border border-yellow-500/30 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Archive className="w-24 h-24 text-yellow-500" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Archive className="w-6 h-6 text-yellow-500" />
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                  Project Status: Archived
                </h2>
              </div>
              <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
                Netflyer is no longer actively maintained. This project serves as a
                portfolio piece demonstrating modern web development capabilities.
                While the application is fully functional, it will not receive
                future updates or new features.
              </p>
              <p className="text-[var(--color-text-secondary)] text-sm">
                Last Updated: February 2026
              </p>
            </div>
          </div>
        </motion.section>

        {/* Transparency */}
        <motion.section variants={itemVariants} className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Server className="w-6 h-6 text-[var(--color-accent-primary)]" />
            How it Works
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-3">Content Aggregation</h3>
              <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                Netflyer does not host any content. It acts as a search engine and
                interface, aggregating metadata from TMDB (The Movie Database) and
                embedding streams from third-party providers.
              </p>
            </div>
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-3">Disclaimer</h3>
              <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                We do not control or verify the content provided by third-party
                stream sources. Use at your own risk. This project is for
                educational purposes only.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Tech Stack */}
        <motion.section variants={itemVariants} className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Layers className="w-6 h-6 text-[var(--color-accent-primary)]" />
            Technology Stack
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "React 18", icon: "⚛️" },
              { name: "Vite", icon: "⚡" },
              { name: "TailwindCSS", icon: "🎨" },
              { name: "Firebase", icon: "🔥" },
              { name: "Framer Motion", icon: "✨" },
              { name: "TMDB API", icon: "🎬" },
              { name: "HeroUI", icon: "🧩" },
              { name: "Bun", icon: "🍞" },
            ].map((tech) => (
              <div
                key={tech.name}
                className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-[var(--color-accent-primary)] transition-colors"
              >
                <span className="text-2xl mb-2" role="img" aria-label={tech.name}>
                  {tech.icon}
                </span>
                <span className="font-medium text-sm">{tech.name}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Links */}
        <motion.section variants={itemVariants} className="text-center">
          <div className="inline-flex gap-4">
            <a
              href="https://github.com/madsykle/netflyer"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-full transition-all"
            >
              <Github className="w-5 h-5" />
              <span>Source Code</span>
            </a>
            <a
              href="https://github.com/madsykle"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-[var(--color-accent-primary)] hover:opacity-90 text-white rounded-full transition-all shadow-lg shadow-[var(--color-accent-primary)]/20"
            >
              <ExternalLink className="w-5 h-5" />
              <span>More Projects</span>
            </a>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default About;