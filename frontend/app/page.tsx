"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black font-sans">
        <p className="text-zinc-500">Loading session...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 font-sans dark:bg-black">
      <main className="flex w-full max-w-xl flex-col items-center rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Social Network
        </h1>

        {user ? (
          <div className="mt-6 w-full space-y-4">
            <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50 text-left space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Connected User</p>
              <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                {user.firstName} {user.lastName} {user.nickname ? `(@${user.nickname})` : ""}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Email: {user.email}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Birthdate: {user.dateOfBirth}</p>
              {user.aboutMe && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">About: {user.aboutMe}</p>
              )}
            </div>

            <button
              onClick={() => logout()}
              className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="mt-6 w-full space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              You are currently not logged in.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/login"
                className="rounded-lg bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg border border-zinc-300 px-6 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
