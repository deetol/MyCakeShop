"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";

// Reuse payment options from checkout
const BANK_TRANSFER = [
  { id: "bca",     name: "BCA",     icon: "account_balance",        accountNumber: "8012-3456-78",       accountName: "PT MyCakeShop Indonesia" },
  { id: "mandiri", name: "Mandiri", icon: "account_balance",        accountNumber: "123-00-9876543-2",   accountName: "PT MyCakeShop Indonesia" },
  { id: "bni",     name: "BNI",     icon: "account_balance",        accountNumber: "0123456789",         accountName: "PT MyCakeShop Indonesia" },
  { id: "bri",     name: "BRI",     icon: "account_balance",        accountNumber: "1234-5678-9012-345", accountName: "PT MyCakeShop Indonesia" },
];

const EWALLET = [
  { id: "gopay",     name: "GoPay",     icon: "account_balance_wallet", accountNumber: "0812-3456-7890", accountName: "MyCakeShop" },
  { id: "ovo",       name: "OVO",       icon: "account_balance_wallet", accountNumber: "0812-3456-7890", accountName: "MyCakeShop" },
  { id: "dana",      name: "DANA",      icon: "account_balance_wallet", accountNumber: "0812-3456-7890", accountName: "MyCakeShop" },
  { id: "shopeepay", name: "ShopeePay", icon: "account_balance_wallet", accountNumber: "0812-3456-7890", accountName: "MyCakeShop" },
  { id: "linkaja",   name: "LinkAja",   icon: "account_balance_wallet", accountNumber: "0812-3456-7890", accountName: "MyCakeShop" },
  { id: "qris",      name: "QRIS",      icon: "qr_code_scanner",        accountNumber: "",               accountName: "" },
];

interface OrderInfo {
  id: number;
  uuid?: string;
  order_number: string;
  total: number;
  dp_amount: number;
  remaining_amount: number;
  payment_status: string;
  payment_method: string | null;
  items: { product_name: string; quantity: number; price: number }[];
}

export default function PayRemainingPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [paymentDone, setPaymentDone] = useState(false);
  const [error, setError] = useState("");
  const [remainingPaymentId, setRemainingPaymentId] = useState<number | null>(null);
  const [remainingPaymentProof, setRemainingPaymentProof] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); }
  }, [loading, user, router]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran gambar maksimal adalah 2MB");
      return;
    }

    if (!remainingPaymentId || !token) {
      alert("Informasi pembayaran tidak ditemukan");
      return;
    }

    setIsUploadingProof(true);
    const formData = new FormData();
    formData.append("payment_proof", file);

    try {
      const res = await api.postFormData<any>(`/payments/${remainingPaymentId}/upload-proof`, formData, token);
      alert("Bukti pembayaran berhasil diunggah.");
      setRemainingPaymentProof(res.data.payment_proof || null);
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

  const fetchOrder = useCallback(async () => {
    if (!token || !orderId) return;
    setIsLoading(true);
    try {
      const res = await api.get<any>(`/orders/${orderId}`, token);
      const o = res.data;
      if (o.payment_status !== 'dp_paid') {
        router.push('/order');
        return;
      }
      
      const pMethod = o.payment_method?.name || o.payment_method || null;
      
      setOrder({
        id: o.id,
        uuid: o.uuid,
        order_number: o.order_number,
        total: o.total,
        dp_amount: o.dp_amount,
        remaining_amount: o.remaining_amount,
        payment_status: o.payment_status,
        payment_method: pMethod,
        items: (o.items || []).map((i: any) => ({
          product_name: i.product_name,
          quantity: i.quantity,
          price: i.price,
        })),
      });

      // Pre-select payment method if match is found
      if (pMethod) {
        const methodName = String(pMethod).toLowerCase();
        let matched = BANK_TRANSFER.find(p => 
          methodName.includes(p.id.toLowerCase()) || 
          methodName.includes(p.name.toLowerCase())
        );
        if (!matched) {
          matched = EWALLET.find(p => 
            methodName.includes(p.id.toLowerCase()) || 
            methodName.includes(p.name.toLowerCase())
          );
        }
        if (matched) {
          setSelectedPayment(matched);
          
          // Auto create remaining payment details
          try {
            const payRes = await api.post<any>(`/orders/${orderId}/create-remaining-payment`, {}, token);
            setRemainingPaymentId(payRes.data.payment_id);
            setRemainingPaymentProof(payRes.data.payment_proof || null);
            setPaymentDone(true);
          } catch (err) {
            console.error("Failed to auto-create remaining payment:", err);
          }
        }
      }
    } catch {
      router.push('/order');
    } finally {
      setIsLoading(false);
    }
  }, [token, orderId, router]);

  useEffect(() => {
    if (user && token) fetchOrder();
  }, [user, token, fetchOrder]);

  const handlePay = async () => {
    if (!selectedPayment) {
      setError("Pilih metode pembayaran terlebih dahulu.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      // Create remaining payment record
      const res = await api.post<any>(`/orders/${orderId}/create-remaining-payment`, {}, token!);
      setRemainingPaymentId(res.data.payment_id);
      setRemainingPaymentProof(res.data.payment_proof || null);
      setPaymentDone(true);
    } catch (e: any) {
      setError(e.message || "Gagal membuat tagihan pelunasan. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v || 0);

  if (loading || !user) return null;

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        {/* Back */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/order" className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="font-headline-md text-headline-md text-primary font-bold">Pelunasan Pesanan</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !order ? null : paymentDone ? (
          /* Success */
          <div className="max-w-2xl mx-auto bg-surface-container-lowest rounded-2xl border border-surface-container shadow-xl p-8 space-y-6 text-center">
            <div className="w-20 h-20 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center shadow-md mx-auto">
              <span className="material-symbols-outlined" style={{ fontSize: "40px" }}>hourglass_empty</span>
            </div>
            <h2 className="text-2xl font-bold text-primary">Permintaan Pelunasan Dikirim!</h2>
            <p className="text-on-surface-variant">
              Silakan transfer sisa pembayaran sebesar <strong className="text-primary">{formatPrice(order.remaining_amount)}</strong> sesuai metode yang dipilih. Admin akan mengkonfirmasi pembayaran Anda.
            </p>

            {/* Payment instructions */}
            <div className="bg-surface-container-low rounded-xl p-5 text-left space-y-3">
              <p className="font-bold text-sm text-on-surface">Detail Transfer Pelunasan:</p>
              {selectedPayment?.id !== 'qris' && selectedPayment?.accountNumber && (
                <div className="space-y-4">
                  <div className="bg-surface border border-outline-variant rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-on-surface-variant font-semibold">{selectedPayment.name}</p>
                      <p className="font-bold text-primary text-lg">{selectedPayment.accountNumber}</p>
                      <p className="text-xs text-on-surface-variant">a.n. {selectedPayment.accountName}</p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(selectedPayment.accountNumber)}
                      className="text-primary hover:bg-surface-container p-2 rounded-full"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                    </button>
                  </div>

                  {/* Upload Bukti Pembayaran */}
                  <div className="bg-surface border border-outline-variant rounded-lg p-4 space-y-3">
                    <p className="font-bold text-sm text-on-surface">Bukti Pelunasan</p>
                    
                    {remainingPaymentProof ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary text-xs font-bold">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          Bukti pelunasan berhasil diunggah (Sedang Diverifikasi)
                        </div>
                        <div className="relative w-32 h-32 rounded border border-outline-variant overflow-hidden bg-surface-container">
                          <Image
                            src={resolveProofUrl(remainingPaymentProof)}
                            alt="Bukti Pelunasan"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-on-surface-variant">
                          Silakan unggah foto bukti transfer pelunasan Anda di sini setelah melakukan pembayaran.
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
              {selectedPayment?.id === 'qris' && (
                <div className="flex flex-col items-center py-4">
                  <span className="material-symbols-outlined text-primary text-7xl">qr_code_scanner</span>
                  <p className="text-xs text-on-surface-variant mt-2">Scan QRIS dengan e-wallet pilihan</p>
                </div>
              )}
              <div className="bg-primary text-on-primary rounded-lg p-3 text-center">
                <p className="text-xs opacity-80">Jumlah Transfer</p>
                <p className="text-xl font-bold">{formatPrice(order.remaining_amount)}</p>
              </div>
              <p className="text-xs text-on-surface-variant text-center italic">
                Pastikan nominal transfer tepat. Admin akan memverifikasi dalam 1×24 jam.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/order" className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold hover:shadow-md transition-all text-center">
                Lihat Pesanan Saya
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Order Summary */}
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-surface-container shadow-sm">
              <h2 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
                Pesanan #{order.order_number}
              </h2>

              {/* Items */}
              <div className="space-y-2 mb-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">{item.product_name} ×{item.quantity}</span>
                    <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Payment breakdown */}
              <div className="border-t border-outline-variant pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Total Pesanan</span>
                  <span className="font-semibold">{formatPrice(order.total)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>DP sudah dibayar ✓</span>
                  <span className="font-semibold text-tertiary line-through">{formatPrice(order.dp_amount)}</span>
                </div>
                <div className="flex justify-between font-bold text-primary border-t border-outline-variant pt-2 mt-2 text-base">
                  <span>Sisa yang harus dilunasi</span>
                  <span>{formatPrice(order.remaining_amount)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-surface-container shadow-sm">
              <h2 className="font-bold text-on-surface mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
                Pilih Metode Pelunasan
              </h2>

              {/* Bank Transfer */}
              <div className="mb-5">
                <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Transfer Bank</h3>
                <div className="grid grid-cols-2 gap-3">
                  {BANK_TRANSFER.map(p => (
                    <label key={p.id} onClick={() => setSelectedPayment(p)}
                      className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedPayment?.id === p.id ? "border-primary bg-primary-fixed/20" : "border-outline-variant hover:border-primary"
                      }`}
                    >
                      <span className="material-symbols-outlined text-primary text-[18px]">account_balance</span>
                      <span className="text-sm font-semibold flex-grow">{p.name}</span>
                      <span className={`material-symbols-outlined text-[16px] ${selectedPayment?.id === p.id ? "text-primary" : "text-outline-variant"}`}>
                        {selectedPayment?.id === p.id ? "radio_button_checked" : "radio_button_unchecked"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <hr className="border-outline-variant mb-5" />

              {/* E-Wallet */}
              <div>
                <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">E-Wallet & QRIS</h3>
                <div className="grid grid-cols-2 gap-3">
                  {EWALLET.map(p => (
                    <label key={p.id} onClick={() => setSelectedPayment(p)}
                      className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedPayment?.id === p.id ? "border-primary bg-primary-fixed/20" : "border-outline-variant hover:border-primary"
                      }`}
                    >
                      <span className="material-symbols-outlined text-primary text-[18px]">{p.icon}</span>
                      <span className="text-sm font-semibold flex-grow">{p.name}</span>
                      <span className={`material-symbols-outlined text-[16px] ${selectedPayment?.id === p.id ? "text-primary" : "text-outline-variant"}`}>
                        {selectedPayment?.id === p.id ? "radio_button_checked" : "radio_button_unchecked"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-error-container text-on-error-container p-3 rounded-xl text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePay}
              disabled={isSubmitting || !selectedPayment}
              className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isSubmitting ? (
                <><span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> Memproses...</>
              ) : (
                <><span className="material-symbols-outlined text-[20px]">lock</span>
                  Lunasi {formatPrice(order.remaining_amount)}
                </>
              )}
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
