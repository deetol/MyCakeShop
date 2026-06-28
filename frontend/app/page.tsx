"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { fetchProducts, FrontendProduct } from "@/lib/products";
import { api } from "@/lib/api";

interface HomeReview {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  user: { name: string };
  product: { id: number; name: string; main_image: string };
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<FrontendProduct[]>([]);
  const [bestsellerProducts, setBestsellerProducts] = useState<FrontendProduct[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [isLoadingBestseller, setIsLoadingBestseller] = useState(true);
  const [homeReviews, setHomeReviews] = useState<HomeReview[]>([]);
  const [reviewStats, setReviewStats] = useState<{ total: number; average: number } | null>(null);

  // Fetch produk Favorit
  useEffect(() => {
    fetchProducts({ sort: "recommended", per_page: 4 })
      .then(r => {
        // Filter tag Favorit atau Terlaris
        const favorites = r.products.filter(
          p => p.tag === "Favorit" || p.tag === "Favorit Keluarga"
        ).slice(0, 4);
        // Jika tidak ada yg di-tag, ambil 4 pertama
        setFeaturedProducts(favorites.length > 0 ? favorites : r.products.slice(0, 4));
      })
      .catch(() => setFeaturedProducts([]))
      .finally(() => setIsLoadingFeatured(false));
  }, []);

  // Fetch produk Terlaris
  useEffect(() => {
    fetchProducts({ sort: "recommended", per_page: 8 })
      .then(r => {
        const bestsellers = r.products.filter(p => p.tag === "Terlaris").slice(0, 4);
        // Jika tidak ada, ambil produk lain yang bukan sudah di featured
        setBestsellerProducts(bestsellers.length > 0 ? bestsellers : r.products.slice(0, 4));
      })
      .catch(() => setBestsellerProducts([]))
      .finally(() => setIsLoadingBestseller(false));
  }, []);

  // Fetch ulasan terbaru untuk homepage
  useEffect(() => {
    api.get<{ items: HomeReview[]; stats: { total: number; average: number } }>("/reviews?per_page=3&sort=latest")
      .then(res => {
        setHomeReviews(res.data.items);
        setReviewStats(res.data.stats);
      })
      .catch(() => {});
  }, []);

  const formatPrice = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

  // Skeleton card
  const SkeletonCard = () => (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-surface-container-low animate-pulse">
      <div className="h-64 bg-surface-container" />
      <div className="p-6 space-y-3">
        <div className="h-5 bg-surface-container rounded w-3/4" />
        <div className="h-4 bg-surface-container rounded" />
        <div className="h-4 bg-surface-container rounded w-2/3" />
        <div className="h-10 bg-surface-container rounded mt-4" />
      </div>
    </div>
  );

  return (
    <>
      <Navbar />

      <main className="w-full">
        {/* ── Hero Section ─────────────────────────────────────────────── */}
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-[64px] flex flex-col md:flex-row items-center gap-[48px]">
          <div className="flex-1 space-y-[24px]">
            <h1 className="font-display-lg text-display-lg text-on-background font-bold">
              Kehangatan Tradisi di Setiap Gigitan.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
              Nikmati sajian roti dan kue tradisional Indonesia yang dibuat dengan resep warisan keluarga dan bahan alami pilihan. Menyajikan kenyamanan dalam setiap momen spesial Anda.
            </p>
            <div className="flex gap-[16px] pt-[16px]">
              <Link
                href="/products"
                className="bg-primary text-on-primary font-label-sm text-label-sm h-[48px] px-[32px] rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all shadow-[0_4px_12px_rgba(112,62,14,0.15)] flex items-center justify-center font-bold"
              >
                Pesan Sekarang
              </Link>
              <Link
                href="/products"
                className="border border-tertiary text-tertiary font-label-sm text-label-sm h-[48px] px-[32px] rounded-full hover:bg-surface-container transition-all flex items-center justify-center font-bold"
              >
                Lihat Menu
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-primary-container/10 rounded-2xl transform translate-x-4 translate-y-4" />
            <div className="relative w-full h-[400px] md:h-[500px] z-10">
              <Image
                alt="Kue Tradisional"
                className="object-cover rounded-2xl shadow-[0_8px_24px_rgba(112,62,14,0.08)]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCd-PFKsf2VHhCnmsZg7r3v77nQJOT0A5W_7trX6KybZ_QVrRYP28MZsOphJAdZiz_eiNYxOvAYlYzwxUix_19lbgku3pCCirfkwHSJwhY3q0vVhalEDK7AZokuD3k3Edvnco_Bajg44s5Vm9NZa_XF0kk9oWHg4t5qklyfaxIXiZ9p7Tw6iQ-MOuNQwWKlQlNApv2Bc_64fxsihpGegLfXnDFFGEf_y4nWtzaMg_SKc-7tJ08_zla5cusoIJ2-beHg7dmBlR7dWNav"
                fill
                priority
              />
            </div>
          </div>
        </section>

        {/* ── Produk Favorit (dinamis dari API) ────────────────────────── */}
        <section className="bg-surface-container-low py-[64px] border-t border-surface-variant">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-[48px] gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-tertiary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-label-sm text-label-sm text-tertiary font-bold uppercase tracking-wider">Pilihan Utama</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-primary font-bold">Produk Favorit Pelanggan</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  Yang paling banyak dicintai dan sering dipesan kembali.
                </p>
              </div>
              <Link
                href="/products"
                className="flex items-center gap-1 text-primary hover:text-primary-container font-label-sm text-label-sm transition-colors font-bold shrink-0"
              >
                Lihat Semua
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>

            {isLoadingFeatured ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="text-center py-16 text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl block mb-3">storefront</span>
                <p className="font-body-md">Produk segera hadir. Tambahkan produk dengan tag <strong>Favorit</strong> di Admin Dashboard.</p>
                <Link href="/products" className="inline-block mt-4 px-6 py-2 bg-primary text-on-primary rounded-full text-sm font-bold hover:opacity-90 transition-opacity">
                  Lihat Semua Produk
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </section>

        {/* ── Produk Terlaris (dinamis dari API) ───────────────────────── */}
        {(isLoadingBestseller || bestsellerProducts.length > 0) && (
          <section className="py-[64px]">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-[48px] gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                    <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">Terlaris</span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Paling Banyak Dipesan</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    Produk yang paling sering dibeli dan direkomendasikan pelanggan.
                  </p>
                </div>
                <Link
                  href="/products"
                  className="flex items-center gap-1 text-primary hover:text-primary-container font-label-sm text-label-sm transition-colors font-bold shrink-0"
                >
                  Lihat Semua
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>

              {isLoadingBestseller ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {bestsellerProducts.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Testimoni Pelanggan ───────────────────────────────────── */}
        {homeReviews.length > 0 && (
          <section className="bg-surface-container-low py-[64px] border-t border-surface-variant">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-[48px] gap-4">
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
                <div className="flex items-center gap-3">
                  {reviewStats && reviewStats.total > 0 && (
                    <div className="flex items-center gap-2 bg-surface-container-highest px-3 py-2 rounded-full border border-outline-variant">
                      <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="font-bold text-primary text-sm">{reviewStats.average.toFixed(1)}</span>
                      <span className="text-on-surface-variant text-xs">({reviewStats.total} ulasan)</span>
                    </div>
                  )}
                  <Link
                    href="/testimonials"
                    className="flex items-center gap-1 text-primary hover:text-primary-container font-label-sm text-label-sm transition-colors font-bold shrink-0"
                  >
                    Lihat Semua
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {homeReviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-surface-container-lowest rounded-xl border border-surface-container p-6 flex flex-col gap-4"
                  >
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span
                          key={s}
                          className={`material-symbols-outlined text-sm ${s <= review.rating ? "text-primary" : "text-outline-variant"}`}
                          style={{ fontVariationSettings: s <= review.rating ? "'FILL' 1" : "'FILL' 0" }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    <p className="text-on-surface text-sm leading-relaxed italic flex-grow">
                      &ldquo;{review.comment.length > 120 ? review.comment.slice(0, 120) + "…" : review.comment}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 pt-2 border-t border-surface-container">
                      <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                        <span className="text-on-primary-container font-bold text-xs">{review.user.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-on-surface text-xs truncate">{review.user.name}</p>
                        <p className="text-[11px] text-on-surface-variant truncate">
                          Membeli <span className="text-primary font-medium">{review.product.name}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA Banner ───────────────────────────────────────────────── */}
        <section className="bg-primary py-[64px]">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
            <h2 className="font-headline-md text-headline-md text-on-primary font-bold mb-3">
              Siap Memesan Kue Favorit Anda?
            </h2>
            <p className="font-body-lg text-on-primary/80 max-w-xl mx-auto mb-8">
              Temukan koleksi lengkap roti dan kue kami. Dibuat fresh setiap hari dengan bahan pilihan terbaik.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-on-primary text-primary font-label-sm text-label-sm h-[52px] px-[40px] rounded-full hover:bg-primary-fixed transition-all shadow-lg font-bold active:scale-95"
            >
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
