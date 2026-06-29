"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    cartTotal,
    clearCart,
  } = useCart();

  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading while checking authentication
  if (loading || !user) {
    return (
      <>
        <Navbar />
        <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-16 flex items-center justify-center">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-on-surface-variant font-medium">Memeriksa autentikasi...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!mounted) {
    return (
      <>
        <Navbar />
        <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-16 flex items-center justify-center">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-on-surface-variant font-medium">Memuat keranjang...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculations
  const packagingFee = cartItems.length > 0 ? 5000 : 0;
  const taxRate = 0.11;
  const taxFee = Math.round((cartTotal + packagingFee) * taxRate);
  const totalBill = cartItems.length > 0 ? cartTotal + packagingFee + taxFee : 0;

  const handleCheckout = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      clearCart();
    }, 200);
  };

  return (
    <>
      <Navbar />

      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-16">
        {checkoutSuccess ? (
          /* Checkout Success View */
          <div className="max-w-md mx-auto text-center py-16 px-6 bg-surface-container-lowest rounded-2xl border border-surface-container shadow-lg space-y-6 animate-in fade-in duration-300">
            <div className="w-24 h-24 bg-tertiary-fixed text-on-tertiary-fixed rounded-full flex items-center justify-center shadow-md mx-auto animate-bounce">
              <span className="material-symbols-outlined" style={{ fontSize: "48px" }}>
                check_circle
              </span>
            </div>
            <div>
              <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary font-bold mb-2">
                Checkout Berhasil!
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Terima kasih telah memesan di MyCakeShop. Pesanan Anda sedang kami proses. Kehangatan tradisi akan segera tiba!
              </p>
            </div>
            <Link
              href="/products"
              className="inline-block bg-primary text-on-primary px-8 py-3 rounded-full font-label-sm text-label-sm shadow-md hover:bg-primary-container transition-all active:scale-95 duration-150"
            >
              Kembali ke Produk
            </Link>
          </div>
        ) : cartItems.length === 0 ? (
          /* Empty Cart View */
          <div className="max-w-md mx-auto text-center py-16 space-y-6">
            <span
              className="material-symbols-outlined text-outline-variant mx-auto block"
              style={{ fontSize: "72px" }}
            >
              shopping_basket
            </span>
            <div>
              <h1 className="font-headline-md text-headline-md text-on-surface font-bold mb-2">
                Keranjang Belanja Kosong
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Jelajahi rasa otentik kami dan tambahkan beberapa kue lezat ke keranjang Anda!
              </p>
            </div>
            <Link
              href="/products"
              className="inline-block border-2 border-primary text-primary hover:bg-surface-container px-8 py-3 rounded-full font-label-sm text-label-sm transition-all active:scale-95 duration-150"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          /* Active Cart View */
          <>
            {/* Page Header */}
            <div className="mb-10">
              <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-2 font-bold">
                Keranjang Belanja
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Tinjau pesanan Anda sebelum melanjutkan ke pembayaran.
              </p>
            </div>

            {/* Layout Grid: Items vs Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-gutter items-start">
              {/* Left Column: Cart Items */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_24px_rgba(136,81,32,0.05)] border border-surface-container flex flex-col sm:flex-row gap-6 items-start sm:items-center relative group transition-all hover:shadow-[0_8px_32px_rgba(136,81,32,0.08)]"
                  >
                    {/* Product Image */}
                    <div className="w-full sm:w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-surface-container-low relative">
                      <Image
                        alt={item.name}
                        fill
                        className="object-cover"
                        src={item.image}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow flex flex-col gap-2 w-full">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-label-sm text-label-sm text-tertiary-container bg-tertiary-fixed px-2 py-1 rounded mb-2 inline-block">
                            {item.unit || "Favorit Tradisional"}
                          </span>
                          <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                            {item.name}
                          </h3>
                        </div>
                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Hapus produk"
                          className="text-error hover:text-on-error-container p-2 rounded-full hover:bg-error-container transition-colors absolute top-4 right-4 sm:static sm:p-0 sm:hover:bg-transparent"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>

                      <div className="flex justify-between items-end mt-4 sm:mt-2 w-full">
                        {/* Price Details */}
                        <div className="flex flex-col">
                          <span className="font-body-lg text-body-lg font-bold text-primary">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                        {/* Quantity Control */}
                        <div className="flex items-center border border-outline-variant rounded-lg bg-surface-container-lowest overflow-hidden h-10">
                           <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={!item.cartItemId}
                            aria-label="Kurangi jumlah"
                            className="w-10 h-full flex items-center justify-center text-primary hover:bg-surface-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              remove
                            </span>
                          </button>
                          <span className="w-12 text-center font-body-md text-body-md text-on-surface font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={!item.cartItemId || (item.stock !== undefined && item.quantity >= item.stock)}
                            aria-label="Tambah jumlah"
                            className="w-10 h-full flex items-center justify-center text-primary hover:bg-surface-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              add
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Order Summary */}
              <div className="lg:col-span-4 relative">
                <div className="bg-surface-container-lowest rounded-xl p-6 lg:p-8 shadow-[0_4px_24px_rgba(136,81,32,0.05)] border border-surface-container lg:sticky lg:top-28">
                  <h2 className="font-headline-md text-headline-md text-on-surface mb-6 border-b border-surface-container-high pb-4 font-bold">
                    Ringkasan Belanja
                  </h2>
                  <div className="flex flex-col gap-4 font-body-md text-body-md">
                    <div className="flex justify-between items-center text-on-surface-variant">
                      <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} Produk)</span>
                      <span className="font-bold text-on-surface">
                        {formatPrice(cartTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-on-surface-variant">
                      <span>Biaya Pengemasan</span>
                      <span className="font-bold text-on-surface">
                        {formatPrice(packagingFee)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-on-surface-variant">
                      <span>Estimasi Pajak (11%)</span>
                      <span className="font-bold text-on-surface">
                        {formatPrice(taxFee)}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-surface-container-high mt-6 pt-6 flex justify-between items-center">
                    <span className="font-body-lg text-body-lg font-bold text-on-surface">
                      Total Tagihan
                    </span>
                    <span className="font-headline-md text-headline-md font-bold text-primary">
                      {formatPrice(totalBill)}
                    </span>
                  </div>

                  <Link
                    href="/checkout"
                    className="w-full bg-primary text-on-primary font-label-sm text-label-sm min-h-[48px] rounded-lg mt-8 hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center gap-2 active:scale-[0.98] font-bold"
                  >
                    Lanjut ke Pembayaran
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </Link>

                  <div className="mt-4 flex items-start gap-2 text-on-surface-variant bg-surface-container-low p-3 rounded-lg">
                    <span className="material-symbols-outlined text-[16px] text-tertiary mt-0.5">
                      verified_user
                    </span>
                    <p className="font-label-sm text-label-sm text-[11px] leading-tight">
                      Transaksi aman dan terenkripsi. Kualitas kesegaran produk dijamin 100%.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />

      {/* Shared Sidebar/Drawer for Quick Access */}
      <CartDrawer />
    </>
  );
}
