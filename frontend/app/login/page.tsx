"use client";
import "./login.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await login(email, password);
            router.push("/");
        } catch (err) {
            setError("Invalid email or password !");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="login-page">
            {/* <div className="background-shape shape-one" />
            <div className="background-shape shape-two" /> */}

            <section className="login-card">
                {/* <div className="logo">
                    <div className="logo-icon">S</div>
                    <span>Socially</span>
                </div> */}

                {/* <div className="login-header">
                    <h1>Welcome back</h1>
                    <p>Log in to continue to your social network.</p>
                </div> */}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="input-group">
                        <div className="password-label">
                            <label htmlFor="password">Password</label>
                        </div>

                        <div className="password-input">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />

                            <button
                                type="button"
                                className="show-password"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="error-message" role="alert">
                            <p>{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" />
                                Logging in...
                            </>
                        ) : (
                            "Log in"
                        )}
                    </button>
                </form>

                {/* <div className="divider">
                    <span>or</span>
                </div>

                <p className="register-text">
                    Don't have an account?{" "}
                    <Link href="/register">Create an account</Link>
                </p> */}
            </section>
        </main>
    );
}