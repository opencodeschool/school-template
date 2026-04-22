# School Builder

Build interactive, agent-driven schools on any topic using the school-template.

## How students experience a school

Students start in the browser. They visit the school website, learn what the school teaches, and enroll. Enrollment is instant: they pick a color, click a button, and receive a unique student ID like `curious-atom-4017`. Their enrollment data is stored in a Cloudflare KV store.

Then they move into their AI agent of choice to dive in and start learning. This works with OpenCode, Claude Code, Gemini CLI, Codex, or any AI tool that can fetch URLs and hold a conversation. Students copy a short prompt from the website and paste it into their agent. The prompt contains the student's ID and a link to the school's discovery file. The agent reads this file, discovers the school's API, fetches the student's progress, and is ready to teach.

The first lesson is an interview. The agent asks the student about their experience level, preferred learning style, how much detail they want, and subject-specific questions defined by the school creator. All answers are optional. They're saved to the student's profile and shape every lesson that follows.

From here, students progress through the course material inside their agent in a flexible and engaging way. They learn at their own pace, ask whatever questions they want, and shape the course to their preferences as they go. The agent adapts its teaching based on the student's profile: a beginner gets thorough explanations from scratch, an expert gets concise technical detail. Someone who prefers hands-on learning jumps straight into doing things, while a concepts-first learner gets the theory before the practice.

Each lesson follows a teach-then-quiz flow. The agent covers the material conversationally, pausing for the student to engage with each topic. Then it presents multiple-choice quiz questions. After the student answers, the agent reviews any wrong answers in a friendly way. The lesson is marked complete regardless of quiz score: quizzes are for learning, not gatekeeping.

Progress syncs in real time. When the agent marks a lesson complete via the API, the browser updates within a second: checkmarks appear, and the page navigates to the next lesson. Students work in their agent but see progress reflected on the website as they go.

The school also supports exercises: open-ended projects where students apply what they've learned. Exercises are less structured than lessons, with broader completion criteria.

## Architecture

Four layers:

- Content layer: MDX files with frontmatter and agent instructions
- Web layer: Astro SSR site with lesson pages, enrollment, and progress UI
- API layer: REST endpoints, OpenAPI spec, llms.txt discovery file
- Storage layer: Cloudflare KV for student progress and profiles

Every lesson serves two audiences. Humans read rich HTML on the website. AI agents read prose markdown and structured `agentInstructions` through the API. The `mdxToProse()` function strips HTML from MDX content so agents get clean text.

Agent discovery works through a chain: the agent reads `/llms.txt`, then downloads `/api/openapi.json`, then interacts with the API to fetch lessons, track progress, and manage profiles.

## Scaffolding a new school

### Step 1: Set up the project

Clone from the template:

```
gh repo create {name} --template opencodeschool/school-template --clone
cd {name}
npm install
```

Read `AGENTS.md` in the new repo to understand the codebase structure, stack, and conventions.

Create a KV namespace for student data:

```
npx wrangler kv namespace create PROGRESS
```

This prints a namespace ID. Update `wrangler.jsonc` with the ID.

Initialize git and make a first commit:

```
git add -A && git commit -m "feat: initialize school from template"
```

From here on, commit your progress at natural stopping points. Each step in this process produces a meaningful chunk of work worth saving. Frequent commits give you confidence to experiment and push forward knowing you can always roll back.

### Step 2: Define the school

Ask the creator:
- What is the subject?
- Who is the target audience?
- What should the school be called?
- What domain will it use? (optional)

Fill in `school.config.ts` with the name and description. Update the worker name in `wrangler.jsonc`. Update "My School" in `src/layouts/Base.astro` (appears in the sidebar title, mobile header, page title template, and og:site_name meta tag).

Commit: `feat: define school identity`

### Step 3: Generate student ID vocabulary

Based on the subject, generate 12-15 adjectives and 12-15 nouns that fit the domain. For example:

| School subject   | Adjectives                                                  | Nouns                                                         |
| ---------------- | ----------------------------------------------------------- | ------------------------------------------------------------- |
| Periodic table   | atomic, bonded, charged, cosmic, dense, golden, ionic       | atom, element, electron, isotope, molecule, neutron, photon   |
| Cloudflare       | cached, edged, global, proxied, routed, shielded, tunneled  | worker, stream, tunnel, cache, zone, queue, bucket, gateway   |
| Cooking          | crispy, golden, savory, simmered, smoked, spiced, zesty     | chef, baker, brewer, forager, griller, mixer, slicer, taster  |
| Music theory     | bright, chromatic, harmonic, lyrical, modal, rhythmic, sharp | chord, melody, note, octave, scale, tempo, tone, verse        |

Present the word lists to the creator: "Here are some subject-appropriate words for student IDs. Would you change any?" Write the final lists to `school.config.ts`.

Commit: `feat: add student ID vocabulary`

### Step 4: Design the interview

Discuss with the creator:
- "What do you need to know about a student to teach them well?"
- "What experience levels exist in this domain?"
- "What different backgrounds or roles might students come from?"

Based on the conversation, propose profile fields with questions, options, and adaptation guidelines. Review together: "Here's how the agent would adapt for each answer. Does this match your teaching instincts?"

Good profile fields are:
- Actionable: the agent can meaningfully change its teaching
- Observable: different values produce noticeably different output
- Stable: the preference doesn't change lesson to lesson
- Small cardinality: 3-5 options per field, not free text

All interview questions are defined in `school.config.ts` under `profileFields`. The template ships with `learningStyle` and `depthPreference` as sensible defaults. The creator can keep, modify, or replace them with subject-specific fields.

Interview questions are automatically generated from `profileFields` at serve time, so there is no need to manually edit `01-interview.mdx`. The MDX contains boilerplate instructions and a `{interviewQuestions}` placeholder that is replaced with the questions from config.

Commit: `feat: add interview lesson and profile fields`

### Step 5: Plan the lessons

Ask about topics, order, scope. Generate a lesson plan. Review together. Adjust based on feedback: reorder, split, merge, add, remove. The creator knows their subject; you help structure it into a learnable sequence.

Create stub MDX files for each lesson with frontmatter (title, slug, description, order, quiz: true, agentInstructions with TODO placeholders).

Commit: `feat: add lesson plan`

### Step 6: Author lessons (collaborative loop)

Work through the lessons one at a time with the school creator. This is a flexible, conversational process. Encourage the creator to share ideas, corrections, and tangents as they come up. Spontaneous insights often produce the best content.

For each lesson:

1. Ask: "What should this lesson cover? What are the key things a student should understand after completing it?"
2. Discuss the content together. Ask follow-up questions. The creator brings domain expertise; you help organize it into a teachable structure. If the creator mentions specific examples, common misconceptions, or connections to other lessons, note those for inclusion.
3. Based on the discussion, propose four quiz topics that capture the core of what was covered. Ask: "Do these four topics feel right, or would you adjust any?"
4. Generate a complete draft: MDX body (prose for the website), `agentInstructions` (the four quiz topics with teaching notes), and frontmatter.
5. Mark the lesson as a draft with a `{/* DRAFT */}` comment at the top.
6. Before moving on, check in: "Anything else you want to add or change about this lesson? Any ideas that came to mind while we were discussing it?"

Between lessons, remind the creator that they can revisit earlier lessons at any time. It's common for later lessons to spark ideas about what should have been mentioned earlier. This is a good thing.

Commit after each lesson or batch of lessons: `feat: draft hydrogen lesson` or `feat: draft lessons 2-5`

### Step 7: Author exercises

Based on what the lessons cover, propose exercise ideas: open-ended projects where students apply what they've learned. Discuss with the creator: "What would your students find interesting or useful to build? Are there real-world applications worth exploring?" Walk through each exercise together. Generate drafts.

Commit: `feat: add exercises`

### Step 8: Fill in supporting content

Glossary: pull terms from the lessons that students might not know. Add them to `src/pages/glossary.astro`.

Troubleshooting: the generic content is already there. Add anything subject-specific.

Commit: `feat: add glossary and supporting content`

### Step 9: Review pass

Read through all lessons in order. Check for:
- Consistency in tone and terminology
- Flow between lessons (does each build on the previous?)
- Gaps in coverage
- agentInstructions accuracy (do the four quiz topics match the content?)

Present findings to the creator for final adjustments.

### Step 10: Build and test

```
script/lint
script/build
script/dev
```

Run the dev server locally. Test:
- Enrollment flow in the browser
- Lesson list and navigation
- Copy a lesson prompt and paste it into an AI agent
- Verify the agent can fetch llms.txt, discover the API, and teach a lesson
- Verify progress updates appear in the browser

Commit any fixes: `fix: resolve lint errors`

## Content authoring guide

### Writing agentInstructions

For quiz-enabled lessons, `agentInstructions` should contain:

1. A numbered list of four topics to teach and quiz (one sentence each)
2. Optionally, a verification step for lessons that produce an artifact

The quiz mechanics (teach, quiz, review, mark complete) are injected automatically by the API layer from `src/lib/quiz-instructions.ts`. Don't include quiz instructions in individual lesson files.

Always use YAML literal block scalars (`|`) for agentInstructions in frontmatter, never quoted strings.

### Writing quiz topics

- One topic per quiz question
- Topics should cover different aspects of the lesson
- Avoid overlapping topics
- Each topic should be substantial enough to teach and quiz on
- Topics should be factual, unambiguous, and testable via multiple choice

### Writing adaptation guidelines

For each profile field option, write specific instructions for how the agent should change behavior:

Good: "For 'none' chemistry experience, explain what an atom is before discussing structure. Do not assume knowledge of protons, neutrons, or electrons."

Bad: "Adapt to the student's experience level."

Each option should produce measurably different agent behavior.

## Git discipline

Commit at natural stopping points: after configuring the school identity, after designing the interview, after drafting each lesson or batch of lessons. Run `script/lint` before each commit. Frequent commits give you confidence to experiment. If a generated draft doesn't turn out well, you can always roll back and try a different approach.

## Reference

### school.config.ts

```typescript
interface SchoolConfig {
  name: string;              // School name, shown in UI and API
  description: string;       // One-line description
  adjectives: string[];      // 12-15 words for student ID generation
  nouns: string[];           // 12-15 words for student ID generation
  colors: string[];          // 18 Tailwind color names for enrollment
  profileFields: Record<string, ProfileField>;  // Subject-specific interview questions
  support: {
    issues: string;          // URL for reporting school issues
    community?: string;      // Optional community link
  };
}
```

### MDX frontmatter (lessons)

```yaml
title: string       # Lesson title (sentence case)
slug: string        # URL slug (kebab-case)
description: string # One-line description
order: number       # Display order (1-based)
quiz: boolean       # Whether to append quiz boilerplate
agentOnly: boolean  # Whether only an agent can mark it complete (default false)
agentInstructions: |
  Multi-line instructions for the agent...
```

### MDX frontmatter (exercises)

```yaml
title: string
slug: string
description: string
order: number
agentInstructions: |
  Multi-line instructions...
```

### API endpoints

| Method | Path                          | Purpose                    |
| ------ | ----------------------------- | -------------------------- |
| GET    | /llms.txt                     | Agent discovery            |
| GET    | /api/openapi.json             | OpenAPI 3.1 spec           |
| GET    | /api/lessons                  | List all lessons           |
| GET    | /api/lessons/{slug}           | Single lesson              |
| GET    | /api/exercises                | List all exercises         |
| GET    | /api/exercises/{slug}         | Single exercise            |
| POST   | /api/enroll                   | Create student             |
| GET    | /api/progress/{studentId}     | Get progress               |
| PUT    | /api/progress/{studentId}     | Mark lesson/exercise done  |
| DELETE | /api/progress/{studentId}     | Undo completion or reset   |
| GET    | /api/profile/{studentId}      | Get profile                |
| PUT    | /api/profile/{studentId}      | Update profile             |

### KV data model

Key: `student:{studentId}` (e.g., `student:curious-atom-4017`)

```typescript
interface StudentProgress {
  completedLessons: Array<{
    slug: string;
    completedAt: string;     // ISO timestamp
    source: "browser" | "agent";
    model?: string;          // e.g. "anthropic/claude-sonnet-4-5"
  }>;
  completedExercises: Array<{
    slug: string;
    completedAt: string;
    source: "browser" | "agent";
    model?: string;
  }>;
  profile?: Record<string, unknown>;  // From the interview
  createdAt: string;
  updatedAt: string;
  deviceId?: string;
}
```
