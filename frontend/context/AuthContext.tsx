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
    nickname?: string;
    aboutMe?: string;
};

type AuthContextType = {
    user: User | null;
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
        const u = await apiFetch<User>("/api/auth/register", {
            method: "POST",
            body: JSON.stringify(data),
        });
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
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);