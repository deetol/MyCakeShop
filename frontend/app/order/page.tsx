"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  product_name: string;
  product_size: string | null;
  quantity: number;
  price: number;
  subtotal: number;
  product_image?: string;
}

interface Order {
  id: string;
  order_number: string;
  date: string;
  status: string;
  payment_status: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  dp_amount: number | null;
  remaining_amount: number | null;
  payment_type: string;
  shipping_address: string;
  city: string;
  province: string;
  postal_code: string;
  recipient_name: string;
  recipient_phone: string;
  shipping_method: string | null;
  payment_method: string | null;
  notes: string | null;
  payment: { status: string; amount: number; paid_at?: string } | null;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const ORDER_STATUS: Record<string, { label: string; cls: string; icon: string }> = {
  pending:    { label: "Menunggu",  cls: "bg-surface-variant text-on-surface-variant border border-outline-variant", icon: "hourglass_empty" },
  processing: { label: "Diproses", cls: "bg-secondary-container text-on-secondary-container", icon: "manufacturing" },
  shipped:    { label: "Dikirim",  cls: "bg-primary-fixed text-on-primary-fixed", icon: "local_shipping" },
  completed:  { label: "Selesai",  cls: "bg-tertiary-container text-on-tertiary-container", icon: "check_circle" },
  cancelled:  { label: "Batal",    cls: "bg-error-container text-on-error-container", icon: "cancel" },
};

const PAYMENT_STATUS: Record<string, { label: string; cls: string; icon: string }> = {
  pending:  { label: "Belum Bayar",  cls: "text-on-surface-variant", icon: "schedule" },
  dp_paid:  { label: "DP Terbayar", cls: "text-primary", icon: "payments" },
  paid:     { label: "Lunas",        cls: "text-tertiary", icon: "verified" },
  success:  { label: "Lunas",        cls: "text-tertiary", icon: "verified" },
  failed:   { label: "Gagal",        cls: "text-error", icon: "error" },
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, token, loading: authLoading, logout: authLogout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }
    if (!token) return;
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, token]);

  const fetchOrders = async () => {
    if (!token) return;
    setIsLoadingOrders(true);
    try {
      const res = await api.get<any>('/orders', token);
      const raw = res.data;
      // Handle paginated response from OrderController
      const list: any[] = raw?.data || raw?.items || (Array.isArray(raw) ? raw : []);
      const mapped: Order[] = list.map((o: any) => ({
        id: o.id?.toString() || 'N/A',
        order_number: o.order_number || `#${o.id}`,
        date: o.created_at
          ? new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
          : '-',
        status: o.status || 'pending',
        payment_status: o.payment_status || 'pending',
        items: (o.items || []).map((item: any) => ({
          product_name: item.product_name || item.name || 'Produk',
          product_size: item.product_size || null,
          quantity: item.quantity || 1,
          price: item.price || 0,
          subtotal: item.subtotal || item.price * item.quantity || 0,
          product_image: item.product_image || null,
        })),
        total: o.total || 0,
        subtotal: o.subtotal || 0,
        shipping_cost: o.shipping_cost || 0,
        tax: o.tax || 0,
        dp_amount: o.dp_amount || null,
        remaining_amount: o.remaining_amount || null,
        payment_type: o.payment_type || 'full',
        shipping_address: o.shipping_address || '',
        city: o.city || '',
        province: o.province || '',
        postal_code: o.postal_code || '',
        recipient_name: o.recipient_name || '',
        recipient_phone: o.recipient_phone || '',
        shipping_method: o.shipping_method?.name || o.shipping_method || null,
        payment_method: o.payment_method?.name || o.payment_method || null,
        notes: o.notes || null,
        payment: o.payment ? {
          status: o.payment.status,
          amount: o.payment.amount,
          paid_at: o.payment.paid_at,
        } : null,
      }));
      setOrders(mapped);
    } catch (e) {
      console.error(e);
      setOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const formatPrice = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v || 0);

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "U";

  if (!mounted || authLoading) {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-24 pb-16">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-on-surface-variant font-medium">Memuat pesanan...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full flex flex-col md:flex-row gap-8">

        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant h-fit">
          <div className="flex items-center space-x-4 mb-8 p-2">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg select-none">
              {getInitials(user?.name || "User")}
            </div>
            <div className="min-w-0">
              <div className="font-body-lg text-on-surface font-bold truncate">{user?.name || "User"}</div>
              <div className="text-label-sm text-on-surface-variant truncate">{user?.email || ""}</div>
            </div>
          </div>
          <nav className="flex flex-col space-y-2">
            <Link href="/profile" className="flex items-center space-x-3 p-3 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors">
              <span className="material-symbols-outlined">person</span>
              <span className="text-body-md">Profil Saya</span>
            </Link>
            <Link href="/order" className="flex items-center space-x-3 p-3 rounded-lg bg-primary-container text-on-primary-container font-semibold">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
              <span className="text-body-md">Pesanan Saya</span>
            </Link>
            <div className="my-4 border-t border-outline-variant" />
            <button onClick={authLogout} className="flex items-center space-x-3 p-3 rounded-lg text-error hover:bg-error-container w-full text-left transition-colors">
              <span className="material-symbols-outlined">logout</span>
              <span className="text-body-md">Keluar</span>
            </button>
          </nav>
        </aside>

        {/* Orders */}
        <section className="flex-grow">
          <h1 className="font-headline-md text-headline-md text-on-surface mb-6 font-bold">Pesanan Saya</h1>

          {isLoadingOrders ? (
            <div className="bg-surface-container-lowest rounded-xl p-12 border border-outline-variant text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-on-surface-variant">Memuat pesanan...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl p-12 border border-outline-variant text-center">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 block">shopping_bag</span>
              <h2 className="text-xl font-bold text-on-surface mb-2">Belum Ada Pesanan</h2>
              <p className="text-on-surface-variant mb-6">Yuk mulai belanja sekarang!</p>
              <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-on-primary font-bold hover:shadow-md transition-all">
                <span className="material-symbols-outlined text-[20px]">storefront</span>Lihat Produk
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => {
                const sc = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
                const pc = PAYMENT_STATUS[order.payment_status] || PAYMENT_STATUS.pending;

                return (
                  <div key={order.id} className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 pb-0 gap-3">
                      <div>
                        <p className="text-xs text-on-surface-variant uppercase tracking-wider">Nomor Pesanan</p>
                        <p className="font-bold text-on-surface font-mono">{order.order_number}</p>
                        <p className="text-sm text-on-surface-variant mt-0.5">{order.date}</p>
                      </div>
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${sc.cls}`}>
                        <span className="material-symbols-outlined text-[14px]">{sc.icon}</span>
                        {sc.label}
                      </span>
                    </div>

                    {/* Items preview */}
                    <div className="p-5 space-y-3">
                      {order.items.slice(0, 2).map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-lg bg-surface-container overflow-hidden flex-shrink-0 relative">
                            {item.product_image ? (
                              <Image src={item.product_image} alt={item.product_name} fill className="object-cover" unoptimized />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-on-surface-variant text-2xl">cake</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="font-semibold text-on-surface text-sm truncate">{item.product_name}</p>
                            {item.product_size && <p className="text-xs text-on-surface-variant">{item.product_size}</p>}
                            <p className="text-xs text-on-surface-variant">{item.quantity}× {formatPrice(item.price)}</p>
                          </div>
                          <p className="font-bold text-sm text-on-surface shrink-0">{formatPrice(item.subtotal)}</p>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-xs text-on-surface-variant text-center">+{order.items.length - 2} produk lainnya</p>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-outline-variant px-5 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        {/* Payment status */}
                        <div className={`flex items-center gap-1.5 text-sm font-semibold ${pc.cls}`}>
                          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>{pc.icon}</span>
                          {pc.label}
                          {order.payment_type === 'dp' && order.payment_status === 'dp_paid' && order.remaining_amount && (
                            <span className="text-xs text-on-surface-variant font-normal">
                              — Sisa {formatPrice(order.remaining_amount)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-on-surface-variant">
                          Total: <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg border-2 border-primary text-primary font-bold text-sm hover:bg-primary hover:text-on-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {selectedOrder?.id === order.id ? "expand_less" : "receipt_long"}
                        </span>
                        {selectedOrder?.id === order.id ? "Tutup" : "Lihat Detail"}
                      </button>

                      {/* Tombol Bayar DP — untuk pesanan yang belum bayar sama sekali */}
                      {order.payment_status === 'pending' && order.status !== 'cancelled' && (
                        <Link
                          href={`/order/${order.id}/pay`}
                          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-opacity"
                        >
                          <span className="material-symbols-outlined text-[18px]">payments</span>
                          {order.payment_type === 'dp' ? `Bayar DP` : 'Bayar Sekarang'}
                        </Link>
                      )}

                      {/* Tombol Lunasi — untuk pesanan yang sudah bayar DP */}
                      {order.payment_status === 'dp_paid' && order.payment_type === 'dp' && (
                        <Link
                          href={`/order/${order.id}/pay-remaining`}
                          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-tertiary text-on-tertiary font-bold text-sm hover:opacity-90 transition-opacity"
                        >
                          <span className="material-symbols-outlined text-[18px]">payments</span>
                          Lunasi Sekarang
                        </Link>
                      )}
                    </div>

                    {/* Detail Panel */}
                    {selectedOrder?.id === order.id && (
                      <div className="border-t border-outline-variant px-5 pb-5 pt-4 space-y-5 bg-surface-container-low rounded-b-xl animate-in fade-in duration-200">

                        {/* Info Pengiriman */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div className="bg-surface rounded-xl p-4 border border-outline-variant/30">
                            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2">Alamat Pengiriman</p>
                            <p className="font-semibold text-on-surface">{order.recipient_name}</p>
                            <p className="text-on-surface-variant">{order.recipient_phone}</p>
                            <p className="text-on-surface-variant mt-1">{order.shipping_address}</p>
                            <p className="text-on-surface-variant">{order.city}, {order.province} {order.postal_code}</p>
                          </div>
                          <div className="bg-surface rounded-xl p-4 border border-outline-variant/30 space-y-2">
                            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2">Info Pengiriman</p>
                            {order.shipping_method && (
                              <div><p className="text-xs text-on-surface-variant">Kurir</p><p className="font-semibold text-on-surface">{order.shipping_method}</p></div>
                            )}
                            {order.payment_method && (
                              <div><p className="text-xs text-on-surface-variant">Metode Bayar</p><p className="font-semibold text-on-surface">{order.payment_method}</p></div>
                            )}
                            {order.notes && (
                              <div><p className="text-xs text-on-surface-variant">Catatan</p><p className="text-on-surface italic">{order.notes}</p></div>
                            )}
                          </div>
                        </div>

                        {/* Rincian Harga */}
                        <div className="bg-surface rounded-xl p-4 border border-outline-variant/30 text-sm space-y-2">
                          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-3">Rincian Pembayaran</p>
                          <div className="flex justify-between text-on-surface-variant"><span>Subtotal Produk</span><span>{formatPrice(order.subtotal)}</span></div>
                          <div className="flex justify-between text-on-surface-variant"><span>Ongkos Kirim</span><span>{formatPrice(order.shipping_cost)}</span></div>
                          <div className="flex justify-between text-on-surface-variant"><span>Pajak (11%)</span><span>{formatPrice(order.tax)}</span></div>
                          <div className="flex justify-between font-bold text-on-surface border-t border-outline-variant pt-2 mt-2">
                            <span>Total Pesanan</span><span className="text-primary">{formatPrice(order.total)}</span>
                          </div>

                          {/* DP Info */}
                          {order.payment_type === 'dp' && order.dp_amount && (
                            <div className="mt-3 border border-primary/20 rounded-xl bg-primary-fixed/20 p-3 space-y-1.5">
                              <p className="text-xs font-bold text-primary flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">splitscreen_right</span>
                                Sistem DP 50%
                              </p>
                              <div className="flex justify-between text-xs">
                                <span className="text-on-surface-variant">DP yang dibayar</span>
                                <span className={`font-bold ${order.payment_status === 'dp_paid' || order.payment_status === 'paid' ? 'text-tertiary' : 'text-on-surface'}`}>
                                  {formatPrice(order.dp_amount)}
                                  {(order.payment_status === 'dp_paid' || order.payment_status === 'paid') && ' ✓'}
                                </span>
                              </div>
                              {order.remaining_amount && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-on-surface-variant">Sisa pembayaran</span>
                                  <span className={`font-bold ${order.payment_status === 'paid' ? 'text-tertiary line-through' : 'text-error'}`}>
                                    {formatPrice(order.remaining_amount)}
                                    {order.payment_status === 'paid' && ' ✓'}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Full payment info */}
                          {order.payment_type === 'full' && (
                            <div className={`flex justify-between text-xs pt-1 font-semibold ${order.payment_status === 'paid' || order.payment_status === 'success' ? 'text-tertiary' : 'text-on-surface-variant'}`}>
                              <span>Status Pembayaran</span>
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                  {PAYMENT_STATUS[order.payment_status]?.icon || 'schedule'}
                                </span>
                                {PAYMENT_STATUS[order.payment_status]?.label || '-'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Beli Lagi */}
                        {order.status === 'completed' && (
                          <Link href="/products" className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-primary-container text-on-primary-container font-bold text-sm hover:bg-primary hover:text-on-primary transition-colors">
                            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                            Beli Lagi
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
