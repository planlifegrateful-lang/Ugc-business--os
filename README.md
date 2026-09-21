# UGC Ad Script Engine

Production React engine for structured UGC ad scripts with secure, operator-friendly workflows.

## Mission

This repo turns a brief into structured ad scripts for TikTok, Reels, Facebook, and YouTube Shorts, with a focus on creator handoff and repeatable script production.

## Production safety note

This project is in a hardening phase. The app must not ship with browser-side Anthropic API keys in production. Browser storage is not a secure secret boundary and can leak credentials through logs, DOM inspection, snapshots, or third-party integrations.

Use a secure backend or serverless proxy for any live model calls:

- Keep the API key on the server only.
- Expose a single authenticated endpoint such as `/api/generate-script`.
- Validate request origin and rate-limit usage.
- Never commit real credentials or production keys into GitHub.

## Architecture

- Frontend: React + Vite + TypeScript
- Model access: secure backend proxy
- Output: structured script variants with copy/download workflow
- Persistence: browser localStorage for non-sensitive session history only

## Local setup

```bash
git clone https://github.com/planlifegrateful-lang/Ugc-business--os.git
cd Ugc-business--os
cp .env.example .env
npm install
npm run validate
npm run dev
```

## Deployment

- Set production environment variables on the host or platform, not in the browser bundle.
- If the app is hosted on Vercel or another static host, route model calls through an API endpoint or serverless function.
- Keep the frontend UI free of any secret material.

## Commands

```bash
npm run dev      # local development
npm run build     # production bundle
npm run validate  # smoke validation via build
npm run ci        # same as validate for CI use
```

## Security posture

- Do not store secrets in `localStorage`.
- Do not embed API keys in `index.html` or frontend code.
- Do not log prompt payloads or sensitive model outputs in production.
- Treat the browser as a UI layer only.

## Related stack

| Repo | Role |
|------|------|
| [Ugc-business--os](https://github.com/planlifegrateful-lang/Ugc-business--os) | This engine |
| [ai-ugc](https://github.com/planlifegrateful-lang/ai-ugc) | Zero-API content agent |
| [Planlife-agent0-openmanus](https://github.com/planlifegrateful-lang/Planlife-agent0-openmanus) | Video pipeline + Manus tasks |
| [Planlife-agent0-openmanus](https://github.com/planlifegrateful-lang/Planlife-agent0-openmanus) | System integration layer |

## Roadmap to 10/10

- Secure API boundary
- Add a CI smoke test for build and type correctness
- Add a health check for provider integration
- Split UI logic from server proxy logic
- Add release notes and deployment runbook
