import React from 'react';
import { ShieldCheck, ExternalLink, KeyRound, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-background-secondary border-t border-border mt-16 py-10 text-xs text-text-muted select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-border/50">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-500 via-purple-500 to-amber-500 flex items-center justify-center text-white">
              <KeyRound className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-heading font-bold text-sm text-text-primary">
                TokenLens by Grassroot Digital
              </span>
              <p className="text-[11px] text-text-muted mt-0.5">
                100% Client-Side WebCrypto JWT Debugger & Inspector
              </p>
            </div>
          </div>

          {/* Ecosystem links */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <a
              href="https://grassroot.digital"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-accent flex items-center space-x-1 font-semibold transition-colors"
            >
              <span>Grassroot Digital Home</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <a
              href="https://endly.grassroot.digital"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-orange-400 flex items-center space-x-1 font-semibold transition-colors"
            >
              <span>Endly (API Client)</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>

        {/* Privacy Promise Footer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-text-muted">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Zero telemetry. Your tokens, secrets, and private keys never leave your browser window.
            </span>
          </div>
          <div>
            © {new Date().getFullYear()} Grassroot Digital Suite. Independent Developer Tools.
          </div>
        </div>
      </div>
    </footer>
  );
};
