"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError, ValidationError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type LoginMethod = "email" | "phone";

export default function LoginPage() {
  const router = useRouter();
  const { login: authLogin } = useAuth();

  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Use the API helper with proper typing
      const response = await api.post<{ user: any; token: string }>('/login', {
        login: loginMethod === "email" ? email : phone,
        password: password,
      });

      // Update AuthContext with user and token
      authLogin(response.data.user, response.data.token);

      // Check user role and redirect accordingly
      if (response.data.user.role === 'admin') {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err) {
      if (err instanceof ValidationError) {
        setError(err.getFirstError());
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Login gagal. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-on-background">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-variant font-medium">Memuat halaman login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen flex items-center justify-center font-body-md text-body-md text-on-background selection:bg-primary-container selection:text-on-primary-container p-margin-mobile md:p-margin-desktop">

      {/* Back to Home button */}
      <Link
        href="/"
        className="fixed top-5 left-5 flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors bg-surface-container-low hover:bg-surface-container border border-outline-variant rounded-full px-4 py-2 text-sm font-semibold z-50 shadow-sm"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Beranda
      </Link>
      {/* Main Container: Asymmetric Split Layout */}
      <div className="max-w-container-max w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        
        {/* Left Side: Hero Image */}
        <div className="hidden lg:block w-full h-[819px] rounded-xl overflow-hidden relative shadow-ambient group">
          <Image
            alt="Warm bakery scene"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9ym1PhlKNisLQ-7eZmWitlVvsxXnNXcayiheGGq0ZSNaqgZD3SC_swzJ-hTCIhkoeDKXcWOm0UnOw3TeqxuwyxaNG_olmEKT_WyAAp4DAhBtRy0xJ8oVCDtkNxQfhUutilK7V58-qR1qFGnfiEGnQcfXXfrdT3bHMHg7TSV5k8Rll9SMONgwibc9lg1De4JiOz_JMV-tA909KFqP_TXe6M6beLe_CWiIcajxHwdj_CCyH38EuGlGB46D9fcJQYd2LZowKX6a2hbI8"
          />
          {/* Glassmorphism overlay badge */}
          <div className="absolute bottom-8 left-8 right-8 backdrop-blur-md bg-surface/80 p-6 rounded-lg border border-surface-bright/50">
            <h2 className="font-headline-md text-headline-md text-primary mb-2 font-bold">
              Kehangatan di setiap gigitan.
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Masuk untuk melanjutkan perjalanan Anda dengan rasa tradisional yang kami buat untuk momen modern.
            </p>
          </div>
        </div>

        {/* Right Side: Login Form Canvas */}
        <div className="w-full max-w-md mx-auto lg:mx-0 bg-surface-container-lowest rounded-xl p-6 sm:p-8 shadow-ambient border border-outline-variant/30">
          
          {/* Brand Header */}
          <div className="text-center mb-8">
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-2 font-bold">
              MyCakeShop
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Selamat datang kembali! Silakan masukkan detail Anda.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error-container text-on-error-container border border-error/20 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Login Method Toggle */}
          <div className="bg-surface-container-low p-1 rounded-lg flex mb-8">
            <button
              type="button"
              onClick={() => setLoginMethod("email")}
              className={`flex-1 py-2 rounded-md font-label-sm text-label-sm transition-all text-center font-bold ${
                loginMethod === "email"
                  ? "bg-surface text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod("phone")}
              className={`flex-1 py-2 rounded-md font-label-sm text-label-sm transition-all text-center font-bold ${
                loginMethod === "phone"
                  ? "bg-surface text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              Nomor Telepon
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Conditional Input */}
            {loginMethod === "email" ? (
              <div className="space-y-1.5">
                <label className="block font-label-sm text-label-sm text-on-surface font-semibold" htmlFor="email">
                  Alamat Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                    mail
                  </span>
                  <input
                    className="w-full bg-surface-bright border border-outline-variant text-on-surface rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md text-body-md placeholder:text-on-surface-variant/50"
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
              <div className="space-y-1.5">
                <label className="block font-label-sm text-label-sm text-on-surface font-semibold" htmlFor="phone">
                  Nomor Telepon
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                    phone
                  </span>
                  <input
                    className="w-full bg-surface-bright border border-outline-variant text-on-surface rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md text-body-md placeholder:text-on-surface-variant/50"
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
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block font-label-sm text-label-sm text-on-surface font-semibold" htmlFor="password">
                  Kata Sandi
                </label>
                <Link
                  className="font-label-sm text-label-sm text-primary hover:text-primary-container transition-colors font-semibold"
                  href="#"
                >
                  Lupa Kata Sandi?
                </Link>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                  lock
                </span>
                <input
                  className="w-full bg-surface-bright border border-outline-variant text-on-surface rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md text-body-md placeholder:text-on-surface-variant/50"
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-1">
              <input
                className="rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-surface-container-lowest bg-surface-bright h-4 w-4 cursor-pointer"
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="font-body-md text-body-md text-on-surface-variant cursor-pointer select-none text-[14px]" htmlFor="remember">
                Ingat saya
              </label>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                className="w-full bg-primary text-on-primary font-body-lg text-body-lg font-bold rounded-lg py-3.5 hover:bg-primary-container hover:-translate-y-[1px] hover:shadow-ambient transition-all duration-200 active:translate-y-0 min-h-[48px] flex justify-center items-center gap-2 disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Masuk ke MyCakeShop"
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-outline-variant/40"></div>
            <span className="px-3 font-label-sm text-label-sm text-on-surface-variant">
              atau lanjutkan dengan
            </span>
            <div className="flex-grow border-t border-outline-variant/40"></div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button
              className="flex items-center justify-center gap-2 border border-outline-variant rounded-lg py-2.5 hover:bg-surface-container transition-colors min-h-[48px] font-semibold"
              type="button"
            >
              <span className="font-label-sm text-label-sm text-on-surface">Google</span>
            </button>
            <button
              className="flex items-center justify-center gap-2 border border-outline-variant rounded-lg py-2.5 hover:bg-surface-container transition-colors min-h-[48px] font-semibold"
              type="button"
            >
              <span className="font-label-sm text-label-sm text-on-surface">Facebook</span>
            </button>
          </div>

          {/* Registration Link */}
          <p className="text-center mt-8 font-body-md text-body-md text-on-surface-variant">
            Belum punya akun?{" "}
            <Link className="text-primary font-bold hover:underline decoration-2 underline-offset-4" href="/register">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}