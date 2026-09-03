import React from 'react';
import {
  KeyRound,
  Sparkles,
  ExternalLink,
  Moon,
  Sun,
  History,
  GitCompare,
  BookOpen,
  Zap,
  Home,
  ShieldCheck,
  FileCode2,
} from 'lucide-react';

import { isDesktopEnvironment, isMacDesktopEnvironment } from '../utils/platform';

interface NavbarProps {
  theme: 'dark' | 'midnight' | 'light';
  onThemeChange: (theme: 'dark' | 'midnight' | 'light') => void;
  onOpenHistory: () => void;
  onOpenDiff: () => void;
  onOpenPresets: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onThemeChange,
  onOpenHistory,
  onOpenDiff,
  onOpenPresets,
}) => {
  const isDesktop = isDesktopEnvironment();
  const isMac = isMacDesktopEnvironment();

  return (
    <header className={`sticky top-0 z-40 bg-background-secondary/90 backdrop-blur-md border-b border-border select-none app-drag-region ${
      isMac ? 'pl-24 pr-4' : 'px-4'
    }`}>
      <div className="max-w-7xl mx-auto h-14 flex items-center justify-between">
        {/* Brand & Ecosystem Navigation */}
        <div className="flex items-center space-x-3 no-drag">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 via-purple-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <KeyRound className="w-4 h-4" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="font-heading font-extrabold text-base tracking-tight text-text-primary">
                TokenLens
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-background-elevated text-accent font-semibold border border-border">
                JWT Studio
              </span>
            </div>
          </div>

          {/* Grassroot Digital Home Link (Shown ONLY on Web, hidden on Desktop App) */}
          {!isDesktop && (
            <div className="hidden md:flex items-center space-x-2 pl-3 border-l border-border/60">
              <a
                href="https://grassroot.digital"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-background-tertiary transition-colors border border-border/50 hover:border-emerald-500/40 group"
                title="Return to Grassroot Digital Welcome Hub"
              >
                <Home className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Home</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60 text-text-muted" />
              </a>
            </div>
          )}
        </div>

        {/* Action Controls & Theme Switcher */}
        <div className="flex items-center space-x-2 no-drag">
          {/* Quick Tools */}
          <button
            onClick={onOpenPresets}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-background-tertiary hover:bg-background-elevated border border-border text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>Templates</span>
          </button>

          <button
            onClick={onOpenDiff}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-background-tertiary hover:bg-background-elevated border border-border text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
          >
            <GitCompare className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Compare Diff</span>
            <span className="sm:hidden">Diff</span>
          </button>

          <button
            onClick={onOpenHistory}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-background-tertiary hover:bg-background-elevated border border-border text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
          >
            <History className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">History</span>
          </button>

          {/* Desktop App Download (Only on Web) */}
          {!isDesktop && (
            <a
              href="https://github.com/rjnarwal/tokenlens/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-xs font-semibold text-purple-400 transition-colors shadow-sm"
              title="Download TokenLens Native Desktop App (Mac / Windows / Linux)"
            >
              <span className="hidden sm:inline">Desktop App ▾</span>
              <span className="sm:hidden">App ▾</span>
            </a>
          )}

          {/* 3-Pill Theme Switcher matching Grassroot Ecosystem */}
          <div className="flex items-center bg-background-tertiary/80 border border-border rounded-xl p-0.5 ml-1">
            <button
              onClick={() => onThemeChange('dark')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                theme === 'dark'
                  ? 'bg-accent text-white shadow-sm font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Dark Modern Theme"
              aria-label="Dark Theme"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onThemeChange('midnight')}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-all ${
                theme === 'midnight'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Midnight Navy Theme"
              aria-label="Midnight Navy Theme"
            >
              Navy
            </button>
            <button
              onClick={() => onThemeChange('light')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                theme === 'light'
                  ? 'bg-amber-500 text-white shadow-sm font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Clean Light Theme"
              aria-label="Light Theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
