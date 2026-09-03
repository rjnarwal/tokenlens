import { DecodedJWT, JWTHeader, JWTPayload, ClaimMeta } from '../types/jwt';

// Safe Base64URL to String decoding with full UTF-8 support
export function base64UrlDecode(str: string): string {
  try {
    // Replace URL-safe characters
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    // Pad with trailing '='
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    throw new Error('Invalid Base64URL character sequence');
  }
}

// Safe String to Base64URL encoding with UTF-8 support
export function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// ArrayBuffer to Base64URL
export function bufferToBase64Url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Parse a raw JWT string into DecodedJWT object
export function parseJWT(rawToken: string): DecodedJWT {
  const trimmed = rawToken.trim();

  if (!trimmed) {
    return {
      raw: '',
      headerRaw: '',
      payloadRaw: '',
      signatureRaw: '',
      header: {},
      payload: {},
      headerJsonFormatted: '{}',
      payloadJsonFormatted: '{}',
      isValidStructure: false,
    };
  }

  const parts = trimmed.split('.');

  if (parts.length !== 3 && parts.length !== 2) {
    return {
      raw: trimmed,
      headerRaw: parts[0] || '',
      payloadRaw: parts[1] || '',
      signatureRaw: parts[2] || '',
      header: {},
      payload: {},
      headerJsonFormatted: '{}',
      payloadJsonFormatted: '{}',
      isValidStructure: false,
      error: `Invalid JWT format: expected 3 dot-separated segments (Header.Payload.Signature), received ${parts.length} segment(s).`,
    };
  }

  const headerRaw = parts[0];
  const payloadRaw = parts[1];
  const signatureRaw = parts[2] || '';

  let header: JWTHeader = {};
  let payload: JWTPayload = {};
  let headerFormatted = '{}';
  let payloadFormatted = '{}';
  let parseError: string | undefined;

  // Decode Header
  try {
    const headerStr = base64UrlDecode(headerRaw);
    header = JSON.parse(headerStr);
    headerFormatted = JSON.stringify(header, null, 2);
  } catch (err: any) {
    parseError = `Failed to decode JWT Header: ${err.message}`;
  }

  // Decode Payload
  try {
    const payloadStr = base64UrlDecode(payloadRaw);
    payload = JSON.parse(payloadStr);
    payloadFormatted = JSON.stringify(payload, null, 2);
  } catch (err: any) {
    parseError = parseError
      ? `${parseError} | Failed to decode JWT Payload: ${err.message}`
      : `Failed to decode JWT Payload: ${err.message}`;
  }

  return {
    raw: trimmed,
    headerRaw,
    payloadRaw,
    signatureRaw,
    header,
    payload,
    headerJsonFormatted: headerFormatted,
    payloadJsonFormatted: payloadFormatted,
    isValidStructure: !parseError,
    error: parseError,
  };
}

// Assemble a JWT string from components
export function assembleJWT(header: object, payload: object, signatureB64: string = ''): string {
  const hB64 = base64UrlEncode(JSON.stringify(header));
  const pB64 = base64UrlEncode(JSON.stringify(payload));
  return signatureB64 ? `${hB64}.${pB64}.${signatureB64}` : `${hB64}.${pB64}.`;
}

// Standard RFC 7519 and OpenID Connect Claim Definitions
export const STANDARD_CLAIMS: Record<string, ClaimMeta> = {
  exp: {
    key: 'exp',
    label: 'Expiration Time',
    description: 'Identifies the expiration time on or after which the JWT must NOT be accepted for processing.',
    rfcSection: 'RFC 7519 §4.1.4',
  },
  nbf: {
    key: 'nbf',
    label: 'Not Before',
    description: 'Identifies the time before which the JWT must NOT be accepted for processing.',
    rfcSection: 'RFC 7519 §4.1.5',
  },
  iat: {
    key: 'iat',
    label: 'Issued At',
    description: 'Identifies the time at which the JWT was issued.',
    rfcSection: 'RFC 7519 §4.1.6',
  },
  iss: {
    key: 'iss',
    label: 'Issuer',
    description: 'Identifies the principal that issued the JWT (e.g. https://accounts.google.com).',
    rfcSection: 'RFC 7519 §4.1.1',
  },
  sub: {
    key: 'sub',
    label: 'Subject',
    description: 'Identifies the principal that is the subject of the JWT (e.g. user ID).',
    rfcSection: 'RFC 7519 §4.1.2',
  },
  aud: {
    key: 'aud',
    label: 'Audience',
    description: 'Identifies the recipients that the JWT is intended for (e.g. client ID or API audience).',
    rfcSection: 'RFC 7519 §4.1.3',
  },
  jti: {
    key: 'jti',
    label: 'JWT ID',
    description: 'Provides a unique identifier for the JWT to prevent token replay attacks.',
    rfcSection: 'RFC 7519 §4.1.7',
  },
  azp: {
    key: 'azp',
    label: 'Authorized Party',
    description: 'The party to which the ID Token was issued (typically Client ID in OIDC).',
    rfcSection: 'OpenID Connect Core §2.0',
  },
  nonce: {
    key: 'nonce',
    label: 'Nonce',
    description: 'String value used to associate a Client session with an ID Token to mitigate replay.',
    rfcSection: 'OpenID Connect Core §3.1.2.1',
  },
  auth_time: {
    key: 'auth_time',
    label: 'Authentication Time',
    description: 'Time when the End-User authentication occurred.',
    rfcSection: 'OpenID Connect Core §2.0',
  },
};

// Relative Time Formatter
export function formatTimeDifference(epochSeconds: number): {
  relativeText: string;
  isExpired: boolean;
  diffMs: number;
} {
  const nowMs = Date.now();
  const targetMs = epochSeconds * 1000;
  const diffMs = targetMs - nowMs;

  const absDiff = Math.abs(diffMs);
  const seconds = Math.floor((absDiff / 1000) % 60);
  const minutes = Math.floor((absDiff / (1000 * 60)) % 60);
  const hours = Math.floor((absDiff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));

  let timeString = '';
  if (days > 0) timeString += `${days}d `;
  if (hours > 0 || days > 0) timeString += `${hours}h `;
  timeString += `${minutes}m ${seconds}s`;

  if (diffMs > 0) {
    return {
      relativeText: `Expires in ${timeString}`,
      isExpired: false,
      diffMs,
    };
  } else {
    return {
      relativeText: `Expired ${timeString} ago`,
      isExpired: true,
      diffMs,
    };
  }
}

// Sample JWT Presets for quick evaluation
export const SAMPLE_TOKENS = {
  standardHS256: {
    name: 'Standard HS256 (HMAC)',
    description: 'Standard HMAC-SHA256 token signed with secret "grassroot-secret-key-2026"',
    secret: 'grassroot-secret-key-2026',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOWE4MjFmMTkiLCJuYW1lIjoiQWxleCBWYW5kZXJiaWx0IiwiZW1haWwiOiJhbGV4QHByaXZhY3ktZmlyc3QuaW8iLCJyb2xlcyI6WyJhZG1pbiIsImVuZ2luZWVyIl0sImlzcyI6Imh0dHBzOi8vYXV0aC5ncmFzc3Jvb3QuZGlnaXRhbCIsImF1ZCI6ImFwaS5ncmFzc3Jvb3QuZGlnaXRhbCIsImlhdCI6MTczNTcwODgwMCwiZXhwIjoyMDgwODg2NDAwfQ.jM8lG3Oq8zI0i-y2tB1mD4kP7xV9nL2jE6cT3rF1wQk',
  },
  cognitoToken: {
    name: 'AWS Cognito ID Token (RS256)',
    description: 'Simulated AWS Cognito User Pools identity token',
    token:
      'eyJraWQiOiJmNGhramhpM2syM2hoOTk4IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiI2NmU4OTAzZi0xMmFkLTRkMmYtOWM0MC05OGZlOWE3ZjAyNWEiLCJjb2duaXRvOmdyb3VwcyI6WyJVc2VycyIsIkRldmVsb3BlcnMiXSwiaXNzIjoiaHR0cHM6Ly9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbS91cy1lYXN0LTFfeFh4WFhYWFh4IiwiY29nbml0bzp1c2VybmFtZSI6ImRldmVsb3BlciIsImF1ZCI6IjY2Zzg5MDNmMTJhZDRkMmY5YzQwOThmZSIsImV2ZW50X2lkIjoiZjI1MDliMTEtYzE1Ni00ZDVlLTkzYmItOTAyZDFiYTVmMGMyIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3MzU3MDg4MDAsImlhdCI6MTczNTcwODgwMCwiZXhwIjoyMDgwODg2NDAwLCJlbWFpbCI6ImRldkBleGFtcGxlLmNvbSJ9.abc123simulatedRSASig',
  },
  firebaseToken: {
    name: 'Firebase Auth Token (RS256)',
    description: 'Firebase Authentication user session token',
    token:
      'eyJhbGciOiJSUzI1NiIsImtpZCI6IjU3ZDYxNzJmZTA0NWIxMjNhYmNkZWYwMSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2VuZGx5LWNsaWVudC05NDgxMiIsImF1ZCI6ImVuZGx5LWNsaWVudC05NDgxMiIsImF1dGhfdGltZSI6MTczNTcwODgwMCwidXNlcl9pZCI6Ik16SGhZMkprTlRvd1pEVXciLCJzdWIiOiJNelhoWTJKa05Ub3daRFV3IiwiaWF0IjoxNzM1NzA4ODAwLCJleHAiOjIwODA4ODY0MDAsImVtYWlsIjoiZW5nbGlzaC5kZXZlbG9wZXJAZ3Jhc3Nyb290LmRpZ2l0YWwiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZX0.simulatedFirebaseSignature12345',
  },
};
