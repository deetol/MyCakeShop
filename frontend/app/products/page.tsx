"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import { fetchProducts, fetchCategories, FrontendProduct, ApiCategory } from "@/lib/products";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function ProductsPage() {
  const mainRef = useScrollReveal<HTMLElement>();
  const [products, setProducts] = useState<FrontendProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [total, setTotal] = useState(0);

  // Load categories once
  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchProducts({
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
        sort: sortBy,
        per_page: 48,
      });
      setProducts(result.products);
      setTotal(result.total);
    } catch {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery, sortBy]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(loadProducts, 300);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  const handleReset = () => {
    setSelectedCategory("");
    setSearchQuery("");
    setSortBy("recommended");
  };

  const SORT_OPTIONS = [
    { value: "recommended", label: "Urutkan: Rekomendasi" },
    { value: "top_rated",   label: "Rating Terbaik" },
    { value: "price_asc",   label: "Harga: Rendah ke Tinggi" },
    { value: "price_desc",  label: "Harga: Tinggi ke Rendah" },
    { value: "newest",      label: "Terbaru" },
  ];

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <Navbar />

      <main ref={mainRef} className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-16">
        {/* Page Header */}
        <div className="animate-fade-up mb-12 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-2 font-bold">
              Etalase Rasa
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Jelajahi koleksi roti manis, kue kering klasik, dan jajanan pasar otentik kami.
            </p>
          </div>
          {total > 0 && (
            <p className="text-sm text-on-surface-variant font-semibold shrink-0 animate-fade-in animation-delay-300">
              {total} produk tersedia
            </p>
          )}
        </div>

        {/* Filter Bar */}
        <div className="animate-fade-up animation-delay-100 flex flex-col lg:flex-row justify-between items-stretch lg:items-center mb-12 gap-6 bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-surface-container-low">
          {/* Category Chips */}
          <div className="flex flex-wrap gap-3 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-6 py-2 rounded-full font-label-sm text-label-sm h-12 flex items-center whitespace-nowrap transition-all active:scale-95 border cursor-pointer ${
                !selectedCategory
                  ? "bg-primary text-on-primary border-primary font-bold shadow-xs"
                  : "bg-surface-container-lowest border-outline text-on-surface-variant hover:bg-surface-container hover:border-primary"
              }`}
            >
              Semua Varian
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-6 py-2 rounded-full font-label-sm text-label-sm h-12 flex items-center whitespace-nowrap transition-all active:scale-95 border cursor-pointer ${
                  selectedCategory === cat.slug
                    ? "bg-primary text-on-primary border-primary font-bold shadow-xs"
                    : "bg-surface-container-lowest border-outline text-on-surface-variant hover:bg-surface-container hover:border-primary"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-grow sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari kue..."
                className="w-full h-12 pl-11 pr-4 bg-surface-container border border-outline text-on-surface font-body-md rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
              />
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">search</span>
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors hover:rotate-90 duration-200">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>

            <div className="relative w-full sm:w-64">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full h-12 pl-4 pr-10 appearance-none bg-surface-container border border-outline text-on-surface font-body-md rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-shadow"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-xl overflow-hidden border border-surface-container-low"
                style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="h-64 skeleton" />
                <div className="p-6 space-y-3">
                  <div className="h-5 skeleton rounded w-3/4" />
                  <div className="h-4 skeleton rounded w-full" />
                  <div className="h-4 skeleton rounded w-2/3" />
                  <div className="h-10 skeleton rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="animate-scale-in flex flex-col items-center justify-center text-center py-20 px-4 space-y-6">
            <span className="material-symbols-outlined text-outline-variant" style={{ fontSize: "64px" }}>
              {searchQuery || selectedCategory ? "sentiment_dissatisfied" : "storefront"}
            </span>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-2">
                {searchQuery || selectedCategory ? "Kue tidak ditemukan" : "Produk segera hadir"}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                {searchQuery || selectedCategory
                  ? "Kami tidak dapat menemukan produk yang sesuai. Silakan coba kata kunci lain."
                  : "Kami sedang menyiapkan produk terbaik untuk Anda."}
              </p>
            </div>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={handleReset}
                className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-label-sm text-label-sm hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-xs active:scale-95"
              >
                Reset Filter & Pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product, i) => (
              <div
                key={product.id}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 0.06}s`, animationFillMode: 'both' }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}
