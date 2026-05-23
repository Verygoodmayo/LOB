import { Router } from "express";
import type { Request, Response } from "express";
import { pageToIndex } from "../lib/algorithm";
import { indexToAddress, formatAddress } from "../lib/address";
import { CHARSET, CHARS_PER_PAGE } from "../lib/constants";

const router = Router();

// POST /search
// Body: { query: string }
// Pads the query to 3200 chars, encodes it, and returns its address.
router.post("/", (req: Request, res: Response) => {
  const query: unknown = req.body?.query;
  if (typeof query !== "string" || !query) {
    res.status(400).json({ error: "Body must include { query: string }" });
    return;
  }
  const invalid = [...query].find(ch => !CHARSET.includes(ch));
  if (invalid !== undefined) {
    res.status(400).json({
      error: `Invalid character "${invalid}". Only a–z, space, comma, period allowed.`,
    });
    return;
  }
  if (query.length > CHARS_PER_PAGE) {
    res.status(400).json({ error: `Query cannot exceed ${CHARS_PER_PAGE} characters` });
    return;
  }

  // Pad to full page length with spaces (deterministic placement: query starts at position 0)
  const padded = query.padEnd(CHARS_PER_PAGE, " ");

  try {
    const index = pageToIndex(padded);
    const addr = indexToAddress(index);
    res.json({ query, address: formatAddress(addr), ...addr });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
