import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  Lock,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCw,
  Cpu,
} from 'lucide-react';
import { DecodedJWT, JWTAlgorithm, VerificationResult } from '../types/jwt';
import { verifyHMAC, signHMAC, verifyRSA, verifyECDSA } from '../services/cryptoService';

interface SignatureVerifierProps {
  decoded: DecodedJWT;
  onSignatureGenerated: (newSignatureB64: string) => void;
}

export const SignatureVerifier: React.FC<SignatureVerifierProps> = ({
  decoded,
  onSignatureGenerated,
}) => {
  const [selectedAlg, setSelectedAlg] = useState<JWTAlgorithm>('HS256');
  const [secret, setSecret] = useState('your-256-bit-secret');
  const [isSecretBase64, setIsSecretBase64] = useState(false);
  const [pemKey, setPemKey] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult>({
    status: 'unverified',
    message: 'Enter secret or key to verify signature.',
    algorithm: 'HS256',
    timestamp: Date.now(),
  });
  const [isSigning, setIsSigning] = useState(false);

  // Sync token header algorithm
  useEffect(() => {
    if (decoded.header?.alg) {
      setSelectedAlg(decoded.header.alg as JWTAlgorithm);
    }
  }, [decoded.header?.alg]);

  // Run live verification when token or secret changes
  useEffect(() => {
    let active = true;

    const runVerification = async () => {
      if (!decoded.headerRaw || !decoded.payloadRaw) return;

      const alg = (decoded.header?.alg as string) || selectedAlg;

      if (alg.startsWith('HS')) {
        const res = await verifyHMAC(
          decoded.headerRaw,
          decoded.payloadRaw,
          decoded.signatureRaw,
          secret,
          alg as any,
          isSecretBase64
        );
        if (active) setVerificationResult(res);
      } else if (alg.startsWith('RS') || alg.startsWith('PS')) {
        const res = await verifyRSA(
          decoded.headerRaw,
          decoded.payloadRaw,
          decoded.signatureRaw,
          pemKey,
          alg
        );
        if (active) setVerificationResult(res);
      } else if (alg.startsWith('ES')) {
        const res = await verifyECDSA(
          decoded.headerRaw,
          decoded.payloadRaw,
          decoded.signatureRaw,
          pemKey,
          alg as any
        );
        if (active) setVerificationResult(res);
      } else {
        if (active) {
          setVerificationResult({
            status: 'unsupported',
            message: `Algorithm ${alg} is not currently supported for browser WebCrypto verification.`,
            algorithm: alg,
            timestamp: Date.now(),
          });
        }
      }
    };

    runVerification();
    return () => {
      active = false;
    };
  }, [decoded.headerRaw, decoded.payloadRaw, decoded.signatureRaw, decoded.header?.alg, secret, isSecretBase64, pemKey, selectedAlg]);

  const handleSignToken = async () => {
    if (!decoded.headerRaw || !decoded.payloadRaw) return;
    setIsSigning(true);
    try {
      if (selectedAlg.startsWith('HS')) {
        const sig = await signHMAC(
          decoded.headerRaw,
          decoded.payloadRaw,
          secret,
          selectedAlg as any,
          isSecretBase64
        );
        onSignatureGenerated(sig);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSigning(false);
    }
  };

  const isHMAC = selectedAlg.startsWith('HS');

  return (
    <div className="rounded-2xl bg-background-secondary border border-border shadow-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center space-x-2">
          <Lock className="w-4 h-4 text-cyan-400" />
          <h3 className="font-heading font-extrabold text-sm text-text-primary">
            WebCrypto Signature Studio
          </h3>
        </div>
        <span className="text-[11px] font-mono font-bold text-cyan-500 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
          SubtleCrypto
        </span>
      </div>

      {/* Verification Status Badge Alert */}
      <div
        className={`p-3.5 rounded-xl border flex items-start space-x-3 ${
          verificationResult.status === 'verified'
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-300 font-medium'
            : verificationResult.status === 'failed'
            ? 'bg-red-500/15 border-red-500/40 text-red-600 dark:text-red-300 font-medium'
            : 'bg-background-tertiary border-border text-text-muted'
        }`}
      >
        <div className="mt-0.5 shrink-0">
          {verificationResult.status === 'verified' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : verificationResult.status === 'failed' ? (
            <XCircle className="w-5 h-5 text-red-500" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-text-muted" />
          )}
        </div>
        <div>
          <div className="font-bold text-xs">
            {verificationResult.status === 'verified'
              ? 'Signature Verified'
              : verificationResult.status === 'failed'
              ? 'Invalid Signature'
              : 'Verification Pending'}
          </div>
          <p className="text-xs opacity-90 mt-0.5 leading-snug">
            {verificationResult.message}
          </p>
        </div>
      </div>

      {/* Algorithm & Key Settings */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Signing Algorithm
          </label>
          <select
            value={selectedAlg}
            onChange={(e) => setSelectedAlg(e.target.value as JWTAlgorithm)}
            className="px-3 py-1.5 rounded-xl bg-background-primary border-2 border-border/80 text-xs font-mono font-bold text-text-primary focus:outline-none focus:border-accent"
          >
            <optgroup label="HMAC (Symmetric Secret)">
              <option value="HS256">HS256 (HMAC-SHA256)</option>
              <option value="HS384">HS384 (HMAC-SHA384)</option>
              <option value="HS512">HS512 (HMAC-SHA512)</option>
            </optgroup>
            <optgroup label="RSA (Asymmetric Public/Private)">
              <option value="RS256">RS256 (RSA-SHA256)</option>
              <option value="RS384">RS384 (RSA-SHA384)</option>
              <option value="RS512">RS512 (RSA-SHA512)</option>
              <option value="PS256">PS256 (RSA-PSS SHA256)</option>
            </optgroup>
            <optgroup label="ECDSA (Elliptic Curve)">
              <option value="ES256">ES256 (ECDSA P-256)</option>
              <option value="ES384">ES384 (ECDSA P-384)</option>
              <option value="ES512">ES512 (ECDSA P-521)</option>
            </optgroup>
          </select>
        </div>

        {/* Secret / Key Input */}
        {isHMAC ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-text-primary">
                HMAC Secret Key
              </label>
              <label className="flex items-center space-x-1.5 text-xs text-text-muted cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={isSecretBase64}
                  onChange={(e) => setIsSecretBase64(e.target.checked)}
                  className="rounded border-border text-accent focus:ring-accent w-3.5 h-3.5"
                />
                <span>Base64 encoded secret</span>
              </label>
            </div>
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter your secret key..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-background-primary border-2 border-border/80 focus:border-cyan-500 text-xs font-mono font-medium text-text-primary placeholder:text-text-muted focus:outline-none shadow-inner"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-text-primary">
              Public Key (PEM format)
            </label>
            <textarea
              value={pemKey}
              onChange={(e) => setPemKey(e.target.value)}
              placeholder="-----BEGIN PUBLIC KEY-----&#10;MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQE...&#10;-----END PUBLIC KEY-----"
              className="w-full h-24 px-3.5 py-2.5 rounded-xl bg-background-primary border-2 border-border/80 focus:border-cyan-500 text-xs font-mono font-medium leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none resize-none scrollbar-thin shadow-inner"
              spellCheck={false}
            />
          </div>
        )}

        {/* Re-Sign Action Button */}
        {isHMAC && (
          <button
            onClick={handleSignToken}
            disabled={isSigning || !decoded.headerRaw}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            <Cpu className="w-4 h-4" />
            <span>{isSigning ? 'Signing with WebCrypto...' : 'Sign & Generate JWT Signature'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
