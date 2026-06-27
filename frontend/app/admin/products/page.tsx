"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";
import ProductFormModal from "@/components/admin/ProductFormModal";

interface Category { id: number; name: string; slug: string; }
interface Product {
  id: number; name: string; slug: string; description: string;
  base_price: number; stock: number; unit: string; tag: string;
  main_image: string; is_active: boolean;
  category: { id: number; name: string } | null;
}
interface Pagination { total: number; per_page: number; current_page: number; last_page: number; }

export default function AdminProductsPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, per_page: 12, current_page: 1, last_page: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

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
      let url = `/admin/products?page=${currentPage}&per_page=12`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (selectedCategory) url += `&category_id=${selectedCategory}`;
      const res = await api.get<any>(url, token);
      const d = res.data;
      setProducts(d?.products || []);
      if (d?.pagination) setPagination(d.pagination);
    } catch { setProducts([]); }
    finally { setIsLoading(false); }
  }, [token, currentPage, search, selectedCategory]);

  useEffect(() => { if (user?.role === "admin") { fetchCategories(); } }, [user, fetchCategories]);
  useEffect(() => { if (user?.role === "admin") { fetchProducts(); } }, [user, fetchProducts]);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/products/${id}`, token!);
      setDeleteConfirm(null);
      fetchProducts();
    } catch (e: any) { alert(e.message || "Gagal menghapus produk"); }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await api.put(`/admin/products/${id}/toggle-status`, {}, token!);
      fetchProducts();
    } catch (e: any) { alert(e.message || "Gagal mengubah status"); }
  };

  const handleSaved = () => { setShowModal(false); setEditProduct(null); fetchProducts(); };

  const formatPrice = (v: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

  const searchTimeout = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchProducts(), 400);
  };

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-low">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Manajemen Produk</h2>
          <p className="text-sm text-on-surface-variant mt-1">Kelola daftar kue, roti, dan ketersediaan stok.</p>
        </div>
        <button
          onClick={() => { setEditProduct(null); setShowModal(true); }}
          className="bg-primary text-on-primary text-xs font-bold py-3 px-6 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Tambah Produk Baru
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest rounded-xl p-4 mb-6 border border-outline-variant/30 flex flex-col lg:flex-row justify-between items-center gap-4">
        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setSelectedCategory(null); setCurrentPage(1); }}
            className={`text-xs font-bold py-2 px-4 rounded-full transition-colors ${!selectedCategory ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface border border-outline-variant hover:bg-surface-container"}`}
          >
            Semua
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setCurrentPage(1); }}
              className={`text-xs font-bold py-2 px-4 rounded-full transition-colors ${selectedCategory === cat.id ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface border border-outline-variant hover:bg-surface-container"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">filter_list</span>
          <input
            className="w-full bg-surface border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
            placeholder="Filter nama produk..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="space-y-3">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold text-on-surface-variant border-b border-outline-variant/50 uppercase tracking-wider">
          <div className="col-span-1">Gambar</div>
          <div className="col-span-4">Nama Produk</div>
          <div className="col-span-2">Kategori</div>
          <div className="col-span-2">Harga</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Aksi</div>
        </div>

        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/20 animate-pulse">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-lg bg-surface-container" />
                <div className="flex-grow space-y-2">
                  <div className="h-4 bg-surface-container rounded w-1/3" />
                  <div className="h-3 bg-surface-container rounded w-1/2" />
                </div>
              </div>
            </div>
          ))
        ) : products.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl p-16 text-center border border-outline-variant/20">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant block mb-3">inventory_2</span>
            <p className="text-on-surface-variant text-sm">
              {search || selectedCategory ? "Tidak ada produk yang cocok dengan filter." : "Belum ada produk. Klik 'Tambah Produk Baru' untuk memulai."}
            </p>
          </div>
        ) : (
          products.map(product => (
            <div
              key={product.id}
              className={`bg-surface-container-lowest rounded-xl p-4 md:px-6 md:py-4 flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 border border-outline-variant/20 hover:border-outline-variant transition-colors ${!product.is_active ? "opacity-70" : ""}`}
            >
              {/* Image */}
              <div className="col-span-1">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container relative flex-shrink-0">
                  {product.main_image ? (
                    <Image src={product.main_image} alt={product.name} fill className={`object-cover ${!product.is_active ? "grayscale" : ""}`} unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant text-2xl">bakery_dining</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Name */}
              <div className="col-span-4">
                <h3 className="font-bold text-on-surface">{product.name}</h3>
                <p className="text-sm text-on-surface-variant mt-1 line-clamp-1">{product.description}</p>
                <p className="text-xs text-on-surface-variant mt-1">Stok: <span className="font-semibold">{product.stock}</span></p>
              </div>

              {/* Category */}
              <div className="col-span-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface-container-high text-on-surface-variant border border-outline-variant/50">
                  {product.category?.name || "-"}
                </span>
              </div>

              {/* Price */}
              <div className="col-span-2 font-bold text-on-surface">{formatPrice(product.base_price)}</div>

              {/* Status */}
              <div className="col-span-2">
                <button
                  onClick={() => handleToggleStatus(product.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                    product.is_active
                      ? "bg-tertiary-container text-on-tertiary-container hover:opacity-80"
                      : "bg-surface-container text-on-surface-variant border border-outline-variant hover:bg-surface-container-high"
                  }`}
                  title={product.is_active ? "Klik untuk nonaktifkan" : "Klik untuk aktifkan"}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${product.is_active ? "bg-on-tertiary-container" : "bg-on-surface-variant"}`} />
                  {product.is_active ? "Tersedia" : "Tidak Aktif"}
                </button>
              </div>

              {/* Actions */}
              <div className="col-span-1 flex justify-end gap-1">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                  title="Edit"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </Link>
                <button
                  onClick={() => setDeleteConfirm(product.id)}
                  className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-colors"
                  title="Hapus"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="mt-8 flex justify-between items-center text-xs text-on-surface-variant">
          <span>
            Menampilkan {((pagination.current_page - 1) * pagination.per_page) + 1}–{Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total} produk
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={pagination.current_page === 1}
              className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-container transition-colors disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(pagination.last_page, 5) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded border flex items-center justify-center text-xs font-bold transition-colors ${
                    pagination.current_page === page
                      ? "bg-primary-container text-on-primary-container border-primary"
                      : "border-outline-variant hover:bg-surface-container"
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(pagination.last_page, p + 1))}
              disabled={pagination.current_page === pagination.last_page}
              className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center hover:bg-surface-container transition-colors disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showModal && (
        <ProductFormModal
          product={editProduct}
          categories={categories}
          token={token!}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
          onSaved={handleSaved}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="bg-surface rounded-2xl p-6 max-w-sm w-full shadow-xl border border-surface-container relative z-10">
            <div className="text-center space-y-3 mb-6">
              <span className="material-symbols-outlined text-error text-5xl block">delete_forever</span>
              <h3 className="font-bold text-on-surface text-lg">Hapus Produk?</h3>
              <p className="text-sm text-on-surface-variant">Produk ini akan dihapus dan tidak dapat dipulihkan.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border-2 border-outline-variant rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">
                Batal
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-error text-on-error rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
