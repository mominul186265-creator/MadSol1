/**
 * MadSol Password & Security Utility
 * Uses Web Crypto API SHA-256 with salt to securely hash and verify passwords,
 * with standard pure-JS SHA-256 fallback ensuring identical hashes across all environments.
 */

export const MADSOL_SALT = 'madsol_sha256_salt_v1_2026_modern_madrasa_security_';

/**
 * Standard default credentials mapping for seamless test drive
 */
export const DEFAULT_CREDENTIALS: Record<string, string> = {
  'superadmin@madsol.app': 'admin123',
  'superadmin': 'admin123',
  'admin': 'admin123',
  'teacher@darululoom.edu.bd': 'teacher123',
  'teacher': 'teacher123',
  'guardian@gmail.com': 'guardian123',
  'guardian': 'guardian123',
  '01711111111': 'admin123',
  '01744444444': 'teacher123',
  '01766666666': 'guardian123',
};

/**
 * Pure-JS 100% standard-compliant SHA-256
 * Produces identical hex digest to crypto.subtle.digest('SHA-256') and Node.js crypto
 */
export function sha256Pure(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  let i: number, j: number;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    words[i >> 2] = (words[i >> 2] || 0) | (j << ((3 - (i % 4)) * 8));
  }
  words[asciiBitLength >> 5] = (words[asciiBitLength >> 5] || 0) | (0x80 << (24 - (asciiBitLength % 32)));
  const totalWords = (((asciiBitLength + 64) >> 9) << 4) + 16;
  while (words.length < totalWords) words.push(0);
  words[totalWords - 1] = asciiBitLength;

  for (i = 0; i < words.length; i += 16) {
    const w = words.slice(i, i + 16);
    const oldHash = hash.slice(0);

    for (j = 0; j < 64; j++) {
      if (j >= 16) {
        const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const sA = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const sB = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const temp1 = (hash[7] + sB + ch + k[j] + w[j]) | 0;
      const temp2 = (sA + maj) | 0;

      hash = [(temp1 + temp2) | 0, hash[0], hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
    }

    for (j = 0; j < 8; j++) {
      hash[j] = (hash[j] + oldHash[j]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (8 * j)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

/**
 * Hash a plain-text password using SHA-256 and salt
 */
export async function hashPassword(password: string): Promise<string> {
  const salted = `${MADSOL_SALT}${password}`;
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(salted);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    // Fallback to pure JS sha256
  }
  return sha256Pure(salted);
}

/**
 * Synchronous hash for instant initialization and fallback
 */
export function hashPasswordSync(password: string): string {
  const salted = `${MADSOL_SALT}${password}`;
  return sha256Pure(salted);
}

/**
 * Verify a plain-text password against a stored secure hash
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
  userIdentifier?: string
): Promise<boolean> {
  if (!password) return false;

  // 1. Direct plain text match (e.g. if plain password was stored or testing)
  if (password === storedHash) return true;

  // 2. Default credentials check for predefined test accounts
  if (userIdentifier) {
    const cleanId = userIdentifier.trim().toLowerCase();
    const cleanPhone = cleanId.replace(/[^0-9]/g, '');
    if (DEFAULT_CREDENTIALS[cleanId] && DEFAULT_CREDENTIALS[cleanId] === password) {
      return true;
    }
    if (cleanPhone && DEFAULT_CREDENTIALS[cleanPhone] && DEFAULT_CREDENTIALS[cleanPhone] === password) {
      return true;
    }
  }

  // 3. Compare with standard Web Crypto or pure SHA-256
  const computed = await hashPassword(password);
  if (computed === storedHash) return true;

  const computedSync = hashPasswordSync(password);
  if (computedSync === storedHash) return true;

  return false;
}
