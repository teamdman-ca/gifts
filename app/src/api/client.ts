import { invalidate } from "$app/navigation";
import { error } from "@sveltejs/kit";
import { auth, AuthData } from "../stores/auth";

export interface DetailedError {
	type: string;
	title: string;
	status: number;
	detail: string;
	traceId: string;
	errors: Record<string, string>;
}

let $authData = new AuthData();
auth.subscribe(v => $authData = v);

export async function assertAuth(fetch: typeof window.fetch, returnUrl: string | URL) {
	if ($authData.expired && !(await refreshJwt(fetch))) {
		throw error(401, {
			message: "Not authenticated",
			returnUrl: returnUrl.toString(),
		});
	}
}

let refreshingJwt = false;
export async function refreshJwt(fetch: typeof window.fetch) {
	refreshingJwt = true;
	try {
		console.log("Refreshing JWT with refresh token");
		if ($authData.refreshToken === null) {
			console.log("refresh token not found uwu");
			return false;
		}
		const resp = await apiFetch<{ token: string }>(fetch, "/Token/Refresh", {
			method: "POST",
			body: JSON.stringify({
				refreshToken: $authData.refreshToken,
			}),
		});
		$authData.jwt = resp.token;
		auth.set($authData);
	} finally {
		refreshingJwt = false;
	}
}

export async function apiFetch<T>(
	fetch: typeof window.fetch,
	path: string,
	options: RequestInit = {},
): Promise<T> {
	try {
		if ($authData.expired && !refreshingJwt) await refreshJwt(fetch);
		const resp = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
			...options,
			headers: {
				...$authData.headers,
				"Content-Type": "application/json",
				...options.headers,
			},
		});
		if (resp.ok) {
			const text = await resp.text();
			if (text.trim().length === 0) {
				console.warn("apiFetch response empty, returning empty object");
				return {} as T;
			}
			return JSON.parse(text);
		} else {
			throw await error(resp.status, "apiFetch response not ok: " + await resp.text());
		}
	} catch (e) {
		throw await error(400, "apiFetch errored: " + e.message + " --- " + JSON.stringify(e));
	}
}

export async function apiInvalidate(path: string) {
	await invalidate(`${import.meta.env.VITE_API_URL}${path}`);
}
export function apiDepends(depends:(...deps: string[]) => void, ...deps: string[]) {
	for(const path of deps) {
		depends(`${import.meta.env.VITE_API_URL}${path}`);
	}
}