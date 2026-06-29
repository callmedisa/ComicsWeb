"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login, register } from "@/lib/api-client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [teacherCode, setTeacherCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user =
        mode === "register"
          ? await register(
              name.trim(),
              password,
              role === "TEACHER" ? teacherCode.trim() : undefined
            )
          : await login(name.trim(), password, role);
      router.push(user.role === "TEACHER" ? "/admin" : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-dots px-4 py-12">
      <div className="relative w-full max-w-sm">
        <span
          className="font-comic text-stroke-ink absolute -right-2 -top-9 rotate-[-6deg] text-2xl text-white"
          aria-hidden
        >
          {mode === "register" ? "WELCOME!" : "HELLO!"}
        </span>

        <div className="rounded-card border border-border bg-white p-7 shadow-frame">
          <div className="mb-1 flex items-center justify-center gap-2">
            <span className="text-2xl">💬</span>
            <span className="font-display text-lg font-extrabold text-ink">
              ComicSpeak
            </span>
          </div>
          <p className="mb-6 text-center text-sm font-bold text-muted-2">
            {mode === "register"
              ? "Create your account to start your streak 🔥"
              : "Log in to keep your streak going 🔥"}
          </p>

          <div className="mb-5 flex rounded-pill border border-border bg-page p-1">
            <button
              type="button"
              onClick={() => setRole("STUDENT")}
              className={`flex-1 rounded-pill px-3 py-2 text-sm font-bold transition-colors ${
                role === "STUDENT"
                  ? "bg-primary text-white"
                  : "text-muted-2"
              }`}
            >
              🦊 I&apos;m a student
            </button>
            <button
              type="button"
              onClick={() => setRole("TEACHER")}
              className={`flex-1 rounded-pill px-3 py-2 text-sm font-bold transition-colors ${
                role === "TEACHER"
                  ? "bg-primary text-white"
                  : "text-muted-2"
              }`}
            >
              🎓 I&apos;m a teacher
            </button>
          </div>

          <form onSubmit={submit}>
            <label className="label-caps mb-2 block">Username</label>
            <div className="mb-5 flex items-center rounded-panel border-2 border-border pl-3 focus-within:border-primary">
              <span className="text-muted">@</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === "TEACHER" ? "ms.rivera" : "mia2016"}
                autoFocus
                className="w-full bg-transparent p-3 font-body font-bold text-ink outline-none"
              />
            </div>

            <label className="label-caps mb-2 block">Password</label>
            <div className="mb-2 flex items-center rounded-panel border-2 border-border pr-3 focus-within:border-primary">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent p-3 font-body text-ink outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="text-muted"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            {role === "TEACHER" && mode === "register" && (
              <>
                <label className="label-caps mb-2 mt-3 block">
                  Teacher code
                </label>
                <input
                  value={teacherCode}
                  onChange={(e) => setTeacherCode(e.target.value)}
                  placeholder="Given by your school"
                  className="mb-2 w-full rounded-panel border-2 border-border p-3 font-body text-ink outline-none focus:border-primary"
                />
              </>
            )}

            {error && (
              <p className="mb-2 mt-3 text-sm font-bold text-red-text">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!name.trim() || !password || loading}
              className="btn-3d mt-5 w-full bg-primary py-3 text-white shadow-btn-primary active:shadow-btn-primary-active disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Just a sec…"
                : mode === "register"
                  ? "Create account →"
                  : "Log in →"}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm font-bold">
            {mode === "register" ? (
              <Link href="/login" className="text-primary underline">
                Already have an account?
              </Link>
            ) : (
              <span className="text-muted-2">
                Forgot password? Ask your teacher.
              </span>
            )}
            <Link href={mode === "register" ? "/" : "/register"} className="text-primary">
              {mode === "register" ? "← Back" : "New here? →"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
