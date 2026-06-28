"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { FrontendProduct } from "@/lib/products";

interface ProductCardProps {
  product: FrontendProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, setCartOpen } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to the details page
    e.stopPropagation();
    
    // Check if user is authenticated
    if (!user) {
      router.push("/login");
      return;
    }
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      unit: product.unit || undefined,
      stock: product.stock,
      productId: product.numericId,
    });
    // Open cart drawer immediately for dynamic feedback
    setCartOpen(true);
  };

  // Determine tag classes based on name
  const getTagStyle = (tag: string) => {
    switch (tag.toLowerCase()) {
      case "favorit keluarga":
      case "favorit":
      case "terlaris":
        return "bg-tertiary text-on-tertiary";
      case "baru":
        return "bg-surface-container-high text-on-surface border border-outline-variant";
      case "tradisional":
      case "premium":
      default:
        return "bg-primary text-on-primary";
    }
  };

  return (
    <Link href={`/products/${product.slug}`} className="block group h-full">
      <article className="bg-surface-container-lowest rounded-xl overflow-hidden flex flex-col border border-surface-container-low relative h-full cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_28px_-5px_rgba(112,62,14,0.15)] hover:border-primary/20">
        {/* Tag Badge */}
        {product.tag && (
          <div className={`absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full font-label-sm text-label-sm shadow-sm transition-transform duration-300 group-hover:scale-105 ${getTagStyle(product.tag)}`}>
            {product.tag}
          </div>
        )}

        {/* Image Container */}
        <div className="relative h-64 w-full bg-surface-container overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-108"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            unoptimized
          />
          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
        </div>

        {/* Details Container */}
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-2 truncate group-hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-3 flex-grow line-clamp-2">
            {product.description}
          </p>

          {/* Rating */}
          {product.ratingAvg !== null && product.reviewCount > 0 ? (
            <div className="flex items-center gap-1.5 mb-4">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => {
                  const filled = product.ratingAvg! >= s;
                  const half = !filled && product.ratingAvg! >= s - 0.5;
                  return (
                    <span key={s} className="material-symbols-outlined text-[14px] text-primary"
                      style={{ fontVariationSettings: filled || half ? "'FILL' 1" : "'FILL' 0" }}>
                      star
                    </span>
                  );
                })}
              </div>
              <span className="text-xs font-bold text-primary">{product.ratingAvg!.toFixed(1)}</span>
              <span className="text-xs text-on-surface-variant">({product.reviewCount})</span>
            </div>
          ) : (
            <div className="mb-4 h-5" />
          )}

          {/* Price */}
          <div className="flex items-end justify-between mb-6">
            <span className="font-body-lg text-body-lg font-bold text-primary">
              {formatPrice(product.price)}
              {product.unit && (
                <span className="font-body-md text-body-md text-on-surface-variant font-normal"> {product.unit}</span>
              )}
            </span>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleAddToCart}
            className="w-full h-12 bg-primary text-on-primary rounded-lg font-label-sm text-label-sm flex justify-center items-center gap-2 transition-all duration-200 hover:bg-primary-container hover:text-on-primary-container hover:gap-3 hover:shadow-md active:scale-95 group/btn"
          >
            <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover/btn:rotate-12">
              add_shopping_cart
            </span>
            Tambah ke Keranjang
          </button>
        </div>
      </article>
    </Link>
  );
}
