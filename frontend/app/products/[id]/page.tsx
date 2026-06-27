"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { fetchProduct, fetchProducts, FrontendProduct } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, setCartOpen } = useCart();
  const { user } = useAuth();

  const slug = params?.id as string;

  const [product, setProduct] = useState<FrontendProduct | null>(null);
  const [related, setRelated] = useState<FrontendProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [selectedSize, setSelectedSize] = useState<{ id: number; name: string; price: number } | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Load product from API
  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    fetchProduct(slug).then(p => {
      setProduct(p);
      if (p) {
        setActiveImage(p.image);
        setSelectedSize(p.sizes.length > 0 ? p.sizes[0] : null);
        setQuantity(1);
        // Load related products
        fetchProducts({ category: p.category ? undefined : undefined, per_page: 8 })
          .then(r => setRelated(r.products.filter(x => x.id !== p.id).slice(0, 4)))
          .catch(() => setRelated([]));
      }
    }).catch(() => setProduct(null))
      .finally(() => setIsLoading(false));
  }, [slug]);

  const formatPrice = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
            <div className="lg:col-span-6 aspect-[4/5] bg-surface-container rounded-xl" />
            <div className="lg:col-span-6 space-y-4 pt-8">
              <div className="h-5 bg-surface-container rounded w-24" />
              <div className="h-10 bg-surface-container rounded w-3/4" />
              <div className="h-8 bg-surface-container rounded w-32" />
              <div className="h-24 bg-surface-container rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center py-20 px-4 text-center">
          <span className="material-symbols-outlined text-outline-variant text-[72px] mb-4">sentiment_dissatisfied</span>
          <h1 className="font-display-lg text-display-lg text-on-surface mb-2 font-bold">Kue Tidak Ditemukan</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mb-8">
            Maaf, kami tidak dapat menemukan produk yang Anda cari.
          </p>
          <Link href="/products" className="bg-primary text-on-primary px-8 py-3 rounded-full font-label-sm text-label-sm hover:bg-primary-container transition-colors shadow-md">
            Kembali ke Katalog
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const currentPrice = selectedSize ? selectedSize.price : product.price;
  const galleryImages = product.gallery.length > 0 ? product.gallery : [product.image];

  const handleAddToCart = () => {
    if (!user) { router.push("/login"); return; }
    const name = selectedSize ? `${product.name} (${selectedSize.name})` : product.name;
    const id = selectedSize ? `${product.id}-${selectedSize.name.replace(/\s+/g, "-").toLowerCase()}` : product.id;
    addToCart({
      id,
      name,
      price: currentPrice,
      image: product.image,
      unit: product.unit,
      stock: product.stock,
      productId: product.numericId,
      productSizeId: selectedSize?.id,
    }, quantity);
    setCartOpen(true);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Breadcrumbs */}
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-6">
          <nav className="flex text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider gap-2 items-center">
            <Link className="hover:text-primary transition-colors" href="/">Beranda</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <Link className="hover:text-primary transition-colors" href="/products">Produk</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-primary font-bold">{product.category}</span>
          </nav>
        </div>

        {/* Product Detail */}
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            {/* Gallery */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-surface-container relative shadow-sm group">
                <Image
                  src={activeImage || product.image}
                  alt={product.name}
                  fill priority
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized
                />
                {product.tag && (
                  <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-full border border-tertiary/20 flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-tertiary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-label-sm text-label-sm text-tertiary font-semibold">{product.tag}</span>
                  </div>
                )}
              </div>
              {galleryImages.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {galleryImages.map((img, i) => (
                    <button key={i} onClick={() => setActiveImage(img)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeImage === img ? "border-primary opacity-100" : "border-transparent opacity-70 hover:opacity-100 hover:border-primary/50"}`}
                    >
                      <div className="relative w-full h-full">
                        <Image alt={`Thumbnail ${i + 1}`} src={img} fill className="object-cover" unoptimized />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="lg:col-span-6 flex flex-col pt-4 lg:pt-8">
              <span className="font-label-sm text-label-sm text-primary bg-primary-fixed px-3 py-1 rounded-md font-semibold w-fit mb-3">{product.category}</span>
              <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-background font-bold mb-2">{product.name}</h1>
              <p className="font-body-lg text-body-lg font-bold text-primary mb-6 text-2xl">
                {formatPrice(currentPrice)}
                {product.unit && <span className="text-on-surface-variant font-normal text-sm ml-1">{product.unit}</span>}
              </p>

              <div className="w-full h-[1px] bg-outline-variant/30 mb-8" />

              {/* Description */}
              <div className="mb-8">
                <h3 className="font-headline-md text-on-background mb-3 text-lg font-semibold">Deskripsi</h3>
                <p className="text-on-surface-variant font-body-md leading-relaxed">{product.description}</p>
              </div>

              {/* Ingredients */}
              {product.ingredients.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-headline-md text-on-background mb-3 text-lg font-semibold">Bahan Utama</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-body-md text-on-surface-variant">
                    {product.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary flex-shrink-0" />
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sizes */}
              {product.sizes.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-headline-md text-on-background mb-3 text-lg font-semibold">Ukuran</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map(s => (
                      <button key={s.id} onClick={() => setSelectedSize(s)}
                        className={`px-6 py-2 rounded-full font-label-sm text-label-sm border transition-all cursor-pointer ${
                          selectedSize?.id === s.id ? "bg-primary border-primary text-on-primary font-bold" : "bg-surface hover:bg-surface-container border-outline text-on-surface-variant"
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Allergens */}
              {product.allergens.length > 0 && (
                <div className="mb-8 bg-error-container text-on-error-container p-4 rounded-xl border border-error/10 flex items-start gap-2.5 max-w-md">
                  <span className="material-symbols-outlined text-error text-[20px] mt-0.5">warning</span>
                  <div className="text-xs space-y-1">
                    <p className="font-bold">Informasi Alergen:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {product.allergens.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-auto flex flex-col sm:flex-row gap-4 pt-8 border-t border-outline-variant/30">
                <div className="flex items-center justify-between border border-outline rounded-lg h-12 w-full sm:w-32 bg-surface overflow-hidden">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[20px]">remove</span>
                  </button>
                  <span className="w-12 text-center font-semibold select-none">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="w-10 h-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-grow flex items-center justify-center gap-2 bg-primary text-on-primary font-label-sm rounded-lg min-h-[48px] px-8 hover:bg-primary-container hover:text-on-primary-container transition-all shadow-sm active:scale-[0.98] cursor-pointer font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                  {product.stock === 0 ? "Stok Habis" : `Tambah ke Keranjang — ${formatPrice(currentPrice * quantity)}`}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="bg-surface-container-low py-16 border-t border-surface-variant">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="font-display-lg-mobile text-display-lg-mobile text-on-background font-bold mb-2">Mungkin Anda Suka</h2>
                  <p className="font-body-md text-on-surface-variant">Pilihan kue favorit lainnya.</p>
                </div>
                <Link className="hidden sm:flex items-center gap-1 text-primary hover:text-primary-container font-label-sm transition-colors font-semibold" href="/products">
                  Lihat Semua <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
