"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { fetchProducts, FrontendProduct } from "@/lib/products";
import { api } from "@/lib/api";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface HomeReview {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  user: { name: string };
  product: { id: number; name: string; main_image: string };
}

export default function Home() {
  const mainRef = useScrollReveal<HTMLElement>();

  const [featuredProducts, setFeaturedProducts] = useState<FrontendProduct[]>([]);
  const [bestsellerProducts, setBestsellerProducts] = useState<FrontendProduct[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [isLoadingBestseller, setIsLoadingBestseller] = useState(true);
  const [homeReviews, setHomeReviews] = useState<HomeReview[]>([]);
  const [reviewStats, setReviewStats] = useState<{ total: number; average: number } | null>(null);

  useEffect(() => {
    fetchProducts({ sort: "recommended", per_page: 12 })
      .then(r => {
        const favorites = r.products.filter(
          p => p.tag === "Favorit" || p.tag === "Favorit Keluarga"
        ).slice(0, 4);
        setFeaturedProducts(favorites.length > 0 ? favorites : r.products.slice(0, 4));
      })
      .catch(() => setFeaturedProducts([]))
      .finally(() => setIsLoadingFeatured(false));
  }, []);

  useEffect(() => {
    fetchProducts({ sort: "recommended", per_page: 12 })
      .then(r => {
        const bestsellers = r.products.filter(p => p.tag === "Terlaris").slice(0, 4);
        setBestsellerProducts(bestsellers.length > 0 ? bestsellers : r.products.slice(0, 4));
      })
      .catch(() => setBestsellerProducts([]))
      .finally(() => setIsLoadingBestseller(false));
  }, []);

  useEffect(() => {
    api.get<{ items: HomeReview[]; stats: { total: number; average: number } }>("/reviews?per_page=10&sort=latest")
      .then(res => {
        setHomeReviews(res.data.items);
        setReviewStats(res.data.stats);
      })
      .catch(() => {});
  }, []);

  // Buat array kartu marquee — duplikasi agar loop mulus & layar selalu penuh
  // Minimal 12 kartu agar animasi seamless di layar lebar
  const marqueeCards = useMemo(() => {
    if (homeReviews.length === 0) return [];
    const minCards = 12;
    const times = Math.max(Math.ceil(minCards / homeReviews.length) * 2, 4);
    return Array.from({ length: times }, (_, ri) =>
      homeReviews.map((r, ci) => ({ ...r, _key: `${r.id}-${ri}-${ci}` }))
    ).flat();
  }, [homeReviews]);

  // Durasi: lebih lambat agar nyaman dibaca — 5 detik per kartu
  const marqueeDuration = Math.max(marqueeCards.length * 5, 30);

  const formatPrice = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

  const SkeletonCard = () => (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-surface-container-low">
      <div className="h-64 skeleton" />
      <div className="p-6 space-y-3">
        <div className="h-5 skeleton rounded w-3/4" />
        <div className="h-4 skeleton rounded" />
        <div className="h-4 skeleton rounded w-2/3" />
        <div className="h-10 skeleton rounded mt-4" />
      </div>
    </div>
  );

  const uniqueBestsellers = bestsellerProducts.filter(
    b => !featuredProducts.find(f => f.id === b.id)
  );

  return (
    <>
      <Navbar />
      <main ref={mainRef} className="w-full">

        {/* ── Hero ───────────────────────────────────────────────────── */}
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-[64px] flex flex-col md:flex-row items-center gap-[48px]">
          <div className="flex-1 space-y-[24px]">
            <h1 className="animate-fade-up font-display-lg text-display-lg text-on-background font-bold">
              Kehangatan Tradisi di Setiap Gigitan.
            </h1>
            <p className="animate-fade-up animation-delay-200 font-body-lg text-body-lg text-on-surface-variant max-w-lg">
              Nikmati sajian roti dan kue tradisional Indonesia yang dibuat dengan resep warisan keluarga dan bahan alami pilihan.
            </p>
            <div className="animate-fade-up animation-delay-300 flex gap-[16px] pt-[16px]">
              <Link href="/products"
                className="bg-primary text-on-primary font-label-sm text-label-sm h-[48px] px-[32px] rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all shadow-[0_4px_12px_rgba(112,62,14,0.15)] flex items-center justify-center font-bold hover:-translate-y-0.5">
                Pesan Sekarang
              </Link>
              <Link href="/products"
                className="border border-tertiary text-tertiary font-label-sm text-label-sm h-[48px] px-[32px] rounded-full hover:bg-surface-container transition-all flex items-center justify-center font-bold hover:-translate-y-0.5">
                Lihat Menu
              </Link>
            </div>
          </div>

          <div className="animate-slide-right animation-delay-200 flex-1 w-full relative">
            <div className="absolute inset-0 bg-primary-container/10 rounded-2xl transform translate-x-4 translate-y-4" />
            <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
              <Image
                src="/images/Kolase Foto - Indulge in Luxury.png"
                alt="Hero"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* ── Produk Pilihan ─────────────────────────────────────────── */}
        <section className="bg-surface-container-low py-[64px] border-t border-surface-variant">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="reveal flex flex-col md:flex-row justify-between items-start md:items-end mb-[48px] gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-tertiary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-label-sm text-label-sm text-tertiary font-bold uppercase tracking-wider">Pilihan Utama</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-primary font-bold">Produk Pilihan Kami</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">Produk terbaik yang paling banyak dicintai pelanggan.</p>
              </div>
              <Link href="/products" className="flex items-center gap-1 text-primary font-label-sm text-label-sm transition-colors font-bold shrink-0 link-underline hover:text-primary-container">
                Lihat Semua <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>

            {isLoadingFeatured ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="reveal text-center py-16 text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl block mb-3">storefront</span>
                <p className="font-body-md">Produk segera hadir.</p>
                <Link href="/products" className="inline-block mt-4 px-6 py-2 bg-primary text-on-primary rounded-full text-sm font-bold hover:opacity-90">
                  Lihat Semua Produk
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((p, i) => (
                  <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.08}s`, animationFillMode: "both" }}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Produk Terlaris (hanya jika berbeda dari featured) ─────── */}
        {!isLoadingBestseller && uniqueBestsellers.length > 0 && (
          <section className="py-[64px]">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
              <div className="reveal flex flex-col md:flex-row justify-between items-start md:items-end mb-[48px] gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                    <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">Terlaris</span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Paling Banyak Dipesan</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">Produk yang paling sering dibeli dan direkomendasikan.</p>
                </div>
                <Link href="/products" className="flex items-center gap-1 text-primary font-label-sm text-label-sm transition-colors font-bold shrink-0 link-underline hover:text-primary-container">
                  Lihat Semua <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {uniqueBestsellers.map((p, i) => (
                  <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.08}s`, animationFillMode: "both" }}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Testimoni Marquee ──────────────────────────────────────── */}
        {homeReviews.length > 0 && (
          <section className="bg-surface-container-low py-[64px] border-t border-surface-variant overflow-hidden">
            {/* Header */}
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>reviews</span>
                    <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">Ulasan Pelanggan</span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Yang Mereka Katakan</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    Ulasan nyata dari pelanggan yang sudah merasakan produk kami.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {reviewStats && reviewStats.total > 0 && (
                    <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant px-4 py-2 rounded-full shadow-sm">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <span key={s}
                            className={`material-symbols-outlined text-[14px] ${s <= Math.round(reviewStats.average) ? "text-primary" : "text-outline-variant"}`}
                            style={{ fontVariationSettings: s <= Math.round(reviewStats.average) ? "'FILL' 1" : "'FILL' 0" }}>
                            star
                          </span>
                        ))}
                      </div>
                      <span className="font-bold text-primary text-sm">{reviewStats.average.toFixed(1)}</span>
                      <span className="text-on-surface-variant text-xs">({reviewStats.total} ulasan)</span>
                    </div>
                  )}
                  <Link href="/testimonials"
                    className="flex items-center gap-1 text-primary font-label-sm text-label-sm transition-colors font-bold link-underline hover:text-primary-container">
                    Lihat Semua <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Marquee */}
            <div className="marquee-wrapper">
              <div
                className="marquee-track"
                style={{
                  "--marquee-duration": `${marqueeDuration}s`,
                  gap: "20px",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                } as React.CSSProperties}
              >
                {marqueeCards.map((review) => (
                  <div
                    key={review._key}
                    style={{ width: "300px", flexShrink: 0 }}
                    className="bg-surface-container-lowest rounded-2xl border border-surface-container p-6 flex flex-col gap-4 shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 cursor-default select-none"
                  >
                    {/* Bintang + tanggal */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <span key={s}
                            className={`material-symbols-outlined text-[16px] ${s <= review.rating ? "text-primary" : "text-outline-variant"}`}
                            style={{ fontVariationSettings: s <= review.rating ? "'FILL' 1" : "'FILL' 0" }}>
                            star
                          </span>
                        ))}
                      </div>
                      <span className="text-[11px] text-on-surface-variant">{review.created_at}</span>
                    </div>

                    {/* Komentar */}
                    <p className="text-on-surface text-sm leading-relaxed italic flex-grow">
                      &ldquo;{review.comment.length > 140 ? review.comment.slice(0, 140) + "…" : review.comment}&rdquo;
                    </p>

                    {/* Produk */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-primary-fixed/30 rounded-lg">
                      <span className="material-symbols-outlined text-primary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>cake</span>
                      <p className="text-xs text-primary font-semibold truncate">{review.product.name}</p>
                    </div>

                    {/* User */}
                    <div className="flex items-center gap-3 pt-2 border-t border-surface-container">
                      <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center shrink-0 text-on-primary-container font-bold text-sm">
                        {review.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-on-surface text-sm truncate">{review.user.name}</p>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-tertiary text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                          <p className="text-[11px] text-on-surface-variant">Pembeli terverifikasi</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA Banner ────────────────────────────────────────────── */}
        <section className="bg-primary py-[64px] overflow-hidden relative">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-float" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3 animate-float animation-delay-500" />
          <div className="reveal max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center relative z-10">
            <h2 className="font-headline-md text-headline-md text-on-primary font-bold mb-3">
              Siap Memesan Kue Favorit Anda?
            </h2>
            <p className="font-body-lg text-on-primary/80 max-w-xl mx-auto mb-8">
              Temukan koleksi lengkap roti dan kue kami. Dibuat fresh setiap hari dengan bahan pilihan terbaik.
            </p>
            <Link href="/products"
              className="inline-flex items-center gap-2 bg-on-primary text-primary font-label-sm text-label-sm h-[52px] px-[40px] rounded-full hover:bg-primary-fixed transition-all shadow-lg font-bold hover:-translate-y-1 hover:shadow-xl">
              <span className="material-symbols-outlined text-[20px]">storefront</span>
              Jelajahi Semua Produk
            </Link>
          </div>
        </section>

      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
