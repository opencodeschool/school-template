## Project overview

This is a template repository for building interactive, agent-driven schools on any topic. Students enroll on a website, then learn inside an AI agent of their choice (OpenCode, Claude Code, Gemini CLI, Codex, or others). Built with Astro 6, deployed to Cloudflare Workers, with student progress tracked via Cloudflare KV.

See [README.md](README.md) for setup instructions and [skill/SKILL.md](skill/SKILL.md) for the scaffolding workflow that guides a school creator through customizing the template.

## Stack

- [Astro](https://astro.build) (v6, SSR mode) with MDX for lesson content
- [Cloudflare Workers](https://workers.cloudflare.com) for hosting
- [Cloudflare KV](https://developers.cloudflare.com/kv/) for student progress storage (binding: `PROGRESS`)
- [Tailwind CSS](https://tailwindcss.com) (v4) for styling
- [Biome](https://biomejs.dev) for linting and formatting
- [Vitest](https://vitest.dev) for testing

## Config-driven architecture

Everything school-specific lives in `school.config.ts` at the repo root. The infrastructure code reads from this config:

- `src/lib/student-id.ts` reads adjective/noun word lists for ID generation
- `src/pages/llms.txt.ts` reads school name, description, and profile adaptation guidelines
- `src/pages/api/openapi.json.ts` reads school name for the API spec title
- `src/pages/api/profile/[studentId].ts` validates all profile fields against options defined in config
- `src/pages/api/lessons/[slug].ts` injects interview questions from config via the `{interviewQuestions}` placeholder

The `SchoolConfig` type is defined in `src/lib/school.ts`.

## Content system

Lessons are MDX files in `src/content/lessons/`. Exercises are in `src/content/exercises/`. The frontmatter schema is defined in `src/content.config.ts` using Zod.

Lesson frontmatter includes:
- `title`, `slug`, `description`, `order`: standard metadata
- `quiz`: whether to append the shared quiz boilerplate to agentInstructions
- `agentOnly`: whether only an agent can mark it complete (used for the interview)
- `agentInstructions`: describes what "done" looks like and how to verify it

For quiz-enabled lessons, `agentInstructions` should list exactly four topics. The quiz mechanics are injected automatically by the API from `src/lib/quiz-instructions.ts`.

Always use YAML literal block scalars (`|`) for `agentInstructions`, never quoted strings. Use `{/* */}` for comments in MDX files, not HTML comments (`<!-- -->`).

## API endpoints

All endpoints return JSON with CORS headers. No authentication. See `src/pages/api/openapi.json.ts` for the full OpenAPI 3.1 spec.

Key endpoints: enroll (`POST /api/enroll`), progress (`GET/PUT/DELETE /api/progress/{studentId}`), profile (`GET/PUT /api/profile/{studentId}`), lessons (`GET /api/lessons`, `GET /api/lessons/{slug}`), exercises (`GET /api/exercises`, `GET /api/exercises/{slug}`).

## Agent discovery

Two files make the school discoverable to AI agents:
- `/llms.txt`: plain-text overview with API usage instructions and profile adaptation guidelines
- `/api/openapi.json`: full OpenAPI 3.1 spec

Both are dynamic routes that use the request origin, not a hardcoded domain.

## Tool agnosticism

All user-facing text and agent-facing instructions use generic language ("your AI agent") rather than referencing any specific tool. The school works with any AI tool that can fetch URLs and converse.

## Styles

Use Tailwind's `stone` palette for dark mode colors. Light mode uses `gray`. Theme colors are CSS custom properties set dynamically based on the student's enrollment color choice.

## Scripts

All tasks have scripts in the `script/` directory. Run `script/lint` before committing.

## CI/CD

- `ci.yml`: lint and test on every PR and non-main push
- `deploy.yml`: build and deploy to Cloudflare Workers on push to main
