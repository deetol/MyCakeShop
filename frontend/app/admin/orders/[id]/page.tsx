"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  product_name: string;
  product_size: string | null;
  quantity: number;
  price: number;
  subtotal: number;
  product_image?: string;
}

interface OrderDetail {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  city: string;
  province: string;
  postal_code: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  notes: string | null;
  shipping_method: string | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  user: { id: number; name: string; email: string; phone?: string } | null;
  payment: { status: string; amount: number; paid_at?: string } | null;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; icon: string; cls: string; dot: string }> = {
  pending:    { label: "Menunggu",  icon: "hourglass_empty", cls: "bg-surface-variant text-on-surface-variant border border-outline-variant", dot: "bg-outline" },
  processing: { label: "Diproses", icon: "manufacturing",    cls: "bg-secondary-container text-on-secondary-container border border-secondary-fixed", dot: "bg-secondary" },
  shipped:    { label: "Dikirim",  icon: "local_shipping",   cls: "bg-primary-fixed text-on-primary-fixed border border-primary-fixed-dim", dot: "bg-primary" },
  completed:  { label: "Selesai",  icon: "check_circle",     cls: "bg-tertiary-fixed-dim/20 text-tertiary border border-tertiary-fixed", dot: "bg-tertiary" },
  cancelled:  { label: "Batal",    icon: "cancel",           cls: "bg-error-container text-on-error-container", dot: "bg-error" },
};

const PAYMENT_CFG: Record<string, { label: string; icon: string; cls: string }> = {
  pending:  { label: "Menunggu Pembayaran", icon: "schedule",   cls: "text-on-surface-variant" },
  paid:     { label: "Lunas",              icon: "verified",    cls: "text-tertiary" },
  success:  { label: "Lunas",              icon: "verified",    cls: "text-tertiary" },
  failed:   { label: "Pembayaran Gagal",   icon: "error",       cls: "text-error" },
  refunded: { label: "Dikembalikan",       icon: "currency_exchange", cls: "text-secondary" },
};

const ORDER_STATUS_OPTIONS = ["pending", "processing", "shipped", "completed", "cancelled"];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Auth guard
  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (!loading && user?.role !== "admin") { router.push("/"); return; }
  }, [loading, user, router]);

  // Fetch order detail
  const fetchOrder = useCallback(async () => {
    if (!token || !orderId) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get<any>(`/admin/orders/${orderId}`, token);
      const d = res.data?.order || res.data;
      setOrder(d);
      setNewStatus(d.status);
    } catch (e: any) {
      setError(e.message || "Gagal memuat detail pesanan");
    } finally {
      setIsLoading(false);
    }
  }, [token, orderId]);

  useEffect(() => {
    if (user?.role === "admin") fetchOrder();
  }, [user, fetchOrder]);

  // Update order status
  const handleUpdateStatus = async () => {
    if (!order || newStatus === order.status) { setShowStatusModal(false); return; }
    setIsUpdating(true);
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus }, token!);
      setOrder(prev => prev ? { ...prev, status: newStatus } : prev);
      setSuccessMsg("Status pesanan berhasil diperbarui!");
      setShowStatusModal(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e: any) {
      alert(e.message || "Gagal update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => window.print();

  const formatPrice = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString("id-ID", {
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const formatDateShort = (d: string) =>
    new Date(d).toLocaleString("id-ID", {
      day: "numeric", month: "short",
      hour: "2-digit", minute: "2-digit",
    });

  // Build activity log from order data
  const buildActivityLog = (o: OrderDetail) => {
    const logs = [
      {
        time: o.created_at,
        title: "Pesanan Dibuat",
        desc: "Pelanggan melakukan pemesanan.",
        icon: "add_shopping_cart", done: true,
      },
    ];
    if (o.payment_status === "paid" || o.payment_status === "success") {
      logs.push({
        time: o.payment?.paid_at || o.updated_at,
        title: "Pembayaran Dikonfirmasi",
        desc: `Sistem memverifikasi ${o.payment_method || "pembayaran"}.`,
        icon: "verified", done: true,
      });
    }
    if (["processing", "shipped", "completed"].includes(o.status)) {
      logs.push({
        time: o.updated_at,
        title: "Pesanan Diproses",
        desc: "Admin mulai menyiapkan item pesanan.",
        icon: "manufacturing", done: true,
      });
    }
    if (["shipped", "completed"].includes(o.status)) {
      logs.push({
        time: o.updated_at,
        title: "Pesanan Dikirim",
        desc: "Kurir mengantarkan pesanan.",
        icon: "local_shipping", done: true,
      });
    }
    if (o.status === "completed") {
      logs.push({
        time: o.updated_at,
        title: "Pesanan Selesai",
        desc: "Pesanan berhasil diterima pelanggan.",
        icon: "check_circle", done: true,
      });
    }
    if (o.status === "cancelled") {
      logs.push({
        time: o.updated_at,
        title: "Pesanan Dibatalkan",
        desc: "Pesanan telah dibatalkan.",
        icon: "cancel", done: false,
      });
    }
    return logs.reverse();
  };

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sc = order ? (STATUS_CFG[order.status] || STATUS_CFG.pending) : null;
  const pc = order ? (PAYMENT_CFG[order.payment_status] || PAYMENT_CFG.pending) : null;
  const activityLog = order ? buildActivityLog(order) : [];

  return (
    <AdminLayout>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="font-headline-md text-headline-md text-primary font-bold">
            Detail Pesanan
          </h1>
        </div>
        {!isLoading && order && (
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="h-10 px-5 flex items-center gap-2 rounded-lg border border-tertiary text-tertiary hover:bg-tertiary-fixed/20 transition-colors text-xs font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              Print Invoice
            </button>
            <button
              onClick={() => setShowStatusModal(true)}
              className="h-10 px-5 flex items-center gap-2 rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity text-xs font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
              Update Status
            </button>
          </div>
        )}
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="mb-6 bg-tertiary-container text-on-tertiary-container p-3 rounded-xl text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          {successMsg}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 bg-error-container text-on-error-container p-4 rounded-xl text-sm">{error}</div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-24 bg-surface-container rounded-xl" />
            <div className="h-64 bg-surface-container rounded-xl" />
            <div className="h-48 bg-surface-container rounded-xl" />
          </div>
          <div className="space-y-6">
            <div className="h-56 bg-surface-container rounded-xl" />
            <div className="h-56 bg-surface-container rounded-xl" />
          </div>
        </div>
      ) : !order ? null : (
        <>
          {/* ── Order Banner ──────────────────────────────────────────── */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Order #{order.order_number}
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Dibuat pada {formatDateTime(order.created_at)}
              </p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-xs ${sc?.cls}`}>
              <span className="material-symbols-outlined text-[18px]">{sc?.icon}</span>
              {sc?.label}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Left Column ───────────────────────────────────────── */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* Items Table */}
              <section className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
                <div className="p-5 border-b border-outline-variant bg-surface-container-low">
                  <h2 className="font-headline-md text-on-surface font-bold">Item Pesanan</h2>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant hidden md:table-header-group">
                    <tr>
                      <th className="p-4">Produk</th>
                      <th className="p-4 text-right">Harga</th>
                      <th className="p-4 text-center">Qty</th>
                      <th className="p-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant text-sm text-on-surface">
                    {order.items?.map((item, i) => (
                      <tr key={i} className="hover:bg-surface-container-low transition-colors">
                        <td className="p-4 flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-surface-container-high overflow-hidden shrink-0 border border-outline-variant relative">
                            {item.product_image ? (
                              <Image src={item.product_image} alt={item.product_name} fill className="object-cover" unoptimized />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-on-surface-variant text-2xl">bakery_dining</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{item.product_name}</p>
                            {item.product_size && (
                              <p className="text-xs text-on-surface-variant mt-0.5">Ukuran: {item.product_size}</p>
                            )}
                            {/* Mobile: price × qty */}
                            <p className="text-xs text-on-surface-variant mt-1 md:hidden">
                              {item.quantity} × {formatPrice(item.price)}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-right hidden md:table-cell">{formatPrice(item.price)}</td>
                        <td className="p-4 text-center hidden md:table-cell">{item.quantity}</td>
                        <td className="p-4 text-right font-bold hidden md:table-cell">{formatPrice(item.subtotal)}</td>
                        {/* Mobile subtotal */}
                        <td className="p-4 text-right font-bold md:hidden">{formatPrice(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              {/* Activity Log */}
              <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant">
                <h2 className="font-headline-md text-on-surface font-bold mb-6">Activity Log</h2>
                <div className="relative pl-5 space-y-7 before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-outline-variant">
                  {activityLog.map((log, i) => (
                    <div key={i} className="relative flex items-start gap-4">
                      {/* Timeline dot */}
                      <div className={`absolute -left-[25px] w-6 h-6 rounded-full flex items-center justify-center z-10 border-2 ${
                        log.done ? "bg-surface-container-lowest border-tertiary" : "bg-error-container border-error"
                      }`}>
                        {i === 0 ? (
                          <div className={`w-2 h-2 rounded-full ${log.done ? "bg-tertiary" : "bg-error"}`} />
                        ) : (
                          <span className={`material-symbols-outlined text-[12px] ${log.done ? "text-tertiary" : "text-error"}`}>
                            {log.done ? "check" : "close"}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">
                          {formatDateShort(log.time)}
                        </p>
                        <p className="text-sm font-bold text-on-surface">{log.title}</p>
                        <p className="text-sm text-on-surface-variant">{log.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Notes */}
              {order.notes && (
                <section className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary text-[20px]">note</span>
                    <h2 className="font-bold text-on-surface text-sm">Catatan Pelanggan</h2>
                  </div>
                  <p className="text-sm text-on-surface-variant italic">{order.notes}</p>
                </section>
              )}
            </div>

            {/* ── Right Column ─────────────────────────────────────── */}
            <div className="flex flex-col gap-5">

              {/* Customer Info */}
              <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-outline-variant">
                  <span className="material-symbols-outlined text-primary">person</span>
                  <h2 className="text-base font-bold text-on-surface">Detail Pelanggan</h2>
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">Nama</p>
                    <p className="font-semibold text-on-surface">{order.recipient_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">Kontak</p>
                    <p className="text-on-surface">{order.recipient_phone}</p>
                    {order.user?.email && <p className="text-on-surface-variant">{order.user.email}</p>}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">Alamat Pengiriman</p>
                    <p className="text-on-surface leading-relaxed">
                      {order.shipping_address}<br />
                      {order.city}, {order.province}<br />
                      {order.postal_code}
                    </p>
                  </div>
                  {order.shipping_method && (
                    <div>
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">Kurir</p>
                      <p className="text-on-surface">{order.shipping_method}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Order Summary */}
              <section className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-outline-variant">
                  <span className="material-symbols-outlined text-primary">receipt_long</span>
                  <h2 className="text-base font-bold text-on-surface">Ringkasan Pesanan</h2>
                </div>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Subtotal ({order.items?.length || 0} item)</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Ongkos Kirim</span>
                    <span>{formatPrice(order.shipping_cost)}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Pajak (11%)</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>
                  <div className="pt-4 border-t border-outline-variant">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-base text-on-surface">Total</span>
                      <span className="text-xl font-bold text-primary">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment status */}
                <div className="mt-5 p-4 bg-surface-container rounded-lg border border-outline-variant">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2">Status Pembayaran</p>
                  <div className={`flex items-center gap-2 font-bold text-sm ${pc?.cls}`}>
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {pc?.icon}
                    </span>
                    {pc?.label}
                    {order.payment_method && (
                      <span className="font-normal text-on-surface-variant">via {order.payment_method}</span>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </>
      )}

      {/* ── Update Status Modal ──────────────────────────────────────── */}
      {showStatusModal && order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowStatusModal(false)} />
          <div className="bg-surface rounded-2xl max-w-sm w-full shadow-xl border border-surface-container relative z-10 p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-primary text-lg">Update Status Pesanan</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-on-surface-variant hover:text-primary p-1 rounded-full transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-2">Status Saat Ini</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${STATUS_CFG[order.status]?.cls}`}>
                <span className="material-symbols-outlined text-[14px]">{STATUS_CFG[order.status]?.icon}</span>
                {STATUS_CFG[order.status]?.label}
              </span>
            </div>

            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-3">Pilih Status Baru</p>
              <div className="space-y-2">
                {ORDER_STATUS_OPTIONS.map(s => {
                  const cfg = STATUS_CFG[s];
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewStatus(s)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                        newStatus === s
                          ? "border-primary bg-primary-fixed/20 text-primary"
                          : "border-outline-variant text-on-surface-variant hover:border-primary hover:bg-surface-container"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{cfg.icon}</span>
                      {cfg.label}
                      {s === order.status && (
                        <span className="ml-auto text-xs font-bold text-on-surface-variant">(Saat ini)</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-surface-container">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 py-2.5 border-2 border-outline-variant rounded-lg text-sm font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={isUpdating || newStatus === order.status}
                className="flex-1 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">check</span>
                )}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
