# school-template

A template for building interactive, agent-driven schools on any topic. Students enroll on a website, then learn inside their AI agent of choice. Built with Astro 6, Cloudflare Workers, and KV.

Based on the architecture of [OpenCode School](https://opencode.school).

## Quick start

Copy and paste this prompt into your agentic coding tool of choice, like OpenCode, Claude Code, Codex, or Gemini CLI:

> Let's create a new school!
>
> Fetch https://raw.githubusercontent.com/opencodeschool/school-template/main/skill/SKILL.md for instructions.

The agent will walk you through the full process: cloning the template, defining your school's subject, designing the interview, planning lessons, and authoring content together.

Not using a coding agent yet? Check out [OpenCode School](https://opencode.school) to learn OpenCode, a free, open-source AI coding agent that works with models from Anthropic, OpenAI, Gemini, and others.

## How it works

Students enroll on the website and get a student ID. They copy a prompt into their AI agent (OpenCode, Claude Code, Gemini CLI, Codex, or others). The agent reads the school's `llms.txt` file to discover the API, fetches the student's progress, and teaches lessons interactively.

Each lesson has two representations: rich HTML on the website for humans, and prose markdown with `agentInstructions` served through the API for agents. The agent teaches the material conversationally, quizzes the student, and marks lessons complete. Progress syncs to the website in real time.

## Project structure

```
school.config.ts          # School name, description, word lists, profile fields
src/
  content/
    lessons/              # MDX lesson files
    exercises/            # MDX exercise files
  lib/
    progress.ts           # KV read/write for student progress
    quiz-instructions.ts  # Shared quiz boilerplate
    mdx-to-prose.ts       # Strip HTML for API
    student-id.ts         # ID generation from school.config word lists
    school.ts             # SchoolConfig type definition
  pages/
    api/                  # REST endpoints (enroll, progress, profile, lessons, exercises)
    llms.txt.ts           # Agent discovery file
    lessons/[slug].astro  # Lesson page template
    index.astro           # Homepage with enrollment
  layouts/Base.astro      # Master layout with sidebar and progress tracking
skill/
  SKILL.md                # Scaffolding skill for creating a new school
script/
  dev, build, lint, deploy, test
```

## Scripts

| Script          | Purpose                            |
| --------------- | ---------------------------------- |
| `script/dev`    | Start the local development server |
| `script/build`  | Build for production               |
| `script/lint`   | Run the Biome linter               |
| `script/test`   | Run tests with Vitest              |
| `script/deploy` | Deploy to Cloudflare Workers       |

## Deployment

Set up GitHub Actions secrets (`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`), then push to main. The deploy workflow builds and deploys automatically.

For manual deployment: `script/deploy`
