# UGC Ad Script Engine

**OMEGA SWARM v10 · Limitless brand system**

Production-ready React engine for generating structured UGC ad scripts via Anthropic (Claude) with live streaming.

## Features

- **Live streaming** output from Anthropic API
- **1–3 variants** per run with tabbed switcher
- Structured parser: **HOOK / PROBLEM / BRIDGE / PROOF / CTA / DIRECTOR NOTE / ESTIMATED RUNTIME**
- Copy + Download All (plain text) for creator handoff
- Platform selector: TikTok, Reels, Facebook, YouTube Shorts (correct max duration)
- 6 hook styles · 6 tone modes (incl. Spiritual/Taqwa) · 5 objectives
- **Sharia compliance toggle** — halal framing, no riba language, ethical persuasion only
- Session history (last 10) in localStorage
- Full dark-luxury black/gold aesthetic

## Quick start

```bash
cd ugc-ad-script-engine   # or root of this repo
npm install
npm run dev
```

Open http://localhost:5173 — paste your Anthropic API key in the header.

## Architecture target

```
Research → AI → UGC → Content → Leads → Digital Product → Funnel → Sales → Analytics → Optimization
```

This module is the **UGC script core**. Next builds:

1. n8n webhook integration (Slack / Notion / Airtable)
2. Batch mode (multi-product overnight)
3. Creator brief PDF export

## Stack

- Vite + React 18 + TypeScript
- `@anthropic-ai/sdk` streaming
- Local-first (API key + history in browser storage only)

## Repo

Part of **Ugc-business--os** — https://github.com/planlifegrateful-lang/Ugc-business--os
