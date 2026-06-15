"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

type RegisterMethod = "email" | "phone";

interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

interface ApiSuccessResponse {
  success: true;
  message: string;
  data: {
    user: {
      id: number;
      name: string;
      email?: string;
      phone?: string;
      role: string;
    };
    token: string;
  };
}

export default function RegisterPage() {
  const router = useRouter();

  const [registerMethod, setRegisterMethod] = useState<RegisterMethod>("email");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
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

if (password !== passwordConfirmation) {
  setError("Konfirmasi password tidak cocok.");
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
        email:  registerMethod === "email"? email: null,
        phone: registerMethod === "phone"? phone: null,
        password, password_confirmation:passwordConfirmation,
      }),
      });

      const data: ApiSuccessResponse | ApiErrorResponse = await response.json();

      if (!response.ok) {
        const errorData = data as ApiErrorResponse;
        const firstError = errorData.errors 
          ? Object.values(errorData.errors)[0][0]
          : errorData.message;

        throw new Error(firstError || "Pendaftaran gagal");
      }

      // Automatically log them in with the registered user data
      const successData = data as ApiSuccessResponse;
      localStorage.setItem("user", JSON.stringify(successData.data.user));
      localStorage.setItem("token", successData.data.token);
      router.push("/dashboard");
    } catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : "Pendaftaran gagal"
  );
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
    <div className="bg-background min-h-screen flex items-center justify-center font-body-md text-body-md text-on-background selection:bg-primary-container selection:text-on-primary-container p-margin-mobile md:p-margin-desktop">
      {/* Main Container: Asymmetric Split Layout */}
      <div className="max-w-container-max w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        
        {/* Left Side: Hero Image (Shared with Login) */}
        <div className="hidden lg:block w-full h-[819px] rounded-xl overflow-hidden relative shadow-ambient group">
          <Image
            alt="Warm bakery scene"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9ym1PhlKNisLQ-7eZmWitlVvsxXnNXcayiheGGq0ZSNaqgZD3SC_swzJ-hTCIhkoeDKXcWOm0UnOw3TeqxuwyxaNG_olmEKT_WyAAp4DAhBtRy0xJ8oVCDtkNxQfhUutilK7V58-qR1qFGnfiEGnQcfXXfrdT3bHMHg7TSV5k8Rll9SMONgwibc9lg1De4JiOz_JMV-tA909KFqP_TXe6M6beLe_CWiIcajxHwdj_CCyH38EuGlGB46D9fcJQYd2LZowKX6a2hbI8"
          />
          {/* Glassmorphism overlay badge */}
          <div className="absolute bottom-8 left-8 right-8 backdrop-blur-md bg-surface/80 p-6 rounded-lg border border-surface-bright/50">
            <h2 className="font-headline-md text-headline-md text-primary mb-2 font-bold">Kehangatan di setiap gigitan.</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Daftar sekarang untuk memulai perjalanan Anda dengan rasa tradisional yang kami buat untuk momen modern.</p>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0 bg-surface-container-lowest rounded-xl p-6 sm:p-8 shadow-ambient border border-outline-variant/30">
          
          {/* Brand Header */}
          <div className="text-center mb-8">
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-2 font-bold">MyCakeShop</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Buat akun untuk mulai memesan kue kesukaan keluarga.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error-container text-on-error-container border border-error/20 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Login Method Toggle */}
          <div className="bg-surface-container-low p-1 rounded-lg flex mb-8">
            <button
              className={`flex-1 py-2 rounded-md font-label-sm text-label-sm transition-all text-center font-bold ${
                registerMethod === "email"
                  ? "bg-surface text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-primary"
              }`}
              onClick={() => setRegisterMethod("email")}
              type="button"
            >
              Email
            </button>
            <button
              className={`flex-1 py-2 rounded-md font-label-sm text-label-sm transition-all text-center font-bold ${
                registerMethod === "phone"
                  ? "bg-surface text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-primary"
              }`}
              onClick={() => setRegisterMethod("phone")}
              type="button"
            >
              Nomor Telepon
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="block font-label-sm text-label-sm text-on-surface uppercase tracking-wider font-semibold" htmlFor="fullname">Nama Lengkap</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">person</span>
                <input
                  autoComplete="name"
                  className="w-full bg-surface-bright border border-outline-variant text-on-surface rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md text-body-md placeholder:text-on-surface-variant/50"
                  id="fullname"
                  name="fullname"
                  placeholder="John Doe"
                  required
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                />
              </div>
            </div>

            {/* Email Input (Toggleable) */}
            {registerMethod === "email" ? (
              <div className="space-y-1.5">
                <label className="block font-label-sm text-label-sm text-on-surface uppercase tracking-wider font-semibold" htmlFor="email">Alamat Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">mail</span>
                  <input
                    autoComplete="email"
                    className="w-full bg-surface-bright border border-outline-variant text-on-surface rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md text-body-md placeholder:text-on-surface-variant/50"
                    id="email"
                    name="email"
                    placeholder="nama@email.com"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              /* Phone Input (Toggleable) */
              <div className="space-y-1.5">
                <label className="block font-label-sm text-label-sm text-on-surface uppercase tracking-wider font-semibold" htmlFor="phone">Nomor Telepon</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">call</span>
                  <input
                    autoComplete="tel"
                    className="w-full bg-surface-bright border border-outline-variant text-on-surface rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md text-body-md placeholder:text-on-surface-variant/50"
                    id="phone"
                    name="phone"
                    placeholder="081234567890"
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block font-label-sm text-label-sm text-on-surface uppercase tracking-wider font-semibold" htmlFor="password">Kata Sandi</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">lock</span>
                <input
                  className="w-full bg-surface-bright border border-outline-variant text-on-surface rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-body-md text-body-md placeholder:text-on-surface-variant/50"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 pt-1">
              <input
                className="rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-surface-container-lowest bg-surface-bright h-4 w-4 cursor-pointer mt-1"
                id="terms"
                name="terms"
                required
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <label className="font-body-md text-body-md text-on-surface-variant cursor-pointer select-none text-[14px]" htmlFor="terms">
                Saya setuju dengan{" "}
                <Link className="text-primary font-semibold hover:underline decoration-2 underline-offset-4" href="#">Syarat &amp; Ketentuan</Link>{" "}
                serta{" "}
                <Link className="text-primary font-semibold hover:underline decoration-2 underline-offset-4" href="#">Kebijakan Privasi</Link>{" "}
                MyCakeShop.
              </label>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                className="w-full bg-primary text-on-primary font-body-lg text-body-lg font-semibold rounded-lg py-3.5 hover:bg-primary-container hover:-translate-y-[1px] hover:shadow-ambient transition-all duration-200 active:translate-y-0 min-h-[48px] flex justify-center items-center"
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

          {/* Login Link */}
          <p className="text-center mt-8 font-body-md text-body-md text-on-surface-variant">
            Sudah punya akun? 
            <Link className="text-primary font-semibold hover:underline decoration-2 underline-offset-4 ml-1" href="/login">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

