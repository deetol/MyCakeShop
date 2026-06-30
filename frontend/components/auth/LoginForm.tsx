    "use client";

    import { useState } from "react";
    import {Eye,EyeOff,User, Lock, ArrowRight, Loader2} from "lucide-react";
    import Image from "next/image";
    import { useRouter } from "next/navigation";


    export default function LoginPage() {
        const router = useRouter();
        const [email, setEmail] = useState("");
        const [password, setPassword] = useState("");
        const [showPassword, setShowPassword] = useState(false);

        const [loading, setLoading] = useState(false);
        const [error, setError] = useState("");

        async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
        ) {
        e.preventDefault();

        setLoading(true);
        setError("");

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

        try {
            const response = await fetch(
            `${API_URL}/login`,
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
    <div className="w-full max-w-[430px] overflow-hidden rounded-2xl bg-white shadow-lg">
        <div className="py-8 px-8 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F7ECE8]">
            <Image
                src="/Container.png"
                alt="MyCakeShop Logo"
                width={42}
                height={42}
                priority
            />
            </div>

        <h1 className="text-4xl font-bold text-[#7B3F00]">
            MyCakeShop
        </h1>

        <p className="mt-2 text-gray-500">
            Admin Dashboard Login
        </p>
        </div>

        <div className="border-t p-8">
    {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
        {error}
        </div>
    )}

    <form
        onSubmit={handleSubmit}
        className="space-y-5"
    >
        <div>
        <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-gray-600">
            Email
        </label>

        <div className="relative">
            <User
                size={20}
                strokeWidth={1.8}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8D7667]"
            />
            <input
                type="email"
                value={email}
                onChange={(e) =>
                setEmail(e.target.value)
                }
                placeholder="Masukkan username admin"
                required
                className="w-full rounded-xl border border-[#D8C5BB] bg-[#FAF5F2] py-3 pl-12 pr-4 text-[#4A2C17] placeholder:text-[#C8B7AE] outline-none transition focus:border-[#8B4A00]"
            />
        </div>
        </div>

        <div>
        
            <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                    Password
                </label>

                <button
                    type="button"
                    className="text-sm font-medium text-[#8B4A00] hover:underline"
                >
                    Lupa Kata Sandi?
                </button>
            </div>
        <div className="relative">
            <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A8478]"
            />

            <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full rounded-xl border border-[#D8C5BB] bg-[#FAF5F2] py-3 pl-12 pr-12 text-[#4A2C17] placeholder:text-[#C8B7AE] outline-none transition focus:border-[#8B4A00]"
            />

            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-[#7D7D7D]"
            >
                {showPassword ? (
                <EyeOff size={20} />
                ) : (
                <Eye size={20} />
                )}
            </button>
            </div>
        </div>

        <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[#8C4E08] py-3 font-semibold text-white transition-all duration-200 hover:bg-[#734006] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
        >
        <span className="flex items-center justify-center gap-2">
            {loading ? (
                <>
                <Loader2
                    size={18}
                    className="animate-spin"
                />
                Signing In...
                </>
            ) : (
                <>
                MASUK
                <ArrowRight size={18} />
                </>
            )}
            </span>
        </button>
    </form>
    </div>
    </div>
    );
    }