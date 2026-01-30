import Header from "../components/Navbar";
import { BACKEND_URL } from "../services/Api";
import { motion } from "framer-motion";
import { Github, Mail, Heart, Code } from "lucide-react";
import { useEffect, useState } from "react";

const About = () => {
  const [developerPicks, setDeveloperPicks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeveloperPicks = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/developer_picks`);
        const data = await response.json();
        setDeveloperPicks(data.picks);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching developer picks:", error);
        setLoading(false);
      }
    };
    fetchDeveloperPicks();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const picksVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <Header />

      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[var(--color-accent-primary)]"></div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-6 py-12 max-w-6xl"
        >
          {/* Hero Section */}
          <motion.section variants={itemVariants} className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--color-accent-primary)] rounded-full mb-6">
              <Code className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-[var(--color-text-primary)]">
              About Netflyer
            </h1>
            <p className="text-xl text-[var(--color-text-secondary)] max-w-3xl mx-auto leading-relaxed">
              Netflyer is a modern streaming platform that brings your favorite
              movies and TV shows directly to your browser with a seamless,
              ad-free experience.
            </p>
          </motion.section>

          {/* About Me Section */}
          <motion.section variants={itemVariants} className="mb-16">
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl shadow-xl">
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-accent-primary)] rounded-full mb-6">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-6">
                  About the Developer
                </h2>
                <div className="max-w-2xl mx-auto space-y-4">
                  <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
                    Hey there! I'm{" "}
                    <span className="text-[var(--color-bone)] font-semibold">
                      Nesbeer
                    </span>
                    , and I built this streaming platform with passion and
                    dedication. Currently, Netflyer is completely ad-free to
                    provide you with the best viewing experience.
                  </p>
                  <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
                    I'm committed to regular updates and improvements to make
                    your streaming experience even better. Future developments
                    may include thoughtful monetization to support continued
                    growth.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Developer Picks Section */}
          <motion.section variants={itemVariants} className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">
                Developer Picks
              </h2>
              <p className="text-lg text-[var(--color-text-secondary)]">
                Handpicked recommendations from my personal collection of
                favorites
              </p>
            </div>

            <motion.div
              variants={picksVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
            >
              {developerPicks.map((pick, index) => (
                <motion.div
                  key={pick.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group cursor-pointer"
                  onClick={() => {
                    window.location.href = `/info/${pick.media_type}/${pick.id}`;
                  }}
                >
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[var(--color-bg-tertiary)]">
                    <img
                      src={`https://image.tmdb.org/t/p/w300${pick.poster_path}`}
                      alt={pick.title || pick.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* Contact Section */}
          <motion.section variants={itemVariants}>
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl shadow-xl">
              <div className="p-8 text-center">
                <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-6">
                  Get in Touch
                </h2>
                <p className="text-lg text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto">
                  Have questions, feedback, or suggestions? I'd love to hear
                  from you! Reach out through any of these platforms.
                </p>

                <div className="flex flex-wrap gap-4 justify-center">
                  <button
                    onClick={() =>
                      window.open("https://github.com/unknnsb", "_blank")
                    }
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] font-semibold rounded-xl border border-[var(--color-border)] transition-all"
                  >
                    <Github className="w-5 h-5" />
                    GitHub
                  </button>
                  <button
                    onClick={() =>
                      (window.location.href = "mailto:asnesbeer3@gmail.com")
                    }
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-[var(--color-text-primary)] font-semibold rounded-xl transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    Email
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        </motion.div>
      )}
    </div>
  );
};

export default About;
