# Security Audit — temp-splitwise
**Date**: 2026-03-28 | **Status**: Paused

## Secrets in Git History
No secrets found in git history. No `.env`, `.pem`, `.key`, or service account files were ever committed.

## Credentials on Disk
- `.env` contains a **live Turso auth token** (JWT) and database URL. File is gitignored.
- `.env.local` contains a SaaS Maker API key (`pk_...`). File is gitignored.
- `backend/.env.example` contains a sample Postgres connection string with dummy password — acceptable.

## Deployment
No deployment artifacts found (no `.vercel/`, `wrangler.toml`, `netlify.toml`, or `firebase.json`).

## Code Security
- **CORS**: `cors` package is a dependency but no custom CORS config found in source — no wide-open `*` origin.
- **XSS**: No `dangerouslySetInnerHTML` usage found.
- **Hardcoded secrets**: None. API keys are loaded from env vars via `import.meta.env`.

## Action Items
- [ ] Rotate the Turso auth token in `.env` — it is a live JWT sitting on disk for a paused project
- [ ] Consider deleting `.env` and `.env.local` entirely since the project is paused
