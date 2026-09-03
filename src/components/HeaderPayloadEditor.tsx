import React, { useState, useEffect } from 'react';
import {
  Code2,
  Copy,
  Check,
  Braces,
  Sparkles,
} from 'lucide-react';
import { DecodedJWT } from '../types/jwt';

interface HeaderPayloadEditorProps {
  decoded: DecodedJWT;
  onUpdateHeader: (newHeaderJson: string) => void;
  onUpdatePayload: (newPayloadJson: string) => void;
}

export const HeaderPayloadEditor: React.FC<HeaderPayloadEditorProps> = ({
  decoded,
  onUpdateHeader,
  onUpdatePayload,
}) => {
  const [activeTab, setActiveTab] = useState<'payload' | 'header'>('payload');
  const [headerText, setHeaderText] = useState(decoded.headerJsonFormatted);
  const [payloadText, setPayloadText] = useState(decoded.payloadJsonFormatted);
  const [copied, setCopied] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Sync external changes
  useEffect(() => {
    setHeaderText(decoded.headerJsonFormatted);
  }, [decoded.headerJsonFormatted]);

  useEffect(() => {
    setPayloadText(decoded.payloadJsonFormatted);
  }, [decoded.payloadJsonFormatted]);

  const handleHeaderChange = (val: string) => {
    setHeaderText(val);
    try {
      JSON.parse(val);
      setJsonError(null);
      onUpdateHeader(val);
    } catch (err: any) {
      setJsonError(`Invalid Header JSON: ${err.message}`);
    }
  };

  const handlePayloadChange = (val: string) => {
    setPayloadText(val);
    try {
      JSON.parse(val);
      setJsonError(null);
      onUpdatePayload(val);
    } catch (err: any) {
      setJsonError(`Invalid Payload JSON: ${err.message}`);
    }
  };

  const handleCopy = async () => {
    const textToCopy = activeTab === 'payload' ? payloadText : headerText;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-background-secondary border border-border shadow-xl overflow-hidden">
      {/* Tab Switcher Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-background-tertiary/80 border-b border-border">
        {/* Tabs */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setActiveTab('payload');
              setJsonError(null);
            }}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'payload'
                ? 'jwt-payload-badge shadow-sm font-extrabold'
                : 'text-text-muted hover:text-text-primary bg-background-elevated/60 border border-border/60'
            }`}
          >
            <Braces className="w-3.5 h-3.5" />
            <span>Payload (Claims)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-background-primary font-bold">
              {Object.keys(decoded.payload || {}).length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('header');
              setJsonError(null);
            }}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'header'
                ? 'jwt-header-badge shadow-sm font-extrabold'
                : 'text-text-muted hover:text-text-primary bg-background-elevated/60 border border-border/60'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Header</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-background-primary font-bold">
              {decoded.header?.alg || 'none'}
            </span>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-background-elevated hover:bg-background-tertiary text-xs font-semibold text-text-secondary hover:text-text-primary border border-border transition-colors shadow-sm"
            title="Copy formatted JSON"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-text-muted" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* JSON Editor Box */}
      <div className="flex-1 p-4 flex flex-col relative space-y-2">
        {activeTab === 'payload' ? (
          <textarea
            value={payloadText}
            onChange={(e) => handlePayloadChange(e.target.value)}
            className="w-full flex-1 min-h-[200px] sm:min-h-[230px] bg-background-primary border-2 border-border/80 focus:border-purple-500 rounded-xl p-3.5 text-xs font-mono font-medium leading-relaxed jwt-payload-text focus:outline-none resize-none scrollbar-thin shadow-inner"
            spellCheck={false}
          />
        ) : (
          <textarea
            value={headerText}
            onChange={(e) => handleHeaderChange(e.target.value)}
            className="w-full flex-1 min-h-[200px] sm:min-h-[230px] bg-background-primary border-2 border-border/80 focus:border-red-500 rounded-xl p-3.5 text-xs font-mono font-medium leading-relaxed jwt-header-text focus:outline-none resize-none scrollbar-thin shadow-inner"
            spellCheck={false}
          />
        )}

        {/* JSON Syntax Error Alert */}
        {jsonError && (
          <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-mono font-semibold">
            {jsonError}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2.5 bg-background-tertiary/60 border-t border-border flex items-center justify-between text-xs text-text-muted">
        <span className="flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-accent" />
          <span className="font-semibold text-text-secondary">Two-way live editing</span>
        </span>
        <span className="font-mono text-[11px] font-semibold">
          {activeTab === 'payload' ? 'RFC 7519 Payload' : 'JOSE Header'}
        </span>
      </div>
    </div>
  );
};
