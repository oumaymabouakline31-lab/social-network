"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { profileApi, Profile, FollowItem, UpdateProfileData } from "@/lib/profileApi";
import { Post, postsApi } from "@/lib/postsApi";
import FollowButton from "@/components/FollowButton";
import FollowersListModal from "@/components/FollowersListModal";
import PostCard from "@/components/PostCard";
import PostComposer from "@/components/PostComposer";
import Avatar from "@/components/Avatar";

import { ArrowLeft, Camera, Cake, FileText, Loader2, Lock, Mail, MessageCircle, Pencil } from "lucide-react";

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const userId = resolvedParams.id;

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [posts, setPosts] = useState<Post[]>([]);
    const [postsLoading, setPostsLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<UpdateProfileData>({});
    const [saving, setSaving] = useState(false);

    // Upload de l'avatar
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        title: string;
        items: FollowItem[];
        loading: boolean;
        isRequests: boolean;
    }>({ isOpen: false, title: "", items: [], loading: false, isRequests: false });

    const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);

    useEffect(() => {
        if (!userId) return;
        let active = true;

        (async () => {
            try {
                const data = await profileApi.getProfile(userId);
                if (!active) return;

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

                if (data.canViewContent) {
                    const list = await postsApi.getUserPosts(data.id).catch(() => []);
                    if (active) setPosts(list);
                }
                if (active) setPostsLoading(false);

                if (data.followStatus === "SELF" && !data.isPublic) {
                    profileApi
                        .getPendingRequests()
                        .then((reqs) => active && setPendingRequestsCount(reqs.length))
                        .catch(() => { });
                }
            } catch (err) {
                if (active) {
                    setError((err as Error).message);
                    setPostsLoading(false);
                }
            } finally {
                if (active) setLoading(false);
            }
        })();

        return () => {
            active = false;
        };
    }, [userId]);

    // Gestion de l'upload d'un fichier image (galerie ou glisser-déposer)
    async function handleFileSelect(file: File) {
        if (!file.type.startsWith("image/")) {
            alert("Veuillez sélectionner un fichier image valide (JPEG, PNG, WEBP, GIF).");
            return;
        }

        const localPreview = URL.createObjectURL(file);
        setPreviewAvatar(localPreview);
        setUploadingAvatar(true);

        try {
            const updated = await profileApi.uploadAvatar(file);
            setProfile(updated);
            setEditForm((prev) => ({ ...prev, avatarUrl: updated.avatarUrl ?? "" }));
            setPreviewAvatar(null);
        } catch (err) {
            alert("Erreur lors de l'upload de l'avatar : " + (err as Error).message);
            setPreviewAvatar(null);
        } finally {
            URL.revokeObjectURL(localPreview);
            setUploadingAvatar(false);
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
        } catch {
            setModalState((prev) => ({ ...prev, loading: false }));
        }
    }

    async function openFollowingModal() {
        if (!profile?.canViewContent) return;
        setModalState({ isOpen: true, title: "Abonnements", items: [], loading: true, isRequests: false });
        try {
            const items = await profileApi.getFollowing(profile.id);
            setModalState((prev) => ({ ...prev, items, loading: false }));
        } catch {
            setModalState((prev) => ({ ...prev, loading: false }));
        }
    }

    async function openRequestsModal() {
        setModalState({ isOpen: true, title: "Demandes d'abonnements", items: [], loading: true, isRequests: true });
        try {
            const items = await profileApi.getPendingRequests();
            setModalState((prev) => ({ ...prev, items, loading: false }));
        } catch {
            setModalState((prev) => ({ ...prev, loading: false }));
        }
    }

    async function handleAcceptRequest(followId: string) {
        try {
            await profileApi.acceptRequest(followId);
            setModalState((prev) => ({ ...prev, items: prev.items.filter((i) => i.followId !== followId) }));
            setPendingRequestsCount((prev) => Math.max(0, prev - 1));
            setProfile((prev) => (prev ? { ...prev, followersCount: prev.followersCount + 1 } : prev));
        } catch (err) {
            alert("Erreur : " + (err as Error).message);
        }
    }

    async function handleRejectRequest(followId: string) {
        try {
            await profileApi.rejectRequest(followId);
            setModalState((prev) => ({ ...prev, items: prev.items.filter((i) => i.followId !== followId) }));
            setPendingRequestsCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            alert("Erreur : " + (err as Error).message);
        }
    }

    if (loading) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
                Chargement du profil...
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <p className="font-medium text-rose-600">{error ?? "Profil introuvable"}</p>
                <Link href="/" className="mt-3 inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline">
                    <ArrowLeft size={15} /> Retour à l&apos;accueil
                </Link>
            </div>
        );
    }

    const isSelf = profile.followStatus === "SELF";

    return (
        <div className="space-y-6">
            {/* Input fichier caché pour l'upload d'avatar */}
            <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                    e.target.value = "";
                }}
            />

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="h-32 bg-gradient-to-r from-indigo-500 via-violet-500 to-rose-500" />

                <div className="relative px-6 pb-6">
                    <div className="mb-4 -mt-16 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        {/* Avatar + upload (clic / glisser-déposer) pour son propre profil */}
                        <div
                            className={`group relative h-28 w-28 ${isSelf ? "cursor-pointer" : ""} ${
                                isDragging ? "rounded-full ring-4 ring-indigo-400" : ""
                            }`}
                            onClick={() => isSelf && fileInputRef.current?.click()}
                            onDragOver={(e) => {
                                if (isSelf) {
                                    e.preventDefault();
                                    setIsDragging(true);
                                }
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                if (isSelf) {
                                    e.preventDefault();
                                    setIsDragging(false);
                                    const file = e.dataTransfer.files?.[0];
                                    if (file) handleFileSelect(file);
                                }
                            }}
                            title={isSelf ? "Cliquez ou glissez une photo pour changer d'avatar" : undefined}
                        >
                            <Avatar
                                firstName={profile.firstName}
                                lastName={profile.lastName}
                                src={previewAvatar ?? profile.avatarUrl}
                                size={112}
                                online
                                className="rounded-full border-4 border-white shadow-md"
                            />
                            {isSelf && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
                                    {uploadingAvatar ? (
                                        <Loader2 size={22} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Camera size={22} />
                                            <span className="text-[10px] font-medium">Changer</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {isSelf ? (
                                <>
                                    {!profile.isPublic && pendingRequestsCount > 0 && (
                                        <button
                                            onClick={openRequestsModal}
                                            className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-200"
                                        >
                                            Demandes ({pendingRequestsCount})
                                        </button>
                                    )}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingAvatar}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        <Camera size={16} /> {uploadingAvatar ? "Upload..." : "Changer photo"}
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                    >
                                        {isEditing ? (
                                            "Annuler"
                                        ) : (
                                            <>
                                                <Pencil size={14} /> Modifier le profil
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <FollowButton
                                        targetUserId={profile.id}
                                        initialStatus={profile.followStatus}
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
                                    <button className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                                        <MessageCircle size={16} /> Message
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field label="Prénom">
                                    <input
                                        type="text"
                                        value={editForm.firstName}
                                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                        required
                                    />
                                </Field>
                                <Field label="Nom">
                                    <input
                                        type="text"
                                        value={editForm.lastName}
                                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                        required
                                    />
                                </Field>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field label="Pseudo">
                                    <input
                                        type="text"
                                        value={editForm.nickname ?? ""}
                                        onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    />
                                </Field>
                                <Field label="Date de naissance">
                                    <input
                                        type="date"
                                        value={editForm.dateOfBirth ?? ""}
                                        onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    />
                                </Field>
                            </div>

                            <Field label="À propos de moi">
                                <textarea
                                    value={editForm.aboutMe ?? ""}
                                    onChange={(e) => setEditForm({ ...editForm, aboutMe: e.target.value })}
                                    rows={3}
                                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                />
                            </Field>

                            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {editForm.isPublic ? "Compte public" : "Compte privé"}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {editForm.isPublic
                                            ? "Tout le monde peut voir votre profil."
                                            : "Seuls vos abonnés acceptés voient vos publications."}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditForm({ ...editForm, isPublic: !editForm.isPublic })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        editForm.isPublic ? "bg-indigo-600" : "bg-slate-300"
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
                                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {saving ? "Sauvegarde..." : "Enregistrer"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold text-slate-900">
                                        {profile.firstName} {profile.lastName}
                                    </h1>
                                    <span
                                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                            profile.isPublic ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
                                        }`}
                                    >
                                        {profile.isPublic ? "Public" : "Privé"}
                                    </span>
                                </div>
                                {profile.nickname && <p className="text-sm text-slate-500">@{profile.nickname}</p>}
                            </div>

                            {profile.aboutMe && (
                                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{profile.aboutMe}</p>
                            )}

                            {profile.canViewContent && (
                                <div className="flex flex-wrap gap-4 pt-1 text-xs text-slate-500">
                                    {profile.email && (
                                        <span className="inline-flex items-center gap-1">
                                            <Mail size={14} /> {profile.email}
                                        </span>
                                    )}
                                    {profile.dateOfBirth && (
                                        <span className="inline-flex items-center gap-1">
                                            <Cake size={14} /> Né(e) le {profile.dateOfBirth}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-6 border-t border-slate-100 pt-3">
                                <button
                                    onClick={openFollowersModal}
                                    disabled={!profile.canViewContent}
                                    className="text-sm text-slate-700 transition hover:text-indigo-600 disabled:cursor-default"
                                >
                                    <span className="font-bold text-slate-900">{profile.followersCount}</span> Abonnés
                                </button>
                                <button
                                    onClick={openFollowingModal}
                                    disabled={!profile.canViewContent}
                                    className="text-sm text-slate-700 transition hover:text-indigo-600 disabled:cursor-default"
                                >
                                    <span className="font-bold text-slate-900">{profile.followingCount}</span> Abonnements
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {profile.canViewContent ? (
                <section className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-900">Publications</h2>

                    {isSelf && <PostComposer onCreated={(created) => setPosts((prev) => [created, ...prev])} />}

                    {postsLoading ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
                            Chargement des publications...
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                            <FileText size={32} className="mx-auto text-slate-300" />
                            <p className="mt-2 text-sm font-medium text-slate-700">Aucune publication pour le moment.</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
                                onUpdated={(updated) =>
                                    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
                                }
                            />
                        ))
                    )}
                </section>
            ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <Lock size={32} className="mx-auto text-slate-300" />
                    <h3 className="mt-2 text-base font-semibold text-slate-900">Ce compte est privé</h3>
                    <p className="mx-auto max-w-sm text-sm text-slate-500">
                        Suivez cet utilisateur pour voir ses publications et ses informations complètes.
                    </p>
                </div>
            )}

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-medium text-slate-700">{label}</label>
            {children}
        </div>
    );
}
