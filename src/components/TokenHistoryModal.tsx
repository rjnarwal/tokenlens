import React, { useState } from 'react';
import { X, History, Trash2, Search, ArrowUpRight, Copy, Check, Clock } from 'lucide-react';
import { TokenHistoryItem } from '../types/jwt';

interface TokenHistoryModalProps {
  history: TokenHistoryItem[];
  onClose: () => void;
  onSelectToken: (token: string) => void;
  onDeleteToken: (id: string) => void;
  onClearHistory: () => void;
}

export const TokenHistoryModal: React.FC<TokenHistoryModalProps> = ({
  history,
  onClose,
  onSelectToken,
  onDeleteToken,
  onClearHistory,
}) => {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredHistory = history.filter(
    (item) =>
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.token.toLowerCase().includes(search.toLowerCase()) ||
      item.algorithm.toLowerCase().includes(search.toLowerCase()) ||
      (item.subject && item.subject.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCopy = async (id: string, token: string) => {
    await navigator.clipboard.writeText(token);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-150">
      <div className="bg-background-elevated border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background-secondary">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-text-primary">
                Local Token History
              </h3>
              <p className="text-[11px] text-text-muted">
                Encrypted in local browser storage. Never transmitted to any cloud server.
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

        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-border/70 flex items-center justify-between gap-3 bg-background-secondary/50">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by label, claim, or algorithm..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-background-primary border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
          </div>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="px-3 py-1.5 rounded-xl bg-background-tertiary hover:bg-red-500/15 text-text-secondary hover:text-red-400 text-xs font-semibold border border-border transition-colors flex items-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* History List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 scrollbar-thin">
          {filteredHistory.length === 0 ? (
            <div className="p-10 text-center text-xs text-text-muted space-y-2">
              <History className="w-8 h-8 mx-auto text-text-muted/40" />
              <p>No tokens saved in history yet.</p>
              <p className="text-[11px]">Click "Save" on any token in the editor to keep it for later inspection.</p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-background-secondary border border-border hover:border-accent/40 transition-colors flex items-center justify-between gap-3 group"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-heading font-bold text-xs text-text-primary truncate">
                      {item.label}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-background-elevated text-accent border border-border">
                      {item.algorithm}
                    </span>
                    {item.isExpired ? (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-red-500/15 text-red-400 font-mono">
                        Expired
                      </span>
                    ) : (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-mono">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-text-muted font-mono truncate">
                    {item.token}
                  </div>
                  <div className="text-[10px] text-text-muted flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Saved {new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    onClick={() => handleCopy(item.id, item.token)}
                    className="p-2 rounded-lg bg-background-tertiary hover:bg-background-elevated text-text-muted hover:text-text-primary transition-colors"
                    title="Copy token"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onSelectToken(item.token);
                      onClose();
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <span>Load</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onDeleteToken(item.id)}
                    className="p-2 rounded-lg bg-background-tertiary hover:bg-red-500/20 text-text-muted hover:text-red-400 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-background-secondary border-t border-border flex items-center justify-between">
          <span className="text-[11px] text-text-muted">{filteredHistory.length} tokens saved</span>
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
