import { TokenHistoryItem, TokenDiffResult, DecodedJWT } from '../types/jwt';
import { parseJWT } from './jwtService';

const HISTORY_KEY = 'tokenlens_history_v1';

export function loadTokenHistory(): TokenHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTokenToHistory(token: string, customLabel?: string): TokenHistoryItem[] {
  try {
    const current = loadTokenHistory();
    const decoded = parseJWT(token);

    const isExpired =
      decoded.payload?.exp !== undefined ? decoded.payload.exp * 1000 < Date.now() : false;

    const label =
      customLabel ||
      (decoded.payload?.name as string) ||
      (decoded.payload?.sub as string) ||
      `Token ${new Date().toLocaleTimeString()}`;

    const newItem: TokenHistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      label,
      token,
      algorithm: (decoded.header?.alg as string) || 'HS256',
      subject: decoded.payload?.sub,
      issuer: decoded.payload?.iss,
      isExpired,
    };

    // Filter out duplicate tokens and keep top 25
    const filtered = [newItem, ...current.filter((t) => t.token !== token)].slice(0, 25);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    return filtered;
  } catch {
    return [];
  }
}

export function deleteTokenFromHistory(id: string): TokenHistoryItem[] {
  try {
    const current = loadTokenHistory();
    const updated = current.filter((t) => t.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearTokenHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

// Compare two JWT objects
export function diffJWT(jwtA: DecodedJWT, jwtB: DecodedJWT): TokenDiffResult {
  const diffObject = (objA: Record<string, any>, objB: Record<string, any>) => {
    const added: Record<string, any> = {};
    const removed: Record<string, any> = {};
    const modified: Record<string, { from: any; to: any }> = {};

    const allKeys = Array.from(new Set([...Object.keys(objA || {}), ...Object.keys(objB || {})]));

    for (const key of allKeys) {
      const valA = objA?.[key];
      const valB = objB?.[key];

      if (valA === undefined && valB !== undefined) {
        added[key] = valB;
      } else if (valA !== undefined && valB === undefined) {
        removed[key] = valA;
      } else if (JSON.stringify(valA) !== JSON.stringify(valB)) {
        modified[key] = { from: valA, to: valB };
      }
    }

    return { added, removed, modified };
  };

  return {
    headerDiff: diffObject(jwtA.header, jwtB.header),
    payloadDiff: diffObject(jwtA.payload, jwtB.payload),
  };
}
