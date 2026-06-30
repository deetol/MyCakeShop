"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    setCartOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
    clearCart,
  } = useCart();

  const [checkoutStep, setCheckoutStep] = useState<"cart" | "success">("cart");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset checkout step when drawer closes
  useEffect(() => {
    if (!isCartOpen) {
      const timer = setTimeout(() => {
        setCheckoutStep("cart");
      }, 300); // Wait for transition to finish
      return () => clearTimeout(timer);
    }
  }, [isCartOpen]);

  if (!mounted) return null;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleCheckout = () => {
    setCheckoutStep("success");
    // Clear the cart after showing success
    setTimeout(() => {
      clearCart();
    }, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${
        isCartOpen ? "visible" : "invisible"
      }`}
      aria-labelledby="slide-over-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Background overlay */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ${
          isCartOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setCartOpen(false)}
      ></div>

      {/* Slide-over panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`w-screen max-w-md bg-surface border-l border-outline-variant transform transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl flex flex-col h-full ${
            isCartOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          }`}
        >
          {/* Header */}
          <div className="p-6 border-b border-surface-container flex justify-between items-center bg-surface-container">
            <h2 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">shopping_cart</span>
              Keranjang Belanja
            </h2>
            <button
              onClick={() => setCartOpen(false)}
              className="text-on-surface-variant hover:text-primary p-2 rounded-full hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            {checkoutStep === "success" ? (
              /* Success Checkout Screen */
              <div className="flex flex-col items-center justify-center text-center h-full space-y-6 py-12">
                <div className="w-24 h-24 bg-tertiary-fixed text-on-tertiary-fixed rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                  <span className="material-symbols-outlined animate-fade-in animation-delay-200" style={{ fontSize: "48px", fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                </div>
                <div className="animate-fade-up animation-delay-300">
                  <h3 className="font-display-lg-mobile text-display-lg-mobile text-primary font-bold mb-2">
                    Checkout Berhasil!
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
                    Terima kasih! Pesanan Anda sedang kami proses. Kehangatan tradisi akan segera tiba!
                  </p>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="animate-fade-up animation-delay-400 bg-primary text-on-primary px-8 py-3 rounded-full font-label-sm text-label-sm shadow-md hover:bg-primary-container transition-all hover:-translate-y-0.5 active:scale-95"
                >
                  Kembali ke Katalog
                </button>
              </div>
            ) : cartItems.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center text-center h-full space-y-6">
                <span
                  className="material-symbols-outlined text-outline-variant"
                  style={{ fontSize: "72px" }}
                >
                  shopping_basket
                </span>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-2">
                    Keranjang Kosong
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
                    Jelajahi rasa otentik kami dan tambahkan beberapa kue lezat ke keranjang Anda!
                  </p>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="border-2 border-primary text-primary hover:bg-surface-container px-6 py-2.5 rounded-full font-label-sm text-label-sm transition-colors active:scale-95 duration-150"
                >
                  Mulai Belanja
                </button>
              </div>
            ) : (
              /* Items List */
              <div className="space-y-4">
                {cartItems.map((item, i) => (
                  <div
                    key={item.id}
                    className="animate-fade-up flex gap-4 p-4 rounded-xl bg-surface-container-lowest border border-surface-container-low transition-all duration-200 hover:shadow-sm hover:border-primary/20"
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    {/* Item Image */}
                    <div className="relative w-20 h-20 bg-surface-container rounded-lg overflow-hidden flex-shrink-0">
                      {item.image && item.image !== '/placeholder-cake.svg' ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-surface-variant text-3xl">cake</span>
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="font-body-md text-body-md font-semibold text-on-surface truncate">
                          {item.name}
                        </h4>
                        <p className="text-primary font-semibold text-sm mt-0.5">
                          {formatPrice(item.price)}
                          {item.unit && (
                            <span className="text-on-surface-variant font-normal text-xs">
                              {" "}
                              {item.unit}
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-outline rounded-lg overflow-hidden bg-surface-container">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={!item.cartItemId}
                            className="px-2.5 py-1 text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 font-body-md text-body-md text-on-surface font-semibold bg-surface-container-lowest min-w-[32px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={!item.cartItemId || (item.stock !== undefined && item.quantity >= item.stock)}
                            className="px-2.5 py-1 text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title={item.stock !== undefined && item.quantity >= item.stock ? `Stok maksimal: ${item.stock}` : 'Tambah'}
                          >
                            +
                          </button>
                        </div>

                        {/* Stock warning */}
                        {item.stock !== undefined && item.quantity >= item.stock && (
                          <span className="text-[10px] text-error font-semibold">
                            Maks {item.stock}
                          </span>
                        )}

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-error hover:bg-error-container hover:text-on-error-container p-1.5 rounded-lg transition-colors flex items-center"
                          title="Hapus Item"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {checkoutStep !== "success" && cartItems.length > 0 && (
            <div className="p-6 border-t border-surface-container bg-surface-container-lowest space-y-4 animate-fade-up">
              <div className="flex justify-between items-center">
                <span className="font-body-lg text-body-lg text-on-surface-variant font-medium">
                  Total Pembayaran
                </span>
                <span className="font-display-lg-mobile text-headline-md text-primary font-bold transition-all duration-200">
                  {formatPrice(cartTotal)}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={() => setCartOpen(false)}
                className="w-full h-12 bg-primary text-on-primary rounded-lg font-label-sm text-label-sm flex justify-center items-center gap-2 hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-95 shadow-md font-bold hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span className="material-symbols-outlined text-[20px]">shopping_cart_checkout</span>
                Checkout Sekarang
              </Link>
              <Link
                href="/cart"
                onClick={() => setCartOpen(false)}
                className="w-full h-12 border border-primary text-primary rounded-lg font-label-sm text-label-sm flex justify-center items-center gap-2 hover:bg-surface-container transition-all active:scale-95 font-bold"
              >
                <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                Lihat Keranjang Lengkap
              </Link>
              <p className="text-center font-label-sm text-[11px] text-on-surface-variant">
                Pajak dan biaya pengiriman akan dihitung saat checkout.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
