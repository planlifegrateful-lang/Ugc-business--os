# UGC Ad Script Engine

React + Vite + TypeScript app for structured UGC ad scripts for TikTok, Reels, Facebook, and YouTube Shorts.

## Security architecture

The browser calls `/api/generate-script`. The Anthropic SDK and `ANTHROPIC_API_KEY` stay in the server function. The browser never receives or stores the provider key.

The UI asks for a private app access code. It is held in component memory only and sent as a Bearer token; it is not saved in localStorage or session history. This is a shared access code, not per-user identity. Do not distribute it publicly.

## Required server environment

Set these values in the server environment only:

- `ANTHROPIC_API_KEY`: Anthropic Console API key.
- `APP_ACCESS_TOKEN`: random shared access code with at least 32 characters.
- `APP_ALLOWED_ORIGINS`: exact comma-separated origins, without paths, trailing slashes, or wildcards. Production origins must use HTTPS.

The API rejects requests if any required setting is missing. It also validates the request body, limits it to 16 KB, checks the Origin header, uses a 45-second provider timeout, and returns sanitized error codes. It does not log prompts or provider responses.

The current endpoint does not provide durable rate limiting or per-user accounts. Before public or multi-user release, add a persistent rate limiter and real identity/access management at the hosting layer.

## Local setup

Use Node.js 22.6 or later.

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` locally:
- Add your Anthropic API key to `ANTHROPIC_API_KEY`.
- Set `APP_ACCESS_TOKEN` to a random value of at least 32 characters (for example, generate one with `openssl rand -hex 32`).
- Keep `APP_ALLOWED_ORIGINS=http://localhost:3000` for local Vercel CLI development.

Run the API and frontend together with the Vercel CLI:

```bash
npx vercel dev
```

Open the local URL shown by Vercel and enter the private app access code in the header. `npm run dev` starts Vite only; it does not run the serverless API route.

## Checks

```bash
npm run test:api
npm run build
npm run validate
```

The API validation tests use Node's built-in test runner and TypeScript type stripping. The build type-checks both the frontend and server function before creating the Vite bundle.

## Deployment notes

Set all three environment variables in the deployment platform's encrypted server environment. Do not use Vite `VITE_*` variables for secrets. Add the exact production domain to `APP_ALLOWED_ORIGINS`; never use `*`.

This repository contains a Vercel Function route. Vercel's Hobby plan is restricted to personal/non-commercial use. Because this engine supports a business workflow, do not deploy it commercially on Hobby; use a plan or hosting provider whose terms permit the intended commercial use. No deployment or hosting-plan status is assumed by this repository.

## Existing behavior

- One to three script variants.
- Platform, hook, tone, objective, duration, and Sharia-compliant framing controls.
- Browser-local session history for generated scripts only.
- Copy and text-download actions.

## Related stack

| Repository | Role |
|---|---|
| [Ugc-business-os](https://github.com/planlifegrateful-lang/Ugc-business-os) | Python/SQLite affiliate-content operations |
| [ai-ugc](https://github.com/planlifegrateful-lang/ai-ugc) | Zero-API content agent |
| [Planlife-agent0-openmanus](https://github.com/planlifegrateful-lang/Planlife-agent0-openmanus) | Video pipeline and local automation |
