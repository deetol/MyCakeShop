"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { PRODUCTS, ProductData, ProductSizeOption } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, setCartOpen } = useCart();
  const { user } = useAuth();
  
  const id = params?.id as string;

  // Find product by id
  const product = useMemo(() => {
    return PRODUCTS.find((p) => p.id === id) || null;
  }, [id]);

  // Gallery active image state
  const [activeImage, setActiveImage] = useState("");
  // Selected size option
  const [selectedSize, setSelectedSize] = useState<ProductSizeOption | null>(null);
  // Quantity state
  const [quantity, setQuantity] = useState(1);

  // Set default values when product loads
  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      } else {
        setSelectedSize(null);
      }
      setQuantity(1);
    }
  }, [product]);

  // If product not found
  if (!product) {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center py-20 px-4 text-center">
          <span className="material-symbols-outlined text-outline-variant text-[72px] mb-4">
            sentiment_dissatisfied
          </span>
          <h1 className="font-display-lg text-display-lg text-on-surface mb-2 font-bold">
            Kue Tidak Ditemukan
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mb-8">
            Maaf, kami tidak dapat menemukan produk yang Anda cari. Silakan kembali ke katalog kami.
          </p>
          <Link
            href="/products"
            className="bg-primary text-on-primary px-8 py-3 rounded-full font-label-sm text-label-sm hover:bg-primary-container transition-colors shadow-md"
          >
            Kembali ke Katalog
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const currentPrice = selectedSize ? selectedSize.price : product.price;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleAddToCart = () => {
    // Check if user is authenticated
    if (!user) {
      router.push("/login");
      return;
    }
    
    const nameWithOption = selectedSize
      ? `${product.name} (${selectedSize.name})`
      : product.name;

    addToCart(
      {
        id: selectedSize ? `${product.id}-${selectedSize.name.replace(/\s+/g, "-").toLowerCase()}` : product.id,
        name: nameWithOption,
        price: currentPrice,
        image: product.image,
        unit: product.unit,
      },
      quantity
    );
    
    // Open drawer immediately
    setCartOpen(true);
  };

  // Get Related Products (4 products in same category, or general, excluding current product)
  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id)
    .sort((a, b) => {
      // Prioritize same category
      const aSameCat = a.category === product.category ? 1 : 0;
      const bSameCat = b.category === product.category ? 1 : 0;
      return bSameCat - aSameCat;
    })
    .slice(0, 4);

  // Gallery images list
  const galleryImages = product.gallery || [product.image];

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      {/* Shared Header Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow">
        {/* Breadcrumbs */}
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-6">
          <nav className="flex text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider gap-2 items-center">
            <Link className="hover:text-primary transition-colors" href="/">
              Beranda
            </Link>
            <span className="material-symbols-outlined text-[16px] leading-none">chevron_right</span>
            <Link className="hover:text-primary transition-colors" href="/products">
              Produk
            </Link>
            <span className="material-symbols-outlined text-[16px] leading-none">chevron_right</span>
            <span className="text-primary font-bold">{product.category}</span>
          </nav>
        </div>

        {/* Product Detail Section */}
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            
            {/* Product Image Gallery (Left Side) */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-surface-container relative shadow-sm group">
                <Image
                  src={activeImage || product.image}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {product.tag && (
                  <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-full border border-tertiary/20 flex items-center gap-1 shadow-sm">
                    <span
                      className="material-symbols-outlined text-tertiary text-[16px] leading-none"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span className="font-label-sm text-label-sm text-tertiary font-semibold">
                      {product.tag}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Thumbnails (Only show if multiple gallery items exist) */}
              {galleryImages.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {galleryImages.map((imgUrl, index) => {
                    const isActive = activeImage === imgUrl;
                    return (
                      <button
                        key={index}
                        onClick={() => setActiveImage(imgUrl)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200 ${
                          isActive
                            ? "border-primary opacity-100 shadow-xs"
                            : "border-transparent opacity-70 hover:opacity-100 hover:border-primary/50"
                        }`}
                      >
                        <div className="relative w-full h-full">
                          <Image
                            alt={`Thumbnail ${index + 1}`}
                            src={imgUrl}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Product Info (Right Side) */}
            <div className="lg:col-span-6 flex flex-col pt-4 lg:pt-8">
              <span className="font-label-sm text-label-sm text-primary bg-primary-fixed px-3 py-1 rounded-md font-semibold w-fit mb-3">
                {product.category}
              </span>
              <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-background font-bold mb-2">
                {product.name}
              </h1>
              <p className="font-body-lg text-body-lg font-bold text-primary mb-6 text-2xl">
                {formatPrice(currentPrice)}
                {product.unit && (
                  <span className="text-on-surface-variant font-normal text-sm ml-1">
                    {product.unit}
                  </span>
                )}
              </p>
              
              <div className="w-full h-[1px] bg-outline-variant/30 mb-8"></div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="font-headline-md text-headline-md text-on-background mb-3 text-lg font-semibold">
                  Deskripsi
                </h3>
                <p className="text-on-surface-variant font-body-md leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Ingredients */}
              <div className="mb-8">
                <h3 className="font-headline-md text-headline-md text-on-background mb-3 text-lg font-semibold">
                  Bahan Utama
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-body-md text-on-surface-variant">
                  {product.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary flex-shrink-0"></span>
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sizes / Variants (Chips) */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-headline-md text-headline-md text-on-background mb-3 text-lg font-semibold">
                    Ukuran
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((sizeOpt) => {
                      const isSelected = selectedSize?.name === sizeOpt.name;
                      return (
                        <button
                          key={sizeOpt.name}
                          onClick={() => setSelectedSize(sizeOpt)}
                          className={`px-6 py-2 rounded-full font-label-sm text-label-sm border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-primary border-primary text-on-primary font-bold shadow-xs"
                              : "bg-surface hover:bg-surface-container border-outline text-on-surface-variant"
                          }`}
                        >
                          {sizeOpt.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Allergens warning */}
              {product.allergens && product.allergens.length > 0 && (
                <div className="mb-8 bg-error-container text-on-error-container p-4 rounded-xl border border-error/10 flex items-start gap-2.5 max-w-md">
                  <span className="material-symbols-outlined text-error text-[20px] mt-0.5 leading-none">
                    warning
                  </span>
                  <div className="text-xs space-y-1">
                    <p className="font-bold">Informasi Alergen:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {product.allergens.map((all, i) => (
                        <li key={i}>{all}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Actions (Quantity & Buy) */}
              <div className="mt-auto flex flex-col sm:flex-row gap-4 pt-8 border-t border-outline-variant/30">
                {/* Quantity Picker */}
                <div className="flex items-center justify-between border border-outline rounded-lg h-12 w-full sm:w-32 bg-surface overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors focus:outline-none font-bold text-lg cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px] leading-none">remove</span>
                  </button>
                  <span className="w-12 text-center font-body-md text-on-background bg-transparent p-0 font-semibold select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors focus:outline-none font-bold text-lg cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px] leading-none">add</span>
                  </button>
                </div>
                
                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-grow flex items-center justify-center gap-2 bg-primary text-on-primary font-label-sm text-label-sm rounded-lg min-h-[48px] px-8 hover:bg-primary-container hover:text-on-primary-container transition-all shadow-sm active:scale-[0.98] cursor-pointer font-bold"
                >
                  <span className="material-symbols-outlined text-[20px] leading-none">shopping_bag</span>
                  Tambah ke Keranjang - {formatPrice(currentPrice * quantity)}
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Related Products Section */}
        <section className="bg-surface-container-low py-16 border-t border-surface-variant">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="font-display-lg-mobile text-display-lg-mobile text-on-background font-bold mb-2">
                  Mungkin Anda Suka
                </h2>
                <p className="font-body-md text-on-surface-variant">
                  Pilihan kue favorit lainnya yang pas untuk menemani hari Anda.
                </p>
              </div>
              <Link
                className="hidden sm:flex items-center gap-1 text-primary hover:text-primary-container font-label-sm text-label-sm transition-colors font-semibold"
                href="/products"
              >
                Lihat Semua
                <span className="material-symbols-outlined text-[18px] leading-none">arrow_forward</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter lg:gap-6">
              {relatedProducts.map((relProduct) => (
                <Link
                  key={relProduct.id}
                  href={`/products/${relProduct.id}`}
                  className="bg-surface rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col border border-surface-container-low cursor-pointer hover:-translate-y-0.5 duration-300"
                >
                  <div className="aspect-square relative overflow-hidden bg-surface-container">
                    <Image
                      alt={relProduct.name}
                      src={relProduct.image}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {relProduct.tag && (
                      <div className="absolute top-3 right-3 bg-surface/90 px-2.5 py-0.5 rounded-full border border-tertiary/20">
                        <span className="font-label-sm text-[10px] text-tertiary uppercase tracking-wider font-semibold">
                          {relProduct.tag}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-headline-md text-headline-md text-on-background text-[18px] leading-tight mb-2 group-hover:text-primary transition-colors font-semibold truncate">
                      {relProduct.name}
                    </h3>
                    <p className="font-body-lg text-body-lg font-bold text-primary mt-auto">
                      {formatPrice(relProduct.price)}
                      {relProduct.unit && (
                        <span className="text-on-surface-variant font-normal text-xs">
                          {relProduct.unit}
                        </span>
                      )}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile View All Button */}
            <div className="mt-8 flex justify-center sm:hidden">
              <Link
                href="/products"
                className="px-6 py-3 rounded-lg border border-tertiary text-tertiary font-label-sm text-label-sm w-full hover:bg-tertiary hover:text-on-tertiary transition-colors flex items-center justify-center font-bold"
              >
                Lihat Semua Produk
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Shared Footer */}
      <Footer />

      {/* Slide-over Drawer */}
      <CartDrawer />
    </div>
  );
}
