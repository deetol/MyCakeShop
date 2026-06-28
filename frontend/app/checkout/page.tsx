"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Footer from "@/components/Footer";
import { api, ApiError, ValidationError } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Address {
  id: number;
  label: string;
  recipient_name: string;
  recipient_phone: string;
  address_line: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
}

type PaymentCategory = "bank_transfer" | "ewallet";

interface PaymentOption {
  id: string;
  name: string;
  category: PaymentCategory;
  icon: string;
  accountNumber?: string;
  accountName?: string;
  note?: string;
}

// ─── Payment Options Data ─────────────────────────────────────────────────────

const BANK_TRANSFER: PaymentOption[] = [
  {
    id: "bca",
    name: "BCA",
    category: "bank_transfer",
    icon: "account_balance",
    accountNumber: "8012-3456-78",
    accountName: "PT MyCakeShop Indonesia",
    note: "Kode unik akan ditambahkan ke total transfer",
  },
  {
    id: "mandiri",
    name: "Mandiri",
    category: "bank_transfer",
    icon: "account_balance",
    accountNumber: "123-00-9876543-2",
    accountName: "PT MyCakeShop Indonesia",
  },
  {
    id: "bni",
    name: "BNI",
    category: "bank_transfer",
    icon: "account_balance",
    accountNumber: "0123456789",
    accountName: "PT MyCakeShop Indonesia",
  },
  {
    id: "bri",
    name: "BRI",
    category: "bank_transfer",
    icon: "account_balance",
    accountNumber: "1234-5678-9012-345",
    accountName: "PT MyCakeShop Indonesia",
  },
];

const EWALLET: PaymentOption[] = [
  {
    id: "gopay",
    name: "GoPay",
    category: "ewallet",
    icon: "account_balance_wallet",
    accountNumber: "0812-3456-7890",
    accountName: "MyCakeShop",
  },
  {
    id: "ovo",
    name: "OVO",
    category: "ewallet",
    icon: "account_balance_wallet",
    accountNumber: "0812-3456-7890",
    accountName: "MyCakeShop",
  },
  {
    id: "dana",
    name: "DANA",
    category: "ewallet",
    icon: "account_balance_wallet",
    accountNumber: "0812-3456-7890",
    accountName: "MyCakeShop",
  },
  {
    id: "shopeepay",
    name: "ShopeePay",
    category: "ewallet",
    icon: "account_balance_wallet",
    accountNumber: "0812-3456-7890",
    accountName: "MyCakeShop",
  },
  {
    id: "linkaja",
    name: "LinkAja",
    category: "ewallet",
    icon: "account_balance_wallet",
    accountNumber: "0812-3456-7890",
    accountName: "MyCakeShop",
  },
  {
    id: "qris",
    name: "QRIS",
    category: "ewallet",
    icon: "qr_code_scanner",
    note: "Scan QR dengan semua e-wallet",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  // Shipping state
  const [shippingOption, setShippingOption] = useState<"instant" | "sameday">("sameday");

  // Payment state
  const [selectedPayment, setSelectedPayment] = useState<PaymentOption | null>(null);
  const [paymentTypeChoice, setPaymentTypeChoice] = useState<"full" | "dp">("full");

  // Order state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [isQrisPaid, setIsQrisPaid] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulateQrisSuccess = async (paymentId: number) => {
    if (!token) return;
    setIsSimulating(true);
    try {
      await api.post<any>(`/payments/${paymentId}/simulate-qris-success`, {}, token);
      setIsQrisPaid(true);
    } catch (e: any) {
      alert(e.message || "Gagal melakukan simulasi pembayaran.");
    } finally {
      setIsSimulating(false);
    }
  };


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran gambar maksimal adalah 2MB");
      return;
    }

    if (!createdOrder?.payment?.id || !token) {
      alert("Informasi pembayaran tidak ditemukan");
      return;
    }

    setIsUploadingProof(true);
    const formData = new FormData();
    formData.append("payment_proof", file);

    try {
      const res = await api.postFormData<any>(`/payments/${createdOrder.payment.id}/upload-proof`, formData, token);
      alert("Bukti pembayaran berhasil diunggah.");
      setPaymentProof(res.data.payment_proof || null);
    } catch (e: any) {
      alert(e.message || "Gagal mengunggah bukti pembayaran.");
    } finally {
      setIsUploadingProof(false);
    }
  };

  function resolveProofUrl(path: string | null | undefined): string {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `http://127.0.0.1:8000/storage/${path}`;
  }

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Fetch addresses ───────────────────────────────────────────────────────
  const fetchAddresses = useCallback(async () => {
    if (!token) return;
    setIsLoadingAddresses(true);
    try {
      const res = await api.get<any[]>('/addresses', token ?? undefined);
      const data: Address[] = res.data.map((a: any) => ({
        id: a.id,
        label: a.label || 'Alamat',
        recipient_name: a.recipient_name,
        recipient_phone: a.phone || a.recipient_phone,
        address_line: a.address_line,
        city: a.city,
        province: a.province,
        postal_code: a.postal_code,
        is_default: a.is_default,
      }));
      setAddresses(data);
      // Auto-select default address
      const def = data.find(a => a.is_default) || data[0] || null;
      if (def) setSelectedAddressId(def.id);
    } catch {
      setAddresses([]);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [token]);

  useEffect(() => {
    if (user && token) fetchAddresses();
  }, [user, token, fetchAddresses]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatPrice = (v: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(v);

  const shippingCost = shippingOption === "instant" ? 25000 : 15000;
  const subtotal = cartTotal;
  const tax = Math.round((subtotal + shippingCost) * 0.11);
  const totalPayment = subtotal + shippingCost + tax;
  const dpAmount = Math.round(totalPayment * 0.5);
  const remainingAmount = totalPayment - dpAmount;
  const amountToPay = paymentTypeChoice === "dp" ? dpAmount : totalPayment;
  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || null;

  // ── Submit order ───────────────────────────────────────────────────────────
  const handlePay = async () => {
    if (!selectedAddress) {
      alert("Pilih alamat pengiriman terlebih dahulu.");
      return;
    }
    if (!selectedPayment) {
      alert("Pilih metode pembayaran terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Fetch shipping & payment method IDs from backend (public routes)
      const [shippingRes, paymentRes] = await Promise.all([
        api.get<any>('/shipping-methods'),
        api.get<any>('/payment-methods'),
      ]);

      const shippingMethods: any[] = Array.isArray(shippingRes.data)
        ? shippingRes.data
        : [];

      const paymentMethods: any[] = Array.isArray(paymentRes.data)
        ? paymentRes.data
        : [];

      // Match shipping option to DB record
      const shippingNameMap: Record<string, string[]> = {
        instant: ['kurir instan', 'instan', 'instant'],
        sameday: ['kurir sameday', 'sameday', 'same day'],
      };
      const shippingKeywords = shippingNameMap[shippingOption] || [shippingOption];
      const matchedShipping = shippingMethods.find(s =>
        shippingKeywords.some(k => s.name?.toLowerCase().includes(k))
      ) || shippingMethods[0];

      // Match payment method to DB record
      const matchedPayment = paymentMethods.find(p =>
        p.name?.toLowerCase() === selectedPayment.name.toLowerCase()
      ) || paymentMethods.find(p =>
        p.name?.toLowerCase().includes(selectedPayment.name.toLowerCase().substring(0, 4))
      ) || paymentMethods[0];

      if (!matchedShipping) {
        alert("Metode pengiriman tidak tersedia. Hubungi admin.");
        setIsSubmitting(false);
        return;
      }
      if (!matchedPayment) {
        alert("Metode pembayaran tidak tersedia. Hubungi admin.");
        setIsSubmitting(false);
        return;
      }

      const res = await api.post<any>('/orders', {
        address_id: selectedAddress.id,
        shipping_method_id: matchedShipping.id,
        payment_method_id: matchedPayment.id,
        payment_type: paymentTypeChoice,
      }, token ?? undefined);

      clearCart();
      setCreatedOrder(res.data);
      setPaymentProof(res.data.payment?.payment_proof || null);
      setCheckoutSuccess(true);
    } catch (error) {
      if (error instanceof ValidationError) {
        alert(error.getFirstError());
      } else if (error instanceof ApiError) {
        alert(error.message);
      } else {
        alert("Terjadi kesalahan koneksi saat memproses pesanan.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading || !user || !mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-on-surface">
        <header className="bg-surface-container-lowest border-b border-surface-container sticky top-0 z-50">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop h-20 flex items-center">
            <span className="font-display-lg-mobile md:font-display-lg text-primary tracking-tight font-bold">
              MyCakeShop
            </span>
          </div>
        </header>
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-on-surface-variant font-medium">Memuat halaman checkout...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased">
      {/* Header */}
      <header className="bg-surface-container-lowest border-b border-surface-container sticky top-0 z-50">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop h-20 flex justify-between items-center">
          <Link href="/" className="font-display-lg-mobile md:font-display-lg text-primary tracking-tight font-bold hover:opacity-90 transition-opacity">
            MyCakeShop
          </Link>
          <Link href="/cart" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm font-bold">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Kembali ke Keranjang
          </Link>
        </div>
      </header>

      <main className="flex-grow max-w-container-max w-full mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12">

        {/* ── SUCCESS STATE ─────────────────────────────────────────────── */}
        {checkoutSuccess && createdOrder ? (
          <div className="max-w-2xl mx-auto bg-surface-container-lowest rounded-2xl border border-surface-container shadow-xl p-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-3">
              <div className={`w-20 h-20 ${isQrisPaid ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-primary-container text-on-primary-container'} rounded-full flex items-center justify-center shadow-md mx-auto transition-colors duration-300`}>
                <span className="material-symbols-outlined" style={{ fontSize: "40px" }}>{isQrisPaid ? 'check_circle' : 'hourglass_empty'}</span>
              </div>
              <h1 className="font-display-lg text-2xl md:text-3xl text-primary font-bold">{isQrisPaid ? 'Pembayaran Berhasil!' : 'Pesanan Diterima!'}</h1>
              <p className="text-on-surface-variant text-sm">Nomor Pesanan: <strong className="text-on-surface">#{createdOrder.order_number}</strong></p>
              <p className="text-on-surface-variant text-sm md:text-base">
                {isQrisPaid ? (
                  "Terima kasih! Pembayaran Anda telah kami terima dan pesanan akan segera diproses."
                ) : selectedPayment?.id === "qris" ? (
                  "Terima kasih! Silakan pindai kode QRIS di bawah ini untuk menyelesaikan pembayaran pesanan Anda."
                ) : (
                  "Terima kasih! Segera lakukan transfer dan unggah bukti pembayaran agar pesanan Anda dapat diproses."
                )}
              </p>
            </div>

            {/* Summary Banner */}
            <div className="bg-primary-fixed/30 border border-primary/20 rounded-xl p-5 space-y-3">
              <p className="text-sm font-bold text-primary uppercase tracking-wide text-center flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">payments</span>
                {paymentTypeChoice === "dp" ? "Ringkasan Pembayaran DP 50%" : "Ringkasan Pembayaran"}
              </p>
              {paymentTypeChoice === "dp" ? (
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-on-surface-variant mb-1">Total Pesanan</p>
                    <p className="font-bold text-on-surface text-sm">{formatPrice(totalPayment)}</p>
                  </div>
                  <div className={`rounded-lg p-3 ${isQrisPaid ? 'bg-tertiary text-on-tertiary' : 'bg-primary text-on-primary'} transition-colors duration-300`}>
                    <p className="text-xs opacity-80 mb-1">{isQrisPaid ? 'Lunas (DP)' : 'Bayar Sekarang (DP)'}</p>
                    <p className="font-bold text-sm">{formatPrice(dpAmount)}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-xs text-on-surface-variant mb-1">Sisa Bayar</p>
                    <p className="font-bold text-on-surface text-sm">{formatPrice(remainingAmount)}</p>
                  </div>
                </div>
              ) : (
                <div className={`text-center rounded-lg p-4 ${isQrisPaid ? 'bg-tertiary text-on-tertiary' : 'bg-primary text-on-primary'} transition-colors duration-300`}>
                  <p className="text-xs opacity-80 mb-1">{isQrisPaid ? 'Lunas' : 'Bayar Penuh Sekarang'}</p>
                  <p className="font-bold text-2xl">{formatPrice(totalPayment)}</p>
                </div>
              )}
              {paymentTypeChoice === "dp" && (
                <p className="text-xs text-on-surface-variant text-center">
                  Sisa pembayaran dilunasi setelah pesanan selesai disiapkan
                </p>
              )}
            </div>

            {/* Payment instruction */}
            <div className="bg-surface-container-low p-6 rounded-xl border border-surface-container space-y-4">
              <h2 className="font-headline-md text-lg font-bold text-on-surface border-b border-surface-container-high pb-2">
                {isQrisPaid ? 'Detail Pembayaran' : `Panduan Pembayaran — ${selectedPayment?.name}`}
              </h2>

              {selectedPayment?.id === "qris" ? (
                isQrisPaid ? (
                  <div className="flex flex-col items-center text-center space-y-4 py-6">
                    <div className="w-16 h-16 bg-tertiary-container text-on-tertiary-container rounded-full flex items-center justify-center shadow-md animate-bounce">
                      <span className="material-symbols-outlined text-3xl text-tertiary">check_circle</span>
                    </div>
                    <h3 className="text-lg font-bold text-tertiary">Pembayaran Berhasil</h3>
                    <p className="text-xs text-on-surface-variant max-w-sm">
                      Sistem simulasi telah mendeteksi pembayaran QRIS Anda sukses. Pesanan Anda kini langsung masuk proses pengerjaan.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center space-y-4">
                    <p className="font-body-md text-on-surface-variant">
                      Scan QRIS untuk membayar sebesar <strong className="text-primary">{formatPrice(amountToPay)}</strong>
                      {paymentTypeChoice === "dp" && <span className="text-xs text-on-surface-variant ml-1">(DP 50%)</span>}
                    </p>
                    <div className="w-48 h-48 bg-white p-3 rounded-lg border border-outline-variant flex items-center justify-center shadow-sm">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent("qris_payment_mock_" + (createdOrder.payment?.id || "") + "_" + amountToPay)}`} 
                        alt="QRIS Mock" 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <p className="text-xs text-on-surface-variant italic">Mendukung GoPay, OVO, Dana, LinkAja, ShopeePay, dan M-Banking.</p>
                    
                    {process.env.NODE_ENV === "development" && (
                      <button
                        onClick={() => handleSimulateQrisSuccess(createdOrder.payment?.id)}
                        disabled={isSimulating}
                        className="mt-2 bg-tertiary text-on-tertiary hover:bg-tertiary/90 text-xs px-4 py-2.5 rounded-lg font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm disabled:opacity-50"
                      >
                        {isSimulating ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-on-tertiary border-t-transparent rounded-full animate-spin" />
                            Mensimulasikan...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-sm">verified_user</span>
                            [Simulasi] Pembayaran Berhasil
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  <p className="font-body-md text-on-surface-variant">
                    Transfer ke {selectedPayment?.category === "bank_transfer" ? "rekening" : "nomor"} {selectedPayment?.name} sebesar <strong className="text-primary">{formatPrice(amountToPay)}</strong>
                    {paymentTypeChoice === "dp" && <span className="text-xs text-on-surface-variant ml-1">(DP 50%)</span>}:
                  </p>
                  
                  {selectedPayment?.category === "bank_transfer" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="border border-outline-variant p-4 rounded-lg">
                        <p className="text-xs text-on-surface-variant font-bold">Nama Bank</p>
                        <p className="font-bold text-on-surface">{selectedPayment.name}</p>
                      </div>
                      <div className="border border-outline-variant p-4 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="text-xs text-on-surface-variant font-bold">Nomor Rekening</p>
                          <p className="font-bold text-primary select-all">{selectedPayment.accountNumber}</p>
                        </div>
                        <button onClick={() => navigator.clipboard.writeText(selectedPayment.accountNumber || '')} className="text-primary hover:bg-surface-container p-2 rounded-full transition-colors">
                          <span className="material-symbols-outlined text-sm">content_copy</span>
                        </button>
                      </div>
                      <div className="border border-outline-variant p-4 rounded-lg md:col-span-2">
                        <p className="text-xs text-on-surface-variant font-bold">Nama Penerima</p>
                        <p className="font-bold text-on-surface">{selectedPayment.accountName}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-surface-container p-4 rounded-lg border border-outline-variant flex justify-between items-center text-sm">
                      <div>
                        <p className="text-xs text-on-surface-variant font-semibold">Nomor {selectedPayment?.name}</p>
                        <p className="font-bold text-primary text-lg">{selectedPayment?.accountNumber}</p>
                        <p className="text-xs text-on-surface-variant">a.n. {selectedPayment?.accountName}</p>
                      </div>
                      <button onClick={() => navigator.clipboard.writeText(selectedPayment?.accountNumber || '')} className="text-primary hover:bg-surface-container p-2 rounded-full transition-colors" title="Salin">
                        <span className="material-symbols-outlined text-sm">content_copy</span>
                      </button>
                    </div>
                  )}

                  {/* Upload Bukti Pembayaran */}
                  <div className="bg-surface border border-outline-variant rounded-lg p-4 space-y-3">
                    <p className="font-bold text-sm text-on-surface">Bukti Pembayaran</p>
                    
                    {paymentProof ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary text-xs font-bold">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          Bukti transfer berhasil diunggah (Sedang Diverifikasi)
                        </div>
                        <div className="relative w-32 h-32 rounded border border-outline-variant overflow-hidden bg-surface-container">
                          <Image
                            src={resolveProofUrl(paymentProof)}
                            alt="Bukti Transfer"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-on-surface-variant">
                          Silakan unggah foto bukti transfer Anda di sini setelah melakukan pembayaran.
                        </p>
                        
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg cursor-pointer hover:bg-primary-container/20 transition-all font-semibold text-xs">
                            <span className="material-symbols-outlined text-sm">upload_file</span>
                            Pilih Berkas
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/jpg"
                              className="hidden"
                              onChange={handleFileChange}
                              disabled={isUploadingProof}
                            />
                          </label>
                          
                          {isUploadingProof && (
                            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              Mengunggah...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/order" className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold text-center hover:shadow-md transition-all">
                Lihat Pesanan Saya
              </Link>
              <Link href="/products" className="border border-primary text-primary px-8 py-3 rounded-lg font-bold text-center hover:bg-surface-container transition-all">
                Belanja Lagi
              </Link>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16 space-y-6">
            <span className="material-symbols-outlined text-outline-variant mx-auto block" style={{ fontSize: "72px" }}>shopping_basket</span>
            <h1 className="font-headline-md text-headline-md text-on-surface font-bold mb-2">Keranjang kosong</h1>
            <p className="text-on-surface-variant">Pilih produk terlebih dahulu untuk melanjutkan checkout.</p>
            <Link href="/products" className="inline-block bg-primary text-on-primary px-8 py-3 rounded-full font-bold hover:shadow-md transition-all">
              Lihat Menu Kue
            </Link>
          </div>

        /* ── CHECKOUT FORM ──────────────────────────────────────────── */
        ) : (
          <>
            <h1 className="font-headline-md text-headline-md text-on-surface mb-8 font-bold">Checkout Pesanan</h1>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Left Column */}
              <div className="lg:col-span-7 space-y-6">

                {/* ── STEP 1: Alamat ─────────────────────────────────── */}
                <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-tertiary" />
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">1</div>
                      <h2 className="font-headline-md text-on-surface font-bold">Pilih Alamat Pengiriman</h2>
                    </div>
                    {addresses.length > 0 && (
                      <button
                        onClick={() => setShowAddressPicker(true)}
                        className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        Ubah Alamat
                      </button>
                    )}
                  </div>

                  {isLoadingAddresses ? (
                    <div className="flex items-center gap-3 p-4 border border-outline-variant rounded-lg">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-on-surface-variant">Memuat alamat...</span>
                    </div>
                  ) : !selectedAddress ? (
                    <div className="p-4 border-2 border-dashed border-outline-variant rounded-lg text-center space-y-3">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant block">location_off</span>
                      <p className="text-sm text-on-surface-variant">Belum ada alamat pengiriman.</p>
                      <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-primary font-semibold hover:underline">
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Tambah Alamat di Profil
                      </Link>
                    </div>
                  ) : (
                    <div className="border-2 border-primary bg-primary-fixed/10 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary mt-0.5">home</span>
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-on-surface">{selectedAddress.label}</span>
                            {selectedAddress.is_default && (
                              <span className="px-2 py-0.5 bg-primary text-on-primary text-[10px] rounded uppercase font-semibold">Utama</span>
                            )}
                          </div>
                          <p className="font-semibold text-sm text-on-surface">{selectedAddress.recipient_name}</p>
                          <p className="text-sm text-on-surface-variant">{selectedAddress.recipient_phone}</p>
                          <p className="text-sm text-on-surface-variant mt-1">
                            {selectedAddress.address_line}, {selectedAddress.city}, {selectedAddress.province} {selectedAddress.postal_code}
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-primary">check_circle</span>
                      </div>
                    </div>
                  )}
                </section>

                {/* ── STEP 2: Pengiriman ─────────────────────────────── */}
                <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">2</div>
                    <h2 className="font-headline-md text-on-surface font-bold">Pilih Pengiriman</h2>
                  </div>

                  {/* Catatan pengiriman */}
                  <div className="bg-tertiary-container rounded-lg p-3 mb-4 flex items-start gap-2">
                    <span className="material-symbols-outlined text-on-tertiary-container text-[18px] mt-0.5">info</span>
                    <p className="text-xs text-on-tertiary-container">
                      <strong>Catatan:</strong> Jika admin tidak dapat memenuhi estimasi waktu yang tertera, 
                      penjadwalan akan dikonfirmasi lebih lanjut melalui pesan WhatsApp ke nomor yang terdaftar.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { value: "instant" as const, label: "Kurir Instan", icon: "two_wheeler", desc: "Estimasi tiba hari ini, maks 3 jam setelah diproses.", price: 25000 },
                      { value: "sameday" as const, label: "Kurir Sameday", icon: "local_shipping", desc: "Estimasi tiba hari ini, maks 8 jam setelah diproses.", price: 15000 },
                    ].map(opt => (
                      <label
                        key={opt.value}
                        onClick={() => setShippingOption(opt.value)}
                        className={`flex flex-col p-4 border-2 rounded-lg cursor-pointer hover:border-primary transition-all group ${
                          shippingOption === opt.value ? "border-primary bg-primary-fixed/20 shadow-sm" : "border-outline-variant"
                        }`}
                      >
                        <input className="sr-only" type="radio" name="shipping" value={opt.value} checked={shippingOption === opt.value} onChange={() => setShippingOption(opt.value)} />
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">{opt.icon}</span>
                            <span className="font-bold text-sm text-on-surface">{opt.label}</span>
                          </div>
                          <span className={`material-symbols-outlined text-[20px] ${shippingOption === opt.value ? "text-primary" : "text-outline-variant"}`}>
                            {shippingOption === opt.value ? "radio_button_checked" : "radio_button_unchecked"}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant">{opt.desc}</p>
                        <p className="text-sm text-primary font-bold mt-3">{formatPrice(opt.price)}</p>
                      </label>
                    ))}
                  </div>
                </section>

                {/* ── STEP 3: Pembayaran ─────────────────────────────── */}
                <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">3</div>
                    <h2 className="font-headline-md text-on-surface font-bold">Metode Pembayaran</h2>
                  </div>

                  {/* Bank Transfer */}
                  <div className="mb-5">
                    <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
                      Transfer Bank (Verifikasi Manual)
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {BANK_TRANSFER.map(p => (
                        <label
                          key={p.id}
                          onClick={() => setSelectedPayment(p)}
                          className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:border-primary transition-all ${
                            selectedPayment?.id === p.id ? "border-primary bg-primary-fixed/20" : "border-outline-variant"
                          }`}
                        >
                          <input className="sr-only" type="radio" name="payment" value={p.id} checked={selectedPayment?.id === p.id} onChange={() => setSelectedPayment(p)} />
                          <span className="material-symbols-outlined text-primary text-[20px]">account_balance</span>
                          <span className="text-sm font-semibold text-on-surface flex-grow">{p.name}</span>
                          <span className={`material-symbols-outlined text-[18px] ${selectedPayment?.id === p.id ? "text-primary" : "text-outline-variant"}`}>
                            {selectedPayment?.id === p.id ? "radio_button_checked" : "radio_button_unchecked"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <hr className="border-outline-variant mb-5" />

                  {/* E-Wallet */}
                  <div>
                    <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
                      E-Wallet & QRIS
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {EWALLET.map(p => (
                        <label
                          key={p.id}
                          onClick={() => setSelectedPayment(p)}
                          className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:border-primary transition-all ${
                            selectedPayment?.id === p.id ? "border-primary bg-primary-fixed/20" : "border-outline-variant"
                          }`}
                        >
                          <input className="sr-only" type="radio" name="payment" value={p.id} checked={selectedPayment?.id === p.id} onChange={() => setSelectedPayment(p)} />
                          <span className="material-symbols-outlined text-primary text-[20px]">{p.icon}</span>
                          <span className="text-sm font-semibold text-on-surface flex-grow">{p.name}</span>
                          <span className={`material-symbols-outlined text-[18px] ${selectedPayment?.id === p.id ? "text-primary" : "text-outline-variant"}`}>
                            {selectedPayment?.id === p.id ? "radio_button_checked" : "radio_button_unchecked"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </section>

                {/* ── STEP 4: Tipe Pembayaran ──────────────────────── */}
                <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">4</div>
                    <h2 className="font-headline-md text-on-surface font-bold">Tipe Pembayaran</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Bayar Penuh */}
                    <label
                      onClick={() => setPaymentTypeChoice("full")}
                      className={`flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        paymentTypeChoice === "full"
                          ? "border-primary bg-primary-fixed/20 shadow-sm"
                          : "border-outline-variant hover:border-primary"
                      }`}
                    >
                      <input className="sr-only" type="radio" name="paytype" value="full"
                        checked={paymentTypeChoice === "full"} onChange={() => setPaymentTypeChoice("full")} />
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            payments
                          </span>
                          <span className="font-bold text-sm text-on-surface">Bayar Penuh</span>
                        </div>
                        <span className={`material-symbols-outlined text-[20px] ${paymentTypeChoice === "full" ? "text-primary" : "text-outline-variant"}`}>
                          {paymentTypeChoice === "full" ? "radio_button_checked" : "radio_button_unchecked"}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mb-3">
                        Lunasi seluruh tagihan sekarang. Pesanan langsung diproses setelah pembayaran dikonfirmasi.
                      </p>
                      <div className="mt-auto">
                        <span className="text-xs text-on-surface-variant">Bayar sekarang</span>
                        <p className="text-lg font-bold text-primary">{formatPrice(totalPayment)}</p>
                      </div>
                    </label>

                    {/* DP 50% */}
                    <label
                      onClick={() => setPaymentTypeChoice("dp")}
                      className={`flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        paymentTypeChoice === "dp"
                          ? "border-tertiary bg-tertiary-fixed/20 shadow-sm"
                          : "border-outline-variant hover:border-tertiary"
                      }`}
                    >
                      <input className="sr-only" type="radio" name="paytype" value="dp"
                        checked={paymentTypeChoice === "dp"} onChange={() => setPaymentTypeChoice("dp")} />
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-tertiary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            splitscreen_right
                          </span>
                          <span className="font-bold text-sm text-on-surface">DP 50%</span>
                        </div>
                        <span className={`material-symbols-outlined text-[20px] ${paymentTypeChoice === "dp" ? "text-tertiary" : "text-outline-variant"}`}>
                          {paymentTypeChoice === "dp" ? "radio_button_checked" : "radio_button_unchecked"}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mb-3">
                        Bayar 50% sekarang, sisa dilunasi setelah pesanan siap dikirim.
                      </p>
                      <div className="mt-auto space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-on-surface-variant">Bayar sekarang (50%)</span>
                          <span className="font-bold text-tertiary">{formatPrice(dpAmount)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-on-surface-variant">Sisa bayar nanti</span>
                          <span className="font-semibold text-on-surface-variant">{formatPrice(remainingAmount)}</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </section>
              </div>

              {/* ── Right Column: Order Summary ─────────────────────── */}
              <div className="lg:col-span-5">
                <div className="sticky top-28 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container flex flex-col gap-5">
                  <h2 className="font-headline-md text-on-surface border-b border-surface-container pb-4 font-bold">Ringkasan Pesanan</h2>

                  <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container-highest shrink-0 relative">
                          {item.image && item.image !== '/placeholder-cake.svg' ? (
                            <Image alt={item.name} fill className="object-cover" src={item.image} unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-on-surface-variant text-2xl">cake</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow flex flex-col justify-between">
                          <p className="font-semibold text-sm text-on-surface leading-tight">{item.name}</p>
                          <p className="text-xs text-on-surface-variant">{item.unit || "Porsi Spesial"}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-on-surface-variant">{item.quantity}×</span>
                            <span className="text-sm font-bold text-on-surface">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-surface-container pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Subtotal Produk</span><span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Biaya Pengiriman</span><span>{formatPrice(shippingCost)}</span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Pajak (11%)</span><span>{formatPrice(tax)}</span>
                    </div>
                  </div>

                  <div className="border-t border-surface-container pt-3 space-y-2">
                    <div className="flex justify-between text-sm text-on-surface-variant">
                      <span>Total Keseluruhan</span>
                      <span className="font-semibold text-on-surface">{formatPrice(totalPayment)}</span>
                    </div>

                    {paymentTypeChoice === "dp" ? (
                      <div className="bg-tertiary-fixed/20 border border-tertiary/30 rounded-xl p-3 space-y-1.5">
                        <p className="text-xs font-bold text-tertiary flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">splitscreen_right</span>
                          DP 50%
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-on-surface-variant">Bayar sekarang</span>
                          <span className="text-xl font-bold text-tertiary">{formatPrice(dpAmount)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-on-surface-variant border-t border-tertiary/20 pt-1.5 mt-1">
                          <span>Sisa bayar setelah pesanan siap</span>
                          <span className="font-semibold">{formatPrice(remainingAmount)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center pt-1">
                        <span className="font-bold text-sm text-on-surface">Bayar Sekarang</span>
                        <span className="text-xl font-bold text-primary">{formatPrice(totalPayment)}</span>
                      </div>
                    )}
                  </div>

                  {selectedPayment && (
                    <div className="bg-surface-container rounded-lg p-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">{selectedPayment.icon}</span>
                      <span className="text-sm text-on-surface font-semibold">{selectedPayment.name}</span>
                      <span className="ml-auto text-xs text-on-surface-variant">{selectedPayment.category === "bank_transfer" ? "Transfer Bank" : "E-Wallet"}</span>
                    </div>
                  )}

                  <button
                    onClick={handlePay}
                    disabled={isSubmitting || !selectedAddress || !selectedPayment}
                    className="w-full bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container transition-all py-4 rounded-lg font-bold uppercase tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <><span className="material-symbols-outlined animate-spin">progress_activity</span> Memproses...</>
                    ) : (
                      <><span className="material-symbols-outlined">lock</span>
                        {paymentTypeChoice === "dp"
                          ? `Bayar DP ${formatPrice(dpAmount)}`
                          : `Bayar ${formatPrice(totalPayment)}`
                        }
                      </>
                    )}
                  </button>

                  {!selectedAddress && !isLoadingAddresses && (
                    <p className="text-xs text-error text-center flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      Pilih alamat pengiriman terlebih dahulu
                    </p>
                  )}
                  {!selectedPayment && (
                    <p className="text-xs text-error text-center flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">warning</span>
                      Pilih metode pembayaran terlebih dahulu
                    </p>
                  )}

                  <p className="text-center text-xs text-outline flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-sm">verified_user</span>
                    Transaksi Aman &amp; Terenkripsi
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* ── Address Picker Modal ─────────────────────────────────────────── */}
      {showAddressPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddressPicker(false)} />
          <div className="bg-surface rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 shadow-xl border border-surface-container relative z-10">
            <div className="flex justify-between items-center border-b border-surface-container pb-4 mb-5">
              <h2 className="text-lg font-bold text-primary">Pilih Alamat Pengiriman</h2>
              <button onClick={() => setShowAddressPicker(false)} className="text-on-surface-variant hover:text-primary p-1 rounded-full transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3">
              {addresses.map(addr => (
                <button
                  key={addr.id}
                  onClick={() => { setSelectedAddressId(addr.id); setShowAddressPicker(false); }}
                  className={`w-full text-left p-4 border-2 rounded-lg transition-all hover:border-primary ${
                    selectedAddressId === addr.id ? "border-primary bg-primary-fixed/10" : "border-outline-variant"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`material-symbols-outlined mt-0.5 ${selectedAddressId === addr.id ? "text-primary" : "text-on-surface-variant"}`}>
                      {selectedAddressId === addr.id ? "radio_button_checked" : "radio_button_unchecked"}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-on-surface">{addr.label}</span>
                        {addr.is_default && (
                          <span className="px-2 py-0.5 bg-primary-container text-on-primary-container text-[10px] rounded font-semibold">Utama</span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-on-surface">{addr.recipient_name}</p>
                      <p className="text-xs text-on-surface-variant">{addr.recipient_phone}</p>
                      <p className="text-xs text-on-surface-variant mt-1">
                        {addr.address_line}, {addr.city}, {addr.province} {addr.postal_code}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-surface-container">
              <Link href="/profile" className="flex items-center justify-center gap-2 text-sm text-primary font-semibold hover:underline">
                <span className="material-symbols-outlined text-[18px]">add</span>
                Tambah Alamat Baru di Profil
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
