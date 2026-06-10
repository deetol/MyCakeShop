"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal, { ProductData } from "@/components/ProductDetailModal";
import CartDrawer from "@/components/CartDrawer";

// Product Database
const PRODUCTS: ProductData[] = [
  {
    id: "roti-sisir",
    name: "Roti Sisir Mentega",
    price: 45000,
    category: "Roti Manis",
    tag: "Favorit Keluarga",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCa0wQH7v7z8p5IgK0yZlPJy29Lbja_DHdcCxSvgLdqnrzXOpbIgfVsKdoIh609bIqTHpzn3esdihwNYdNdt9RrABKEIxkWCkIkvcMN7JrDvZyhC--ggsBlu3qtCE1oJxs3HVcD1HMywg3FGUukKtNm2VFpRUKXAFSZrv_MDSzGhh4Kqyznur5ixVcwA0DVYuILlar1mVRsNgugPo2rQlEovNqagqQ6WenRiiJeUEryVqNaEMtO73nrhkFI6xMznKGWDpDiGOlHz1Hv",
    description: "Roti manis klasik dengan olesan mentega melimpah dan gula premium. Lembut dan harum.",
    ingredients: ["Tepung Terigu Protein Tinggi", "Mentega Premium", "Kuning Telur Organik", "Gula Tebu Pilihan", "Ragi Alami"],
    allergens: ["Mengandung Gluten (Tepung Terigu)", "Produk Susu (Mentega)", "Telur"]
  },
  {
    id: "nastar-wisman",
    name: "Nastar Klasik Wisman",
    price: 120000,
    category: "Kue Kering",
    tag: "Baru",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9oC5JnYK-5oY1ZATXFL3oqfBJevldk-vL5IF03iWw468o1BksgRbTw8hcaDckup9JoluzL6zd8EKfiYlDKnd3h_0j_7itJh5WlezFStIwa35UOhyNAE6s3FIbGCigKj596VypA4ziu40WjW88BEmujUWwiF6RRo692ZsWFIJTSS5tUtIaw__E3N7qFBnhBxUJnGOk-RXgToKeQG5v17N_hyVNwgHkryc1yQg0nqE3sKFVaB2grHSg3abJ14_hgeMAH5oZ2abTz3gU",
    description: "Kue kering ikonik dengan selai nanas asli buatan sendiri dan butter Wisman yang lumer di mulut.",
    ingredients: ["Selai Nanas Asli (Nanas Madu & Gula Semut)", "Butter Wisman", "Tepung Terigu Rendah Protein", "Maizena", "Suku Bubuk"],
    allergens: ["Mengandung Gluten", "Produk Susu", "Telur"]
  },
  {
    id: "kue-ku",
    name: "Kue Ku Kacang Hijau",
    price: 7500,
    unit: "/ pcs",
    category: "Jajanan Pasar",
    tag: "Tradisional",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCByCzim_7g9rmjjGklYsPD3XBAY81iE-fFpnBQ_uctNvkggR-fQDzVYOG3SpktnLlePS-WXD1IcO5XU14RrwRaAOkKH59Bb332jguxtahrpsR6WhqZ6usjWMHBVX_rY_LdXquYwal4FRSBiYNR5tHVc2Rj_k1JQAgEbSxTYdld9odTqWULpR3nl4gDwzpvD0gU0gnWeGXeZ7tiO_CCBysIhdIO374Ck-oPIbUnWMyGZKKAJ0-b4kt5SLuFc1NdeXPjzjhaF-tmMES7",
    description: "Jajanan pasar kenyal dengan isian kacang hijau kupas yang manis legit. Dibungkus daun pisang asli.",
    ingredients: ["Tepung Ketan Putih", "Kacang Hijau Kupas", "Santan Kelapa Murni", "Gula Pasir", "Daun Pisang"],
    allergens: ["Bebas gluten secara alami (diolah di fasilitas yang memproses gluten)", "Kacang Hijau"]
  },
  {
    id: "bolu-pandan",
    name: "Bolu Pandan Asli",
    price: 65000,
    category: "Roti Manis",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDL4MyWeEee7uge6PGOnz5yOpJFoEDGg3YbJorP6hXAo5gnyZ5C2AMkR4YzvZgV6MT6kuftpeANGMvY0i3uXZRN3bI75Bibt3H59ahdDJPd-g8r7D6g_gZmHdtKk6F_RVnRavyFaNfHmgnlfm8_uOlRANEg4FGMmviLVcqpNLWaoK2mCOLqQrJYlAhbrkOIcdvLLQ2BUW8N1jqDFjEouzkpvI1Jw6wkY97SkSgImcRX3iUWk2cniaNXj4Gq_H4zKdZs3U0eKPGTWEAx",
    description: "Sponge cake super lembut dengan ekstrak daun pandan dan suji murni. Tanpa perasa buatan.",
    ingredients: ["Tepung Terigu Protein Sedang", "Telur Ayam Segar", "Gula Tebu Pilihan", "Ekstrak Daun Pandan & Suji Asli", "Santan Kelapa"],
    allergens: ["Mengandung Gluten", "Telur", "Santan Kelapa"]
  },
  {
    id: "lapis-legit",
    name: "Lapis Legit Spekuk",
    price: 180000,
    category: "Kue Kering",
    tag: "Terlaris",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWQ-VBmnDBtcoX1pPlu2nJg9ZJUovc907njeag3n-QMMCHfpZr2oM0KNjdhZ_mvGgUt5CmdcGT9wJM9WlLStLRfrO9P-7HLi847ZICn7oyU9bTFB4Q01gwn2tWk4IcATU4HOTnEiIddcJr892LMecZMFHRYwkM2tJyeuct-L4vwz6n5wG4EWjWGyWef8sJg0Yhn4FN5Bz2UzMUSOQPkv7Tt2MaxAB_YLrwHKIhvjWkn86s-aRHjwSqDnOcr-byIb7WUrt-17sSyatA",
    description: "Lapis legit legendaris beraroma bumbu spekuk harum, dibuat dengan puluhan kuning telur berkualitas tinggi dan mentega impor.",
    ingredients: ["Kuning Telur Ayam Organik", "Butter Premium", "Gula Halus", "Tepung Terigu Rendah Gluten", "Bubuk Spekuk Pilihan"],
    allergens: ["Mengandung Gluten", "Produk Susu", "Telur"]
  },
  {
    id: "klepon",
    name: "Klepon Gula Merah",
    price: 15000,
    unit: "/ porsi",
    category: "Jajanan Pasar",
    tag: "Tradisional",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZw1fFDTyETRsDVXKOhZnZtxuYuH-kxjf5EWkoWFNb8Uyz3V2gGjt0KKiJ4q8-cj9Dj0FrUsw_hgrkNVhT1spOQngExz_i9BrNpJNSuE2Tjh_LzLGH-ZCuGfz2A2KX8Mj8-IQ39LWbG-OCbtafNU-PHKK9Nir_SFokjJWfoc2jcu7t6YDMSKbkLW8ls5sjk1Ezd3-BZ5TqETZTxV9gBSPpHXVJ7vN0hayRK3QV--U0bHWa7szl0LwmsWmQnL_4BFOFbRCug_1zy325",
    description: "Bola ketan kenyal isi gula merah cair yang melumer saat digigit, dibalur dengan kelapa parut segar yang gurih.",
    ingredients: ["Tepung Ketan Putih", "Gula Merah Aren Cair", "Ekstrak Daun Pandan", "Kelapa Parut Setengah Tua", "Garam"],
    allergens: ["Kelapa Parut"]
  },
  {
    id: "roti-sobek",
    name: "Roti Sobek Cokelat Keju",
    price: 50000,
    category: "Roti Manis",
    tag: "Favorit Keluarga",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCe6PqN6eQf_CwHvCvZEhGaNd8Q6m6acLTBhdd8Odi-kF-ZvDd1ggx4ZfINgKtJEwaInkscS0LvkmjB0rj_zK8upwombuXM93x2px1WepJ-zMx-bQLWxUXU4d3uZBnl2b1OcMox_U1r574_w7jpqIILjh--3AYuQt-dHe1taIRgfwLaZs-ya_k7HS4Fh4vRPtq_X7EXzNVL1NrlbbdXrXUwDBnG3tMDr458AkjgXd5lR_rSFfIC_UAeD3pConitIxMNAYmnDYl4aJDz",
    description: "Roti sobek super empuk dengan separuh isian cokelat lumer premium dan separuh keju cheddar gurih.",
    ingredients: ["Tepung Terigu Protein Tinggi", "Ragi Alami", "Susu Cair Segar", "Butter Premium", "Cokelat Batang", "Keju Cheddar"],
    allergens: ["Mengandung Gluten", "Produk Susu", "Telur"]
  },
  {
    id: "kastengel",
    name: "Kastengel Keju Edam",
    price: 110000,
    category: "Kue Kering",
    tag: "Baru",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9oC5JnYK-5oY1ZATXFL3oqfBJevldk-vL5IF03iWw468o1BksgRbTw8hcaDckup9JoluzL6zd8EKfiYlDKnd3h_0j_7itJh5WlezFStIwa35UOhyNAE6s3FIbGCigKj596VypA4ziu40WjW88BEmujUWwiF6RRo692ZsWFIJTSS5tUtIaw__E3N7qFBnhBxUJnGOk-RXgToKeQG5v17N_hyVNwgHkryc1yQg0nqE3sKFVaB2grHSg3abJ14_hgeMAH5oZ2abTz3gU",
    description: "Kue kering kastengel gurih renyah bertabur keju cheddar parut melimpah dan adonan beraroma keju Edam impor.",
    ingredients: ["Keju Edam Impor", "Butter Wisman", "Tepung Terigu Protein Rendah", "Kuning Telur", "Keju Cheddar Parut"],
    allergens: ["Mengandung Gluten", "Produk Susu", "Telur"]
  }
];

const CATEGORIES = ["Semua Varian", "Roti Manis", "Kue Kering", "Jajanan Pasar"];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("Semua Varian");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Urutkan: Rekomendasi");
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleOpenDetail = (product: ProductData) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedProduct(null);
  };

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
          const aPriority = a.tag === "Favorit Keluarga" || a.tag === "Terlaris" ? 1 : 0;
          const bPriority = b.tag === "Favorit Keluarga" || b.tag === "Terlaris" ? 1 : 0;
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
                onViewDetails={handleOpenDetail}
              />
            ))}
          </div>
        )}
      </main>

      {/* Shared Footer */}
      <Footer />

      {/* Modals & Slide-overs */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
      />
      <CartDrawer />
    </div>
  );
}
