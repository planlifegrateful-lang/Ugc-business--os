# Secure provider boundary

## Required production shape

The browser must call an application-owned endpoint, not Anthropic directly:

```text
Browser -> authenticated /api/generate-script -> provider SDK -> structured response
```

The provider key belongs only in the server environment. The frontend may receive a request ID and sanitized result, never the provider credential.

## Minimum endpoint controls

- Validate JSON body and enforce size limits.
- Authenticate or authorize the caller.
- Apply rate limits and request timeouts.
- Allow-list model, temperature, and output schema values.
- Redact prompts and outputs from production logs.
- Return stable error codes without provider internals.
- Add a health check that does not make a paid model request.

## Migration acceptance criteria

- No provider SDK import is bundled into the browser entrypoint.
- No API key is read from `localStorage`, `sessionStorage`, URL parameters, or DOM fields.
- The frontend uses a relative API route or configured trusted origin.
- CI fails if secret-like names are introduced into client source.
