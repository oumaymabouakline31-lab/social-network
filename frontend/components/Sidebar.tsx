"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Avatar from "./Avatar";

import { Home, User, Users, MessageCircle, Bell, LogOut, Sparkles } from "lucide-react";

const NAV_ITEMS = [
    { href: "/", label: "Fil d'actualité", icon: Home },
    { href: "/profile/me", label: "Mon profil", icon: User },
    { href: "/groups", label: "Groupes", icon: Users },
    { href: "/messages", label: "Messages", icon: MessageCircle },
    { href: "/notifications", label: "Notifications", icon: Bell },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();

    async function handleLogout() {
        await logout();
        router.push("/login");
    }

    return (
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-64 flex-col lg:flex">
            <div className="flex flex-1 flex-col overflow-y-auto rounded-2xl bg-slate-900 p-4 text-slate-200 shadow-sm">
                <Link href="/" className="mb-6 flex items-center gap-2 px-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-lg text-white">
                        <Sparkles size={18} />
                    </span>
                    <span className="text-lg font-bold text-white">SocialNet</span>
                </Link>

                <div className="mb-5 flex items-center gap-3 rounded-xl bg-slate-800 p-3">
                    <Avatar firstName={user?.firstName} lastName={user?.lastName} src={user?.avatarUrl} size={44} online />
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="truncate text-xs text-slate-400">{user?.email}</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const active =
                            item.href === "/"
                                ? pathname === "/"
                                : pathname === item.href || pathname.startsWith(`${item.href}/`);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                    }`}
                            >
                                <Icon size={18} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <button
                    onClick={handleLogout}
                    className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-rose-500/20 hover:text-rose-300"
                >
                    <span className="text-base">
                        <LogOut size={16} />
                    </span>
                    Se déconnecter
                </button>
            </div>
        </aside>
    );
}
