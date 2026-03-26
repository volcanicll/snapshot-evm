# Snapshot Voting

A streamlined Snapshot batch voting workspace built with React, Vite, and a modern client-side data stack. The product is designed around one core job: review active proposals, choose vote options, and submit votes with either MetaMask or imported private keys.

## Features

- Load active proposals from one space or all configured spaces
- Search and switch between curated Snapshot spaces
- Review proposals in a compact vote-focused queue
- Submit votes with MetaMask or private-key signing
- Track wallet and vote execution status in one workspace

## Tech Stack

- React 19
- Vite 8
- React Router
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Tailwind CSS
- ethers.js

## Requirements

- Node.js 20+
- Bun 1.2+
- A browser wallet such as MetaMask for wallet-based signing

## Getting Started

```bash
bun install
bun run dev
```

The local Vite server is typically available at `http://localhost:5173`.

## Scripts

```bash
bun run dev
bun run build
bun run preview
bun run lint
```

`bun run deploy` publishes the built `dist` directory through `gh-pages`.

## Project Structure

```text
src/
  components/   UI modules for proposals, wallet panels, and status blocks
  config/       app-level configuration such as curated spaces
  hooks/        reusable React hooks
  lib/          Snapshot API, wallet helpers, and query client setup
  pages/        page composition
  router/       React Router setup
  store/        Zustand workspace state
```

## Voting Workflow

1. Pick a target space or browse all configured spaces.
2. Review active proposals in the proposal list.
3. Select proposals and adjust vote choices.
4. Choose a signing mode: `MetaMask` or `Private Key`.
5. Submit votes and monitor account-level status feedback.

## Configuration

- Curated space definitions live in `src/config/spaces.js`.
- Snapshot API access is implemented in `src/lib/snapshot.js`.
- Wallet helpers are implemented in `src/lib/wallet.js`.
- The current setup does not require any environment variables for local development.

## Safety Notes

- Private keys are handled client-side only and are not sent to your own backend.
- Use a dedicated voting wallet whenever possible.
- Double-check proposal choices before submitting batch votes.

## Build

```bash
bun run build
```

Production assets are output to `dist/`.
