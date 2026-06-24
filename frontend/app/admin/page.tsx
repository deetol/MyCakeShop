"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  total: number;
  status: string;
  date: string;
}

export default function AdminDashboard() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (!loading && user && user.role !== "admin") {
      router.push("/");
      return;
    }
  }, [loading, user, router]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      // Try to get stats from API
      const [ordersRes, productsRes, usersRes] = await Promise.allSettled([
        api.get<any>("/orders?per_page=5", token),
        api.get<any>("/products?per_page=1", token),
        api.get<any>("/admin/users?per_page=1", token),
      ]);

      let ordersData: any[] = [];
      if (ordersRes.status === "fulfilled") {
        const d = ordersRes.value.data;
        ordersData = Array.isArray(d) ? d : d?.data || d?.orders || [];
      }

      const pending = ordersData.filter(
        (o: any) => o.status === "pending" || o.status === "processing"
      ).length;

      const revenue = ordersData.reduce(
        (sum: number, o: any) => sum + (o.total_amount || o.total || 0),
        0
      );

      let productCount = 0;
      if (productsRes.status === "fulfilled") {
        const d = productsRes.value.data;
        productCount = d?.total || d?.pagination?.total || (Array.isArray(d) ? d.length : 0);
      }

      let userCount = 0;
      if (usersRes.status === "fulfilled") {
        const d = usersRes.value.data;
        userCount = d?.total || d?.pagination?.total || (Array.isArray(d) ? d.length : 0);
      }

      setStats({
        totalOrders: ordersData.length,
        pendingOrders: pending,
        totalRevenue: revenue,
        totalProducts: productCount,
        totalUsers: userCount,
      });

      // Map recent orders
      const mapped: RecentOrder[] = ordersData.slice(0, 5).map((o: any) => ({
        id: o.order_number || o.id?.toString() || "N/A",
        customer: o.recipient_name || o.user?.name || "Pelanggan",
        total: o.total_amount || o.total || 0,
        status: o.status || "pending",
        date: o.created_at
          ? new Date(o.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "-",
      }));
      setRecentOrders(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role === "admin" && token) fetchStats();
  }, [user, token, fetchStats]);

  const formatPrice = (v: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(v);

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-indigo-100 text-indigo-800",
    completed: "bg-green-100 text-green-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const statusLabel: Record<string, string> = {
    pending: "Menunggu",
    processing: "Diproses",
    shipped: "Dikirim",
    completed: "Selesai",
    delivered: "Selesai",
    cancelled: "Dibatalkan",
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Sidebar ── */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 sticky top-0 h-screen">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-indigo-600">🎂 MyCakeShop</h1>
          <p className="text-xs text-gray-400 mt-1">Admin Dashboard</p>
        </div>

        {/* Admin info */}
        <div className="px-4 py-3 bg-indigo-50 mx-3 mt-3 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
              <p className="text-xs text-indigo-500">Administrator</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-grow px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">Menu Utama</p>

          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-50 text-indigo-600 font-semibold text-sm">
            <span className="material-symbols-outlined text-[20px]">dashboard</span> Dashboard
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors text-sm">
            <span className="material-symbols-outlined text-[20px]">receipt_long</span> Pesanan
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors text-sm">
            <span className="material-symbols-outlined text-[20px]">cake</span> Produk
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors text-sm">
            <span className="material-symbols-outlined text-[20px]">group</span> Pelanggan
          </Link>

          <div className="pt-3 mt-3 border-t border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">Pengaturan</p>
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors text-sm">
              <span className="material-symbols-outlined text-[20px]">storefront</span> Lihat Toko
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span> Keluar
            </button>
          </div>
        </nav>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-grow overflow-y-auto">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Dashboard</h2>
            <p className="text-xs text-gray-400">
              {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <button onClick={fetchStats} className="flex items-center gap-2 text-sm text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
            <span className={`material-symbols-outlined text-[18px] ${isLoading ? "animate-spin" : ""}`}>refresh</span>
            Refresh
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {[
              { label: "Total Pesanan", value: stats.totalOrders, icon: "receipt_long", color: "text-indigo-600", bg: "bg-indigo-50" },
              { label: "Menunggu Proses", value: stats.pendingOrders, icon: "hourglass_empty", color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Total Produk", value: stats.totalProducts, icon: "cake", color: "text-green-600", bg: "bg-green-50" },
              { label: "Total Pelanggan", value: stats.totalUsers, icon: "group", color: "text-purple-600", bg: "bg-purple-50" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500">{stat.label}</span>
                  <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center`}>
                    <span className={`material-symbols-outlined text-[20px] ${stat.color}`}>{stat.icon}</span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {isLoading ? <span className="inline-block w-12 h-7 bg-gray-100 rounded animate-pulse" /> : stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Revenue card full width */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl p-6 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-sm font-medium">Total Pendapatan</p>
                <p className="text-3xl font-bold mt-1">
                  {isLoading ? <span className="inline-block w-32 h-8 bg-white/20 rounded animate-pulse" /> : formatPrice(stats.totalRevenue)}
                </p>
                <p className="text-indigo-200 text-xs mt-2">Berdasarkan pesanan yang tercatat</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-white">payments</span>
              </div>
            </div>
          </div>

          {/* ── Recent Orders ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Pesanan Terbaru</h3>
              <Link href="/admin/orders" className="text-sm text-indigo-600 hover:underline font-semibold">
                Lihat Semua →
              </Link>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <span className="material-symbols-outlined text-5xl block mb-3">receipt_long</span>
                <p className="text-sm">Belum ada pesanan masuk</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {["No. Pesanan", "Pelanggan", "Total", "Status", "Tanggal"].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono font-semibold text-indigo-600">#{order.id}</td>
                        <td className="px-6 py-4 text-gray-800">{order.customer}</td>
                        <td className="px-6 py-4 font-semibold text-gray-800">{formatPrice(order.total)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor[order.status] || "bg-gray-100 text-gray-700"}`}>
                            {statusLabel[order.status] || order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Quick Actions ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">Aksi Cepat</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Tambah Produk", icon: "add_circle", href: "/admin/products/create", color: "text-green-600 bg-green-50 hover:bg-green-100" },
                { label: "Kelola Pesanan", icon: "receipt_long", href: "/admin/orders", color: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100" },
                { label: "Lihat Pelanggan", icon: "group", href: "/admin/users", color: "text-purple-600 bg-purple-50 hover:bg-purple-100" },
                { label: "Lihat Toko", icon: "storefront", href: "/", color: "text-gray-600 bg-gray-50 hover:bg-gray-100" },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${action.color}`}
                >
                  <span className="material-symbols-outlined text-[28px]">{action.icon}</span>
                  <span className="text-xs font-semibold text-center">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
