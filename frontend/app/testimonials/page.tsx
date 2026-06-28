"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { api } from "@/lib/api";

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
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
  stats: ReviewStats;
}

const SORT_OPTIONS = [
  { value: "latest", label: "Terbaru" },
  { value: "highest", label: "Rating Tertinggi" },
  { value: "lowest", label: "Rating Terendah" },
];

const RATING_FILTERS = [
  { value: "", label: "Semua Rating" },
  { value: "5", label: "5 Bintang" },
  { value: "4", label: "4 Bintang" },
  { value: "3", label: "3 Bintang" },
  { value: "2", label: "2 Bintang" },
  { value: "1", label: "1 Bintang" },
];

function StarRow({ count, label }: { count: number; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-on-surface-variant w-12 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full" style={{ width: `${count}%` }} />
      </div>
      <span className="text-on-surface-variant w-8 text-right shrink-0">{count}%</span>
    </div>
  );
}

function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "text-xl" : "text-sm";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={`material-symbols-outlined ${cls} ${s <= rating ? "text-primary" : "text-outline-variant"}`}
          style={{ fontVariationSettings: s <= rating ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const initial = review.user.name.charAt(0).toUpperCase();
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-2">
        <StarDisplay rating={review.rating} />
        <span className="text-xs text-on-surface-variant shrink-0">{review.created_at}</span>
      </div>
      <p className="text-on-surface text-sm leading-relaxed flex-grow italic">
        &ldquo;{review.comment}&rdquo;
      </p>
      <div className="flex items-center gap-3 pt-2 border-t border-surface-container">
        <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center shrink-0">
          <span className="text-on-primary-container font-bold text-sm">{initial}</span>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-on-surface text-sm truncate">{review.user.name}</p>
          <p className="text-[11px] text-on-surface-variant truncate">
            Membeli{" "}
            <span className="text-primary font-medium">{review.product.name}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-6 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="h-4 w-24 bg-surface-container rounded" />
        <div className="h-4 w-16 bg-surface-container rounded" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-surface-container rounded" />
        <div className="h-4 bg-surface-container rounded w-4/5" />
        <div className="h-4 bg-surface-container rounded w-3/5" />
      </div>
      <div className="flex items-center gap-3 pt-3 border-t border-surface-container">
        <div className="w-9 h-9 bg-surface-container rounded-full" />
        <div className="space-y-1 flex-1">
          <div className="h-3 bg-surface-container rounded w-1/3" />
          <div className="h-3 bg-surface-container rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsPage() {
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
      const params = new URLSearchParams({
        per_page: "9",
        page: String(page),
        sort,
      });
      if (ratingFilter) params.set("rating", ratingFilter);

      const res = await api.get<ReviewsData>(`/reviews?${params}`);
      setData(res.data);
    } catch {
      setError("Gagal memuat ulasan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [page, sort, ratingFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Reset halaman ke 1 saat filter berubah
  useEffect(() => {
    setPage(1);
  }, [sort, ratingFilter]);

  const stats = data?.stats;
  const total = stats?.total ?? 0;
  const avg = stats?.average ?? 0;

  const getPercent = (count: number) =>
    total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow w-full">
        {/* Hero */}
        <section className="relative overflow-hidden py-16 md:py-24 bg-surface-container-low border-b border-surface-container">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary-fixed rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-tertiary-fixed rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />
          </div>
          <div className="relative px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
            <span className="inline-block px-4 py-1.5 mb-5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              Ulasan Pelanggan
            </span>
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-4 font-bold">
              Apa Kata Mereka?
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-8">
              Ulasan nyata dari pelanggan yang telah memesan dan menikmati produk MyCakeShop.
            </p>

            {/* Rating summary */}
            {stats && total > 0 && (
              <div className="inline-flex items-center gap-3 bg-surface-container-lowest border border-surface-container rounded-2xl px-6 py-4 shadow-sm">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary leading-none">{avg.toFixed(1)}</div>
                  <div className="mt-1">
                    <StarDisplay rating={Math.round(avg)} size="md" />
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">{total.toLocaleString("id-ID")} ulasan</p>
                </div>
                <div className="w-px h-16 bg-surface-container mx-2" />
                <div className="space-y-1.5 text-left min-w-[160px]">
                  <StarRow count={getPercent(stats.star5)} label="5 ⭐" />
                  <StarRow count={getPercent(stats.star4)} label="4 ⭐" />
                  <StarRow count={getPercent(stats.star3)} label="3 ⭐" />
                  <StarRow count={getPercent(stats.star2)} label="2 ⭐" />
                  <StarRow count={getPercent(stats.star1)} label="1 ⭐" />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Filter & Sort bar */}
        <section className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-surface-container py-3 px-margin-mobile md:px-margin-desktop">
          <div className="max-w-container-max mx-auto flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {RATING_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setRatingFilter(f.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    ratingFilter === f.value
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-surface-container-lowest text-on-surface-variant border-surface-container hover:border-primary hover:text-primary"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-on-surface-variant">Urutkan:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-sm bg-surface-container-lowest border border-surface-container rounded-lg px-3 py-1.5 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Review grid */}
        <section className="py-12 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          {error && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-5xl text-error block mb-3">error_outline</span>
              <p className="text-on-surface-variant mb-4">{error}</p>
              <button
                onClick={fetchReviews}
                className="px-6 py-2 bg-primary text-on-primary rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {!error && loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {!error && !loading && data?.items.length === 0 && (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-5xl text-outline block mb-3">rate_review</span>
              <p className="font-headline-sm text-on-surface font-bold mb-1">Belum ada ulasan</p>
              <p className="text-on-surface-variant text-sm">
                {ratingFilter ? `Tidak ada ulasan dengan ${ratingFilter} bintang.` : "Jadilah yang pertama memberi ulasan!"}
              </p>
            </div>
          )}

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
                {data.items.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>

              {/* Pagination */}
              {data.pagination.last_page > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-surface-container hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  {Array.from({ length: data.pagination.last_page }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === data.pagination.last_page || Math.abs(p - page) <= 2)
                    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "..." ? (
                        <span key={`ellipsis-${i}`} className="px-1 text-on-surface-variant text-sm">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p as number)}
                          className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                            page === p
                              ? "bg-primary text-on-primary"
                              : "border border-surface-container hover:border-primary hover:text-primary text-on-surface"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setPage((p) => Math.min(data.pagination.last_page, p + 1))}
                    disabled={page === data.pagination.last_page}
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-surface-container hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* CTA */}
        <section className="py-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="bg-primary-container rounded-[2rem] p-8 md:p-14 text-center text-on-primary-container relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-1/4 -translate-y-1/4">
              <span className="material-symbols-outlined text-[120px]">rate_review</span>
            </div>
            <h2 className="font-headline-md text-headline-md font-bold mb-3 relative z-10">
              Sudah Pernah Memesan?
            </h2>
            <p className="font-body-lg text-body-lg mb-8 max-w-xl mx-auto opacity-90 relative z-10">
              Bagikan pengalamanmu dan bantu pelanggan lain menemukan produk terbaik kami.
            </p>
            <Link
              href="/testimonials/create"
              className="inline-flex items-center gap-2 bg-on-primary-container text-primary-container px-10 py-4 rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-lg relative z-10"
            >
              <span className="material-symbols-outlined">edit</span>
              <span>Tulis Ulasan</span>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
