"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

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
  order_number: string;
  total: number;
  dp_amount: number | null;
  remaining_amount: number | null;
  payment_type: string;
  payment_status: string;
  payment_method: string | null;
  items: { product_name: string; quantity: number; price: number; subtotal: number }[];
}

export default function PayOrderPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); }
  }, [loading, user, router]);

  const fetchOrder = useCallback(async () => {
    if (!token || !orderId) return;
    setIsLoading(true);
    try {
      const res = await api.get<any>(`/orders/${orderId}`, token);
      const o = res.data;
      // Redirect if already paid
      if (o.payment_status !== 'pending') {
        router.push('/order');
        return;
      }
      setOrder({
        id: o.id,
        order_number: o.order_number,
        total: o.total,
        dp_amount: o.dp_amount,
        remaining_amount: o.remaining_amount,
        payment_type: o.payment_type || 'full',
        payment_status: o.payment_status,
        payment_method: o.payment_method?.name || o.payment_method || null,
        items: (o.items || []).map((i: any) => ({
          product_name: i.product_name,
          quantity: i.quantity,
          price: i.price,
          subtotal: i.subtotal,
        })),
      });
    } catch {
      router.push('/order');
    } finally {
      setIsLoading(false);
    }
  }, [token, orderId, router]);

  useEffect(() => { if (user && token) fetchOrder(); }, [user, token, fetchOrder]);

  const formatPrice = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v || 0);

  if (loading || !user) return null;
  if (!order && !isLoading) return null;

  const amountToPay = order?.payment_type === 'dp' ? (order.dp_amount || 0) : (order?.total || 0);

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/order" className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="font-headline-md text-headline-md text-primary font-bold">
            {order?.payment_type === 'dp' ? 'Bayar DP 50%' : 'Selesaikan Pembayaran'}
          </h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !order ? null : paid ? (
          /* Success Screen */
          <div className="max-w-2xl mx-auto bg-surface-container-lowest rounded-2xl border border-surface-container shadow-xl p-8 space-y-6 text-center">
            <div className="w-20 h-20 bg-tertiary-fixed text-on-tertiary-fixed rounded-full flex items-center justify-center shadow-md mx-auto">
              <span className="material-symbols-outlined" style={{ fontSize: "40px" }}>check_circle</span>
            </div>
            <h2 className="text-2xl font-bold text-primary">Instruksi Pembayaran</h2>
            <p className="text-on-surface-variant">
              Segera transfer sebesar <strong className="text-primary">{formatPrice(amountToPay)}</strong> sesuai metode di bawah. Admin akan mengkonfirmasi dalam 1×24 jam.
            </p>

            {/* Payment Detail */}
            <div className="bg-surface-container-low rounded-xl p-5 text-left space-y-3">
              {selectedPayment?.id === 'qris' ? (
                <div className="flex flex-col items-center py-4">
                  <span className="material-symbols-outlined text-primary text-8xl">qr_code_scanner</span>
                  <p className="text-sm font-semibold text-on-surface mt-2">Scan QRIS</p>
                  <p className="text-xs text-on-surface-variant">Bayar dengan GoPay, OVO, Dana, ShopeePay, dll</p>
                </div>
              ) : (
                <div className="bg-surface border border-outline-variant rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-on-surface-variant font-semibold">{selectedPayment?.name}</p>
                    <p className="font-bold text-primary text-xl">{selectedPayment?.accountNumber}</p>
                    <p className="text-xs text-on-surface-variant">a.n. {selectedPayment?.accountName}</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedPayment?.accountNumber || '')}
                    className="text-primary hover:bg-surface-container p-2 rounded-full transition-colors"
                    title="Salin"
                  >
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                  </button>
                </div>
              )}
              <div className="bg-primary text-on-primary rounded-lg p-4 text-center">
                <p className="text-xs opacity-80 mb-1">
                  {order.payment_type === 'dp' ? 'Jumlah DP (50%)' : 'Jumlah Transfer'}
                </p>
                <p className="text-2xl font-bold">{formatPrice(amountToPay)}</p>
              </div>
              {order.payment_type === 'dp' && order.remaining_amount && (
                <p className="text-xs text-on-surface-variant text-center bg-surface-container rounded-lg p-2">
                  Sisa pembayaran <strong>{formatPrice(order.remaining_amount)}</strong> akan ditagih setelah pesanan siap dikirim
                </p>
              )}
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
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-wide">Nomor Pesanan</p>
                  <p className="font-bold text-on-surface font-mono">{order.order_number}</p>
                </div>
                {order.payment_type === 'dp' && (
                  <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full text-xs font-bold">DP 50%</span>
                )}
              </div>

              <div className="space-y-2 mb-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm text-on-surface-variant">
                    <span>{item.product_name} ×{item.quantity}</span>
                    <span>{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-outline-variant pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Total Pesanan</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
                {order.payment_type === 'dp' ? (
                  <>
                    <div className="flex justify-between font-bold text-primary text-base border-t border-outline-variant pt-2 mt-2">
                      <span>Bayar DP Sekarang (50%)</span>
                      <span>{formatPrice(amountToPay)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-on-surface-variant">
                      <span>Sisa bayar nanti</span>
                      <span>{formatPrice(order.remaining_amount || 0)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between font-bold text-primary text-base border-t border-outline-variant pt-2 mt-2">
                    <span>Bayar Sekarang</span>
                    <span>{formatPrice(amountToPay)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-surface-container shadow-sm">
              <h2 className="font-bold text-on-surface mb-5">Pilih Metode Pembayaran</h2>

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
                <span className="material-symbols-outlined text-[18px]">error</span>{error}
              </div>
            )}

            <button
              onClick={() => {
                if (!selectedPayment) { setError("Pilih metode pembayaran terlebih dahulu."); return; }
                setError("");
                setPaid(true);
              }}
              disabled={!selectedPayment}
              className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">lock</span>
              {order.payment_type === 'dp' ? `Bayar DP ${formatPrice(amountToPay)}` : `Bayar ${formatPrice(amountToPay)}`}
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
