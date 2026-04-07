"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function StaffLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !pinCode.trim()) {
      setError("Email and PIN are required.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          pinCode: pinCode.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data?.error || "Login failed.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="border-b border-slate-800 px-6 py-5">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
            Staff Access
          </p>
          <h1 className="mt-2 text-2xl font-bold">Login</h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to access students, attendance, classes, and staff tools.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Staff Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@yourdojo.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="pinCode"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              PIN
            </label>

            <div className="flex gap-2">
              <input
                id="pinCode"
                type={showPin ? "text" : "password"}
                autoComplete="current-password"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                placeholder="Enter your PIN"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-slate-500"
              />

              <button
                type="button"
                onClick={() => setShowPin((prev) => !prev)}
                className="rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-200 hover:bg-slate-800"
              >
                {showPin ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}