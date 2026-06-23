"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login, register } from "@/lib/api-client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "register") {
        await register(name.trim(), password);
      } else {
        await login(name.trim(), password);
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4">
      <div className="w-full max-w-sm rounded-card border border-border bg-white p-7 shadow-card">
        <div className="mb-6 flex items-center gap-2">
          <span className="text-2xl">💬</span>
          <span className="font-display text-lg font-extrabold text-ink">
            ComicSpeak
          </span>
        </div>
        <h1 className="mb-1 font-display text-xl font-extrabold text-ink">
          {mode === "register" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mb-6 text-sm text-muted-2">
          {mode === "register"
            ? "Pick a name and password — no email needed."
            : "Sign in with your name and password."}
        </p>

        <form onSubmit={submit}>
          <label className="label-caps mb-2 block">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoFocus
            className="mb-5 w-full rounded-panel border-2 border-border p-3 font-body text-ink outline-none focus:border-primary"
          />

          <label className="label-caps mb-2 block">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mb-5 w-full rounded-panel border-2 border-border p-3 font-body text-ink outline-none focus:border-primary"
          />

          {error && <p className="mb-4 text-sm font-bold text-red-text">{error}</p>}

          <button
            type="submit"
            disabled={!name.trim() || !password || loading}
            className="btn-3d w-full bg-primary py-3 text-white shadow-btn-primary active:shadow-btn-primary-active disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Just a sec…"
              : mode === "register"
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-2">
          {mode === "register" ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-primary underline">
                Sign in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link href="/register" className="font-bold text-primary underline">
                Create an account
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
