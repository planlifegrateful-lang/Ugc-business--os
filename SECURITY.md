# Security Policy

## Core rule

This project must never ship with live model credentials in the browser. Browser-side storage is not a secure secret boundary.

## Required posture

- Keep all model credentials on a server, API route, or platform-managed secret store.
- Use authenticated server endpoints for generation requests.
- Treat localStorage as safe only for non-sensitive UI state such as session labels or recent templates.
- Do not commit `.env`, private keys, tokens, or generated credentials.

## Production checklist

- Verify no `ANTHROPIC_API_KEY` or similar values exist in frontend source or configuration.
- Verify the frontend only calls a trusted backend endpoint.
- Verify rate limiting and request validation are enabled on the server.
- Verify logs do not include model payloads or sensitive data.

## Emergency response

If a secret is ever exposed:

1. Revoke the key immediately.
2. Rotate the credential in the provider dashboard.
3. Remove and replace the leak in Git history if needed.
4. Re-run the app in a clean environment before resuming deployments.
