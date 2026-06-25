"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";

interface Category { id: number; name: string; }

interface ProductRow {
  id: number;
  name: string;
  category: { id: number; name: string } | null;
  base_price: number;
  stock: number;
  main_image: string;
  is_active: boolean;
  // local dirty tracking
  _price: number;
  _stock: number;
  _dirty: boolean;
}

const LOW_STOCK_THRESHOLD = 10;

export default function StockPricePage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [rows, setRows] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [filterCategory, setFilterCategory] = useState<number | null>(null);
  const [filterLowStock, setFilterLowStock] = useState(false);
  const successTimer = useRef<ReturnType<typeof setTimeout>>();

  // Auth guard
  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (!loading && user?.role !== "admin") { router.push("/"); return; }
  }, [loading, user, router]);

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get<any>("/categories", token);
      const d = res.data;
      setCategories(Array.isArray(d) ? d : d?.categories || d?.data || []);
    } catch { setCategories([]); }
  }, [token]);

  const fetchProducts = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      let url = "/admin/products?per_page=50";
      if (filterCategory) url += `&category_id=${filterCategory}`;
      const res = await api.get<any>(url, token);
      const d = res.data;
      const list = Array.isArray(d) ? d : d?.products || d?.data || [];
      setRows(list.map((p: any) => ({
        ...p,
        _price: p.base_price,
        _stock: p.stock,
        _dirty: false,
      })));
    } catch { setRows([]); }
    finally { setIsLoading(false); }
  }, [token, filterCategory]);

  useEffect(() => {
    if (user?.role === "admin") { fetchCategories(); }
  }, [user, fetchCategories]);

  useEffect(() => {
    if (user?.role === "admin") { fetchProducts(); }
  }, [user, fetchProducts]);

  // Mark row dirty on change
  const handlePriceChange = (id: number, val: string) => {
    const num = parseFloat(val) || 0;
    setRows(prev => prev.map(r => r.id === id ? { ...r, _price: num, _dirty: true } : r));
  };

  const handleStockChange = (id: number, val: number) => {
    const clamped = Math.max(0, val);
    setRows(prev => prev.map(r => r.id === id ? { ...r, _stock: clamped, _dirty: true } : r));
  };

  const handleStockStep = (id: number, delta: number) => {
    setRows(prev => prev.map(r =>
      r.id === id ? { ...r, _stock: Math.max(0, r._stock + delta), _dirty: true } : r
    ));
  };

  // Save all dirty rows
  const handleSaveAll = async () => {
    const dirty = rows.filter(r => r._dirty);
    if (dirty.length === 0) { setSuccessMsg("Tidak ada perubahan."); return; }

    setIsSaving(true);
    setErrorMsg("");
    try {
      await api.post("/admin/products/bulk-stock-price", {
        products: dirty.map(r => ({
          id: r.id,
          stock: r._stock,
          base_price: r._price,
        })),
      }, token!);

      // Mark all as clean
      setRows(prev => prev.map(r => ({ ...r, _dirty: false, stock: r._stock, base_price: r._price })));
      setSuccessMsg(`${dirty.length} produk berhasil diperbarui!`);
      clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e: any) {
      setErrorMsg(e.message || "Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const dirtyCount = rows.filter(r => r._dirty).length;

  const formatPrice = (v: number) =>
    new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(v);

  const displayRows = rows.filter(r => {
    if (filterLowStock) return r._stock <= LOW_STOCK_THRESHOLD;
    return true;
  });

  const getStockStatus = (stock: number) => {
    if (stock === 0) return "out";
    if (stock <= LOW_STOCK_THRESHOLD) return "low";
    return "ok";
  };

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-surface-container-low flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-outline-variant pb-6 mb-6 gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary mb-1">
            Manajemen Stok &amp; Harga
          </h2>
          <p className="text-sm text-on-surface-variant">
            Perbarui ketersediaan dan harga produk secara cepat.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={isSaving || dirtyCount === 0}
          className="flex items-center gap-2 bg-tertiary-container hover:bg-tertiary text-on-tertiary-container hover:text-on-tertiary px-6 py-3 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-[18px]">save</span>
          )}
          Simpan Perubahan
          {dirtyCount > 0 && (
            <span className="bg-primary text-on-primary rounded-full px-2 py-0.5 text-[10px] font-bold ml-1">
              {dirtyCount}
            </span>
          )}
        </button>
      </div>

      {/* Success / Error banners */}
      {successMsg && (
        <div className="mb-4 bg-tertiary-container text-on-tertiary-container p-3 rounded-xl text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 bg-error-container text-on-error-container p-3 rounded-xl text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {errorMsg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => { setFilterCategory(null); setFilterLowStock(false); }}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
            !filterCategory && !filterLowStock
              ? "bg-primary text-on-primary shadow-sm"
              : "bg-surface-container-low border border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          Semua Produk
        </button>

        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setFilterCategory(cat.id); setFilterLowStock(false); }}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
              filterCategory === cat.id
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container-low border border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {cat.name}
          </button>
        ))}

        <button
          onClick={() => { setFilterLowStock(!filterLowStock); setFilterCategory(null); }}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-1 ${
            filterLowStock
              ? "bg-error text-on-error shadow-sm"
              : "bg-surface-container-low border border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">warning</span>
          Stok Menipis
        </button>
      </div>

      {/* Data Grid */}
      <div className="flex flex-col gap-3">
        {/* Header Row */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-on-surface-variant text-xs font-bold uppercase tracking-wider">
          <div className="col-span-5">Produk</div>
          <div className="col-span-3 text-right">Harga (Rp)</div>
          <div className="col-span-3 text-center">Stok (Pcs)</div>
          <div className="col-span-1 text-center">Status</div>
        </div>

        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-surface-container-high px-6 py-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-surface-container" />
                <div className="flex-grow space-y-2">
                  <div className="h-4 bg-surface-container rounded w-1/3" />
                  <div className="h-3 bg-surface-container rounded w-1/5" />
                </div>
              </div>
            </div>
          ))
        ) : displayRows.length === 0 ? (
          <div className="bg-white rounded-xl border border-surface-container-high p-16 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-3">inventory_2</span>
            <p className="text-sm text-on-surface-variant">
              {filterLowStock ? "Tidak ada produk dengan stok menipis." : "Tidak ada produk ditemukan."}
            </p>
          </div>
        ) : (
          displayRows.map(row => {
            const status = getStockStatus(row._stock);
            const isOutOfStock = status === "out";
            const isLowStock = status === "low";

            return (
              <div
                key={row.id}
                className={`grid grid-cols-12 gap-4 px-6 py-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow items-center ${
                  isOutOfStock
                    ? "bg-surface-container-low border-outline-variant opacity-75"
                    : isLowStock
                    ? "bg-white border-error-container"
                    : "bg-white border-surface-container-high"
                } ${row._dirty ? "ring-2 ring-primary/30" : ""}`}
              >
                {/* Product Info */}
                <div className="col-span-12 md:col-span-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-container-low flex-shrink-0 relative">
                    {row.main_image ? (
                      <Image
                        src={row.main_image}
                        alt={row.name}
                        fill
                        className={`object-cover ${isOutOfStock ? "grayscale" : ""}`}
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface-variant text-on-surface-variant">
                        <span className="material-symbols-outlined">image_not_supported</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm text-on-surface leading-tight mb-1 ${isOutOfStock ? "line-through decoration-on-surface-variant" : ""}`}>
                      {row.name}
                    </h3>
                    <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md">
                      {row.category?.name || "—"}
                    </span>
                    {row._dirty && (
                      <span className="ml-2 text-[10px] text-primary font-bold">● Diubah</span>
                    )}
                  </div>
                </div>

                {/* Price Input */}
                <div className="col-span-6 md:col-span-3 flex justify-end">
                  <div className="relative w-36">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none">Rp</span>
                    <input
                      type="number"
                      value={row._price}
                      onChange={e => handlePriceChange(row.id, e.target.value)}
                      disabled={isOutOfStock}
                      aria-label={`Harga ${row.name}`}
                      className="w-full bg-surface-bright border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-2 pl-10 pr-3 text-right text-sm text-on-surface font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      min="0"
                    />
                  </div>
                </div>

                {/* Stock Stepper */}
                <div className="col-span-6 md:col-span-3 flex justify-center">
                  <div className={`flex items-center gap-1 rounded-lg px-2 py-1 border transition-all focus-within:ring-1 ${
                    isOutOfStock
                      ? "bg-error-container/50 border-error/50"
                      : isLowStock
                      ? "bg-error-container border-error focus-within:ring-error"
                      : "bg-surface-bright border-outline-variant focus-within:border-primary focus-within:ring-primary"
                  }`}>
                    <button
                      type="button"
                      onClick={() => handleStockStep(row.id, -1)}
                      disabled={isOutOfStock || row._stock === 0}
                      aria-label={`Kurangi stok ${row.name}`}
                      className={`p-1 transition-colors rounded disabled:opacity-40 disabled:cursor-not-allowed ${
                        isLowStock ? "text-error hover:text-on-error-container" : "text-on-surface-variant hover:text-primary"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">remove</span>
                    </button>
                    <input
                      type="number"
                      value={row._stock}
                      onChange={e => handleStockChange(row.id, parseInt(e.target.value) || 0)}
                      disabled={isOutOfStock}
                      aria-label={`Stok ${row.name}`}
                      className={`w-14 bg-transparent border-none text-center text-sm font-bold p-0 focus:ring-0 disabled:cursor-not-allowed ${
                        isLowStock || isOutOfStock ? "text-on-error-container" : "text-on-surface"
                      }`}
                      min="0"
                    />
                    <button
                      type="button"
                      onClick={() => handleStockStep(row.id, 1)}
                      disabled={isOutOfStock}
                      aria-label={`Tambah stok ${row.name}`}
                      className={`p-1 transition-colors rounded disabled:opacity-40 disabled:cursor-not-allowed ${
                        isLowStock ? "text-error hover:text-on-error-container" : "text-on-surface-variant hover:text-primary"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="col-span-12 md:col-span-1 flex md:flex-col justify-center items-center gap-1">
                  {isOutOfStock && (
                    <span className="bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border border-outline-variant">
                      Habis
                    </span>
                  )}
                  {isLowStock && (
                    <span className="bg-error text-on-error px-2 py-0.5 rounded-full text-[10px] font-bold uppercase animate-pulse">
                      Menipis
                    </span>
                  )}
                  {!isOutOfStock && !isLowStock && (
                    <span className="material-symbols-outlined text-tertiary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }} title="Stok Aman">
                      check_circle
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom summary */}
      {!isLoading && rows.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-on-surface-variant border-t border-outline-variant pt-4">
          <div className="flex items-center gap-4">
            <span>{rows.length} produk total</span>
            <span className="text-error font-semibold">
              {rows.filter(r => r._stock === 0).length} habis
            </span>
            <span className="text-amber-600 font-semibold">
              {rows.filter(r => r._stock > 0 && r._stock <= LOW_STOCK_THRESHOLD).length} menipis
            </span>
          </div>
          {dirtyCount > 0 && (
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              Simpan {dirtyCount} perubahan
            </button>
          )}
        </div>
      )}

      <div className="h-12" />
    </AdminLayout>
  );
}
