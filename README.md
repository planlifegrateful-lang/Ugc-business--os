# UGC Ad Script Engine

Production React engine for structured UGC ad scripts with secure, operator-friendly workflows.

## Mission

This repo turns a brief into structured ad scripts for TikTok, Reels, Facebook, and YouTube Shorts, with a focus on creator handoff and repeatable script production.

## Zero-key guarantee

This version is intentionally designed to work without any API keys in the browser or frontend.
The app generates script variants locally with a deterministic template engine, so it works offline and in production without exposing provider secrets.

## Architecture

- Frontend: React + Vite + TypeScript
- Model access: optional and server-side only, never required for base product behavior
- Output: structured script variants with copy/download workflow
- Persistence: browser localStorage for non-sensitive session history only

## Local setup

```bash
git clone https://github.com/planlifegrateful-lang/Ugc-business--os.git
cd Ugc-business--os
npm install
npm run validate
npm run dev
```

## Deployment

- The app runs without API keys by default.
- If AI is enabled later, keep provider keys on the server only and never in the browser bundle.
- Keep the frontend UI free of any secret material.

## Commands

```bash
npm run dev      # local development
npm run build     # production bundle
npm run validate  # smoke validation via build
npm run ci        # same as validate for CI use
```

## Security posture

- No provider API key is required for the default workflow.
- Do not store secrets in `localStorage`.
- Do not embed API keys in `index.html` or frontend code.
- Treat the browser as a UI layer only.

## Related stack

| Repo | Role |
|------|------|
| [Ugc-business--os](https://github.com/planlifegrateful-lang/Ugc-business--os) | This engine |
| [ai-ugc](https://github.com/planlifegrateful-lang/ai-ugc) | Zero-API content agent |
| [Planlife-agent0-openmanus](https://github.com/planlifegrateful-lang/Planlife-agent0-openmanus) | Video pipeline + Manus tasks |
| [otto-server-wow](https://github.com/planlifegrateful-lang/otto-server-wow) | Controller + dashboard |

## Roadmap to 10/10

- Confirm offline generation path is stable
- Add a CI smoke test for build and type correctness
- Add optional server-side AI integration only behind a secure backend boundary
- Add release notes and deployment runbook
