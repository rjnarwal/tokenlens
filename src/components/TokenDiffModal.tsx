import React, { useState } from 'react';
import { X, GitCompare, ArrowRight, Check, AlertCircle, Plus, Minus, RefreshCw } from 'lucide-react';
import { parseJWT } from '../services/jwtService';
import { diffJWT } from '../services/storageService';

interface TokenDiffModalProps {
  initialTokenA: string;
  onClose: () => void;
  onApplyToken: (token: string) => void;
}

export const TokenDiffModal: React.FC<TokenDiffModalProps> = ({
  initialTokenA,
  onClose,
  onApplyToken,
}) => {
  const [tokenA, setTokenA] = useState(initialTokenA);
  const [tokenB, setTokenB] = useState('');

  const jwtA = parseJWT(tokenA);
  const jwtB = parseJWT(tokenB);

  const diff = diffJWT(jwtA, jwtB);

  const hasChanges =
    Object.keys(diff.payloadDiff.added).length > 0 ||
    Object.keys(diff.payloadDiff.removed).length > 0 ||
    Object.keys(diff.payloadDiff.modified).length > 0 ||
    Object.keys(diff.headerDiff.added).length > 0 ||
    Object.keys(diff.headerDiff.removed).length > 0 ||
    Object.keys(diff.headerDiff.modified).length > 0;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-150">
      <div className="bg-background-elevated border border-border rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background-secondary">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-sm text-text-primary">
                Side-by-Side JWT Token Diff
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Compare claims and header differences between two tokens
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Two Token Input Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-primary uppercase mb-1.5">
                Token A (Original / Baseline)
              </label>
              <textarea
                value={tokenA}
                onChange={(e) => setTokenA(e.target.value)}
                placeholder="Paste original Token A..."
                className="w-full h-28 p-3.5 bg-background-primary rounded-xl border-2 border-border/80 focus:border-purple-500 text-xs font-mono font-medium leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none resize-none scrollbar-thin shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary uppercase mb-1.5">
                Token B (New / Compared)
              </label>
              <textarea
                value={tokenB}
                onChange={(e) => setTokenB(e.target.value)}
                placeholder="Paste Token B to compare..."
                className="w-full h-28 p-3.5 bg-background-primary rounded-xl border-2 border-border/80 focus:border-purple-500 text-xs font-mono font-medium leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none resize-none scrollbar-thin shadow-inner"
              />
            </div>
          </div>

          {/* Diff Results View */}
          {!tokenA || !tokenB ? (
            <div className="p-8 text-center border-2 border-dashed border-border rounded-xl text-xs text-text-muted font-medium">
              Paste both Token A and Token B above to compute side-by-side claim differences.
            </div>
          ) : !hasChanges ? (
            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs text-center flex items-center justify-center space-x-2 font-bold">
              <Check className="w-4 h-4" />
              <span>Tokens are identical! No claim differences found.</span>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-text-secondary">
                Payload Claim Differences
              </h4>

              {/* Added Claims */}
              {Object.entries(diff.payloadDiff.added).length > 0 && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <div className="text-xs font-bold text-emerald-500 flex items-center space-x-1.5">
                    <Plus className="w-4 h-4" />
                    <span>Added in Token B ({Object.keys(diff.payloadDiff.added).length})</span>
                  </div>
                  {Object.entries(diff.payloadDiff.added).map(([k, v]) => (
                    <div key={k} className="font-mono text-xs text-emerald-600 dark:text-emerald-300 pl-5 font-semibold">
                      <strong>+ {k}:</strong> {JSON.stringify(v)}
                    </div>
                  ))}
                </div>
              )}

              {/* Removed Claims */}
              {Object.entries(diff.payloadDiff.removed).length > 0 && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-2">
                  <div className="text-xs font-bold text-red-500 flex items-center space-x-1.5">
                    <Minus className="w-4 h-4" />
                    <span>Removed in Token B ({Object.keys(diff.payloadDiff.removed).length})</span>
                  </div>
                  {Object.entries(diff.payloadDiff.removed).map(([k, v]) => (
                    <div key={k} className="font-mono text-xs text-red-600 dark:text-red-300 pl-5 font-semibold">
                      <strong>- {k}:</strong> {JSON.stringify(v)}
                    </div>
                  ))}
                </div>
              )}

              {/* Modified Claims */}
              {Object.entries(diff.payloadDiff.modified).length > 0 && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="text-xs font-bold text-amber-500 flex items-center space-x-1.5">
                    <RefreshCw className="w-4 h-4" />
                    <span>Modified Values ({Object.keys(diff.payloadDiff.modified).length})</span>
                  </div>
                  {Object.entries(diff.payloadDiff.modified).map(([k, { from, to }]) => (
                    <div key={k} className="font-mono text-xs pl-5 space-y-0.5">
                      <div className="text-amber-500 font-bold">{k}:</div>
                      <div className="text-red-500 pl-3 font-semibold">- {JSON.stringify(from)}</div>
                      <div className="text-emerald-500 pl-3 font-semibold">+ {JSON.stringify(to)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-background-secondary border-t border-border flex items-center justify-between">
          <div className="text-xs text-text-muted font-medium">100% computed in browser memory</div>
          <div className="flex space-x-2">
            {tokenB && (
              <button
                onClick={() => {
                  onApplyToken(tokenB);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-md"
              >
                Load Token B into Studio
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-background-tertiary text-text-secondary hover:text-text-primary text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
