"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/utils/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data?.valid) {
        throw new Error(data?.error || "Invalid token")
      }
      // Save locally and redirect to home
      localStorage.setItem("token", token)
      router.replace("/")
    } catch (err: any) {
      setError(err?.message || "Validation failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-950 px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm rounded-lg border border-white/10 bg-slate-900/70 p-5 shadow-sm"
      >
        <h1 className="mb-4 text-center text-lg font-semibold text-slate-100">Login</h1>
        <label className="mb-2 block text-sm text-slate-300" htmlFor="token">
          TOKEN
        </label>
        <input
          id="token"
          name="token"
          type="password"
          autoComplete="off"
          required
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter your Discord Bot Token"
          className="mb-3 w-full rounded-md border border-white/10 bg-slate-800 px-3 py-2 text-slate-100 placeholder:text-slate-400 outline-none focus:border-white/20"
        />
        {error ? <p className="mb-3 text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full rounded-md bg-slate-200 px-3 py-2 text-slate-900 disabled:opacity-60"
        >
          {loading ? "Validating..." : "Login"}
        </button>
        <p className="mt-3 text-center text-xs text-slate-400">
          Token is validated with Discord and stored only on your device.
        </p>
      </form>
    </main>
  )
}