"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import { PRODUCTS } from "@/data/products";

const CATEGORIES = ["Semua Varian", "Roti Manis", "Kue Kering", "Jajanan Pasar"];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("Semua Varian");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Urutkan: Rekomendasi");

  const handleResetFilters = () => {
    setSelectedCategory("Semua Varian");
    setSearchQuery("");
    setSortBy("Urutkan: Rekomendasi");
  };

  // Filter & Sort logic
  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    // Filter by Category
    if (selectedCategory !== "Semua Varian") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Sort products
    switch (sortBy) {
      case "Harga: Rendah ke Tinggi":
        result.sort((a, b) => a.price - b.price);
        break;
      case "Harga: Tinggi ke Rendah":
        result.sort((a, b) => b.price - a.price);
        break;
      case "Terbaru":
        // Sort items with "Baru" tag first
        result.sort((a, b) => {
          const aIsNew = a.tag === "Baru" ? 1 : 0;
          const bIsNew = b.tag === "Baru" ? 1 : 0;
          return bIsNew - aIsNew;
        });
        break;
      case "Urutkan: Rekomendasi":
      default:
        // Sort items with "Favorit Keluarga" or "Terlaris" first
        result.sort((a, b) => {
          const aPriority = a.tag === "Favorit Keluarga" || a.tag === "Terlaris" || a.tag === "Favorit" ? 1 : 0;
          const bPriority = b.tag === "Favorit Keluarga" || b.tag === "Terlaris" || b.tag === "Favorit" ? 1 : 0;
          return bPriority - aPriority;
        });
        break;
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      {/* Shared Header Navigation */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-16">
        {/* Page Header */}
        <div className="mb-12 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-2 font-bold">
              Etalase Rasa
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Jelajahi koleksi roti manis, kue kering klasik, dan jajanan pasar otentik kami. Dibuat dengan resep warisan dan bahan berkualitas.
            </p>
          </div>
        </div>

        {/* Filters, Search & Sorting Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center mb-12 gap-6 bg-surface-container-lowest p-4 rounded-xl shadow-xs border border-surface-container-low">
          {/* Category Chips (Horizontal Scrollable) */}
          <div className="flex flex-wrap gap-3 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto scrollbar-hide">
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-label-sm text-label-sm h-12 flex items-center whitespace-nowrap transition-all active:scale-95 duration-150 border cursor-pointer ${
                    isActive
                      ? "bg-primary text-on-primary border-primary font-bold shadow-xs"
                      : "bg-surface-container-lowest border-outline text-on-surface-variant hover:bg-surface-container hover:border-primary"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Search & Sorting Selectors */}
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-grow sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kue..."
                className="w-full h-12 pl-11 pr-4 bg-surface-container border border-outline text-on-surface font-body-md text-body-md rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                search
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary leading-none"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>

            {/* Sorting Select */}
            <div className="relative w-full sm:w-64">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full h-12 pl-4 pr-10 appearance-none bg-surface-container border border-outline text-on-surface font-body-md text-body-md rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
              >
                <option>Urutkan: Rekomendasi</option>
                <option>Harga: Rendah ke Tinggi</option>
                <option>Harga: Tinggi ke Rendah</option>
                <option>Terbaru</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          /* Empty Search/Filter State */
          <div className="flex flex-col items-center justify-center text-center py-20 px-4 space-y-6">
            <span
              className="material-symbols-outlined text-outline-variant"
              style={{ fontSize: "64px" }}
            >
              sentiment_dissatisfied
            </span>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-2">
                Kue tidak ditemukan
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                Kami tidak dapat menemukan produk yang sesuai dengan pencarian atau filter Anda. Silakan coba kata kunci lain.
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-label-sm text-label-sm hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-xs active:scale-95 duration-150"
            >
              Reset Filter & Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </main>

      {/* Shared Footer */}
      <Footer />

      {/* Slide-over Drawer */}
      <CartDrawer />
    </div>
  );
}
