import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Calendar,
  User,
  Fingerprint,
  Layers,
  Copy,
  Check,
} from 'lucide-react';
import { DecodedJWT } from '../types/jwt';
import { STANDARD_CLAIMS, formatTimeDifference } from '../services/jwtService';

interface ClaimInspectorProps {
  decoded: DecodedJWT;
}

export const ClaimInspector: React.FC<ClaimInspectorProps> = ({ decoded }) => {
  const [timerState, setTimerState] = useState<{
    relativeText: string;
    isExpired: boolean;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Real-time countdown refresh
  useEffect(() => {
    if (!decoded.payload?.exp) {
      setTimerState(null);
      return;
    }

    const updateTimer = () => {
      setTimerState(formatTimeDifference(decoded.payload.exp!));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [decoded.payload?.exp]);

  const handleCopyClaim = async (key: string, val: any) => {
    const text = typeof val === 'object' ? JSON.stringify(val) : String(val);
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const payload = decoded.payload || {};
  const claimEntries = Object.entries(payload);

  return (
    <div className="rounded-2xl bg-background-secondary border border-border shadow-xl p-5 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-purple-400" />
          <h3 className="font-heading font-extrabold text-sm text-text-primary">
            Claim & Expiration Inspector
          </h3>
        </div>
        <span className="text-[11px] font-mono font-bold text-text-secondary px-2 py-0.5 rounded-md bg-background-tertiary">
          {claimEntries.length} Claims
        </span>
      </div>

      {/* Expiration Timer Card (if exp exists) */}
      {payload.exp ? (
        <div
          className={`p-4 rounded-xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            timerState?.isExpired
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-emerald-500/10 border-emerald-500/30'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  timerState?.isExpired ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'
                }`}
              />
              <span
                className={`font-heading font-black text-sm sm:text-base ${
                  timerState?.isExpired ? 'text-red-500' : 'text-emerald-500'
                }`}
              >
                {timerState?.relativeText || 'Calculating...'}
              </span>
            </div>
            <div className="text-xs text-text-secondary font-medium flex flex-wrap gap-x-4">
              <span>
                <strong className="text-text-primary">Local:</strong> {new Date(payload.exp * 1000).toLocaleString()}
              </span>
              <span>
                <strong className="text-text-primary">UTC:</strong> {new Date(payload.exp * 1000).toUTCString()}
              </span>
            </div>
          </div>

          <span
            className={`self-start sm:self-center px-3 py-1 rounded-full font-mono text-xs font-black border ${
              timerState?.isExpired
                ? 'bg-red-500/20 text-red-500 border-red-500/40'
                : 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
            }`}
          >
            {timerState?.isExpired ? 'TOKEN EXPIRED' : 'TOKEN ACTIVE'}
          </span>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-background-tertiary/70 border border-border text-text-secondary text-xs flex items-center space-x-2 font-medium">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>No <code>exp</code> (Expiration Time) claim found. This token will not expire automatically.</span>
        </div>
      )}

      {/* Claims Breakdown Grid */}
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
          Payload Claims Dictionary
        </div>

        {claimEntries.length === 0 ? (
          <div className="text-center py-6 text-xs text-text-muted">
            No claims parsed yet. Paste a valid JWT to inspect claims.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto scrollbar-thin pr-1">
            {claimEntries.map(([key, value]) => {
              const meta = STANDARD_CLAIMS[key];
              const isDateClaim = ['exp', 'iat', 'nbf', 'auth_time'].includes(key) && typeof value === 'number';

              return (
                <div
                  key={key}
                  className="p-3 rounded-xl bg-background-primary border-2 border-border/80 hover:border-accent/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs jwt-payload-text">{key}</span>
                      {meta && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-background-tertiary text-text-secondary border border-border">
                          {meta.label}
                        </span>
                      )}
                    </div>
                    {meta && (
                      <p className="text-[11px] text-text-muted leading-tight">
                        {meta.description}
                      </p>
                    )}
                  </div>

                  {/* Value & Copy Action */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="text-right">
                      <div className="font-mono text-xs font-bold text-text-primary max-w-xs truncate">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </div>
                      {isDateClaim && (
                        <div className="text-[10px] font-semibold text-text-muted">
                          {new Date(value * 1000).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleCopyClaim(key, value)}
                      className="p-1.5 rounded-lg bg-background-tertiary hover:bg-background-elevated text-text-secondary hover:text-text-primary transition-colors border border-border"
                      title="Copy claim value"
                    >
                      {copiedKey === key ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
