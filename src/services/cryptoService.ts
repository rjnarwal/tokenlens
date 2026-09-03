import { VerificationResult, JWTAlgorithm } from '../types/jwt';
import { bufferToBase64Url } from './jwtService';

// Convert PEM string to ArrayBuffer (SPKI or PKCS8)
function pemToArrayBuffer(pem: string): ArrayBuffer {
  const cleanPem = pem
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s+/g, '');
  const binary = atob(cleanPem);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Convert Base64URL string to ArrayBuffer
function base64UrlToArrayBuffer(base64Url: string): ArrayBuffer {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Get WebCrypto hash algorithm name
function getHashName(alg: string): string {
  if (alg.endsWith('256')) return 'SHA-256';
  if (alg.endsWith('384')) return 'SHA-384';
  if (alg.endsWith('512')) return 'SHA-512';
  return 'SHA-256';
}

// -------------------------------------------------------------
// HMAC Verification & Signing (HS256, HS384, HS512)
// -------------------------------------------------------------
export async function verifyHMAC(
  headerB64: string,
  payloadB64: string,
  signatureB64: string,
  secret: string,
  algorithm: 'HS256' | 'HS384' | 'HS512',
  isSecretBase64: boolean = false
): Promise<VerificationResult> {
  try {
    if (!secret) {
      return {
        status: 'unverified',
        message: 'Enter your HMAC secret key to verify signature.',
        algorithm,
        timestamp: Date.now(),
      };
    }

    if (!signatureB64) {
      return {
        status: 'failed',
        message: 'Token has no signature segment to verify.',
        algorithm,
        timestamp: Date.now(),
      };
    }

    const hash = getHashName(algorithm);
    let keyData: ArrayBuffer;

    if (isSecretBase64) {
      try {
        keyData = base64UrlToArrayBuffer(secret);
      } catch {
        keyData = new TextEncoder().encode(secret).buffer as ArrayBuffer;
      }
    } else {
      keyData = new TextEncoder().encode(secret).buffer as ArrayBuffer;
    }

    // Import HMAC Key
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: { name: hash } },
      false,
      ['verify']
    );

    const messageData = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signatureData = base64UrlToArrayBuffer(signatureB64);

    const isValid = await window.crypto.subtle.verify('HMAC', cryptoKey, signatureData, messageData);

    if (isValid) {
      return {
        status: 'verified',
        message: `Signature Verified! Matched ${algorithm} using WebCrypto.`,
        algorithm,
        timestamp: Date.now(),
      };
    } else {
      return {
        status: 'failed',
        message: `Invalid Signature! Secret key does not match token payload or algorithm ${algorithm}.`,
        algorithm,
        timestamp: Date.now(),
      };
    }
  } catch (err: any) {
    return {
      status: 'error',
      message: `Verification Error: ${err.message}`,
      algorithm,
      timestamp: Date.now(),
    };
  }
}

export async function signHMAC(
  headerB64: string,
  payloadB64: string,
  secret: string,
  algorithm: 'HS256' | 'HS384' | 'HS512',
  isSecretBase64: boolean = false
): Promise<string> {
  const hash = getHashName(algorithm);
  let keyData: ArrayBuffer;

  if (isSecretBase64) {
    try {
      keyData = base64UrlToArrayBuffer(secret);
    } catch {
      keyData = new TextEncoder().encode(secret).buffer as ArrayBuffer;
    }
  } else {
    keyData = new TextEncoder().encode(secret).buffer as ArrayBuffer;
  }

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: { name: hash } },
    false,
    ['sign']
  );

  const messageData = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signatureBuffer = await window.crypto.subtle.sign('HMAC', cryptoKey, messageData);

  return bufferToBase64Url(signatureBuffer);
}

// -------------------------------------------------------------
// RSA Verification (RS256, RS384, RS512, PS256, PS384, PS512)
// -------------------------------------------------------------
export async function verifyRSA(
  headerB64: string,
  payloadB64: string,
  signatureB64: string,
  publicKeyPem: string,
  algorithm: string
): Promise<VerificationResult> {
  try {
    if (!publicKeyPem) {
      return {
        status: 'unverified',
        message: 'Paste your RSA Public Key (PEM format) to verify signature.',
        algorithm,
        timestamp: Date.now(),
      };
    }

    const hash = getHashName(algorithm);
    const isPSS = algorithm.startsWith('PS');
    const keyData = pemToArrayBuffer(publicKeyPem);

    const cryptoKey = await window.crypto.subtle.importKey(
      'spki',
      keyData,
      {
        name: isPSS ? 'RSA-PSS' : 'RSASSA-PKCS1-v1_5',
        hash: { name: hash },
      },
      false,
      ['verify']
    );

    const messageData = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signatureData = base64UrlToArrayBuffer(signatureB64);

    const signParams = isPSS
      ? { name: 'RSA-PSS', saltLength: hash === 'SHA-256' ? 32 : hash === 'SHA-384' ? 48 : 64 }
      : { name: 'RSASSA-PKCS1-v1_5' };

    const isValid = await window.crypto.subtle.verify(signParams, cryptoKey, signatureData, messageData);

    if (isValid) {
      return {
        status: 'verified',
        message: `Signature Verified! Matched ${algorithm} RSA public key using WebCrypto.`,
        algorithm,
        timestamp: Date.now(),
      };
    } else {
      return {
        status: 'failed',
        message: `Invalid Signature! Public key does not match token payload or algorithm ${algorithm}.`,
        algorithm,
        timestamp: Date.now(),
      };
    }
  } catch (err: any) {
    return {
      status: 'error',
      message: `RSA Verification Error: ${err.message}. Ensure valid SPKI PEM format.`,
      algorithm,
      timestamp: Date.now(),
    };
  }
}

// -------------------------------------------------------------
// ECDSA Verification (ES256, ES384, ES512)
// -------------------------------------------------------------
export async function verifyECDSA(
  headerB64: string,
  payloadB64: string,
  signatureB64: string,
  publicKeyPem: string,
  algorithm: 'ES256' | 'ES384' | 'ES512'
): Promise<VerificationResult> {
  try {
    if (!publicKeyPem) {
      return {
        status: 'unverified',
        message: 'Paste your ECDSA Public Key (PEM format) to verify signature.',
        algorithm,
        timestamp: Date.now(),
      };
    }

    const namedCurve = algorithm === 'ES256' ? 'P-256' : algorithm === 'ES384' ? 'P-384' : 'P-521';
    const hash = getHashName(algorithm);
    const keyData = pemToArrayBuffer(publicKeyPem);

    const cryptoKey = await window.crypto.subtle.importKey(
      'spki',
      keyData,
      {
        name: 'ECDSA',
        namedCurve,
      },
      false,
      ['verify']
    );

    const messageData = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signatureData = base64UrlToArrayBuffer(signatureB64);

    const isValid = await window.crypto.subtle.verify(
      { name: 'ECDSA', hash: { name: hash } },
      cryptoKey,
      signatureData,
      messageData
    );

    if (isValid) {
      return {
        status: 'verified',
        message: `Signature Verified! Matched ${algorithm} (${namedCurve}) ECDSA public key.`,
        algorithm,
        timestamp: Date.now(),
      };
    } else {
      return {
        status: 'failed',
        message: `Invalid Signature! ECDSA key does not match token payload.`,
        algorithm,
        timestamp: Date.now(),
      };
    }
  } catch (err: any) {
    return {
      status: 'error',
      message: `ECDSA Verification Error: ${err.message}. Ensure SPKI PEM format with correct curve.`,
      algorithm,
      timestamp: Date.now(),
    };
  }
}
