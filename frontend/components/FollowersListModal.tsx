"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { FollowItem } from "@/lib/profileApi";
import Avatar from "./Avatar";

type FollowersListModalProps = {
    isOpen: boolean;
    title: string;
    items: FollowItem[];
    loading: boolean;
    onClose: () => void;
    isRequestsMode?: boolean;
    onAccept?: (followId: string) => void;
    onReject?: (followId: string) => void;
};

export default function FollowersListModal({
    isOpen,
    title,
    items,
    loading,
    onClose,
    isRequestsMode = false,
    onAccept,
    onReject,
}: FollowersListModalProps) {
    const [query, setQuery] = useState("");

    if (!isOpen) return null;

    const term = query.trim().toLowerCase();
    const filteredItems = term
        ? items.filter((item) =>
              `${item.firstName} ${item.lastName} ${item.nickname ?? ""}`.toLowerCase().includes(term)
          )
        : items;

    function handleClose() {
        setQuery("");
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                    <button
                        onClick={handleClose}
                        aria-label="Fermer"
                        className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Recherche dans la liste courante */}
                {!loading && items.length > 0 && (
                    <div className="border-b border-slate-100 px-4 py-3">
                        <div className="relative">
                            <Search
                                size={16}
                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Rechercher un utilisateur..."
                                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-9 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery("")}
                                    aria-label="Effacer la recherche"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                    {loading ? (
                        <div className="py-8 text-center text-sm text-slate-500">Chargement...</div>
                    ) : items.length === 0 ? (
                        <div className="py-8 text-center text-sm text-slate-400">
                            {isRequestsMode ? "Aucune demande en attente" : "Aucun utilisateur trouvé"}
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="py-8 text-center text-sm text-slate-400">
                            Aucun résultat pour « {query.trim()} »
                        </div>
                    ) : (
                        filteredItems.map((item) => (
                            <div
                                key={item.followId ?? item.userId}
                                className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-slate-50"
                            >
                                <Link
                                    href={`/profile/${item.userId}`}
                                    onClick={handleClose}
                                    className="flex min-w-0 flex-1 items-center space-x-3"
                                >
                                    <Avatar
                                        firstName={item.firstName}
                                        lastName={item.lastName}
                                        src={item.avatarUrl}
                                        size={40}
                                    />
                                    <div className="truncate">
                                        <p className="truncate text-sm font-semibold text-slate-900">
                                            {item.firstName} {item.lastName}
                                        </p>
                                        <p className="truncate text-xs text-slate-500">
                                            {item.nickname ? `@${item.nickname}` : item.email}
                                        </p>
                                    </div>
                                </Link>

                                {isRequestsMode && item.followId && (
                                    <div className="ml-3 flex flex-shrink-0 items-center space-x-2">
                                        <button
                                            onClick={() => onAccept && onAccept(item.followId!)}
                                            className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
                                        >
                                            Accepter
                                        </button>
                                        <button
                                            onClick={() => onReject && onReject(item.followId!)}
                                            className="rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
                                        >
                                            Refuser
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
