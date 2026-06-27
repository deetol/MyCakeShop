"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockCount: number;
  totalProducts: number;
  totalUsers: number;
}

interface LowStockProduct {
  id: number;
  name: string;
  category: string;
  stock: number;
  unit: string;
}

interface WeeklySales {
  day: string;
  amount: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  total: number;
  status: string;
  date: string;
}

// ─── Chart Component ──────────────────────────────────────────────────────────

function SalesChart({ data }: { data: WeeklySales[] }) {
  const max = Math.max(...data.map(d => d.amount), 1);

  return (
    <div className="flex-1 min-h-[220px] relative flex flex-col justify-end">
      {/* Y-axis guides */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
        {[100, 75, 50, 25, 0].map(pct => (
          <div key={pct} className="flex items-center gap-2">
            <span className="text-[10px] text-on-surface-variant w-8 text-right">
              {pct === 0 ? "0" : max > 0 ? `${Math.round(max * pct / 100 / 1000)}K` : "0"}
            </span>
            <div className="flex-1 border-t border-outline-variant/30" />
          </div>
        ))}
      </div>

      {/* Bars */}
      <div className="flex items-end justify-between gap-2 pl-10 pb-8 h-full">
        {data.map((d, i) => {
          const heightPct = max > 0 ? (d.amount / max) * 100 : 0;
          const isToday = i === data.length - 1;
          return (
            <div key={d.day} className="flex flex-col items-center gap-2 flex-1 group">
              <div className="relative w-full flex flex-col items-center">
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${
                    isToday ? "bg-primary" : "bg-primary-fixed group-hover:bg-primary/70"
                  }`}
                  style={{ height: `${Math.max(heightPct * 1.8, 4)}px` }}
                />
                {/* Tooltip */}
                <div className="absolute -top-8 hidden group-hover:flex bg-on-surface text-inverse-on-surface text-[10px] px-2 py-1 rounded-md whitespace-nowrap z-10">
                  {d.amount > 0 ? `Rp ${(d.amount / 1000).toFixed(0)}K` : 'Rp 0'}
                </div>
              </div>
              <span className={`text-[10px] font-bold ${isToday ? "text-primary" : "text-on-surface-variant"}`}>
                {d.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0, revenueGrowth: 0,
    totalOrders: 0, pendingOrders: 0,
    lowStockCount: 0, totalProducts: 0, totalUsers: 0,
  });
  const [weeklySales, setWeeklySales] = useState<WeeklySales[]>([
    { day: "Sen", amount: 0 }, { day: "Sel", amount: 0 },
    { day: "Rab", amount: 0 }, { day: "Kam", amount: 0 },
    { day: "Jum", amount: 0 }, { day: "Sab", amount: 0 },
    { day: "Min", amount: 0 },
  ]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auth guard
  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (!loading && user?.role !== "admin") { router.push("/"); return; }
  }, [loading, user, router]);

  const fetchDashboard = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      // Fetch from correct admin endpoints
      const [ordersRes, productsRes, usersRes] = await Promise.allSettled([
        api.get<any>("/admin/orders?per_page=50", token),
        api.get<any>("/admin/products?per_page=100", token),
        api.get<any>("/admin/users?per_page=1", token),
      ]);

      // ── Products data ──
      let productList: any[] = [];
      if (productsRes.status === "fulfilled") {
        const d = productsRes.value.data;
        productList = Array.isArray(d) ? d : d?.products || d?.data || [];
      }

      const lowStock = productList.filter((p: any) => p.stock > 0 && p.stock <= 10);
      const outOfStock = productList.filter((p: any) => p.stock === 0);

      setLowStockProducts(
        [...outOfStock, ...lowStock].slice(0, 6).map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category?.name || "—",
          stock: p.stock,
          unit: p.unit || "pcs",
        }))
      );

      // ── Orders data ──
      let orderList: any[] = [];
      if (ordersRes.status === "fulfilled") {
        const d = ordersRes.value.data;
        // admin/orders returns paginated { orders: [], pagination: {} }
        orderList = Array.isArray(d) ? d : d?.orders || d?.data || [];
      }

      // Revenue = sum of orders that are paid (dp_paid or paid)
      // parseFloat() handles string decimals from API like "24420.00"
      const totalRevenue = orderList
        .filter((o: any) => ["dp_paid", "paid"].includes(o.payment_status))
        .reduce((s: number, o: any) => {
          if (o.payment_status === "dp_paid") {
            return s + (parseFloat(o.dp_amount) || 0);
          }
          return s + (parseFloat(o.total) || 0);
        }, 0);

      const pendingOrders = orderList.filter((o: any) => o.status === "pending").length;
      const processingOrders = orderList.filter((o: any) => o.status === "processing").length;

      // Users count — only from pagination total (actual registered customers)
      let totalUsers = 0;
      if (usersRes.status === "fulfilled") {
        const d = usersRes.value.data;
        totalUsers = d?.pagination?.total || 0;
      }

      setStats({
        totalRevenue,
        revenueGrowth: 0,
        totalOrders: orderList.length,
        pendingOrders: pendingOrders + processingOrders,
        lowStockCount: lowStock.length + outOfStock.length,
        totalProducts: productList.length,
        totalUsers,
      });

      // ── Recent orders (5 latest) ──
      setRecentOrders(orderList.slice(0, 5).map((o: any) => ({
        id: o.order_number || o.id?.toString() || "—",
        customer: o.recipient_name || o.user?.name || "Pelanggan",
        total: parseFloat(o.total) || 0,
        status: o.status || "pending",
        date: o.created_at
          ? new Date(o.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
          : "—",
      })));

      // ── Weekly sales chart ──
      const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
      const dayTotals = days.map((day, i) => ({
        day,
        amount: orderList
          .filter((o: any) => {
            if (!o.created_at) return false;
            const d = new Date(o.created_at).getDay();
            const mapped = d === 0 ? 6 : d - 1;
            return mapped === i;
          })
          .reduce((s: number, o: any) => s + (parseFloat(o.total) || 0), 0),
      }));
      setWeeklySales(dayTotals);

    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role === "admin") fetchDashboard();
  }, [user, fetchDashboard]);

  const formatPrice = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

  const statusMap: Record<string, { label: string; cls: string }> = {
    pending:    { label: "Menunggu", cls: "bg-yellow-100 text-yellow-800" },
    processing: { label: "Diproses", cls: "bg-blue-100 text-blue-800" },
    shipped:    { label: "Dikirim",  cls: "bg-indigo-100 text-indigo-800" },
    completed:  { label: "Selesai",  cls: "bg-tertiary-container text-on-tertiary-container" },
    delivered:  { label: "Selesai",  cls: "bg-tertiary-container text-on-tertiary-container" },
    cancelled:  { label: "Batal",    cls: "bg-error-container text-on-error-container" },
  };

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const Skeleton = ({ cls }: { cls: string }) => (
    <div className={`animate-pulse bg-surface-container rounded-lg ${cls}`} />
  );

  return (
    <AdminLayout>
      {/* Page heading */}
      <div className="mb-8">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-1">
          Ringkasan Hari Ini
        </h2>
        <p className="text-sm text-on-surface-variant">
          Pantau performa toko roti Anda hari ini.
        </p>
      </div>

      {/* ── Bento: Stat Cards — 4 kolom lurus ──────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        {/* Total Penjualan */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:border-primary/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary-fixed rounded-lg text-primary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
            </div>
            <span className="text-xs text-tertiary px-2 py-1 bg-tertiary-fixed rounded-full flex items-center gap-1 font-bold">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              +{stats.revenueGrowth}%
            </span>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Total Penjualan</p>
            {isLoading ? <Skeleton cls="h-8 w-40 mt-1" /> : (
              <h3 className="font-display-lg-mobile text-display-lg-mobile text-on-surface">
                {formatPrice(stats.totalRevenue)}
              </h3>
            )}
            <p className="text-xs text-on-surface-variant mt-1">Dari pembayaran yang dikonfirmasi</p>
          </div>
        </div>

        {/* Pesanan Masuk */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:border-primary/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-secondary-container rounded-lg text-secondary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
            </div>
            <span className="text-xs text-on-surface-variant px-2 py-1 bg-surface-container rounded-full font-bold">Total</span>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Total Pesanan</p>
            {isLoading ? <Skeleton cls="h-8 w-24 mt-1" /> : (
              <h3 className="font-display-lg-mobile text-display-lg-mobile text-on-surface">
                {stats.totalOrders}
                <span className="text-sm text-on-surface-variant ml-2 font-normal">pesanan</span>
              </h3>
            )}
            {stats.pendingOrders > 0 && !isLoading && (
              <p className="text-xs text-amber-600 font-semibold mt-1">
                {stats.pendingOrders} perlu diproses
              </p>
            )}
          </div>
        </div>

        {/* Pelanggan */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:border-primary/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary-fixed rounded-lg text-primary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
            </div>
            <Link href="/admin/users" className="text-xs text-primary font-bold hover:underline">Lihat →</Link>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Total Pelanggan</p>
            {isLoading ? <Skeleton cls="h-8 w-20 mt-1" /> : (
              <h3 className="font-display-lg-mobile text-display-lg-mobile text-on-surface">
                {stats.totalUsers}
                <span className="text-sm text-on-surface-variant ml-2 font-normal">akun</span>
              </h3>
            )}
          </div>
        </div>

        {/* Stok Menipis */}
        <div className={`p-6 rounded-xl shadow-sm border flex flex-col justify-between transition-colors ${
          stats.lowStockCount > 0
            ? "bg-error-container/20 border-error/20 hover:border-error/50"
            : "bg-surface-container-lowest border-outline-variant/30 hover:border-primary/50"
        }`}>
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-lg ${stats.lowStockCount > 0 ? "bg-error-container text-error" : "bg-tertiary-fixed text-tertiary"}`}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                {stats.lowStockCount > 0 ? "warning" : "inventory_2"}
              </span>
            </div>
            {stats.lowStockCount > 0 && (
              <span className="text-xs text-error px-2 py-1 bg-error-container/50 rounded-full font-bold">Perlu Perhatian</span>
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Stok Menipis</p>
            {isLoading ? <Skeleton cls="h-8 w-20 mt-1" /> : (
              <h3 className={`font-display-lg-mobile text-display-lg-mobile ${stats.lowStockCount > 0 ? "text-error" : "text-tertiary"}`}>
                {stats.lowStockCount}
                <span className="text-sm text-on-surface-variant ml-2 font-normal">item</span>
              </h3>
            )}
          </div>
        </div>
      </div>

      {/* ── Secondary Grid: Chart + Stok Kritis ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Sales Chart (span 2) */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-md text-headline-md text-on-surface">
              Tren Penjualan (Mingguan)
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs text-primary font-bold hover:underline px-3 py-1 border border-primary/20 rounded-full"
            >
              Lihat Detail
            </Link>
          </div>
          {isLoading ? (
            <div className="flex-1 min-h-[220px] flex items-end justify-between gap-2 px-10 pb-8">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 rounded-t-md bg-surface-container animate-pulse"
                  style={{ height: `${Math.random() * 140 + 40}px` }} />
              ))}
            </div>
          ) : (
            <SalesChart data={weeklySales} />
          )}
        </div>

        {/* Stok Kritis */}
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
              Stok Kritis
              {lowStockProducts.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
              )}
            </h3>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} cls="h-12 w-full" />)}
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant py-8">
              <span className="material-symbols-outlined text-4xl mb-2 text-tertiary">check_circle</span>
              <p className="text-sm font-semibold">Semua stok aman!</p>
            </div>
          ) : (
            <div className="overflow-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/50">
                    <th className="py-2 px-2 text-xs font-bold text-on-surface-variant uppercase tracking-wide">Produk</th>
                    <th className="py-2 px-2 text-xs font-bold text-on-surface-variant uppercase tracking-wide text-right">Sisa</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map(p => (
                    <tr key={p.id} className="border-b border-surface-container hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-2">
                        <p className="text-sm font-semibold text-on-surface leading-tight">{p.name}</p>
                        <p className="text-xs text-on-surface-variant">{p.category}</p>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className={`text-sm font-bold ${p.stock === 0 ? "text-error" : p.stock <= 5 ? "text-error" : "text-primary"}`}>
                          {p.stock} {p.unit}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-outline-variant/30 text-center">
            <Link href="/admin/stock" className="text-xs text-primary font-bold hover:underline">
              Kelola Stok →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Recent Orders ──────────────────────────────────────────────── */}
      {recentOrders.length > 0 && (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant/30">
            <h3 className="font-headline-md text-headline-md text-on-surface">Pesanan Terbaru</h3>
            <Link href="/admin/orders" className="text-xs text-primary font-bold hover:underline">
              Lihat Semua →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low">
                <tr>
                  {["No. Pesanan", "Pelanggan", "Total", "Status", "Tanggal"].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {recentOrders.map(order => {
                  const s = statusMap[order.status] || { label: order.status, cls: "bg-surface-container text-on-surface" };
                  return (
                    <tr key={order.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-3 font-mono font-bold text-primary text-xs">#{order.id}</td>
                      <td className="px-6 py-3 text-on-surface">{order.customer}</td>
                      <td className="px-6 py-3 font-bold text-on-surface">{formatPrice(order.total)}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${s.cls}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-on-surface-variant">{order.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Quick Actions ──────────────────────────────────────────────── */}
      <div className="mt-6 bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6">
        <h3 className="font-headline-md text-on-surface mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Tambah Produk",   icon: "add_circle",   href: "/admin/products/create", cls: "text-green-700 bg-green-50 hover:bg-green-100" },
            { label: "Kelola Pesanan",  icon: "receipt_long", href: "/admin/orders",           cls: "text-primary bg-primary-fixed hover:bg-primary-fixed-dim" },
            { label: "Update Stok",     icon: "inventory_2",  href: "/admin/stock",            cls: "text-secondary bg-secondary-container hover:bg-secondary-fixed-dim" },
            { label: "Lihat Toko",      icon: "storefront",   href: "/",                       cls: "text-on-surface-variant bg-surface-container hover:bg-surface-container-high" },
          ].map(a => (
            <Link key={a.label} href={a.href}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${a.cls}`}>
              <span className="material-symbols-outlined text-[28px]">{a.icon}</span>
              <span className="text-xs font-bold text-center">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
