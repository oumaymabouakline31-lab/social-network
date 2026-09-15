"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { User } from "@/context/AuthContext";
import Avatar from "@/components/Avatar";

export default function UserSearchBar({ compact = false }: { compact?: boolean }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Recherche avec Debounce (300ms)
    useEffect(() => {
        if (!query.trim()) return;

        const timeoutId = setTimeout(async () => {
            setLoading(true);
            try {
                const users = await apiFetch<User[]>(`/api/users/search?query=${encodeURIComponent(query.trim())}`);
                setResults(users);
                setIsOpen(true);
            } catch (err) {
                console.error("Search error:", err);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    // Fermeture lors d'un clic en dehors
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className={`relative w-full ${compact ? "max-w-sm" : "max-w-md mx-auto"}`}>
            {/* Champ de saisie */}
            <div className="relative">
                <Search
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        const value = e.target.value;
                        setQuery(value);
                        if (!value.trim()) {
                            setResults([]);
                            setIsOpen(false);
                            setLoading(false);
                        }
                    }}
                    onFocus={() => query.trim() && setIsOpen(true)}
                    placeholder={compact ? "Rechercher un utilisateur..." : "Rechercher un utilisateur (nom, pseudo)..."}
                    className={`w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 ${
                        compact ? "py-1.5" : "py-2"
                    }`}
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery("");
                            setResults([]);
                            setIsOpen(false);
                            setLoading(false);
                        }}
                        aria-label="Effacer la recherche"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                    >
                        <X size={15} />
                    </button>
                )}
            </div>

            {/* Menu déroulant des résultats */}
            {isOpen && (
                <div className="absolute left-0 right-0 z-50 mt-2 max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                    {loading ? (
                        <div className="p-4 text-center text-xs text-slate-500">Recherche en cours...</div>
                    ) : results.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">
                            Aucun utilisateur trouvé pour « {query} »
                        </div>
                    ) : (
                        results.map((u) => (
                            <Link
                                key={u.id}
                                href={`/profile/${u.id}`}
                                onClick={() => {
                                    setIsOpen(false);
                                    setQuery("");
                                }}
                                className="flex items-center gap-3 p-3 transition-colors hover:bg-slate-50"
                            >
                                <Avatar firstName={u.firstName} lastName={u.lastName} src={u.avatarUrl} size={36} />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-slate-900">
                                        {u.firstName} {u.lastName}
                                    </p>
                                    <p className="truncate text-xs text-slate-500">
                                        {u.nickname ? `@${u.nickname}` : u.email}
                                    </p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
