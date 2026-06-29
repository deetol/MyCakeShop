"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { api, resolveStorageUrl } from "@/lib/api";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  user: { name: string };
  product: { id: number; name: string; main_image: string };
}

interface ReviewStats {
  total: number;
  average: number;
  star5: number;
  star4: number;
  star3: number;
  star2: number;
  star1: number;
}

interface ReviewsData {
  items: Review[];
  pagination: { total: number; per_page: number; current_page: number; last_page: number };
  stats: ReviewStats;
}

const SORT_OPTIONS = [
  { value: "latest",  label: "Terbaru" },
  { value: "highest", label: "Rating Tertinggi" },
  { value: "lowest",  label: "Rating Terendah" },
];

const RATING_FILTERS = [
  { value: "",  label: "Semua" },
  { value: "5", label: "5 ★" },
  { value: "4", label: "4 ★" },
  { value: "3", label: "3 ★" },
  { value: "2", label: "2 ★" },
  { value: "1", label: "1 ★" },
];

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`material-symbols-outlined ${s <= rating ? "text-primary" : "text-outline-variant"}`}
          style={{ fontSize: size, fontVariationSettings: s <= rating ? "'FILL' 1" : "'FILL' 0" }}>
          star
        </span>
      ))}
    </div>
  );
}

function RatingBar({ count, total, star }: { count: number; total: number; star: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 w-10 shrink-0">
        <span className="text-xs font-semibold text-on-surface">{star}</span>
        <span className="material-symbols-outlined text-primary text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
      </div>
      <div className="flex-1 h-2.5 bg-surface-container rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-on-surface-variant w-6 text-right shrink-0">{count}</span>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="group bg-surface-container-lowest rounded-2xl border border-surface-container p-6 flex flex-col gap-4 h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_32px_-8px_rgba(112,62,14,0.14)] hover:border-primary/25">
      {/* Top: rating + waktu */}
      <div className="flex items-start justify-between gap-2">
        <Stars rating={review.rating} size={15} />
        <span className="text-[11px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full shrink-0">
          {review.created_at}
        </span>
      </div>

      {/* Quote */}
      <div className="relative flex-grow">
        <span className="absolute -top-1 -left-1 text-4xl text-primary/10 font-serif leading-none select-none">&ldquo;</span>
        <p className="text-on-surface text-sm leading-relaxed pl-3 italic">
          {review.comment}
        </p>
      </div>

      {/* Produk yang dibeli */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 bg-surface-container rounded-xl">
        <div className="w-9 h-9 rounded-lg overflow-hidden bg-surface-container-high shrink-0 relative">
          {review.product.main_image ? (
            <Image src={resolveStorageUrl(review.product.main_image)} alt={review.product.name}
              fill className="object-cover" unoptimized sizes="36px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-outline text-[18px]">cake</span>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wide">Membeli</p>
          <p className="text-xs font-semibold text-primary truncate">{review.product.name}</p>
        </div>
      </div>

      {/* User */}
      <div className="flex items-center gap-3 pt-3 border-t border-surface-container">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-container to-primary-fixed flex items-center justify-center shrink-0">
          <span className="text-primary font-bold text-sm">{review.user.name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-on-surface text-sm truncate">{review.user.name}</p>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-tertiary text-[12px]"
              style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <p className="text-[10px] text-on-surface-variant">Pembeli terverifikasi</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-surface-container p-6 space-y-4">
      <div className="flex justify-between">
        <div className="h-4 w-24 skeleton rounded" />
        <div className="h-4 w-14 skeleton rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-3.5 skeleton rounded" />
        <div className="h-3.5 skeleton rounded w-4/5" />
        <div className="h-3.5 skeleton rounded w-3/5" />
      </div>
      <div className="h-10 skeleton rounded-xl" />
      <div className="flex items-center gap-3 pt-3 border-t border-surface-container">
        <div className="w-9 h-9 skeleton rounded-full shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 skeleton rounded w-1/3" />
          <div className="h-2.5 skeleton rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsPage() {
  const mainRef = useScrollReveal<HTMLElement>();
  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("latest");
  const [ratingFilter, setRatingFilter] = useState("");
  const [error, setError] = useState("");

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ per_page: "9", page: String(page), sort });
      if (ratingFilter) params.set("rating", ratingFilter);
      const res = await api.get<ReviewsData>(`/reviews?${params}`);
      setData(res.data);
    } catch {
      setError("Gagal memuat ulasan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [page, sort, ratingFilter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);
  useEffect(() => { setPage(1); }, [sort, ratingFilter]);

  const stats  = data?.stats;
  const total  = stats?.total ?? 0;
  const avg    = stats?.average ?? 0;

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <Navbar />
      <main ref={mainRef} className="flex-grow w-full">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-surface-container-low border-b border-surface-container">
          {/* Background blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
            <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-tertiary/5 rounded-full blur-3xl animate-float animation-delay-500" />
          </div>

          <div className="relative px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-16 md:py-24">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">

              {/* Left — headline */}
              <div className="flex-1 text-center lg:text-left">
                <span className="animate-fade-down inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>reviews</span>
                  Ulasan Pelanggan
                </span>
                <h1 className="animate-fade-up animation-delay-100 font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary font-bold mb-4">
                  Apa Kata Mereka?
                </h1>
                <p className="animate-fade-up animation-delay-200 font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto lg:mx-0">
                  Ulasan nyata dari pelanggan yang telah memesan dan menikmati produk MyCakeShop.
                </p>
                <div className="animate-fade-up animation-delay-300 flex items-center gap-3 mt-8 justify-center lg:justify-start">
                  <Link href="/testimonials/create"
                    className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-sm hover:bg-primary-container hover:text-on-primary-container transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    Tulis Ulasan
                  </Link>
                  {total > 0 && (
                    <span className="text-sm text-on-surface-variant">
                      {total.toLocaleString("id-ID")} ulasan tersedia
                    </span>
                  )}
                </div>
              </div>

              {/* Right — rating card */}
              {total > 0 && stats && (
                <div className="animate-scale-in animation-delay-200 bg-surface-container-lowest rounded-3xl border border-surface-container shadow-lg p-8 w-full max-w-sm mx-auto lg:mx-0 shrink-0">
                  {/* Score big */}
                  <div className="flex items-end gap-4 mb-6">
                    <div>
                      <div className="text-6xl font-bold text-primary leading-none">{avg.toFixed(1)}</div>
                      <div className="mt-2"><Stars rating={Math.round(avg)} size={20} /></div>
                      <p className="text-sm text-on-surface-variant mt-1">dari {total} ulasan</p>
                    </div>
                    {/* Donut-style visual */}
                    <div className="ml-auto relative w-16 h-16">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--color-surface-container)" strokeWidth="3"/>
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--color-primary)" strokeWidth="3"
                          strokeDasharray={`${(avg / 5) * 100} 100`} strokeLinecap="round"/>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{Math.round((avg/5)*100)}%</span>
                      </div>
                    </div>
                  </div>
                  {/* Bars */}
                  <div className="space-y-2.5">
                    {([5,4,3,2,1] as const).map(s => (
                      <RatingBar key={s} star={s}
                        count={stats[`star${s}` as keyof ReviewStats] as number}
                        total={total} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Filter bar ────────────────────────────────────────── */}
        <div className="sticky top-[80px] z-10 bg-background/95 backdrop-blur-md border-b border-surface-container shadow-sm">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-3 flex flex-wrap gap-2 items-center justify-between">
            {/* Rating chips */}
            <div className="flex flex-wrap gap-2">
              {RATING_FILTERS.map((f) => (
                <button key={f.value} onClick={() => setRatingFilter(f.value)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all border ${
                    ratingFilter === f.value
                      ? "bg-primary text-on-primary border-primary shadow-sm"
                      : "bg-surface-container-lowest text-on-surface-variant border-surface-container hover:border-primary hover:text-primary"
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-on-surface-variant hidden sm:block">Urutkan:</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}
                className="text-sm bg-surface-container-lowest border border-surface-container rounded-lg px-3 py-1.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Grid ──────────────────────────────────────────────── */}
        <section className="py-12 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          {/* Error */}
          {error && (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-5xl text-error block mb-3">error_outline</span>
              <p className="text-on-surface-variant mb-4">{error}</p>
              <button onClick={fetchReviews}
                className="px-6 py-2 bg-primary text-on-primary rounded-full text-sm font-bold hover:opacity-90">
                Coba Lagi
              </button>
            </div>
          )}

          {/* Loading */}
          {!error && loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Empty */}
          {!error && !loading && data?.items.length === 0 && (
            <div className="text-center py-24 animate-scale-in">
              <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl text-outline">rate_review</span>
              </div>
              <p className="font-headline-sm text-on-surface font-bold mb-1">Belum ada ulasan</p>
              <p className="text-on-surface-variant text-sm mb-6">
                {ratingFilter ? `Belum ada ulasan dengan ${ratingFilter} bintang.` : "Jadilah yang pertama memberi ulasan!"}
              </p>
              <Link href="/testimonials/create"
                className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full text-sm font-bold hover:opacity-90">
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Tulis Ulasan Pertama
              </Link>
            </div>
          )}

          {/* Cards */}
          {!error && !loading && data && data.items.length > 0 && (
            <>
              <p className="text-sm text-on-surface-variant mb-6">
                Menampilkan{" "}
                <span className="font-semibold text-on-surface">
                  {(page - 1) * 9 + 1}–{Math.min(page * 9, data.pagination.total)}
                </span>{" "}
                dari <span className="font-semibold text-on-surface">{data.pagination.total}</span> ulasan
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.items.map((review, i) => (
                  <div key={review.id} className="animate-fade-up"
                    style={{ animationDelay: `${(i % 9) * 0.07}s`, animationFillMode: 'both' }}>
                    <ReviewCard review={review} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {data.pagination.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-surface-container hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  {Array.from({ length: data.pagination.last_page }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === data.pagination.last_page || Math.abs(p - page) <= 1)
                    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) => p === "..." ? (
                      <span key={`e-${i}`} className="px-1 text-on-surface-variant text-sm">…</span>
                    ) : (
                      <button key={p} onClick={() => setPage(p as number)}
                        className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                          page === p ? "bg-primary text-on-primary shadow-sm" : "border border-surface-container hover:border-primary hover:text-primary text-on-surface"
                        }`}>
                        {p}
                      </button>
                    ))}
                  <button onClick={() => setPage((p) => Math.min(data.pagination.last_page, p + 1))}
                    disabled={page === data.pagination.last_page}
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-surface-container hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <section className="py-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="relative bg-primary rounded-3xl p-8 md:p-14 text-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-float" />
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3 animate-float animation-delay-500" />
            </div>
            <div className="relative z-10">
              <h2 className="font-headline-md text-headline-md text-on-primary font-bold mb-3">
                Sudah Pernah Memesan?
              </h2>
              <p className="font-body-lg text-on-primary/80 max-w-xl mx-auto mb-8">
                Bagikan pengalamanmu dan bantu pelanggan lain menemukan produk terbaik kami.
              </p>
              <Link href="/testimonials/create"
                className="inline-flex items-center gap-2 bg-on-primary text-primary px-10 py-4 rounded-full font-bold hover:-translate-y-1 hover:shadow-xl transition-all active:scale-95">
                <span className="material-symbols-outlined">edit</span>
                Tulis Ulasan Sekarang
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
