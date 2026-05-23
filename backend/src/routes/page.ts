import { Router } from "express";
import type { Request, Response } from "express";
import { parseAddress, addressToIndex, indexToAddress, formatAddress } from "../lib/address";
import { indexToPage, pageToIndex } from "../lib/algorithm";
import { CHARSET, CHARS_PER_PAGE, LINES_PER_PAGE, CHARS_PER_LINE } from "../lib/constants";

const router = Router();

// GET /page?address=hex:wall:shelf:volume:page
// Returns the text content of a page at a given address.
router.get("/", (req: Request, res: Response) => {
  const raw = req.query["address"];
  if (typeof raw !== "string" || !raw) {
    res.status(400).json({ error: "Missing ?address= parameter" });
    return;
  }
  try {
    const addr = parseAddress(raw);
    const index = addressToIndex(addr);
    const text = indexToPage(index);
    const lines: string[] = [];
    for (let i = 0; i < LINES_PER_PAGE; i++) {
      lines.push(text.slice(i * CHARS_PER_LINE, (i + 1) * CHARS_PER_LINE));
    }
    res.json({ address: formatAddress(addr), text, lines });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// GET /page/random
// Returns a random address and its page content.
router.get("/random", (_req: Request, res: Response) => {
  const addr = {
    hex:    randomHex(3260),
    wall:   randomInt(1, 4),
    shelf:  randomInt(1, 5),
    volume: randomInt(1, 32),
    page:   randomInt(1, 410),
  };
  const index = addressToIndex(addr);
  const text = indexToPage(index);
  const lines: string[] = [];
  for (let i = 0; i < LINES_PER_PAGE; i++) {
    lines.push(text.slice(i * CHARS_PER_LINE, (i + 1) * CHARS_PER_LINE));
  }
  res.json({ address: formatAddress(addr), text, lines });
});

function randomHex(length: number): string {
  let hex = "";
  for (let i = 0; i < length; i++) {
    hex += Math.floor(Math.random() * 16).toString(16);
  }
  return hex.replace(/^0+/, "") || "0";
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default router;
