# Iyed Boubakri – Portfolio

Personal portfolio of **Iyed Boubakri**, Junior DevOps / DevSecOps / Cloud Engineer (ESPRIT, Tunisia).

**Live site:** https://portfolio-iyed-iota.vercel.app

## Content

- Hero, About, Technical Skills, Featured Projects, Experience, Certifications, Blog, Contact
- `/projects/devsecops-pfe`: a dedicated page for the final-year DevSecOps project (13-stage pipeline explorer, runtime walkthrough, real screenshots)
- `/blog`: Markdown articles in `content/blog/`
- `/recruiter`: **Recruiter mode** (see below)
- **Iyed AI**: a floating recruiter assistant on every page
- Downloadable CV (`public/cv/`)

## Iyed AI – recruiter assistant

| Feature | Where | Needs an LLM? |
|---|---|---|
| Recruiter chat (EN/FR, language auto-detected, sources under each answer) | floating button, every page | yes (falls back to knowledge-base answers) |
| Job description analyzer: deterministic evidence scorecard + AI assessment and interview questions | assistant "Job match" tab, `/recruiter#job` | scorecard: no · assessment: yes |
| Technical interview mode (8 topics, curated questions + AI follow-ups) | assistant "Interview" tab, `/recruiter#interview` | curated: no · generated: yes |
| Project explorer (problem, architecture, tech, contribution, challenges, results, lessons) | `/recruiter#projects` | no |
| Interactive DevSecOps architecture (clickable components, real screenshots) | `/recruiter#architecture` | no |
| Skill evidence (each skill → evidence level + links) | `/recruiter#skills` | no |
| Candidate summary (copy-ready, EN/FR) | `/recruiter#summary` | no (generated from verified data) |
| Contact conversion (email / CV after a useful conversation) | chat | no |

### How it stays truthful

- **Single source of truth:** `src/ai/knowledge.ts` is built from `src/data.ts`, `src/pfe.ts` and Iyed's LinkedIn export. Every skill has an **evidence level**: `project`, `internship`, `training` or `none`.
- **Retrieval grounding:** `src/ai/retrieval.ts` (BM25, no external service) indexes the knowledge base and the blog articles. For each question the server sends the core profile (stable, cached system prompt) plus the most relevant chunks. Sources are returned to the UI.
- **Deterministic job matching:** `src/ai/jobMatch.ts` decides what matches, what is training-only and what is missing. The LLM receives that result as ground truth and only writes the narrative, so it cannot claim a requirement without evidence.
- **The prompt** (`api/_lib/prompt.ts`) forbids invented facts, requires the evidence levels, lists what is not documented (salary, visa, notice period…), and treats job descriptions and recruiter text as untrusted data (prompt-injection resistant).

To change what the assistant knows, edit `src/data.ts` / `src/ai/knowledge.ts` or add a blog article. Nothing else.

### Architecture

```
Browser (React)                          Vercel Function (Node.js)                 LLM provider
──────────────                           ─────────────────────────                 ────────────
Assistant / Recruiter UI ── POST /api/chat ─► origin check → JSON validation
                                              → rate limit (IP + daily cap)
                                              → retrieval (BM25 over KB + blog)
                                              → prompt (cached system + context) ──► Anthropic SDK or
                         ◄── text stream ──── stream tokens, X-Iyed-AI-Sources ◄──── OpenAI-compatible API
                                              (on error / no key: grounded fallback answer)
```

Files:

- `api/chat.ts`: streaming endpoint (Web `Request`/`Response` signature)
- `api/status.ts`: `{ ai: boolean }` so the UI can show "Live AI" or "Knowledge-base mode"
- `api/_lib/validate.ts`: body size, roles, alternation, length limits, mode/topic enums, control-character stripping
- `api/_lib/rateLimit.ts`: per-IP minute/day windows + global daily cap; Upstash Redis if configured, in-memory otherwise
- `api/_lib/providers.ts`: provider switch (Anthropic SDK; Groq, OpenAI, Gemini, OpenRouter, Mistral or any OpenAI-compatible endpoint via fetch)
- `api/_lib/prompt.ts`: system prompt, per-mode prompts, fallback answers
- `src/components/assistant/*`, `src/components/recruiter/*`, `src/pages/Recruiter.tsx`, `src/assistant.css`

Security: API keys are only read server-side (`process.env`, never `VITE_*`), provider error bodies are never forwarded, model output is rendered with a small React Markdown renderer (no `innerHTML`, only `http(s)`, relative and `mailto:` links).

## Environment variables

See `.env.example`.

| Variable | Required | Purpose |
|---|---|---|
| `LLM_PROVIDER` | no* | `anthropic`, `groq`, `openai`, `gemini`, `openrouter`, `mistral`, `openai-compatible` |
| `LLM_API_KEY` | no* | key for that provider (`ANTHROPIC_API_KEY` / `GROQ_API_KEY` / … also work) |
| `LLM_MODEL` | depends | default `claude-opus-5-5` (anthropic), `openai/gpt-oss-120b` (groq); required otherwise |
| `LLM_BASE_URL` | openai-compatible only | e.g. `https://my-gateway/v1` |
| `LLM_FALLBACK_MODEL` | no | used when the main model is rate-limited; Groq default `openai/gpt-oss-20b`, `none` to disable |
| `LLM_REASONING_EFFORT` | no | for reasoning models (gpt-oss, qwen3…), default `low` |
| `LLM_PROFILE` | no | `full` sends the whole knowledge base each time (needs high rate limits); default compact + retrieval |
| `RATE_LIMIT_PER_MINUTE` / `RATE_LIMIT_PER_DAY` | no | per IP, default 8 / 60 |
| `LLM_DAILY_CAP` | no | global LLM calls per day, default 1500 |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | recommended in prod | shared rate-limit counters |
| `ALLOWED_ORIGINS` | no | extra origins allowed to call the API |

\* Without a key the site works fully, and the assistant answers in knowledge-base mode.

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill LLM_PROVIDER / LLM_API_KEY (optional)
npm run dev                  # http://localhost:5173 (the /api routes are served by a Vite plugin)
npm run build                # type-check (app + api) + production build + prerender
npm run lint
```

## Deployment

Every push to `main` is deployed automatically by Vercel. Vercel detects `api/*.ts` as Node.js functions (`vercel.json` sets `maxDuration` and bundles `content/blog/**` for retrieval).

1. Vercel → Project → Settings → Environment Variables: add `LLM_PROVIDER`, `LLM_API_KEY` (and optionally `LLM_MODEL`, Upstash variables) for Production and Preview.
2. Redeploy (env changes apply to new deployments only).
3. Check `https://<domain>/api/status` → `{"ai":true}`.

## Project content

Site text lives in `src/data.ts` (profile, skills, projects, experience, certifications), `src/pfe.ts` (pipeline stages, demo steps, gallery) and `src/ai/knowledge.ts` (evidence levels, project details, architecture nodes, interview bank).
