"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import Footer from "@/components/Footer";

type ShippingOption = "sameday" | "instant";
type PaymentMethod = "bca" | "mandiri" | "gopay" | "qris";

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();

  const [mounted, setMounted] = useState(false);
  const [shippingOption, setShippingOption] = useState<ShippingOption>("sameday");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("gopay");
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-on-surface">
        <header className="bg-surface-container-lowest border-b border-surface-container sticky top-0 z-50">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop h-20 flex justify-between items-center">
            <span className="font-display-lg-mobile md:font-display-lg text-primary tracking-tight font-bold">
              MyCakeShop
            </span>
          </div>
        </header>
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-on-surface-variant font-medium">Memuat halaman checkout...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const shippingCost = shippingOption === "instant" ? 25000 : 15000;
  const totalPayment = cartTotal > 0 ? cartTotal + shippingCost : 0;

  const handlePay = () => {
    setCheckoutSuccess(true);
    // Note: Do not clear cart immediately so we can show items/details on success screen if needed,
    // but we clear it in local storage / context state after step changes.
    clearCart();
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased">
      {/* Minimal Checkout Header */}
      <header className="bg-surface-container-lowest border-b border-surface-container sticky top-0 z-50">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop h-20 flex justify-between items-center">
          <Link
            href="/"
            className="font-display-lg-mobile md:font-display-lg text-primary tracking-tight font-bold hover:opacity-90 transition-opacity"
          >
            MyCakeShop
          </Link>
          <Link
            href="/cart"
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm font-bold"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Kembali ke Keranjang
          </Link>
        </div>
      </header>

      {/* Main Checkout Canvas */}
      <main className="flex-grow max-w-container-max w-full mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12">
        {checkoutSuccess ? (
          /* Rich Success Checkout Page */
          <div className="max-w-2xl mx-auto bg-surface-container-lowest rounded-2xl border border-surface-container shadow-xl p-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 bg-tertiary-fixed text-on-tertiary-fixed rounded-full flex items-center justify-center shadow-md mx-auto animate-bounce">
                <span className="material-symbols-outlined" style={{ fontSize: "40px" }}>
                  check_circle
                </span>
              </div>
              <h1 className="font-display-lg text-2xl md:text-3xl text-primary font-bold">
                Pesanan Anda Telah Diterima!
              </h1>
              <p className="text-on-surface-variant text-sm md:text-base">
                Terima kasih atas pembelian Anda. Silakan selesaikan pembayaran di bawah ini.
              </p>
            </div>

            <div className="bg-surface-container-low p-6 rounded-xl border border-surface-container space-y-4">
              <h2 className="font-headline-md text-lg font-bold text-on-surface border-b border-surface-container-high pb-2">
                Panduan Pembayaran
              </h2>

              {paymentMethod === "gopay" && (
                <div className="flex flex-col items-center text-center space-y-4">
                  <p className="font-body-md text-on-surface-variant">
                    Silakan scan kode QR GoPay di bawah ini untuk membayar sebesar{" "}
                    <strong className="text-primary">{formatPrice(totalPayment)}</strong>
                  </p>
                  <div className="w-48 h-48 bg-white p-3 rounded-lg border border-outline-variant flex items-center justify-center relative shadow-sm">
                    {/* Mock QR Code representation */}
                    <div className="w-full h-full border-2 border-dashed border-primary/40 rounded flex flex-col items-center justify-center bg-surface-container-lowest">
                      <span className="material-symbols-outlined text-primary text-5xl">qr_code_2</span>
                      <span className="text-[10px] font-bold text-on-primary-fixed-variant mt-2">GOPAY / QRIS</span>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant italic">
                    Status pembayaran akan terverifikasi secara otomatis setelah pembayaran sukses.
                  </p>
                </div>
              )}

              {paymentMethod === "qris" && (
                <div className="flex flex-col items-center text-center space-y-4">
                  <p className="font-body-md text-on-surface-variant">
                    Silakan scan kode QRIS di bawah ini dengan aplikasi e-wallet pilihan Anda.
                  </p>
                  <div className="w-48 h-48 bg-white p-3 rounded-lg border border-outline-variant flex items-center justify-center relative shadow-sm">
                    <div className="w-full h-full border-2 border-dashed border-primary/40 rounded flex flex-col items-center justify-center bg-surface-container-lowest">
                      <span className="material-symbols-outlined text-primary text-5xl">qr_code_scanner</span>
                      <span className="text-[10px] font-bold text-on-primary-fixed-variant mt-2">QRIS PEMBAYARAN</span>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant italic">
                    Mendukung GoPay, OVO, Dana, LinkAja, ShopeePay, dan M-Banking.
                  </p>
                </div>
              )}

              {(paymentMethod === "bca" || paymentMethod === "mandiri") && (
                <div className="space-y-4">
                  <p className="font-body-md text-on-surface-variant">
                    Silakan lakukan transfer manual ke rekening bank berikut sebesar:
                  </p>
                  <div className="bg-surface-container-highest p-4 rounded-lg text-center space-y-2 border border-surface-container">
                    <span className="text-xs text-on-surface-variant uppercase tracking-wider block font-bold">
                      Jumlah Transfer
                    </span>
                    <span className="font-display-lg text-2xl font-bold text-primary block">
                      {formatPrice(totalPayment)}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="border border-outline-variant p-4 rounded-lg bg-surface-container-lowest">
                      <span className="text-xs text-on-surface-variant block font-bold">Nama Bank</span>
                      <span className="font-body-md font-bold text-on-surface">
                        {paymentMethod === "bca" ? "BCA (Bank Central Asia)" : "Bank Mandiri"}
                      </span>
                    </div>
                    <div className="border border-outline-variant p-4 rounded-lg bg-surface-container-lowest flex justify-between items-center">
                      <div>
                        <span className="text-xs text-on-surface-variant block font-bold">Nomor Rekening</span>
                        <span className="font-body-md font-bold text-primary select-all">
                          {paymentMethod === "bca" ? "8012-3456-78" : "123-00-9876543-2"}
                        </span>
                      </div>
                      <button 
                        onClick={() => navigator.clipboard.writeText(paymentMethod === "bca" ? "8012-3456-78" : "123-00-9876543-2")}
                        className="text-primary hover:bg-surface-container p-2 rounded-full transition-colors"
                        title="Salin Rekening"
                      >
                        <span className="material-symbols-outlined text-sm">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div className="border border-outline-variant p-4 rounded-lg bg-surface-container-lowest">
                    <span className="text-xs text-on-surface-variant block font-bold">Nama Penerima</span>
                    <span className="font-body-md font-bold text-on-surface">PT MyCakeShop Indonesia</span>
                  </div>
                  <div className="pt-2">
                    <button className="w-full bg-primary hover:bg-primary-container text-on-primary rounded-lg py-3 font-label-sm text-label-sm font-bold flex items-center justify-center gap-2 transition-all">
                      <span className="material-symbols-outlined text-lg">upload_file</span>
                      Unggah Bukti Transfer
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
              <Link
                href="/products"
                className="bg-primary text-on-primary px-8 py-3 rounded-lg font-label-sm text-label-sm shadow-md hover:bg-primary-container text-center transition-all active:scale-95 font-bold"
              >
                Belanja Lagi
              </Link>
              <Link
                href="/"
                className="border border-primary text-primary px-8 py-3 rounded-lg font-label-sm text-label-sm hover:bg-surface-container text-center transition-all active:scale-95 font-bold"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          /* Empty Checkout View */
          <div className="max-w-md mx-auto text-center py-16 space-y-6">
            <span
              className="material-symbols-outlined text-outline-variant mx-auto block"
              style={{ fontSize: "72px" }}
            >
              shopping_basket
            </span>
            <div>
              <h1 className="font-headline-md text-headline-md text-on-surface font-bold mb-2">
                Tidak ada pesanan untuk di-checkout
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Keranjang belanja Anda kosong. Silakan pilih beberapa menu terlebih dahulu.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-block bg-primary text-on-primary px-8 py-3 rounded-full font-label-sm text-label-sm hover:bg-primary-container transition-all active:scale-95 duration-150 font-bold"
            >
              Lihat Menu Kue
            </Link>
          </div>
        ) : (
          /* Normal Checkout Page Form */
          <>
            <h1 className="font-headline-md text-headline-md text-on-surface mb-8 font-bold">
              Checkout Pesanan
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-gutter">
              {/* Left Column: Forms & Steps */}
              <div className="lg:col-span-7 space-y-8">
                {/* Step 1: Informasi Pengiriman */}
                <section className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-sm border border-surface-container relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-tertiary"></div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold font-label-sm">
                        1
                      </div>
                      <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                        Pilih Alamat Pengiriman
                      </h2>
                    </div>
                    <button className="text-primary font-label-sm text-label-sm hover:underline font-semibold">
                      Ubah Alamat
                    </button>
                  </div>
                  <div className="border-2 border-primary bg-primary-fixed/10 rounded-lg p-4 relative">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary">home</span>
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-label-sm text-label-sm text-on-surface font-bold">
                            Rumah Utama
                          </span>
                          <span className="px-2 py-0.5 bg-primary text-on-primary text-[10px] rounded uppercase tracking-tighter font-semibold">
                            Default
                          </span>
                        </div>
                        <p className="font-body-md text-body-md text-on-surface font-semibold">
                          John Doe
                        </p>
                        <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                          0812-3456-7890
                        </p>
                        <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-2">
                          Jl. Melati No. 45, RT 05 / RW 02, Kebayoran Lama, Jakarta Selatan, 12240
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-primary">check_circle</span>
                    </div>
                  </div>
                </section>

                {/* Step 2: Kurir Lokal */}
                <section className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-sm border border-surface-container relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold font-label-sm">
                      2
                    </div>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                      Pilih Pengiriman
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Option 1 */}
                    <label
                      onClick={() => setShippingOption("instant")}
                      className={`relative flex flex-col p-4 border rounded-lg cursor-pointer hover:border-primary transition-all group ${
                        shippingOption === "instant"
                          ? "border-primary bg-primary-fixed/20 shadow-sm"
                          : "border-outline-variant"
                      }`}
                    >
                      <input
                        className="peer sr-only"
                        name="courier"
                        type="radio"
                        value="gosend"
                        checked={shippingOption === "instant"}
                        onChange={() => setShippingOption("instant")}
                      />
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                            two_wheeler
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface font-bold">
                            Kurir Instan
                          </span>
                        </div>
                        <span
                          className={`material-symbols-outlined transition-colors ${
                            shippingOption === "instant" ? "text-primary icon-fill" : "text-outline-variant"
                          }`}
                        >
                          {shippingOption === "instant" ? "radio_button_checked" : "radio_button_unchecked"}
                        </span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">
                        Estimasi tiba hari ini, maks 3 jam setelah diproses.
                      </p>
                      <p className="font-label-sm text-label-sm text-primary mt-3 font-semibold">
                        Rp 25.000
                      </p>
                    </label>

                    {/* Option 2 */}
                    <label
                      onClick={() => setShippingOption("sameday")}
                      className={`relative flex flex-col p-4 border rounded-lg cursor-pointer hover:border-primary transition-all group ${
                        shippingOption === "sameday"
                          ? "border-primary bg-primary-fixed/20 shadow-sm"
                          : "border-outline-variant"
                      }`}
                    >
                      <input
                        className="peer sr-only"
                        name="courier"
                        type="radio"
                        value="sameday"
                        checked={shippingOption === "sameday"}
                        onChange={() => setShippingOption("sameday")}
                      />
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                            local_shipping
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface font-bold">
                            Kurir Sameday
                          </span>
                        </div>
                        <span
                          className={`material-symbols-outlined transition-colors ${
                            shippingOption === "sameday" ? "text-primary icon-fill" : "text-outline-variant"
                          }`}
                        >
                          {shippingOption === "sameday" ? "radio_button_checked" : "radio_button_unchecked"}
                        </span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">
                        Estimasi tiba hari ini, maks 8 jam setelah diproses.
                      </p>
                      <p className="font-label-sm text-label-sm text-primary mt-3 font-semibold">
                        Rp 15.000
                      </p>
                    </label>
                  </div>
                </section>

                {/* Step 3: Metode Pembayaran */}
                <section className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-sm border border-surface-container relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold font-label-sm">
                      3
                    </div>
                    <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                      Metode Pembayaran
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {/* Transfer Bank */}
                    <div>
                      <h3 className="font-label-sm text-label-sm text-on-surface-variant mb-3 uppercase tracking-wider font-semibold">
                        Transfer Bank (Verifikasi Manual)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label
                          onClick={() => setPaymentMethod("bca")}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer hover:border-primary transition-all ${
                            paymentMethod === "bca"
                              ? "border-primary bg-primary-fixed/20"
                              : "border-outline-variant"
                          }`}
                        >
                          <input
                            className="sr-only"
                            name="payment"
                            type="radio"
                            value="bca"
                            checked={paymentMethod === "bca"}
                            onChange={() => setPaymentMethod("bca")}
                          />
                          <span className="material-symbols-outlined text-primary mr-3">
                            account_balance
                          </span>
                          <span className="font-body-md text-body-md text-on-surface flex-grow">
                            BCA Transfer
                          </span>
                          <span
                            className={`material-symbols-outlined transition-colors ${
                              paymentMethod === "bca" ? "text-primary icon-fill" : "text-outline-variant"
                            }`}
                          >
                            {paymentMethod === "bca" ? "radio_button_checked" : "radio_button_unchecked"}
                          </span>
                        </label>

                        <label
                          onClick={() => setPaymentMethod("mandiri")}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer hover:border-primary transition-all ${
                            paymentMethod === "mandiri"
                              ? "border-primary bg-primary-fixed/20"
                              : "border-outline-variant"
                          }`}
                        >
                          <input
                            className="sr-only"
                            name="payment"
                            type="radio"
                            value="mandiri"
                            checked={paymentMethod === "mandiri"}
                            onChange={() => setPaymentMethod("mandiri")}
                          />
                          <span className="material-symbols-outlined text-primary mr-3">
                            account_balance
                          </span>
                          <span className="font-body-md text-body-md text-on-surface flex-grow">
                            Mandiri Transfer
                          </span>
                          <span
                            className={`material-symbols-outlined transition-colors ${
                              paymentMethod === "mandiri" ? "text-primary icon-fill" : "text-outline-variant"
                            }`}
                          >
                            {paymentMethod === "mandiri" ? "radio_button_checked" : "radio_button_unchecked"}
                          </span>
                        </label>
                      </div>
                    </div>

                    <hr className="border-surface-container my-4" />

                    {/* E-Wallet */}
                    <div>
                      <h3 className="font-label-sm text-label-sm text-on-surface-variant mb-3 uppercase tracking-wider font-semibold">
                        E-Wallet (Otomatis)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label
                          onClick={() => setPaymentMethod("gopay")}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer hover:border-primary transition-all ${
                            paymentMethod === "gopay"
                              ? "border-primary bg-primary-fixed/20"
                              : "border-outline-variant"
                          }`}
                        >
                          <input
                            className="sr-only"
                            name="payment"
                            type="radio"
                            value="gopay"
                            checked={paymentMethod === "gopay"}
                            onChange={() => setPaymentMethod("gopay")}
                          />
                          <span className="material-symbols-outlined text-primary mr-3">
                            account_balance_wallet
                          </span>
                          <span className="font-body-md text-body-md text-on-surface flex-grow">
                            GoPay
                          </span>
                          <span
                            className={`material-symbols-outlined transition-colors ${
                              paymentMethod === "gopay" ? "text-primary icon-fill" : "text-outline-variant"
                            }`}
                          >
                            {paymentMethod === "gopay" ? "radio_button_checked" : "radio_button_unchecked"}
                          </span>
                        </label>

                        <label
                          onClick={() => setPaymentMethod("qris")}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer hover:border-primary transition-all ${
                            paymentMethod === "qris"
                              ? "border-primary bg-primary-fixed/20"
                              : "border-outline-variant"
                          }`}
                        >
                          <input
                            className="sr-only"
                            name="payment"
                            type="radio"
                            value="qris"
                            checked={paymentMethod === "qris"}
                            onChange={() => setPaymentMethod("qris")}
                          />
                          <span className="material-symbols-outlined text-primary mr-3">
                            qr_code_scanner
                          </span>
                          <span className="font-body-md text-body-md text-on-surface flex-grow">
                            QRIS
                          </span>
                          <span
                            className={`material-symbols-outlined transition-colors ${
                              paymentMethod === "qris" ? "text-primary icon-fill" : "text-outline-variant"
                            }`}
                          >
                            {paymentMethod === "qris" ? "radio_button_checked" : "radio_button_unchecked"}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Order Summary */}
              <div className="lg:col-span-5">
                <div className="sticky top-28 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container flex flex-col gap-6">
                  <h2 className="font-headline-md text-headline-md text-on-surface border-b border-surface-container pb-4 font-bold">
                    Ringkasan Pesanan
                  </h2>

                  {/* Item List */}
                  <div className="space-y-4 max-h-[409px] overflow-y-auto pr-2">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-container-highest shrink-0 relative">
                          <Image
                            alt={item.name}
                            fill
                            className="object-cover"
                            src={item.image}
                          />
                        </div>
                        <div className="flex-grow flex flex-col justify-between">
                          <div>
                            <h3 className="font-body-lg text-body-lg text-on-surface font-semibold leading-tight">
                              {item.name}
                            </h3>
                            <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">
                              {item.unit || "Porsi Spesial"}
                            </p>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="font-label-sm text-label-sm text-on-surface-variant">
                              {item.quantity} x
                            </span>
                            <span className="font-body-md text-body-md text-on-surface font-bold">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-surface-container pt-4 space-y-3">
                    <div className="flex justify-between text-on-surface-variant font-body-md text-body-md">
                      <span>Subtotal Produk</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant font-body-md text-body-md">
                      <span>Biaya Pengiriman</span>
                      <span>{formatPrice(shippingCost)}</span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant font-body-md text-body-md text-sm">
                      <span>Pajak (Termasuk)</span>
                      <span>Rp 0</span>
                    </div>
                  </div>

                  <div className="border-t border-surface-container pt-4 flex justify-between items-end">
                    <span className="font-body-md text-body-md text-on-surface">Total Pembayaran</span>
                    <span className="font-display-lg-mobile text-display-lg-mobile text-primary font-bold">
                      {formatPrice(totalPayment)}
                    </span>
                  </div>

                  <button
                    onClick={handlePay}
                    className="w-full bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container transition-colors duration-300 py-4 rounded-lg font-label-sm text-label-sm uppercase tracking-widest flex items-center justify-center gap-2 mt-4 active:scale-[0.98] font-bold"
                  >
                    <span className="material-symbols-outlined">lock</span>
                    Bayar Sekarang
                  </button>

                  <p className="text-center font-label-sm text-label-sm text-outline mt-2 flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-sm">verified_user</span>
                    Transaksi Aman &amp; Terenkripsi
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer Component */}
      <Footer />
    </div>
  );
}
