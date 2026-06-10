"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export interface ProductData {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  tag?: string;
  unit?: string;
  ingredients: string[];
  allergens: string[];
}

interface ProductDetailModalProps {
  product: ProductData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
}: ProductDetailModalProps) {
  const { addToCart, setCartOpen } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset quantity when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen, product]);

  if (!mounted || !product) return null;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        unit: product.unit,
      },
      quantity
    );
    onClose();
    // Smooth transition to show cart drawer
    setTimeout(() => {
      setCartOpen(true);
    }, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 transition-all duration-300 ${
        isOpen ? "visible" : "invisible"
      }`}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      ></div>

      {/* Modal Content Wrapper */}
      <div
        className={`relative w-full max-w-3xl bg-surface rounded-2xl overflow-hidden shadow-2xl border border-surface-container transform transition-all duration-300 flex flex-col md:flex-row max-h-[90vh] ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-surface/80 hover:bg-surface text-on-surface-variant hover:text-primary p-2 rounded-full border border-surface-container shadow-xs transition-colors"
        >
          <span className="material-symbols-outlined leading-none">close</span>
        </button>

        {/* Product Image Section */}
        <div className="relative w-full md:w-1/2 min-h-[250px] md:min-h-[400px] bg-surface-container flex-shrink-0">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
          {product.tag && (
            <span className="absolute top-4 left-4 bg-tertiary text-on-tertiary px-3.5 py-1.5 rounded-full font-label-sm text-label-sm shadow-sm font-semibold">
              {product.tag}
            </span>
          )}
        </div>

        {/* Product Details Section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col justify-between scrollbar-hide max-h-[50vh] md:max-h-[90vh]">
          <div className="space-y-6">
            <div>
              <span className="font-label-sm text-label-sm text-primary bg-primary-fixed px-3 py-1 rounded-md font-semibold inline-block mb-3">
                {product.category}
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                {product.name}
              </h2>
              <div className="mt-2 text-primary font-bold text-xl flex items-baseline">
                {formatPrice(product.price)}
                {product.unit && (
                  <span className="text-on-surface-variant font-normal text-sm ml-1">
                    {product.unit}
                  </span>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-body-md text-body-md font-bold text-on-surface mb-2">
                Deskripsi
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Ingredients */}
            <div>
              <h3 className="font-body-md text-body-md font-bold text-on-surface mb-2">
                Bahan-Bahan Utama
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="text-xs bg-surface-container-low text-on-surface border border-outline-variant px-2.5 py-1 rounded-lg"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            {/* Allergens warning */}
            {product.allergens && product.allergens.length > 0 && (
              <div className="bg-error-container text-on-error-container p-4 rounded-xl border border-error/10 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-error text-[20px] mt-0.5">
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
          </div>

          {/* Add to Cart Actions */}
          <div className="mt-8 pt-6 border-t border-surface-container space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-body-md text-body-md text-on-surface-variant font-medium">
                Jumlah Pesanan
              </span>
              <div className="flex items-center border border-outline rounded-lg overflow-hidden bg-surface-container">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-on-surface-variant hover:bg-surface-container-high transition-colors font-bold text-lg"
                >
                  -
                </button>
                <span className="px-4 py-1.5 font-body-md text-body-md text-on-surface font-semibold bg-surface-container-lowest min-w-[48px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1.5 text-on-surface-variant hover:bg-surface-container-high transition-colors font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 h-12 bg-primary text-on-primary rounded-lg font-label-sm text-label-sm flex justify-center items-center gap-2 hover:bg-primary-container transition-colors active:scale-95 duration-150 shadow-md font-semibold"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add_shopping_cart
                </span>
                Masukkan Keranjang - {formatPrice(product.price * quantity)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
