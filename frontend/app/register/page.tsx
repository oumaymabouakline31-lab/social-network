"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        nickname: "",
        aboutMe: "",
    });

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleFileSelect(file: File) {
        if (!file.type.startsWith("image/")) {
            setError("Veuillez sélectionner un fichier image valide (JPEG, PNG, WEBP, GIF).");
            return;
        }
        setError(null);
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    }

    function removeAvatar() {
        setAvatarFile(null);
        setAvatarPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await register({
                ...formData,
                avatarFile: avatarFile ?? undefined,
            });
            router.push("/");
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-4 dark:bg-black font-sans">
            <div className="w-full max-w-lg space-y-6 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Create your account
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Join our social network community
                    </p>
                </div>

                {error && (
                    <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Zone d'Upload de l'Avatar (Galerie / Fichier local avec Prévisualisation) */}
                    <div className="flex flex-col items-center justify-center pb-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    handleFileSelect(e.target.files[0]);
                                }
                            }}
                        />

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                    handleFileSelect(e.dataTransfer.files[0]);
                                }
                            }}
                            className={`relative w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-colors ${
                                isDragging
                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                                    : "border-zinc-300 hover:border-zinc-400 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800"
                            }`}
                            title="Cliquez pour choisir une photo ou glissez-déposez-la"
                        >
                            {avatarPreview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={avatarPreview}
                                    alt="Avatar preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-center p-2">
                                    <span className="text-2xl">📷</span>
                                    <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                                        Photo
                                    </span>
                                </div>
                            )}
                        </div>

                        {avatarPreview ? (
                            <button
                                type="button"
                                onClick={removeAvatar}
                                className="mt-1 text-xs text-red-600 hover:underline"
                            >
                                Supprimer la photo
                            </button>
                        ) : (
                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                Cliquez ou glissez une photo de profil (optionnel)
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                First Name *
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                placeholder="John"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Last Name *
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Email address *
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            Password * (min 6 characters)
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Date of Birth *
                            </label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                Nickname (optional)
                            </label>
                            <input
                                type="text"
                                name="nickname"
                                placeholder="johndoe"
                                value={formData.nickname}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            About Me (optional)
                        </label>
                        <textarea
                            name="aboutMe"
                            rows={3}
                            placeholder="Tell us something about yourself..."
                            value={formData.aboutMe}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-black py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    >
                        {loading ? "Creating account..." : "Register"}
                    </button>
                </form>

                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-zinc-900 underline hover:text-black dark:text-zinc-100">
                        Sign in here
                    </Link>
                </p>
            </div>
        </div>
    );
}
