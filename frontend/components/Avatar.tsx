"use client";

export function resolveAvatarUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("data:") ||
        url.startsWith("blob:")
    ) {
        return url;
    }
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
    return `${apiBase}${url.startsWith("/") ? "" : "/"}${url}`;
}

type AvatarProps = {
    firstName?: string | null;
    lastName?: string | null;
    src?: string | null;
    size?: number;
    online?: boolean;
    className?: string;
};

export default function Avatar({
    firstName,
    lastName,
    src,
    size = 40,
    online = false,
    className = "",
}: AvatarProps) {
    const initials = `${(firstName?.[0] ?? "").toUpperCase()}${(lastName?.[0] ?? "").toUpperCase()}` || "?";
    const resolvedSrc = resolveAvatarUrl(src);

    return (
        <div className={`relative flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
            <div
                className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-indigo-100 font-semibold text-indigo-600"
                style={{ fontSize: size * 0.38 }}
            >
                {resolvedSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resolvedSrc} alt={`${firstName ?? ""} ${lastName ?? ""}`.trim()} className="h-full w-full object-cover" />
                ) : (
                    initials
                )}
            </div>
            {online && (
                <span
                    className="absolute bottom-0 right-0 rounded-full bg-green-400 ring-2 ring-white"
                    style={{ width: size * 0.28, height: size * 0.28 }}
                />
            )}
        </div>
    );
}
