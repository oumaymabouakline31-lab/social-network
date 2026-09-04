"use client";

import Link from "next/link";
import { FollowItem } from "@/lib/profileApi";

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
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500 text-sm">Chargement...</div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            {isRequestsMode ? "Aucune demande en attente" : "Aucun utilisateur trouvé"}
                        </div>
                    ) : (
                        items.map((item) => (
                            <div
                                key={item.followId ?? item.userId}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Link
                                    href={`/profile/${item.userId}`}
                                    onClick={onClose}
                                    className="flex items-center space-x-3 flex-1 min-w-0"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0">
                                        {item.avatarUrl ? (
                                            <img
                                                src={item.avatarUrl}
                                                alt={item.firstName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            `${item.firstName[0]}${item.lastName[0]}`
                                        )}
                                    </div>
                                    <div className="truncate">
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {item.firstName} {item.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {item.nickname ? `@${item.nickname}` : item.email}
                                        </p>
                                    </div>
                                </Link>

                                {isRequestsMode && item.followId && (
                                    <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                                        <button
                                            onClick={() => onAccept && onAccept(item.followId!)}
                                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
                                        >
                                            Accepter
                                        </button>
                                        <button
                                            onClick={() => onReject && onReject(item.followId!)}
                                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-md transition-colors"
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