"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Post, PostPrivacy, postsApi } from "@/lib/postsApi";
import Avatar from "./Avatar";

import {ImagePlus, Smile} from "lucide-react";

type PostComposerProps = {
    onCreated: (post: Post) => void;
};

const MOODS = ["😊", "😄", "🔥", "❤️", "🎉", "🤔", "😎", "🥳"];

export default function PostComposer({ onCreated }: PostComposerProps) {
    const { user } = useAuth();
    const [content, setContent] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [showImage, setShowImage] = useState(false);
    const [showMoods, setShowMoods] = useState(false);
    const [privacy, setPrivacy] = useState<PostPrivacy>("PUBLIC");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if ((!content.trim() && !imageUrl.trim()) || submitting) return;

        setSubmitting(true);
        setError(null);
        try {
            const created = await postsApi.createPost({
                content: content.trim() || undefined,
                imageUrl: imageUrl.trim() || undefined,
                privacy,
            });
            onCreated(created);
            setContent("");
            setImageUrl("");
            setShowImage(false);
            setPrivacy("PUBLIC");
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
                <Avatar firstName={user?.firstName} lastName={user?.lastName} src={user?.avatarUrl} size={44} />
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={`Quoi de neuf, ${user?.firstName ?? ""} ?`}
                    rows={3}
                    className="min-h-[64px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white"
                />
            </div>

            {showImage && (
                <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Collez l'URL d'une image..."
                    className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:bg-white"
                />
            )}

            {showMoods && (
                <div className="mt-3 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
                    {MOODS.map((mood) => (
                        <button
                            key={mood}
                            type="button"
                            onClick={() => setContent((c) => `${c}${mood}`)}
                            className="rounded-lg px-2 py-1 text-lg transition hover:bg-white"
                        >
                            {mood}
                        </button>
                    ))}
                </div>
            )}

            {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => setShowImage((v) => !v)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                            showImage ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        <ImagePlus size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowMoods((v) => !v)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                            showMoods ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        <Smile size={16} className="inline mr-1" /> Humeur
                    </button>
                    <select
                        value={privacy}
                        onChange={(e) => setPrivacy(e.target.value as PostPrivacy)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-600 outline-none focus:border-indigo-400"
                    >
                        <option value="PUBLIC">🌍 Public</option>
                        <option value="FOLLOWERS">👥 Abonnés</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={submitting || (!content.trim() && !imageUrl.trim())}
                    className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {submitting ? "Publication..." : "Publier"}
                </button>
            </div>
        </form>
    );
}
