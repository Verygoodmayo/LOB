import {
  WALLS, SHELVES, VOLUMES, PAGES,
  PAGES_PER_HEX, M,
} from "./constants";

export interface Address {
  hex: string;     // base-16 string, variable length
  wall: number;    // 1–4
  shelf: number;   // 1–5
  volume: number;  // 1–32
  page: number;    // 1–410
}

// Convert a structured address to a single global page index (BigInt).
// The hex encodes the "hexagon number"; wall/shelf/volume/page address
// a page within that hexagon.
export function addressToIndex(addr: Address): bigint {
  validateAddress(addr);
  const hexIndex = BigInt("0x" + addr.hex);
  const localOffset =
    BigInt(addr.page - 1) +
    BigInt(PAGES) * BigInt(addr.volume - 1) +
    BigInt(PAGES * VOLUMES) * BigInt(addr.shelf - 1) +
    BigInt(PAGES * VOLUMES * SHELVES) * BigInt(addr.wall - 1);
  return ((hexIndex * PAGES_PER_HEX + localOffset) % M + M) % M;
}

// Convert a global page index back to a structured address.
export function indexToAddress(index: bigint): Address {
  const idx = ((index % M) + M) % M;
  const hexIndex = idx / PAGES_PER_HEX;
  const localOffset = Number(idx % PAGES_PER_HEX);

  const page   = (localOffset % PAGES) + 1;
  const volume = (Math.floor(localOffset / PAGES) % VOLUMES) + 1;
  const shelf  = (Math.floor(localOffset / (PAGES * VOLUMES)) % SHELVES) + 1;
  const wall   = Math.floor(localOffset / (PAGES * VOLUMES * SHELVES)) + 1;

  return { hex: hexIndex.toString(16), wall, shelf, volume, page };
}

export function parseAddress(raw: string): Address {
  // Format: "hex:wall:shelf:volume:page"
  const parts = raw.split(":");
  if (parts.length !== 5 || !parts[0] || !parts[1] || !parts[2] || !parts[3] || !parts[4]) {
    throw new Error('Address must be formatted as "hex:wall:shelf:volume:page"');
  }
  return {
    hex:    parts[0].toLowerCase(),
    wall:   parseInt(parts[1], 10),
    shelf:  parseInt(parts[2], 10),
    volume: parseInt(parts[3], 10),
    page:   parseInt(parts[4], 10),
  };
}

export function formatAddress(addr: Address): string {
  return `${addr.hex}:${addr.wall}:${addr.shelf}:${addr.volume}:${addr.page}`;
}

function validateAddress(addr: Address): void {
  if (!/^[0-9a-f]+$/.test(addr.hex)) throw new Error("hex must be a lowercase hex string");
  if (addr.wall   < 1 || addr.wall   > WALLS)   throw new Error(`wall must be 1–${WALLS}`);
  if (addr.shelf  < 1 || addr.shelf  > SHELVES)  throw new Error(`shelf must be 1–${SHELVES}`);
  if (addr.volume < 1 || addr.volume > VOLUMES)  throw new Error(`volume must be 1–${VOLUMES}`);
  if (addr.page   < 1 || addr.page   > PAGES)    throw new Error(`page must be 1–${PAGES}`);
}
