import React, { useState } from 'react';
import {
  Copy,
  Trash2,
  Sparkles,
  Bookmark,
  Check,
  ClipboardPaste,
  AlertTriangle,
} from 'lucide-react';
import { DecodedJWT } from '../types/jwt';

interface TokenInputProps {
  rawToken: string;
  decoded: DecodedJWT;
  onTokenChange: (token: string) => void;
  onSaveHistory: () => void;
  onLoadSample: () => void;
}

export const TokenInput: React.FC<TokenInputProps> = ({
  rawToken,
  decoded,
  onTokenChange,
  onSaveHistory,
  onLoadSample,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!rawToken) return;
    await navigator.clipboard.writeText(rawToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) onTokenChange(text.trim());
    } catch {
      // ignore
    }
  };

  const parts = rawToken.trim().split('.');
  const headerPart = parts[0] || '';
  const payloadPart = parts[1] || '';
  const signaturePart = parts[2] || '';

  return (
    <div className="flex flex-col h-full rounded-2xl bg-background-secondary border border-border shadow-xl overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-background-tertiary/80 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
          <span className="font-heading font-extrabold text-xs uppercase tracking-wider text-text-primary">
            Encoded Token (Base64URL)
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={handlePaste}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-background-elevated hover:bg-background-tertiary text-xs font-semibold text-text-secondary hover:text-text-primary border border-border transition-colors shadow-sm"
            title="Paste from clipboard"
          >
            <ClipboardPaste className="w-3.5 h-3.5 text-accent" />
            <span className="hidden sm:inline">Paste</span>
          </button>

          <button
            onClick={onLoadSample}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-background-elevated hover:bg-background-tertiary text-xs font-semibold text-text-secondary hover:text-text-primary border border-border transition-colors shadow-sm"
            title="Load sample token"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Sample</span>
          </button>

          <button
            onClick={onSaveHistory}
            disabled={!rawToken}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-background-elevated hover:bg-background-tertiary text-xs font-semibold text-text-secondary hover:text-text-primary border border-border transition-colors shadow-sm disabled:opacity-40"
            title="Save token to local history"
          >
            <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={handleCopy}
            disabled={!rawToken}
            className="p-1.5 rounded-lg bg-background-elevated hover:bg-background-tertiary text-text-secondary hover:text-text-primary border border-border transition-colors shadow-sm disabled:opacity-40"
            title="Copy raw token"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => onTokenChange('')}
            disabled={!rawToken}
            className="p-1.5 rounded-lg bg-background-elevated hover:bg-red-500/20 text-text-secondary hover:text-red-400 border border-border transition-colors shadow-sm disabled:opacity-40"
            title="Clear token"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Textarea Input */}
      <div className="relative flex-1 p-4 flex flex-col space-y-3">
        <textarea
          value={rawToken}
          onChange={(e) => onTokenChange(e.target.value)}
          placeholder="Paste your JSON Web Token (JWT) here... e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          className="w-full flex-1 min-h-[170px] sm:min-h-[220px] bg-background-primary border-2 border-border/80 focus:border-accent rounded-xl p-3.5 text-xs font-mono font-medium leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none resize-none scrollbar-thin shadow-inner"
          spellCheck={false}
        />

        {/* Validation Alert */}
        {decoded.error && rawToken && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{decoded.error}</span>
          </div>
        )}

        {/* Live Color Syntax Indicator Bar */}
        {rawToken && parts.length >= 2 && (
          <div className="p-3.5 rounded-xl bg-background-primary border border-border text-xs font-mono break-all leading-relaxed max-h-36 overflow-y-auto scrollbar-thin shadow-inner">
            <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-text-muted mb-1.5 flex items-center justify-between">
              <span>Color-Coded Token Segments</span>
              <span className="text-[10px] font-mono text-text-muted">RFC 7519</span>
            </div>
            <span className="jwt-header-text font-bold">{headerPart}</span>
            <span className="text-text-muted font-black mx-0.5">.</span>
            <span className="jwt-payload-text font-bold">{payloadPart}</span>
            {signaturePart && (
              <>
                <span className="text-text-muted font-black mx-0.5">.</span>
                <span className="jwt-signature-text font-bold">{signaturePart}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Segment Legend Footer */}
      <div className="px-4 py-2.5 bg-background-tertiary/60 border-t border-border flex flex-wrap items-center justify-between text-xs text-text-muted gap-2">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded-md jwt-header-badge font-bold text-[11px]">
            Header
          </span>
          <span className="px-2 py-0.5 rounded-md jwt-payload-badge font-bold text-[11px]">
            Payload
          </span>
          <span className="px-2 py-0.5 rounded-md jwt-signature-badge font-bold text-[11px]">
            Signature
          </span>
        </div>
        <div className="text-[10px] font-mono text-emerald-400 font-semibold">100% Client-Side</div>
      </div>
    </div>
  );
};
