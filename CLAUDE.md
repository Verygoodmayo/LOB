# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Library of Babel (LOB)** — a reimagination of [libraryofbabel.info](https://libraryofbabel.info), inspired by Jorge Luis Borges' short story. The core concept: a virtual library containing every possible combination of characters across an astronomically large (but finite and deterministic) space. Every page that could ever be written already exists somewhere in the library. Users can search for text and receive the exact address of the page containing it, or browse to any address and read the page at that location.

The library is not stored — it is computed on demand using an invertible PRNG. The same input always produces the same output, and any output can be reversed to its input.

## Monorepo Structure

```
LOB/
├── frontend/   → Next.js 16 app (deployed to Vercel)
└── backend/    → Node.js API (deployed to Railway)
```

Frontend is owned by the human collaborator. **Backend is owned by Claude.**

## The Algorithm

Source: [github.com/Verygoodmayo/libraryofbabel.info-algo](https://github.com/Verygoodmayo/libraryofbabel.info-algo) (C++ reference implementation).

The algorithm is a **bijective, invertible PRNG** — a permutation function over an astronomically large index space:

- **Forward (index → page content):** Given a permutation index (derived from a hex address), apply a Linear Congruential Generator (`next = (a*x + c) % m`) followed by XOR/bit-rotation tempering to produce a deterministic sequence of characters.
- **Inverse (page content → index):** Reverse the tempering (`detemper`) then apply the modular multiplicative inverse of the LCG (via Extended Euclidean algorithm) to recover the original index.
- **Hull-Dobell constraints** ensure the LCG produces a full-period permutation (every index is visited exactly once).

The backend must re-implement this algorithm in JavaScript/TypeScript using **BigInt** (since the index space vastly exceeds 64-bit integers). The C++ reference uses GNU GMP for arbitrary-precision arithmetic.

## Address System

A library address encodes a unique location: `hex:wall:shelf:volume:page`

- **Hex** — a long hexadecimal string identifying a "hexagon" (room) in the library
- **Wall** (1–4), **Shelf** (1–5), **Volume** (1–32), **Page** (1–410)
- Together these map to a single permutation index, which the algorithm expands into a page of text

The character set is 29 characters: 26 lowercase letters + space + comma + period.

Each page is **3,200 characters** (40 lines × 80 characters).

## Development Commands

All commands run from their respective subdirectories.

### Frontend (`/frontend`)
```bash
npm run dev      # start dev server
npm run build    # production build
npm run lint     # eslint
```

### Backend (`/backend`)
```bash
# (to be established)
```

## Key Constraints

- **No data storage for pages** — pages are always computed, never stored or cached by default. The algorithm is the database.
- **BigInt throughout** — the permutation index is a ~3000+ bit number. All arithmetic in the algorithm must use `BigInt`, not `number`.
- **Determinism is the contract** — given the same address, the algorithm must always return the same page. Any deviation is a bug.
- **The algorithm must be invertible** — search encodes text into an address; browse decodes an address into text. Both directions must work.

## Frontend Notes (for context)

- Next.js 16 with App Router (`/frontend/app/`)
- Tailwind CSS v4, GSAP for animation, SCSS available
- See `frontend/AGENTS.md` — this version of Next.js has breaking API changes from prior versions. Read `node_modules/next/dist/docs/` before writing frontend code.
- Fonts: Geist Sans + Geist Mono via `next/font/google`

## Deployment

| Service | Target | Notes |
|---|---|---|
| Vercel | `frontend/` | standard Next.js deploy |
| Railway | `backend/` | Node.js service, env vars set in Railway dashboard |

CORS must be configured on the backend to allow the Vercel frontend origin.
