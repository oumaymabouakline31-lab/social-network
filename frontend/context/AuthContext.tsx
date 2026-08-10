"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
type User = { id: string; email: string };
const AuthContext = createContext<{
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
}>(null!);
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        apiFetch<User>("/api/auth/me").then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
    }, []);
    async function login(email: string, password: string) {
        const u = await apiFetch<User>("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
        setUser(u);
    }
    return (
        <AuthContext.Provider value={{ user, loading, login }}>
            {children}
        </AuthContext.Provider>
    );
}
export const useAuth = () => useContext(AuthContext);