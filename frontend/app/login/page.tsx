"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
    ) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
        const response = await fetch(
        "http://127.0.0.1:8000/api/login",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Login gagal"
            );
        }

        console.log(data);

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        router.push("/dashboard");
    } catch (err) {
        setError(
            err instanceof Error
            ? err.message
            : "Terjadi kesalahan"
        );
    } finally {
        setLoading(false);
    }
    }

    return (
        <main className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
            <h1 className="text-3xl font-bold text-center mb-2">
            MyCakeShop
            </h1>

            <p className="text-center text-gray-500 mb-8">
            Sign in to continue
            </p>

            {error && (
            <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-red-600">
                {error}
            </div>
            )}

            <form
            onSubmit={handleSubmit}
            className="space-y-5"
            >
            <div>
                <label className="block mb-2 font-medium">
                Email
                </label>

                <input
                type="email"
                value={email}
                onChange={(e) =>
                    setEmail(e.target.value)
                }
                className="w-full rounded-lg border p-3"
                placeholder="admin@example.com"
                required
                />
            </div>

            <div>
                <label className="block mb-2 font-medium">
                Password
                </label>

                <input
                type="password"
                value={password}
                onChange={(e) =>
                    setPassword(e.target.value)
                }
                className="w-full rounded-lg border p-3"
                placeholder="password"
                required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
            >
                {loading
                ? "Signing In..."
                : "Sign In"}
            </button>
            </form>
        </div>
        </main>
    );
    }