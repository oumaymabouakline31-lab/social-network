"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { profileApi, Profile, FollowItem, UpdateProfileData } from "@/lib/profileApi";
import FollowButton from "@/components/FollowButton";
import FollowersListModal from "@/components/FollowersListModal";

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const userId = resolvedParams.id;
    const { user: authUser } = useAuth();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // États d'édition
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<UpdateProfileData>({});
    const [saving, setSaving] = useState(false);

    // États de modale pour listes
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        title: string;
        items: FollowItem[];
        loading: boolean;
        isRequests: boolean;
    }>({
        isOpen: false,
        title: "",
        items: [],
        loading: false,
        isRequests: false,
    });

    const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);

    useEffect(() => {
        loadProfile();
    }, [userId]);

    async function loadProfile() {
        setLoading(true);
        setError(null);
        try {
            const data = await profileApi.getProfile(userId);
            setProfile(data);
            setEditForm({
                firstName: data.firstName,
                lastName: data.lastName,
                dateOfBirth: data.dateOfBirth ?? "",
                avatarUrl: data.avatarUrl ?? "",
                nickname: data.nickname ?? "",
                aboutMe: data.aboutMe ?? "",
                isPublic: data.isPublic,
            });

            // Si c'est son propre profil privé, on charge le nombre de demandes en attente
            if (data.followStatus === "SELF" && !data.isPublic) {
                profileApi.getPendingRequests()
                    .then((reqs) => setPendingRequestsCount(reqs.length))
                    .catch(() => {});
            }
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveProfile(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const updated = await profileApi.updateProfile(editForm);
            setProfile(updated);
            setIsEditing(false);
        } catch (err) {
            alert("Erreur lors de la sauvegarde : " + (err as Error).message);
        } finally {
            setSaving(false);
        }
    }

    async function openFollowersModal() {
        if (!profile?.canViewContent) return;
        setModalState({ isOpen: true, title: "Abonnés", items: [], loading: true, isRequests: false });
        try {
            const items = await profileApi.getFollowers(profile.id);
            setModalState((prev) => ({ ...prev, items, loading: false }));
        } catch (err) {
            setModalState((prev) => ({ ...prev, loading: false }));
        }
    }

    async function openFollowingModal() {
        if (!profile?.canViewContent) return;
        setModalState({ isOpen: true, title: "Abonnements", items: [], loading: true, isRequests: false });
        try {
            const items = await profileApi.getFollowing(profile.id);
            setModalState((prev) => ({ ...prev, items, loading: false }));
        } catch (err) {
            setModalState((prev) => ({ ...prev, loading: false }));
        }
    }

    async function openRequestsModal() {
        setModalState({ isOpen: true, title: "Demandes d'abonnements", items: [], loading: true, isRequests: true });
        try {
            const items = await profileApi.getPendingRequests();
            setModalState((prev) => ({ ...prev, items, loading: false }));
        } catch (err) {
            setModalState((prev) => ({ ...prev, loading: false }));
        }
    }

    async function handleAcceptRequest(followId: string) {
        try {
            await profileApi.acceptRequest(followId);
            setModalState((prev) => ({
                ...prev,
                items: prev.items.filter((i) => i.followId !== followId),
            }));
            setPendingRequestsCount((prev) => Math.max(0, prev - 1));
            setProfile((prev) => prev ? { ...prev, followersCount: prev.followersCount + 1 } : prev);
        } catch (err) {
            alert("Erreur : " + (err as Error).message);
        }
    }

    async function handleRejectRequest(followId: string) {
        try {
            await profileApi.rejectRequest(followId);
            setModalState((prev) => ({
                ...prev,
                items: prev.items.filter((i) => i.followId !== followId),
            }));
            setPendingRequestsCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            alert("Erreur : " + (err as Error).message);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500 text-sm">Chargement du profil...</p>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-6 rounded-xl shadow-sm max-w-md w-full text-center">
                    <p className="text-red-600 font-medium mb-4">{error ?? "Profil introuvable"}</p>
                    <Link href="/" className="text-blue-600 hover:underline text-sm">
                        ← Retour à l'accueil
                    </Link>
                </div>
            </div>
        );
    }

    const isSelf = profile.followStatus === "SELF";

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center">
                        ← Accueil
                    </Link>
                </div>

                {/* Carte de Profil */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Bannière */}
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600" />

                    <div className="px-6 pb-6 relative">
                        {/* Avatar & Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 mb-4 gap-4">
                            <div className="w-28 h-28 rounded-full border-4 border-white bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold shadow-md overflow-hidden flex-shrink-0">
                                {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt={profile.firstName} className="w-full h-full object-cover" />
                                ) : (
                                    `${profile.firstName[0]}${profile.lastName[0]}`
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                {isSelf ? (
                                    <>
                                        {!profile.isPublic && pendingRequestsCount > 0 && (
                                            <button
                                                onClick={openRequestsModal}
                                                className="px-3 py-1.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full hover:bg-amber-200 transition-colors"
                                            >
                                                Demandes ({pendingRequestsCount})
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setIsEditing(!isEditing)}
                                            className="px-4 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors"
                                        >
                                            {isEditing ? "Annuler" : "Modifier le profil"}
                                        </button>
                                    </>
                                ) : (
                                    <FollowButton
                                        targetUserId={profile.id}
                                        initialStatus={profile.followStatus}
                                        isTargetPublic={profile.isPublic}
                                        onStatusChange={(newStatus, delta) => {
                                            setProfile((prev) =>
                                                prev
                                                    ? {
                                                          ...prev,
                                                          followStatus: newStatus,
                                                          followersCount: prev.followersCount + delta,
                                                          canViewContent: prev.isPublic || newStatus === "ACCEPTED",
                                                      }
                                                    : prev
                                            );
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Mode Édition de Profil */}
                        {isEditing ? (
                            <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">Prénom</label>
                                        <input
                                            type="text"
                                            value={editForm.firstName}
                                            onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2 border rounded-lg text-sm border-gray-300"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">Nom</label>
                                        <input
                                            type="text"
                                            value={editForm.lastName}
                                            onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2 border rounded-lg text-sm border-gray-300"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">Pseudo</label>
                                        <input
                                            type="text"
                                            value={editForm.nickname ?? ""}
                                            onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2 border rounded-lg text-sm border-gray-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">Date de naissance</label>
                                        <input
                                            type="date"
                                            value={editForm.dateOfBirth ?? ""}
                                            onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2 border rounded-lg text-sm border-gray-300"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700">URL de l'Avatar</label>
                                    <input
                                        type="url"
                                        value={editForm.avatarUrl ?? ""}
                                        onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border rounded-lg text-sm border-gray-300"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700">À propos de moi (Bio)</label>
                                    <textarea
                                        value={editForm.aboutMe ?? ""}
                                        onChange={(e) => setEditForm({ ...editForm, aboutMe: e.target.value })}
                                        rows={3}
                                        className="mt-1 block w-full px-3 py-2 border rounded-lg text-sm border-gray-300"
                                    />
                                </div>

                                {/* Toggle Public / Privé */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {editForm.isPublic ? "Compte Public" : "Compte Privé"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {editForm.isPublic
                                                ? "Tout le monde peut voir votre profil et vos publications."
                                                : "Seuls vos abonnés acceptés peuvent voir vos publications."}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setEditForm({ ...editForm, isPublic: !editForm.isPublic })}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            editForm.isPublic ? "bg-blue-600" : "bg-gray-300"
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                editForm.isPublic ? "translate-x-6" : "translate-x-1"
                                            }`}
                                        />
                                    </button>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {saving ? "Sauvegarde..." : "Enregistrer"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            /* Affichage Normal du Profil */
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl font-bold text-gray-900">
                                            {profile.firstName} {profile.lastName}
                                        </h1>
                                        <span
                                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                profile.isPublic
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {profile.isPublic ? "Public" : "Privé"}
                                        </span>
                                    </div>
                                    {profile.nickname && (
                                        <p className="text-sm text-gray-500">@{profile.nickname}</p>
                                    )}
                                </div>

                                {profile.aboutMe && (
                                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                        {profile.aboutMe}
                                    </p>
                                )}

                                {/* Détails (visibles si canViewContent) */}
                                {profile.canViewContent && (
                                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-1">
                                        {profile.email && <div>✉️ {profile.email}</div>}
                                        {profile.dateOfBirth && <div>🎂 Né(e) le {profile.dateOfBirth}</div>}
                                    </div>
                                )}

                                {/* Compteurs Followers / Following */}
                                <div className="flex items-center gap-6 pt-2 border-t border-gray-100">
                                    <button
                                        onClick={openFollowersModal}
                                        disabled={!profile.canViewContent}
                                        className="text-sm text-gray-700 hover:text-blue-600 disabled:cursor-default"
                                    >
                                        <span className="font-bold text-gray-900">{profile.followersCount}</span> Abonnés
                                    </button>
                                    <button
                                        onClick={openFollowingModal}
                                        disabled={!profile.canViewContent}
                                        className="text-sm text-gray-700 hover:text-blue-600 disabled:cursor-default"
                                    >
                                        <span className="font-bold text-gray-900">{profile.followingCount}</span> Abonnements
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section Contenu / Posts */}
                {profile.canViewContent ? (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center text-gray-500 text-sm">
                        📝 Les publications apparaîtront ici dès l'activation du module Posts.
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center space-y-2">
                        <div className="text-3xl">🔒</div>
                        <h3 className="text-base font-semibold text-gray-900">Ce compte est privé</h3>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto">
                            Suivez cet utilisateur pour voir ses publications et ses informations complètes.
                        </p>
                    </div>
                )}
            </div>

            {/* Modale des listes (Abonnés / Abonnements / Demandes) */}
            <FollowersListModal
                isOpen={modalState.isOpen}
                title={modalState.title}
                items={modalState.items}
                loading={modalState.loading}
                onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
                isRequestsMode={modalState.isRequests}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
            />
        </div>
    );
}

