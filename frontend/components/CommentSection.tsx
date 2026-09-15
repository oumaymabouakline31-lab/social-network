"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { CommentItem, formatRelativeTime, postsApi } from "@/lib/postsApi";
import Avatar from "./Avatar";

type CommentSectionProps = {
    postId: string;
};

export default function CommentSection({ postId }: CommentSectionProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        postsApi
            .getComments(postId)
            .then((data) => active && setComments(data))
            .catch((err) => active && setError((err as Error).message))
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, [postId]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!text.trim() || sending) return;
        setSending(true);
        try {
            const created = await postsApi.createComment(postId, text.trim());
            setComments((prev) => [...prev, created]);
            setText("");
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="mt-3 border-t border-slate-100 pt-3">
            {loading ? (
                <p className="py-2 text-center text-xs text-slate-400">Chargement des commentaires...</p>
            ) : comments.length === 0 ? (
                <p className="py-2 text-center text-xs text-slate-400">Soyez le premier à commenter.</p>
            ) : (
                <ul className="space-y-3">
                    {comments.map((comment) => (
                        <li key={comment.id} className="flex items-start gap-2.5">
                            <Avatar
                                firstName={comment.authorFirstName}
                                lastName={comment.authorLastName}
                                src={comment.authorAvatarUrl}
                                size={32}
                            />
                            <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2">
                                <div className="flex items-baseline gap-2">
                                    <p className="text-xs font-semibold text-slate-900">
                                        {comment.authorFirstName} {comment.authorLastName}
                                    </p>
                                    <span className="text-[10px] text-slate-400">{formatRelativeTime(comment.createdAt)}</span>
                                </div>
                                <p className="mt-0.5 whitespace-pre-line break-words text-sm text-slate-700">
                                    {comment.content}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}

            <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2.5">
                <Avatar firstName={user?.firstName} lastName={user?.lastName} src={user?.avatarUrl} size={32} />
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Écrire un commentaire..."
                    className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white"
                />
                <button
                    type="submit"
                    disabled={sending || !text.trim()}
                    className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Envoyer
                </button>
            </form>
        </div>
    );
}
