# Iyed Boubakri – Portfolio

Personal portfolio of **Iyed Boubakri**, Junior DevOps / DevSecOps / Cloud Engineer (ESPRIT, Tunisia).

**Live site:** https://portfolio-iyed-iota.vercel.app

## Content

- Hero, About, Technical Skills, Featured Projects, Experience, Certifications, Contact
- `/projects/devsecops-pfe`: a dedicated page for the final-year DevSecOps project, with
  - an interactive explorer of the 13 GitLab CI/CD stages
  - a step-by-step walkthrough of the runtime loop: attack → Falco → AI agent (Groq / Llama 3.3) → Slack approval → patch
  - real screenshots from the project environment (the PFE cluster has been shut down, so there is no live production URL)
- Downloadable CV (`public/cv/`)

## Stack

React 19 · TypeScript · Vite. No UI framework and no router dependency. A small history-based router plus `vercel.json` rewrites serve `/projects/*`.

SEO: meta and Open Graph tags, JSON-LD `Person`, `sitemap.xml`, `robots.txt`. Images are served as WebP (about 0.9 MB for all screenshots).

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build in dist/
npm run lint
```

## Deployment

Every push to `main` is deployed automatically by Vercel.

## Project content

Site text lives in `src/data.ts` (profile, skills, projects, experience, certifications) and `src/pfe.ts` (pipeline stages, demo steps, gallery).
