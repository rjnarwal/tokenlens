import React from 'react';
import { X, BookOpen, ArrowUpRight, Sparkles, Shield, Key } from 'lucide-react';
import { SAMPLE_TOKENS } from '../services/jwtService';

interface ClaimPresetsModalProps {
  onClose: () => void;
  onSelectPreset: (token: string) => void;
}

export const ClaimPresetsModal: React.FC<ClaimPresetsModalProps> = ({
  onClose,
  onSelectPreset,
}) => {
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-150">
      <div className="bg-background-elevated border border-border rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background-secondary">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-text-primary">
                Sample JWT Templates
              </h3>
              <p className="text-[11px] text-text-muted">
                Pre-configured token architectures for testing signature and claim parsers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-background-tertiary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset Cards */}
        <div className="p-6 space-y-3">
          {Object.entries(SAMPLE_TOKENS).map(([key, preset]) => (
            <div
              key={key}
              className="p-4 rounded-xl bg-background-secondary border border-border hover:border-accent/40 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-heading font-bold text-sm text-text-primary group-hover:text-accent transition-colors">
                    {preset.name}
                  </h4>
                </div>
                <p className="text-xs text-text-muted">{preset.description}</p>
              </div>

              <button
                onClick={() => {
                  onSelectPreset(preset.token);
                  onClose();
                }}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-md shrink-0"
              >
                <span>Load Template</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-background-secondary border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-background-tertiary text-text-secondary hover:text-text-primary text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
