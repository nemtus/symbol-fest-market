# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A web marketplace where stores sell items and buyers pay in XYM (the Symbol
blockchain's native currency). Built as a Vite + React frontend plus
Firebase (Auth, Firestore, Cloud Functions, Storage, Hosting). UI text is in
Japanese. There are two live environments backed by separate Firebase projects:
**testnet** (`symbol-fest-market-test`) and **mainnet** (`symbol-fest-market`),
distinguished by which Symbol network and node list the build targets.

## Commands

Frontend (run from repo root):

```bash
npm start                 # Vite dev server on :3000 (uses .env → testnet config + emulators)
npm run build             # Vite production build (default .env → build/)
npm run build:testnet     # vite build --mode testnet (.env.testnet)
npm run build:mainnet     # vite build --mode mainnet (.env.mainnet)
npm test                  # Vitest, run once (npm run test:watch for watch mode)
npm test -- src/App.test.tsx   # run a single test file
npm run lint              # eslint over src
npm run format            # eslint --fix + prettier --write over src
```

Cloud Functions (run from `functions/`):

```bash
npm run build             # tsc → lib/
npm run build:watch       # tsc --watch
npm run serve             # build + start functions emulator
npm run logs              # tail deployed function logs
```

Local full-stack development uses the Firebase emulator suite (auth 9099,
functions 5001, firestore 8080, hosting 5000, pubsub 8085, storage 9199).
`src/configs/firebase.ts` auto-connects to these emulators whenever
`import.meta.env.DEV` is true (i.e. under `npm start` / `vite`).

## Build & config specifics

- Build tooling is **Vite** (`vite.config.ts`), not CRA. The Node builtins the
  Symbol SDK needs in the browser (`Buffer`, `crypto`, `process`, ...) are
  provided by `vite-plugin-node-polyfills`. Tests run on **Vitest** (jsdom).
- Environment is selected by Vite **mode**: `.env` (default / production build),
  `.env.testnet` (`--mode testnet`), `.env.mainnet` (`--mode mainnet`). Vars keep
  the `REACT_APP_` prefix (Vite `envPrefix`) and are read via
  `import.meta.env.REACT_APP_*` (not `process.env`). The key switch is
  `REACT_APP_SYMBOL_PREFIX` (`T` = testnet, `N` = mainnet) and
  `REACT_APP_SYMBOL_NODES` (comma-separated Symbol node hostnames); most
  network/UI branching keys off `SYMBOL_PREFIX` in `src/configs/symbol.ts`.
- Functions REST/WebSocket calls hit Symbol nodes at `https://<node>:3001`
  (and `wss://<node>:3001/ws`); a node is picked at random per call via
  `selectRandomNode()`. When transactions aren't being detected, a bad node in
  the env list is a common cause.
- **Env files are committed on purpose, and only hold non-secret config.** The
  `.env*` (root) and `functions/.env*` files are checked in following Vite's /
  Firebase's convention (`.env` + `.env.[mode|alias]` tracked; secret overrides
  go in `.env*.local`, which is gitignored — see `.env.example`). The Firebase
  Web config keys are **public client identifiers, not secrets** (access is
  governed by Firestore rules / Auth, and the browser API keys are
  HTTP-referrer/API-restricted in Google Cloud). GitHub Secret Scanning flags the
  Firebase `apiKey` as a `google_api_key`; those alerts are intentionally
  resolved as `wont_fix`. Never put a real secret in a tracked `.env*`; use
  `.env*.local` or Cloud Secret Manager (`defineSecret`) instead.

## Deployment

- Hosting serves the Vite `build/` dir (`vite.config.ts` sets
  `build.outDir: 'build'`) with a SPA rewrite (`** → /index.html`).
- CI/CD via GitHub Actions: `ci-react.yml` / `ci-functions.yml` build on PRs
  (each gated by `npm audit --audit-level=high`). **Push to `main` auto-deploys
  to testnet** (`cd-testnet-firebase.yml`). Mainnet deploy is **manual only**
  (`workflow_dispatch` on `cd-mainnet-firebase.yml`). Deploys authenticate
  keylessly via OIDC + Workload Identity Federation (no `FIREBASE_TOKEN`).
  Firebase project aliases live in `.firebaserc`.

## Architecture

### Frontend routing → filesystem convention
`src/App.tsx` is the single source of truth for routes. Page components live
under `src/components/page/` in a path structure that **mirrors the URL**, using
Next.js-style bracket folders (`users/[userId]/stores/[storeId]/items/[itemId]/`).
All pages are code-split with `@loadable/component`. Reusable presentational
components are in `src/components/ui/`. There is no central data-model/types
directory — domain types are colocated with the components and functions that use
them.

### Two views of the same data: private vs. public, buyer vs. store
Firestore is organized so each entity has multiple copies for different
audiences, and **Cloud Functions keep the copies in sync** — the client never
writes the public/cross-party copies directly (the rules forbid it). Key paths
(see `firestore.rules`, which is the authoritative map of the data model):

- `users/{userId}` — private user profile.
- `users/{userId}/stores/{storeId}` — a store. By convention `storeId === userId`
  (one store per user; rules enforce `uid == userId && uid == storeId`).
- `users/{userId}/stores/{storeId}/items/{itemId}` — private item.
- `users/{userId}/orders/{orderId}` — order from the **buyer's** view (buyer may
  create; only admin/functions may update).
- `users/{userId}/stores/{storeId}/orders/{orderId}` — same order copied to the
  **store's** view by a function.
- `stores/{storeId}` and `stores/{storeId}/items/{itemId}` — **public** read-only
  copies populated by `storeOnCreate/Update` and `itemOnCreate/Update`.
- `exchanges/.../currencies/...` — public XYM/JPY price ticker.
- `configs/{configId}` — public feature flags (`enableCreateOrder`,
  `enableCreateItem`, etc.; see `src/configs/config.ts`).

### Cloud Functions (`functions/src/index.ts` exports them all)
- Firestore triggers (`*OnCreate`/`*OnUpdate` per entity) propagate data into the
  public and store-side copies described above.
- `httpsOnCall*` callables handle KYC verification and store
  email/phone/address verification challenges.
- `priceZaifXymJpyPubSub` is a scheduled job pulling the XYM/JPY price from the
  Zaif exchange into the price ticker collection.
- Functions are deployed to region `asia-northeast1` (the client also targets
  this region in `firebase.ts`).

### Order & payment flow (the core domain logic)
An order moves through `orderStatus`: `WAITING_PRICE_INFO → PENDING →
UNCONFIRMED → CONFIRMED` (and `SENT`). The buyer signs/sends an XYM transfer to
the store's Symbol address with the **orderId as the transaction message**.
`orders/orderOnUpdate.ts` watches for the matching transaction two ways:
opening a WebSocket subscription to the node (`unconfirmedAdded`/`confirmedAdded`
for the store address) and polling the REST API
(`searchUnconfirmed/ConfirmedTransactions`). A transaction matches when amount
(`orderTotalPriceCC × 1_000_000`), the network currency mosaic id, **and** the
decoded message (== orderId) all agree; the function then advances the order
status. `src/configs/symbol.ts` builds the unsigned transfer payload and the
`web+symbol://` URI / QR data the buyer's wallet scans.

### KYC / verification gating
Payment-related functions require `customClaims.userKycVerified` on the Firebase
Auth user. Admin-only actions across `firestore.rules` key off
`request.auth.token.admin == true`. Store KYC secrets live in a
`.../kyc/secret` doc readable only by admin.

## Conventions

- TypeScript throughout; ESLint uses `airbnb` + `airbnb-typescript` +
  `prettier`. Run `npm run format` before committing frontend changes.
- Code comments and all user-facing strings are in Japanese — match the existing
  language when editing.
- Node 22 is the pinned runtime for functions (`functions/package.json` engines)
  and the CI/CD baseline.
