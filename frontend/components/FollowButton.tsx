"use client";

import { useState } from "react";
import { profileApi } from "@/lib/profileApi";

type FollowButtonProps = {
    targetUserId: string;
    initialStatus: "SELF" | "NONE" | "PENDING" | "ACCEPTED";
    isTargetPublic: boolean;
    onStatusChange?: (newStatus: "SELF" | "NONE" | "PENDING" | "ACCEPTED", followersDelta: number) => void;
};

export default function FollowButton({
    targetUserId,
    initialStatus,
    isTargetPublic,
    onStatusChange,
}: FollowButtonProps) {
    const [status, setStatus] = useState(initialStatus);
    const [loading, setLoading] = useState(false);
    const [hovering, setHovering] = useState(false);

    if (status === "SELF") {
        return null;
    }

    async function handleToggleFollow() {
        setLoading(true);
        try {
            const res = await profileApi.toggleFollow(targetUserId);
            let nextStatus: "SELF" | "NONE" | "PENDING" | "ACCEPTED";
            let delta = 0;

            if (res.status === "NONE") {
                // Annulation ou Unfollow
                if (status === "ACCEPTED") delta = -1;
                nextStatus = "NONE";
            } else if (res.status.toLowerCase() === "pending") {
                nextStatus = "PENDING";
            } else {
                nextStatus = "ACCEPTED";
                delta = 1;
            }

            setStatus(nextStatus);
            if (onStatusChange) {
                onStatusChange(nextStatus, delta);
            }
        } catch (err) {
            console.error("Failed to toggle follow:", err);
        } finally {
            setLoading(false);
        }
    }

    if (status === "ACCEPTED") {
        return (
            <button
                onClick={handleToggleFollow}
                disabled={loading}
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    hovering
                        ? "bg-red-50 text-red-600 border-red-200"
                        : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
                }`}
            >
                {loading ? "Chargement..." : hovering ? "Se désabonner" : "Abonné"}
            </button>
        );
    }

    if (status === "PENDING") {
        return (
            <button
                onClick={handleToggleFollow}
                disabled={loading}
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    hovering
                        ? "bg-red-50 text-red-600 border-red-200"
                        : "bg-amber-50 text-amber-700 border-amber-300"
                }`}
            >
                {loading ? "Chargement..." : hovering ? "Annuler la demande" : "Demande envoyée"}
            </button>
        );
    }

    return (
        <button
            onClick={handleToggleFollow}
            disabled={loading}
            className="px-4 py-1.5 rounded-full text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
            {loading ? "Chargement..." : "+ Suivre"}
        </button>
    );
}