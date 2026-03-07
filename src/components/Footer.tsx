import { Github, ExternalLink } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[var(--color-bg-secondary)] border-t border-[var(--color-border-subtle)] pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-display tracking-widest text-white uppercase">
              Netflyer
            </h3>
            <p className="text-[var(--color-text-secondary)] text-sm italic font-serif">
              Cinema, anytime. Anywhere.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/discover" className="hover:text-white transition-colors">Discover</Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-white transition-colors">Search</Link>
              </li>
              <li>
                <Link href="/watchlist" className="hover:text-white transition-colors">Watchlist</Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-white transition-colors">Settings</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">
              Legal & Open Source
            </h4>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <li>
                <a
                  href="https://github.com/madsykle/netflyer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <Github className="w-4 h-4" /> GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/madsykle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> Developer Profile
                </a>
              </li>
            </ul>
            <p className="text-[var(--color-text-tertiary)] text-xs mt-4 max-w-xs leading-relaxed">
              Netflyer does not host any files on its servers. All content is
              provided by non-affiliated third parties.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--color-border-subtle)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[var(--color-text-tertiary)] text-xs">
            © {currentYear} Netflyer. MIT License.
          </p>
          <p className="text-[var(--color-text-tertiary)] text-xs">
            v2.0.0
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;