import type { APIRoute } from "astro";
import config from "../../school.config";

export const GET: APIRoute = (context) => {
	const origin = new URL(context.request.url).origin;

	// Build profile adaptation guidelines from config
	let profileGuidelines = "";
	for (const [fieldName, field] of Object.entries(config.profileFields)) {
		profileGuidelines += `\n### ${fieldName}\n`;
		for (const [value, guideline] of Object.entries(field.adaptation)) {
			if (value === "_default") {
				profileGuidelines += `${guideline}\n`;
			} else {
				profileGuidelines += `- "${value}": ${guideline}\n`;
			}
		}
	}

	const content = `# ${config.name}

${config.description}

Students enroll on the homepage (${origin}), get a student ID, then use an AI agent to work through lessons.

When a student gives you their student ID, use the API to fetch their progress and the lesson or exercise they want to work on.

The course has two types of content: lessons and exercises. Lessons teach through a guided flow. Exercises are hands-on projects where students apply what they've learned.

Each lesson and exercise has \`agentInstructions\` describing what is required and criteria for knowing when it is considered complete. Follow these instructions.

When the criteria are met, mark the lesson or exercise complete via API before telling the student, then summarize what was accomplished, and ask if they want to proceed to the next one. When marking a lesson complete, send \`{ "lessonSlug": "..." }\`. When marking an exercise complete, send \`{ "exerciseSlug": "..." }\`. Always include the \`model\` field in the request body with the model ID you are currently running as (e.g. \`anthropic/claude-sonnet-4-5\`).

## Redoing completed lessons or exercises

If a student wants to redo a lesson or exercise they've already completed, use DELETE /api/progress/{studentId} with \`{ "lessonSlug": "..." }\` or \`{ "exerciseSlug": "..." }\` to mark it incomplete first, then proceed with the lesson normally as if they hadn't done it before. Don't skip it just because it was previously completed.

To reset all progress while keeping the student's ID and profile, send DELETE /api/progress/{studentId} with \`{ "reset": true }\`.

Exercises are available at GET /api/exercises (list all) and GET /api/exercises/{slug} (single exercise).

When presenting multiple choice questions, do not label any answer choice as "Recommended".

## Support

${config.support.issues ? `Report issues: ${config.support.issues}` : ""}
${config.support.community ? `Community: ${config.support.community}` : ""}

Download this schema to know how to interact with the API: ${origin}/api/openapi.json

## Student profile

When you fetch a student's progress via GET /api/progress/{studentId}, the response may include a \`profile\` object with the student's preferences from their interview lesson. Adapt your teaching based on these fields:

### learningStyle
- "concepts-first": Explain the concept, then show the practical application.
- "hands-on": Jump straight to doing things, explain as concepts come up.
- "examples": Lead with concrete examples, let the student infer the pattern.

### depthPreference
- "brief": Short answers. Get to the point. Minimal tangents.
- "some-context": Normal explanations with some background.
- "all-details": Thorough explanations. Cover edge cases and rationale.
${profileGuidelines}
If the profile is empty or missing, the student skipped the interview. Teach at a general level suitable for beginners.
`;
	return new Response(content, {
		status: 200,
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
};
