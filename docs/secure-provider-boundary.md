# Secure provider boundary

## Request flow

```text
Browser -> same-origin /api/generate-script -> authenticated server function -> Anthropic Messages API
```

The browser must never call Anthropic directly. The provider key belongs only in the server environment and is never returned to the client.

## Server controls implemented

- POST-only endpoint and JSON content-type check.
- Exact Origin allowlist through `APP_ALLOWED_ORIGINS`; no wildcard origins.
- Shared Bearer access code through `APP_ACCESS_TOKEN`, held in frontend memory only.
- Minimum 32-character access-code configuration check and constant-time comparison.
- 16 KB request-body limit.
- Allowlisted platform, hook, tone, objective, and variant count.
- Server derives platform duration; it does not trust a client-supplied duration.
- 45-second provider timeout and request-abort propagation.
- Generic error codes; provider internals, prompts, and responses are not logged.
- No provider key in the browser bundle, localStorage, sessionStorage, URL, or DOM.

## Remaining production controls

- The shared access code is not per-user identity and can be shared or copied by an authorized browser user.
- Durable rate limiting is not implemented. Add host-level or persistent rate limiting before public or multi-user release; an in-memory serverless counter would not be a reliable substitute.
- Set `ANTHROPIC_API_KEY`, `APP_ACCESS_TOKEN`, and exact `APP_ALLOWED_ORIGINS` values in the host's encrypted server environment.
- Keep production origins HTTPS-only.
- Confirm the host's commercial-use terms and function-duration limits before deployment.
- Rotate any provider keys previously pasted into documents or browser tools; do not commit replacement keys.

## Model lifecycle

The previous frontend model ID `claude-sonnet-4-20250514` is retired on the Claude API. The server route uses `claude-sonnet-5-5`, which Anthropic lists as active and as the recommended replacement.

## Verification

Run `npm run test:api` and `npm run build`. A passing local validation suite does not prove the provider key is configured, the deployed function is reachable, or a paid generation succeeds.
