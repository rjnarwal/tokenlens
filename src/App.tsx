import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TokenInput } from './components/TokenInput';
import { HeaderPayloadEditor } from './components/HeaderPayloadEditor';
import { ClaimInspector } from './components/ClaimInspector';
import { SignatureVerifier } from './components/SignatureVerifier';
import { TokenDiffModal } from './components/TokenDiffModal';
import { TokenHistoryModal } from './components/TokenHistoryModal';
import { ClaimPresetsModal } from './components/ClaimPresetsModal';
import { Footer } from './components/Footer';
import { parseJWT, assembleJWT, SAMPLE_TOKENS } from './services/jwtService';
import {
  loadTokenHistory,
  saveTokenToHistory,
  deleteTokenFromHistory,
  clearTokenHistory,
} from './services/storageService';
import { DecodedJWT, TokenHistoryItem } from './types/jwt';
import { ShieldCheck, Zap, Lock, Sparkles, KeyRound } from 'lucide-react';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'midnight' | 'light'>('dark');
  const [rawToken, setRawToken] = useState<string>(SAMPLE_TOKENS.standardHS256.token);
  const [decoded, setDecoded] = useState<DecodedJWT>(() =>
    parseJWT(SAMPLE_TOKENS.standardHS256.token)
  );

  const [history, setHistory] = useState<TokenHistoryItem[]>(() => loadTokenHistory());
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);

  // Sync theme on mount
  useEffect(() => {
    const savedTheme =
      (localStorage.getItem('grassroot_theme') as 'dark' | 'midnight' | 'light') || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.remove('dark', 'midnight', 'light');
    document.documentElement.classList.add(savedTheme);
  }, []);

  const handleThemeChange = (newTheme: 'dark' | 'midnight' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('grassroot_theme', newTheme);
    document.documentElement.classList.remove('dark', 'midnight', 'light');
    document.documentElement.classList.add(newTheme);
  };

  // Re-parse when rawToken changes
  const handleTokenChange = (newRawToken: string) => {
    setRawToken(newRawToken);
    setDecoded(parseJWT(newRawToken));
  };

  // When Header JSON is edited in editor
  const handleUpdateHeader = (newHeaderJson: string) => {
    try {
      const headerObj = JSON.parse(newHeaderJson);
      const newRaw = assembleJWT(headerObj, decoded.payload || {}, decoded.signatureRaw);
      setRawToken(newRaw);
      setDecoded(parseJWT(newRaw));
    } catch {
      // ignore
    }
  };

  // When Payload JSON is edited in editor
  const handleUpdatePayload = (newPayloadJson: string) => {
    try {
      const payloadObj = JSON.parse(newPayloadJson);
      const newRaw = assembleJWT(decoded.header || {}, payloadObj, decoded.signatureRaw);
      setRawToken(newRaw);
      setDecoded(parseJWT(newRaw));
    } catch {
      // ignore
    }
  };

  // When a new signature is generated
  const handleSignatureGenerated = (newSigB64: string) => {
    const newRaw = assembleJWT(decoded.header || {}, decoded.payload || {}, newSigB64);
    setRawToken(newRaw);
    setDecoded(parseJWT(newRaw));
  };

  const handleSaveHistory = () => {
    if (!rawToken) return;
    const updated = saveTokenToHistory(rawToken);
    setHistory(updated);
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = deleteTokenFromHistory(id);
    setHistory(updated);
  };

  const handleClearHistory = () => {
    clearTokenHistory();
    setHistory([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-primary text-text-primary selection:bg-accent selection:text-white antialiased">
      {/* Background Ambient Orbs */}
      <div className="ambient-glow w-[500px] h-[500px] bg-purple-500/10 -top-32 -left-32" />
      <div className="ambient-glow w-[500px] h-[500px] bg-rose-500/10 top-60 -right-32" />

      {/* Top Navbar */}
      <Navbar
        theme={theme}
        onThemeChange={handleThemeChange}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenDiff={() => setIsDiffOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10">
        {/* Banner Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-background-secondary/80 border border-border/80 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500/20 to-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-lg sm:text-xl text-text-primary flex items-center space-x-2">
                <span>TokenLens Studio</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Zero-Cloud Offline
                </span>
              </h1>
              <p className="text-xs text-text-secondary mt-0.5">
                Decode, verify, and modify JSON Web Tokens in your local browser with WebCrypto.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs text-text-muted self-start sm:self-center">
            <span className="flex items-center space-x-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-semibold">Secrets Never Transmitted</span>
            </span>
          </div>
        </div>

        {/* 2-Column Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Encoded Token & WebCrypto Verifier */}
          <div className="lg:col-span-6 space-y-6">
            {/* Raw Token Input */}
            <TokenInput
              rawToken={rawToken}
              decoded={decoded}
              onTokenChange={handleTokenChange}
              onSaveHistory={handleSaveHistory}
              onLoadSample={() => handleTokenChange(SAMPLE_TOKENS.standardHS256.token)}
            />

            {/* Signature Verifier & Key Studio */}
            <SignatureVerifier
              decoded={decoded}
              onSignatureGenerated={handleSignatureGenerated}
            />
          </div>

          {/* Right Column: Decoded JSON Editor & Claims Inspector */}
          <div className="lg:col-span-6 space-y-6">
            {/* JSON Editor (Header & Payload) */}
            <HeaderPayloadEditor
              decoded={decoded}
              onUpdateHeader={handleUpdateHeader}
              onUpdatePayload={handleUpdatePayload}
            />

            {/* Expiration Countdown & Claims Breakdown */}
            <ClaimInspector decoded={decoded} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      {isDiffOpen && (
        <TokenDiffModal
          initialTokenA={rawToken}
          onClose={() => setIsDiffOpen(false)}
          onApplyToken={(token) => handleTokenChange(token)}
        />
      )}

      {isHistoryOpen && (
        <TokenHistoryModal
          history={history}
          onClose={() => setIsHistoryOpen(false)}
          onSelectToken={(token) => handleTokenChange(token)}
          onDeleteToken={handleDeleteHistoryItem}
          onClearHistory={handleClearHistory}
        />
      )}

      {isPresetsOpen && (
        <ClaimPresetsModal
          onClose={() => setIsPresetsOpen(false)}
          onSelectPreset={(token) => handleTokenChange(token)}
        />
      )}
    </div>
  );
};

export default App;
