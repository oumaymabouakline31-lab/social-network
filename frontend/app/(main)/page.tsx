"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { profileApi } from "@/lib/profileApi";
import { Post, postsApi } from "@/lib/postsApi";
import PostComposer from "@/components/PostComposer";
import PostCard from "@/components/PostCard";
import UserSearchBar from "@/components/UserSearchBar";

export default function FeedPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) return;
        let active = true;

        (async () => {
            try {
                const following = await profileApi.getFollowing(user.id).catch(() => []);
                const authorIds = [user.id, ...following.map((f) => f.userId)].slice(0, 20);

                const results = await Promise.all(
                    authorIds.map((id) => postsApi.getUserPosts(id).catch(() => []))
                );

                const unique = Array.from(new Map(results.flat().map((p) => [p.id, p])).values());
                unique.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                if (active) setPosts(unique);
            } catch (err) {
                if (active) setError((err as Error).message);
            } finally {
                if (active) setLoading(false);
            }
        })();

        return () => {
            active = false;
        };
    }, [user?.id]);

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-bold text-slate-900">Fil d&apos;actualité</h1>

            <UserSearchBar compact />

            <PostComposer onCreated={(created) => setPosts((prev) => [created, ...prev])} />

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
                    Chargement des publications...
                </div>
            ) : posts.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <FileText size={32} className="mx-auto text-slate-300" />
                    <p className="mt-2 text-sm font-medium text-slate-700">Aucune publication pour le moment.</p>
                    <p className="text-xs text-slate-400">
                        Publiez quelque chose ou suivez des amis pour voir leurs posts.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            onDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
                            onUpdated={(updated) =>
                                setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
