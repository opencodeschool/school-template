import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { mdxToProse } from "../../../lib/mdx-to-prose";
import { QUIZ_INSTRUCTIONS } from "../../../lib/quiz-instructions";

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
};

export const OPTIONS: APIRoute = async () => {
	return new Response(null, { status: 204, headers: corsHeaders });
};

export const GET: APIRoute = async ({ params, request }) => {
	const origin = new URL(request.url).origin;
	const lessons = await getCollection("lessons");
	const lesson = lessons.find((l) => l.data.slug === params.slug);

	if (!lesson) {
		return new Response(JSON.stringify({ error: "Lesson not found" }), {
			status: 404,
			headers: {
				"Content-Type": "application/json",
				...corsHeaders,
			},
		});
	}

	let rawInstructions = lesson.data.agentInstructions;
	if (lesson.data.quiz) {
		rawInstructions += `\n\n${QUIZ_INSTRUCTIONS}`;
	}
	const agentInstructions = rawInstructions.replaceAll("{origin}", origin);

	const result = {
		order: lesson.data.order,
		slug: lesson.data.slug,
		title: lesson.data.title,
		description: lesson.data.description,
		agentOnly: lesson.data.agentOnly,
		agentInstructions,
		content: mdxToProse(lesson.body),
	};

	return new Response(JSON.stringify(result), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
			...corsHeaders,
		},
	});
};
