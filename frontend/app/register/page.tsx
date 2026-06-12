"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type RegisterMethod = "email" | "phone";

export default function RegisterPage() {
  const router = useRouter();

  const [registerMethod, setRegisterMethod] = useState<RegisterMethod>("email");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeTerms) {
      setError("Anda harus menyetujui Syarat & Ketentuan serta Kebijakan Privasi.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Try to register with Laravel API
      const response = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: fullname,
          email: registerMethod === "email" ? email : undefined,
          phone: registerMethod === "phone" ? phone : undefined,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Pendaftaran gagal");
      }

      // Automatically log them in with the registered user data
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/profile");
    } catch (err) {
      console.warn("API Connection failed, falling back to mock registration.", err);

      // Fallback Mock Auto-Login on success
      const mockUser = {
        id: `mock-user-${Date.now()}`,
        name: fullname,
        email: registerMethod === "email" ? email : "customer@example.com",
        phone: registerMethod === "phone" ? phone : "+62 812 3456 7890",
      };

      localStorage.setItem("user", JSON.stringify(mockUser));
      router.push("/profile");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-on-background">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-variant font-medium">Memuat halaman pendaftaran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased bg-pattern">
      <main className="flex-grow flex items-center justify-center p-margin-mobile md:p-margin-desktop w-full max-w-container-max mx-auto my-12 md:my-24 animate-in fade-in duration-300">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-[0_4px_16px_rgba(112,62,14,0.05)] border border-outline-variant/30 overflow-hidden relative">
          
          {/* Decorative Header Accent */}
          <div className="h-2 w-full bg-primary absolute top-0 left-0"></div>
          
          <div className="p-8 md:p-12">
            <div className="text-center mb-10">
              <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-2 font-bold">
                MyCakeShop
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Buat akun untuk mulai memesan kue kesukaan keluarga.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-error-container text-on-error-container border border-error/20 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">
              
              {/* Method Toggle */}
              <div className="flex p-1 bg-surface-container-low rounded-lg mb-6">
                <button
                  type="button"
                  onClick={() => setRegisterMethod("email")}
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all duration-200 ${
                    registerMethod === "email"
                      ? "bg-surface-container-lowest text-primary shadow-sm"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setRegisterMethod("phone")}
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all duration-200 ${
                    registerMethod === "phone"
                      ? "bg-surface-container-lowest text-primary shadow-sm"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  Nomor Telepon
                </button>
              </div>

              {/* Full Name Input */}
              <div className="space-y-2">
                <label className="block font-label-sm text-label-sm text-on-surface uppercase tracking-wider font-semibold" htmlFor="fullname">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">person</span>
                  </div>
                  <input
                    autoComplete="name"
                    className="block w-full pl-10 pr-3 py-3 border border-outline-variant rounded-lg bg-surface-container-low text-on-surface focus:ring-primary focus:border-primary focus:bg-surface-container-lowest transition-colors duration-200"
                    id="fullname"
                    placeholder="John Doe"
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Conditional Input Field */}
              {registerMethod === "email" ? (
                <div className="space-y-2">
                  <label className="block font-label-sm text-label-sm text-on-surface uppercase tracking-wider font-semibold" htmlFor="email">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-outline">mail</span>
                    </div>
                    <input
                      autoComplete="email"
                      className="block w-full pl-10 pr-3 py-3 border border-outline-variant rounded-lg bg-surface-container-low text-on-surface focus:ring-primary focus:border-primary focus:bg-surface-container-lowest transition-colors duration-200"
                      id="email"
                      placeholder="nama@email.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block font-label-sm text-label-sm text-on-surface uppercase tracking-wider font-semibold" htmlFor="phone">
                    Nomor Telepon
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-outline">call</span>
                    </div>
                    <input
                      autoComplete="tel"
                      className="block w-full pl-10 pr-3 py-3 border border-outline-variant rounded-lg bg-surface-container-low text-on-surface focus:ring-primary focus:border-primary focus:bg-surface-container-lowest transition-colors duration-200"
                      id="phone"
                      placeholder="081234567890"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block font-label-sm text-label-sm text-on-surface uppercase tracking-wider font-semibold" htmlFor="password">
                  Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline">lock</span>
                  </div>
                  <input
                    className="block w-full pl-10 pr-3 py-3 border border-outline-variant rounded-lg bg-surface-container-low text-on-surface focus:ring-primary focus:border-primary focus:bg-surface-container-lowest transition-colors duration-200"
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                  />
                </div>
                <p className="text-xs text-on-surface-variant mt-1">Minimal 8 karakter.</p>
              </div>

              {/* Agree Terms Checkbox */}
              <div className="flex items-start mt-4">
                <div className="flex items-center h-5">
                  <input
                    className="focus:ring-primary h-4 w-4 text-primary border-outline-variant rounded bg-surface-container-low cursor-pointer"
                    id="terms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="font-body-md text-body-md text-on-surface-variant cursor-pointer select-none" htmlFor="terms">
                    Saya setuju dengan{" "}
                    <Link className="text-primary font-bold hover:underline" href="#">
                      Syarat &amp; Ketentuan
                    </Link>{" "}
                    serta{" "}
                    <Link className="text-primary font-bold hover:underline" href="#">
                      Kebijakan Privasi
                    </Link>{" "}
                    MyCakeShop.
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-body-lg font-body-lg font-bold text-on-primary bg-primary hover:bg-primary-container hover:text-on-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Daftar Sekarang"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Sudah punya akun?
                <Link
                  className="font-bold text-primary hover:text-primary-container transition-colors duration-200 ml-1"
                  href="/login"
                >
                  Masuk di sini
                </Link>
              </p>
            </div>
          </div>

          {/* Decorative Bottom Element */}
          <div className="h-24 bg-surface-container-high/50 w-full flex items-center justify-center border-t border-outline-variant/20">
            <span className="material-symbols-outlined text-outline/40 text-4xl">bakery_dining</span>
          </div>
        </div>
      </main>
    </div>
  );
}
