// Shared client API config.
// Existing auth pages keep their hardcoded URL (kept as-is intentionally);
// new code reads from env with the deployed backend as fallback.
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://flow-cv-backend.onrender.com";

// Display fallbacks — the pricing page prefers the live `/payments/plans` response.
export const PRO_PRICE_MWK = Number(process.env.NEXT_PUBLIC_PRO_PRICE_MWK) || 5000;
export const PRO_PASS_DAYS = Number(process.env.NEXT_PUBLIC_PRO_PASS_DAYS) || 30;

export async function apiFetch(path, options = {}, token) {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        const message = data?.message;
        throw new Error(Array.isArray(message) ? message.join(", ") : message || `request failed (${res.status})`);
    }

    return data;
}

// CV persistence (authenticated).
export const listResumes = (token) => apiFetch("/resumes", {}, token).then((d) => d.resumes || []);

export const fetchResume = (token, resumeUid) => apiFetch(`/resumes/${resumeUid}`, {}, token).then((d) => d.resume);

export const createResume = (token, body) => apiFetch("/resumes", { method: "POST", body: JSON.stringify(body) }, token).then((d) => d.resume);

export const updateResume = (token, resumeUid, body) =>
    apiFetch(`/resumes/${resumeUid}`, { method: "PUT", body: JSON.stringify(body) }, token).then((d) => d.resume);

export const deleteResume = (token, resumeUid) => apiFetch(`/resumes/${resumeUid}`, { method: "DELETE" }, token);

export const duplicateResume = (token, resumeUid) => apiFetch(`/resumes/${resumeUid}/duplicate`, { method: "POST" }, token).then((d) => d.resume);
