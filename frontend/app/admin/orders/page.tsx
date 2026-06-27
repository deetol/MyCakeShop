"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Order {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  recipient_name: string;
  recipient_phone: string;
  total: number;
  items_count: number;
  created_at: string;
  user: { id: number; name: string; email: string } | null;
  payment: { status: string; amount: number } | null;
}

interface Pagination {
  total: number; per_page: number; current_page: number; last_page: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const ORDER_STATUSES = [
  { value: "all",        label: "Semua" },
  { value: "pending",    label: "Perlu Diproses" },
  { value: "processing", label: "Diproses" },
  { value: "shipped",    label: "Dikirim" },
  { value: "completed",  label: "Selesai" },
  { value: "cancelled",  label: "Dibatalkan" },
];

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  pending:    { label: "Menunggu",  cls: "bg-surface-variant text-on-surface-variant border border-outline-variant" },
  processing: { label: "Diproses", cls: "bg-secondary-container text-on-secondary-container border border-secondary-fixed" },
  shipped:    { label: "Dikirim",  cls: "bg-primary-fixed text-on-primary-fixed border border-primary-fixed-dim" },
  completed:  { label: "Selesai",  cls: "bg-tertiary-container text-on-tertiary-container" },
  cancelled:  { label: "Batal",    cls: "bg-error-container text-on-error-container" },
};

const PAYMENT_CFG: Record<string, { label: string; cls: string }> = {
  pending:  { label: "Menunggu", cls: "bg-surface-variant text-on-surface-variant border border-outline-variant" },
  dp_paid:  { label: "DP Bayar", cls: "bg-primary-fixed text-on-primary-fixed border border-primary-fixed-dim" },
  paid:     { label: "Lunas",    cls: "bg-tertiary-fixed text-on-tertiary-fixed" },
  success:  { label: "Lunas",    cls: "bg-tertiary-fixed text-on-tertiary-fixed" },
  failed:   { label: "Gagal",    cls: "bg-error-container text-on-error-container" },
  refunded: { label: "Refund",   cls: "bg-secondary-container text-on-secondary-container" },
};

const ORDER_STATUS_OPTIONS = ["pending", "processing", "shipped", "completed", "cancelled"];
const PAYMENT_STATUS_OPTIONS = ["pending", "dp_paid", "paid", "failed", "refunded"];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, per_page: 15, current_page: 1, last_page: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Inline status change
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  // Auth guard
  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (!loading && user?.role !== "admin") { router.push("/"); return; }
  }, [loading, user, router]);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      let url = `/admin/orders?page=${currentPage}&per_page=15`;
      if (filterStatus !== "all") url += `&status=${filterStatus}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await api.get<any>(url, token);
      const d = res.data;
      setOrders(Array.isArray(d) ? d : d?.orders || d?.data || []);
      if (d?.pagination) setPagination(d.pagination);
    } catch { setOrders([]); }
    finally { setIsLoading(false); }
  }, [token, currentPage, filterStatus, search]);

  useEffect(() => {
    if (user?.role === "admin") fetchOrders();
  }, [user, fetchOrders]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(fetchOrders, 400);
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus }, token!);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (detailOrder?.id === orderId) {
        setDetailOrder(prev => prev ? { ...prev, status: newStatus } : prev);
      }
    } catch (e: any) {
      alert(e.message || "Gagal update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmPayment = async (orderId: number) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/admin/orders/${orderId}/confirm-payment`, {}, token!);
      fetchOrders();
    } catch (e: any) {
      alert(e.message || "Gagal konfirmasi pembayaran");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatPrice = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

  const formatDate = (d: string) =>
    new Date(d).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-background">Daftar Pesanan</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Kelola semua pesanan pelanggan dari toko Anda.
          </p>
        </div>
        <button
          onClick={() => {
            const csv = ["Order ID,Pelanggan,Total,Status,Pembayaran,Tanggal"]
              .concat(orders.map(o =>
                `${o.order_number},${o.recipient_name},${o.total},${o.status},${o.payment_status},${o.created_at}`
              )).join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = "orders.csv"; a.click();
          }}
          className="flex items-center gap-2 px-4 py-2 border border-outline text-on-surface rounded-lg text-xs font-bold hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            type="text"
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Cari pesanan atau nama..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-full text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Status Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
        {ORDER_STATUSES.map(s => (
          <button
            key={s.value}
            onClick={() => { setFilterStatus(s.value); setCurrentPage(1); }}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-colors ${
              filterStatus === s.value
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container text-on-surface border border-outline-variant hover:border-outline"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-surface-container-high">
                {["Order ID", "Customer", "Tanggal", "Total", "Pembayaran", "Status", "Aksi"].map(h => (
                  <th key={h} className={`py-4 px-6 text-xs font-bold text-on-surface-variant uppercase tracking-wider ${h === "Total" ? "text-right" : h === "Aksi" ? "text-center" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high text-sm text-on-surface">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="py-4 px-6">
                        <div className="h-4 bg-surface-container rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-5xl block mb-3">receipt_long</span>
                    <p className="text-sm">Tidak ada pesanan ditemukan.</p>
                  </td>
                </tr>
              ) : (
                orders.map(order => {
                  const sc = STATUS_CFG[order.status] || STATUS_CFG.pending;
                  const pc = PAYMENT_CFG[order.payment_status] || PAYMENT_CFG.pending;
                  const isCancelled = order.status === "cancelled";
                  const isUpdating = updatingId === order.id;

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-surface-container-low transition-colors cursor-pointer ${isCancelled ? "opacity-70" : ""}`}
                    >
                      <td className="py-4 px-6 font-bold text-primary font-mono text-xs">
                        #{order.order_number}
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold">{order.recipient_name}</p>
                        {order.user && <p className="text-xs text-on-surface-variant">{order.user.email}</p>}
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant text-xs">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="py-4 px-6 text-right font-bold">
                        {formatPrice(order.total)}
                      </td>

                      {/* Payment Status — read-only badge + confirm button */}
                      <td className="py-4 px-6">
                        {isUpdating ? (
                          <span className="material-symbols-outlined animate-spin text-[16px] text-primary">progress_activity</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${pc.cls}`}>
                              {pc.label}
                            </span>
                            {/* Show confirm button only when payment can be confirmed */}
                            {(order.payment_status === 'pending' || order.payment_status === 'dp_paid') && (
                              <button
                                onClick={e => { e.stopPropagation(); handleConfirmPayment(order.id); }}
                                className="text-[10px] font-bold text-tertiary hover:underline flex items-center gap-0.5"
                              >
                                <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                {order.payment_status === 'dp_paid' ? 'Konfirmasi Lunas' : 'Konfirmasi Bayar'}
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Order Status — dropdown */}
                      <td className="py-4 px-6">
                        {isUpdating ? (
                          <span className="material-symbols-outlined animate-spin text-[16px] text-primary">progress_activity</span>
                        ) : (
                          <select
                            value={order.status}
                            onChange={e => { e.stopPropagation(); handleStatusChange(order.id, e.target.value); }}
                            onClick={e => e.stopPropagation()}
                            className={`text-xs font-bold px-2 py-1 rounded-full border-0 focus:ring-1 focus:ring-primary cursor-pointer ${sc.cls}`}
                          >
                            {ORDER_STATUS_OPTIONS.map(s => (
                              <option key={s} value={s}>
                                {STATUS_CFG[s]?.label || s}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-center">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-primary hover:text-primary-container transition-colors p-1 rounded inline-flex"
                          title="Lihat Detail"
                        >
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-surface px-6 py-4 border-t border-surface-container-high flex items-center justify-between">
          <span className="text-xs text-on-surface-variant">
            Menampilkan {((pagination.current_page - 1) * pagination.per_page) + 1}–
            {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total} pesanan
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={pagination.current_page === 1}
              className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high disabled:opacity-40 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(pagination.last_page, 5) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded border flex items-center justify-center text-xs font-bold transition-colors ${
                  pagination.current_page === page
                    ? "border-outline bg-surface-container-lowest text-primary"
                    : "border-outline-variant text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(pagination.last_page, p + 1))}
              disabled={pagination.current_page === pagination.last_page}
              className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high disabled:opacity-40 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

    </AdminLayout>
  );
}
