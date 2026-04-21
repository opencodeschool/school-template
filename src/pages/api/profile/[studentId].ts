import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import {
	getProfile,
	type StudentProfile,
	updateProfile,
} from "../../../lib/progress";
import { isValidStudentId } from "../../../lib/student-id";

const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
};

function notFound(message: string) {
	return new Response(JSON.stringify({ error: message }), {
		status: 404,
		headers: { "Content-Type": "application/json", ...corsHeaders },
	});
}

function badRequest(message: string) {
	return new Response(JSON.stringify({ error: message }), {
		status: 400,
		headers: { "Content-Type": "application/json", ...corsHeaders },
	});
}

export const OPTIONS: APIRoute = async () => {
	return new Response(null, { status: 204, headers: corsHeaders });
};

export const GET: APIRoute = async ({ params }) => {
	const { studentId } = params;
	if (!studentId || !isValidStudentId(studentId)) {
		return badRequest("Invalid student ID format");
	}

	const profile = await getProfile(env.PROGRESS, studentId);
	if (profile === null) {
		return notFound("Student not found");
	}

	return new Response(JSON.stringify({ profile }), {
		headers: { "Content-Type": "application/json", ...corsHeaders },
	});
};

const VALID_LEARNING_STYLE = ["concepts-first", "hands-on", "examples"];
const VALID_DEPTH_PREFERENCE = ["brief", "some-context", "all-details"];

function validateProfile(body: Record<string, unknown>): {
	profile: Partial<StudentProfile>;
	errors: string[];
} {
	const profile: Partial<StudentProfile> = {};
	const errors: string[] = [];

	if ("learningStyle" in body) {
		if (VALID_LEARNING_STYLE.includes(body.learningStyle as string)) {
			profile.learningStyle =
				body.learningStyle as StudentProfile["learningStyle"];
		} else {
			errors.push(
				`Invalid learningStyle: must be one of ${VALID_LEARNING_STYLE.join(", ")}`,
			);
		}
	}

	if ("depthPreference" in body) {
		if (VALID_DEPTH_PREFERENCE.includes(body.depthPreference as string)) {
			profile.depthPreference =
				body.depthPreference as StudentProfile["depthPreference"];
		} else {
			errors.push(
				`Invalid depthPreference: must be one of ${VALID_DEPTH_PREFERENCE.join(", ")}`,
			);
		}
	}

	// Accept any other fields from custom profileFields defined in school.config.ts.
	// Custom field validation is left to the school creator.
	for (const [key, value] of Object.entries(body)) {
		if (key === "learningStyle" || key === "depthPreference") continue;
		profile[key] = value as string | string[];
	}

	return { profile, errors };
}

export const PUT: APIRoute = async ({ params, request }) => {
	const { studentId } = params;
	if (!studentId || !isValidStudentId(studentId)) {
		return badRequest("Invalid student ID format");
	}

	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		return badRequest("Invalid JSON body");
	}

	const { profile, errors } = validateProfile(body);
	if (errors.length > 0) {
		return badRequest(errors.join("; "));
	}
	if (Object.keys(profile).length === 0) {
		return badRequest("No valid profile fields provided");
	}

	const updated = await updateProfile(env.PROGRESS, studentId, profile);
	if (updated === null) {
		return notFound("Student not found");
	}

	return new Response(JSON.stringify({ profile: updated }), {
		headers: { "Content-Type": "application/json", ...corsHeaders },
	});
};
