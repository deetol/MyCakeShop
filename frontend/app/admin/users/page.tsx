"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";

interface Customer {
  id: number; name: string; email: string; phone: string;
  orders_count: number; created_at: string;
}
interface Pagination { total: number; per_page: number; current_page: number; last_page: number; }
interface CustomerDetail {
  id: number; name: string; email: string; phone: string;
  orders_count: number; total_spent: number; created_at: string;
  recent_orders: Array<{
    id: number; order_number: string; status: string;
    payment_status: string; total: number; created_at: string;
  }>;
}

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  pending:    { label: "Menunggu",  cls: "bg-surface-variant text-on-surface-variant" },
  processing: { label: "Diproses", cls: "bg-secondary-container text-on-secondary-container" },
  shipped:    { label: "Dikirim",  cls: "bg-primary-fixed text-on-primary-fixed" },
  completed:  { label: "Selesai",  cls: "bg-tertiary-container text-on-tertiary-container" },
  cancelled:  { label: "Batal",    cls: "bg-error-container text-on-error-container" },
};

export default function AdminUsersPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, per_page: 15, current_page: 1, last_page: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<CustomerDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (!loading && user?.role !== "admin") { router.push("/"); return; }
  }, [loading, user, router]);

  const fetchCustomers = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      let url = `/admin/users?page=${currentPage}&per_page=15`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await api.get<any>(url, token);
      const d = res.data;
      setCustomers(d?.users || []);
      if (d?.pagination) setPagination(d.pagination);
    } catch { setCustomers([]); }
    finally { setIsLoading(false); }
  }, [token, currentPage, search]);

  useEffect(() => { if (user?.role === "admin") fetchCustomers(); }, [user, fetchCustomers]);

  const fetchDetail = async (id: number) => {
    if (!token) return;
    setIsLoadingDetail(true);
    try {
      const res = await api.get<any>(`/admin/users/${id}`, token);
      setSelected(res.data);
    } catch {}
    finally { setIsLoadingDetail(false); }
  };

  const handleSearch = (val: string) => {
    setSearch(val); setCurrentPage(1);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(fetchCustomers, 400);
  };

  const formatPrice = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  if (loading || !user || user.role !== "admin") {
    return <div className="min-h-screen bg-surface-container-low flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  return (
    <AdminLayout>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-background">Daftar Pelanggan</h2>
          <p className="text-sm text-on-surface-variant mt-1">Kelola semua akun pelanggan terdaftar.</p>
        </div>
        <span className="text-xs text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-full font-semibold">
          {pagination.total} pelanggan
        </span>
      </div>

      {/* Search */}
      <div className="mb-5 relative max-w-sm">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
        <input type="text" value={search} onChange={e => handleSearch(e.target.value)}
          placeholder="Cari nama atau email..."
          className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-full text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-surface-container-high">
                {["Pelanggan", "Email", "No. Telepon", "Pesanan", "Bergabung", "Aksi"].map(h => (
                  <th key={h} className="py-4 px-6 text-xs font-bold text-on-surface-variant uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high text-sm">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="py-4 px-6"><div className="h-4 bg-surface-container rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : customers.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl block mb-3">group_off</span>
                  <p className="text-sm">Belum ada pelanggan terdaftar.</p>
                </td></tr>
              ) : customers.map(c => (
                <tr key={c.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-on-surface">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-on-surface-variant">{c.email}</td>
                  <td className="py-4 px-6 text-on-surface-variant">{c.phone || '—'}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${c.orders_count > 0 ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-surface-container text-on-surface-variant'}`}>
                      {c.orders_count} pesanan
                    </span>
                  </td>
                  <td className="py-4 px-6 text-on-surface-variant text-xs">{formatDate(c.created_at)}</td>
                  <td className="py-4 px-6">
                    <button onClick={() => fetchDetail(c.id)}
                      className="text-primary hover:text-primary-container transition-colors p-1 rounded" title="Lihat Detail">
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-surface px-6 py-4 border-t border-surface-container-high flex items-center justify-between">
          <span className="text-xs text-on-surface-variant">
            {((pagination.current_page - 1) * pagination.per_page) + 1}–{Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total}
          </span>
          <div className="flex gap-1.5">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={pagination.current_page === 1}
              className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-container-high disabled:opacity-40">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(pagination.last_page, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 rounded border flex items-center justify-center text-xs font-bold ${pagination.current_page === p ? 'border-outline bg-surface-container-lowest text-primary' : 'border-outline-variant hover:bg-surface-container-high'}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(pagination.last_page, p + 1))} disabled={pagination.current_page === pagination.last_page}
              className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-container-high disabled:opacity-40">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="bg-surface rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-xl border border-surface-container relative z-10">
            <div className="flex justify-between items-center p-6 border-b border-surface-container sticky top-0 bg-surface z-10">
              <h2 className="text-lg font-bold text-primary">Detail Pelanggan</h2>
              <button onClick={() => setSelected(null)} className="text-on-surface-variant hover:text-primary p-2 rounded-full hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              {isLoadingDetail ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Profile */}
                  <div className="flex items-center gap-4 bg-surface-container-low rounded-xl p-4">
                    <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xl font-bold flex-shrink-0">
                      {selected.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-on-surface text-base">{selected.name}</p>
                      <p className="text-sm text-on-surface-variant">{selected.email}</p>
                      <p className="text-sm text-on-surface-variant">{selected.phone || '—'}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Total Pesanan", value: selected.orders_count, icon: "receipt_long", cls: "bg-secondary-container text-on-secondary-container" },
                      { label: "Total Belanja", value: formatPrice(selected.total_spent), icon: "payments", cls: "bg-tertiary-container text-on-tertiary-container" },
                      { label: "Bergabung", value: formatDate(selected.created_at), icon: "calendar_today", cls: "bg-primary-fixed text-on-primary-fixed" },
                    ].map(s => (
                      <div key={s.label} className={`rounded-xl p-3 ${s.cls}`}>
                        <span className="material-symbols-outlined text-[20px] mb-1 block">{s.icon}</span>
                        <p className="text-[10px] font-bold uppercase tracking-wide opacity-70">{s.label}</p>
                        <p className="font-bold text-sm mt-0.5">{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recent Orders */}
                  {selected.recent_orders.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">5 Pesanan Terakhir</p>
                      <div className="space-y-2">
                        {selected.recent_orders.map(o => {
                          const sc = STATUS_CFG[o.status] || STATUS_CFG.pending;
                          return (
                            <div key={o.id} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg text-sm">
                              <div>
                                <p className="font-semibold text-primary font-mono text-xs">#{o.order_number}</p>
                                <p className="text-xs text-on-surface-variant">{formatDate(o.created_at)}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-on-surface">{formatPrice(o.total)}</p>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${sc.cls}`}>{sc.label}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
