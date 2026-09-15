"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export type User = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    avatarUrl?: string | null;
    nickname?: string | null;
    aboutMe?: string | null;
    isPublic: boolean;
    createdAt?: string | null;
};

export type RegisterData = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    avatarUrl?: string;
    avatarFile?: File;
    nickname?: string;
    aboutMe?: string;
};

type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch<User>("/api/auth/me")
            .then(setUser)
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    async function login(email: string, password: string) {
        const u = await apiFetch<User>("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
        setUser(u);
    }

    async function register(data: RegisterData) {
        let u: User;
        if (data.avatarFile) {
            const formData = new FormData();
            formData.append("email", data.email);
            formData.append("password", data.password);
            formData.append("firstName", data.firstName);
            formData.append("lastName", data.lastName);
            formData.append("dateOfBirth", data.dateOfBirth);
            if (data.nickname) formData.append("nickname", data.nickname);
            if (data.aboutMe) formData.append("aboutMe", data.aboutMe);
            formData.append("avatarFile", data.avatarFile);

            const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
            const res = await fetch(`${API_BASE}/api/auth/register`, {
                method: "POST",
                body: formData,
                credentials: "include",
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error ?? `Registration failed: ${res.status}`);
            }
            u = await res.json();
        } else {
            u = await apiFetch<User>("/api/auth/register", {
                method: "POST",
                body: JSON.stringify(data),
            });
        }
        setUser(u);
    }

    async function logout() {
        try {
            await apiFetch("/api/auth/logout", { method: "POST" });
        } finally {
            setUser(null);
        }
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);