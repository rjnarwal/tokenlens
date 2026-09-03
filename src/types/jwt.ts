export type JWTAlgorithm =
  | 'HS256'
  | 'HS384'
  | 'HS512'
  | 'RS256'
  | 'RS384'
  | 'RS512'
  | 'PS256'
  | 'PS384'
  | 'PS512'
  | 'ES256'
  | 'ES384'
  | 'ES512'
  | 'none';

export interface JWTHeader {
  typ?: string;
  alg?: JWTAlgorithm | string;
  kid?: string;
  jku?: string;
  x5t?: string;
  crit?: string[];
  [key: string]: any;
}

export interface JWTPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  azp?: string;
  nonce?: string;
  auth_time?: number;
  scope?: string;
  roles?: string[] | string;
  permissions?: string[] | string;
  name?: string;
  email?: string;
  email_verified?: boolean;
  [key: string]: any;
}

export interface DecodedJWT {
  raw: string;
  headerRaw: string;
  payloadRaw: string;
  signatureRaw: string;
  header: JWTHeader;
  payload: JWTPayload;
  headerJsonFormatted: string;
  payloadJsonFormatted: string;
  isValidStructure: boolean;
  error?: string;
}

export type VerificationStatus =
  | 'unverified'
  | 'verified'
  | 'failed'
  | 'unsupported'
  | 'error';

export interface VerificationResult {
  status: VerificationStatus;
  message: string;
  algorithm: string;
  timestamp: number;
}

export interface ClaimMeta {
  key: string;
  label: string;
  description: string;
  rfcSection?: string;
}

export interface TokenHistoryItem {
  id: string;
  timestamp: number;
  label: string;
  token: string;
  algorithm: string;
  subject?: string;
  issuer?: string;
  isExpired: boolean;
}

export interface TokenDiffResult {
  headerDiff: {
    added: Record<string, any>;
    removed: Record<string, any>;
    modified: Record<string, { from: any; to: any }>;
  };
  payloadDiff: {
    added: Record<string, any>;
    removed: Record<string, any>;
    modified: Record<string, { from: any; to: any }>;
  };
}
