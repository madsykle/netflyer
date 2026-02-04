import { Github, Code, ExternalLink } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] pt-12 pb-8 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand & Desc */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] bg-clip-text text-transparent inline-block">
              Netflyer
            </h3>
            <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed max-w-xs">
              An open-source streaming interface for discovering movies and TV shows.
              Archived project.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-[var(--color-text-primary)]">
              Links
            </h4>
            <ul className="space-y-2 text-sm text-[var(--color-text-tertiary)]">
              <li>
                <a
                  href="https://github.com/madsykle/netflyer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-accent-primary)] transition-colors flex items-center gap-2"
                >
                  <Github className="w-4 h-4" /> Source Code
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/madsykle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-accent-primary)] transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> More Projects
                </a>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="space-y-4">
            <h4 className="font-semibold text-[var(--color-text-primary)]">
              Legal
            </h4>
            <p className="text-[var(--color-text-tertiary)] text-xs leading-relaxed">
              Netflyer does not host any files on its servers. All content is
              provided by non-affiliated third parties. This project is strictly
              for educational purposes.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--color-border)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[var(--color-text-tertiary)] text-sm">
            © {currentYear} Netflyer. MIT License.
          </p>
          
          <div className="flex items-center gap-6 text-sm text-[var(--color-text-tertiary)]">
             <span className="flex items-center gap-1">
               <Code className="w-4 h-4" />
               Built with React & Vite
             </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
