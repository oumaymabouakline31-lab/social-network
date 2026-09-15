const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: "include",
        headers: { "Content-Type": "application/json", ...options.headers },
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `Request failed: ${res.status}`);
    }

    if (res.status === 204) {
        return undefined as T;
    }

    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
}
