// Shared client API config.
// All client requests share the environment-driven API base.
// The deployed KungaCV backend is used only when no environment value is set.
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://kungacv-api.onrender.com";

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

export const exportResume = async (token, content, isPro = false) => {
    const response = await fetch(`${API_BASE}/resumes/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content, isPro }),
    });
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || `export failed (${response.status})`);
    }
    return response.blob();
};
