// Library dimensions (matching libraryofbabel.info)
export const CHARS_PER_PAGE = 3200;
export const LINES_PER_PAGE = 40;
export const CHARS_PER_LINE = 80;
export const WALLS = 4;
export const SHELVES = 5;
export const VOLUMES = 32;
export const PAGES = 410;

// 29-character alphabet: a-z + space + comma + period
export const CHARSET = "abcdefghijklmnopqrstuvwxyz ,."
export const BASE = BigInt(CHARSET.length); // 29n

// Total pages in one hexagon: walls * shelves * volumes * pages
export const PAGES_PER_HEX = BigInt(WALLS * SHELVES * VOLUMES * PAGES); // 262,400

// Total unique page contents = 29^3200
// m must be >= 29^3200, chosen to satisfy Hull-Dobell theorem.
// We use the same m as the original implementation (power-of-29 space).
export const M: bigint = BASE ** BigInt(CHARS_PER_PAGE);

// LCG parameters satisfying Hull-Dobell theorem for m = 29^3200:
//   1. gcd(c, m) = 1  → c must not be divisible by 29
//   2. a ≡ 1 (mod 29) → a - 1 divisible by 29
//   3. (no factor of 4 constraint since m is odd)
//
// These are large values chosen close to m for good dispersion.
// a = m - 29^3199 * 14 + 1  (a ≡ 1 mod 29, large, < m)
// c = m - 29^3199 * 7       (not divisible by 29, large, < m)
//
// For production parity with the original site you would use the exact
// a, c, ainverse from the compiled C++ binary. These values produce a
// valid, deterministic, invertible permutation on the same space.
export const A: bigint = BASE ** BigInt(CHARS_PER_PAGE - 1) * 14n + 1n;
export const C: bigint = BASE ** BigInt(CHARS_PER_PAGE - 1) * 7n + 53n;

// ainverse: modular multiplicative inverse of A under M
// computed once at startup via Extended Euclidean algorithm
export function modInverse(a: bigint, m: bigint): bigint {
  let [old_r, r] = [a, m];
  let [old_s, s] = [1n, 0n];
  while (r !== 0n) {
    const q = old_r / r;
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  return ((old_s % m) + m) % m;
}

// Bit-shift constants from the reference implementation (babelia variant).
// Proportional to the bit-length of m ≈ 29^3200 ≈ 2^15,198
const BITS = 15198n;
export const SHIFT1 = (BITS * 1098239n) / 1797118n; // ~right shift 1
export const SHIFT2 = (BITS * 698879n)  / 1797118n;  // ~left shift 2
export const SHIFT3 = (BITS * 1497599n) / 1797118n;  // ~left shift 3
export const SHIFT4 = BITS;                            // ~right shift 4

// masks to prevent left-shift overflow (cut to m-1 bits before shifting left)
export const MASKONE: bigint = (1n << (BITS - SHIFT2)) - 1n;
export const MASKTWO: bigint = (1n << (BITS - SHIFT3)) - 1n;
