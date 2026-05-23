import {
  M, A, C, SHIFT1, SHIFT2, SHIFT3, SHIFT4,
  MASKONE, MASKTWO, modInverse,
  BASE, CHARSET, CHARS_PER_PAGE,
} from "./constants";

// Computed once at module load — this is the only expensive init step.
const A_INV = modInverse(A, M);

// --- Temper / Detemper ---
// Direct translation of the babelia.cpp bit-shift operations to BigInt.

function temper(x: bigint): bigint {
  x ^= (x >> SHIFT1);
  x ^= ((x % MASKONE) << SHIFT2);
  x ^= ((x % MASKTWO) << SHIFT3);
  x ^= (x >> SHIFT4);
  return ((x % M) + M) % M;
}

function detemper(x: bigint): bigint {
  // Reverse shift4 (right): self-inverse for right shifts >= half bit-length
  x ^= (x >> SHIFT4);

  // Reverse shift3 (left with masktwo): two passes sufficient since shift > half
  let rev = x ^ ((x % MASKTWO) << SHIFT3);
  x = x ^ ((rev % MASKTWO) << SHIFT3);

  // Reverse shift2 (left with maskone): four passes
  rev = x ^ ((x % MASKONE) << SHIFT2);
  rev = x ^ ((rev % MASKONE) << SHIFT2);
  rev = x ^ ((rev % MASKONE) << SHIFT2);
  rev = x ^ ((rev % MASKONE) << SHIFT2);
  x = x ^ ((rev % MASKONE) << SHIFT2);

  // Reverse shift1 (right): three passes
  rev = x ^ (x >> SHIFT1);
  rev = x ^ (rev >> SHIFT1);
  x = x ^ (rev >> SHIFT1);

  return ((x % M) + M) % M;
}

// --- Core permutation ---

export function indexToPage(index: bigint): string {
  // LCG forward step
  let x = (A * index + C) % M;
  // Temper
  x = temper(x);
  // Convert to base-29 characters
  return indexToChars(x);
}

export function pageToIndex(page: string): bigint {
  if (page.length !== CHARS_PER_PAGE) {
    throw new Error(`Page must be exactly ${CHARS_PER_PAGE} characters`);
  }
  // Convert chars to base-29 number
  let x = charsToIndex(page);
  // Detemper
  x = detemper(x);
  // LCG inverse
  let idx = (A_INV * (x - C + M)) % M;
  return idx;
}

// --- Base-29 encoding ---

function indexToChars(x: bigint): string {
  const chars: string[] = new Array(CHARS_PER_PAGE) as string[];
  let n = x;
  for (let i = CHARS_PER_PAGE - 1; i >= 0; i--) {
    chars[i] = CHARSET[Number(n % BASE)] ?? "a";
    n = n / BASE;
  }
  return chars.join("");
}

function charsToIndex(text: string): bigint {
  let n = 0n;
  for (const ch of text) {
    const idx = CHARSET.indexOf(ch);
    if (idx === -1) throw new Error(`Invalid character: "${ch}"`);
    n = n * BASE + BigInt(idx);
  }
  return n;
}
