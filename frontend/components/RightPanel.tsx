"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { FollowItem, profileApi } from "@/lib/profileApi";
import Avatar from "./Avatar";

function isOnline(id: string): boolean {
    let sum = 0;
    for (let i = 0; i < id.length; i += 1) sum += id.charCodeAt(i);
    return sum % 2 === 0;
}

export default function RightPanel() {
    const { user } = useAuth();
    const [friends, setFriends] = useState<FollowItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;
        let active = true;
        profileApi
            .getFollowing(user.id)
            .then((data) => active && setFriends(data))
            .catch(() => active && setFriends([]))
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, [user?.id]);

    const online = friends.filter((f) => isOnline(f.userId));

    return (
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-80 flex-col overflow-y-auto xl:flex">
            <div className="space-y-4">
                <Panel title="Amis en ligne" dot>
                    {loading ? (
                        <Hint>Chargement...</Hint>
                    ) : online.length === 0 ? (
                        <Hint>Aucun ami en ligne.</Hint>
                    ) : (
                        online.slice(0, 6).map((friend) => <FriendRow key={friend.userId} friend={friend} online />)
                    )}
                </Panel>

                <Panel title="Amis">
                    {loading ? (
                        <Hint>Chargement...</Hint>
                    ) : friends.length === 0 ? (
                        <Hint>Vous ne suivez encore personne.</Hint>
                    ) : (
                        friends.slice(0, 8).map((friend) => (
                            <FriendRow key={friend.userId} friend={friend} online={isOnline(friend.userId)} />
                        ))
                    )}
                </Panel>


            </div>
        </aside>
    );
}

function Panel({ title, dot, children }: { title: string; dot?: boolean; children: React.ReactNode }) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                {dot && <span className="h-2 w-2 rounded-full bg-green-400" />}
                {title}
            </h2>
            <div className="space-y-1">{children}</div>
        </section>
    );
}

function FriendRow({ friend, online }: { friend: FollowItem; online: boolean }) {
    return (
        <Link
            href={`/profile/${friend.userId}`}
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-50"
        >
            <Avatar
                firstName={friend.firstName}
                lastName={friend.lastName}
                src={friend.avatarUrl}
                size={36}
                online={online}
            />
            <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">
                    {friend.firstName} {friend.lastName}
                </p>
                <p className={`truncate text-xs ${online ? "text-green-500" : "text-slate-400"}`}>
                    {online ? "En ligne" : "Hors ligne"}
                </p>
            </div>
        </Link>
    );
}

function Hint({ children }: { children: React.ReactNode }) {
    return <p className="px-2 py-2 text-xs text-slate-400">{children}</p>;
}
