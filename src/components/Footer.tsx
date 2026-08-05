import { GithubLogo, ArrowSquareOut } from "@phosphor-icons/react";
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border-faint)] mt-20 bg-[var(--bg-base)]">
      <div className="container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <p
              className="text-white mb-2 tracking-[0.2em] font-bold"
              style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '1.15rem' }}
            >
              TARKOSI
            </p>
            <p className="t-body text-sm opacity-50">Cinema, anytime. Anywhere.</p>
          </div>

          {/* Navigation */}
          <div>
            <p className="t-label mb-4">Navigation</p>
            <nav className="flex flex-col gap-2.5">
              {[
                { path: '/', label: 'Home' },
                { path: '/discover', label: 'Discover' },
                { path: '/search', label: 'Search' },
                { path: '/watchlist', label: 'Watchlist' },
                { path: '/settings', label: 'Settings' }
              ].map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="t-body text-sm hover:text-white transition-colors w-fit"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div>
            <p className="t-label mb-4">Legal & Open Source</p>
            <div className="flex flex-col gap-2.5">
              <a href="https://github.com/madsykle/netflyer" target="_blank" rel="noopener noreferrer"
                 className="t-body text-sm hover:text-white transition-colors flex items-center gap-2 w-fit">
                GitHub Repository <ArrowSquareOut className="w-3 h-3" />
              </a>
            </div>
            <p className="t-body text-[10px] mt-4 leading-relaxed opacity-40 uppercase tracking-wider">
              Tarkosi does not host any files. All content is provided by non-affiliated third parties.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border-faint)] flex items-center justify-between">
          <p className="t-meta text-[10px]">© {currentYear} Tarkosi. MIT License.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
