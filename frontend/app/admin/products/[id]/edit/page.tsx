"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError, ValidationError } from "@/lib/api";
import AdminLayout from "@/components/admin/AdminLayout";

interface Category { id: number; name: string; slug: string; }
interface Product {
  id: number; name: string; slug: string; description: string;
  base_price: number; stock: number; unit: string; tag: string;
  main_image: string; is_active: boolean;
  category: { id: number; name: string } | null;
}

const TAGS = ["", "Favorit", "Terlaris", "Baru", "Promo"];

export default function EditProductPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [basePrice, setBasePrice] = useState("");
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("");
  const [tag, setTag] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth guard
  useEffect(() => {
    if (!loading && !user) { router.push("/login"); return; }
    if (!loading && user?.role !== "admin") { router.push("/"); return; }
  }, [loading, user, router]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get<any>("/categories", token);
      const d = res.data;
      setCategories(Array.isArray(d) ? d : d?.categories || d?.data || []);
    } catch { setCategories([]); }
  }, [token]);

  // Fetch product data
  const fetchProduct = useCallback(async () => {
    if (!token || !productId) return;
    setIsLoading(true);
    try {
      const res = await api.get<any>(`/admin/products/${productId}`, token);
      const p: Product = res.data?.product || res.data;
      setProduct(p);
      // Populate form
      setName(p.name || "");
      setDescription(p.description || "");
      setCategoryId(p.category?.id || "");
      setBasePrice(p.base_price?.toString() || "");
      setStock(p.stock?.toString() || "");
      setUnit(p.unit || "");
      setTag(p.tag || "");
      setMainImage(p.main_image || "");
      setIsActive(p.is_active ?? true);
    } catch (e: any) {
      setError(e.message || "Gagal memuat data produk");
    } finally {
      setIsLoading(false);
    }
  }, [token, productId]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchCategories();
      fetchProduct();
    }
  }, [user, fetchCategories, fetchProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    if (!categoryId) { setError("Pilih kategori terlebih dahulu"); return; }

    setIsSubmitting(true);
    try {
      await api.put(`/admin/products/${productId}`, {
        name, description,
        category_id: categoryId,
        base_price: parseFloat(basePrice),
        stock: parseInt(stock),
        unit, tag,
        main_image: mainImage,
        is_active: isActive,
      }, token!);

      setSuccessMsg("Perubahan berhasil disimpan!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      if (err instanceof ValidationError) setError(err.getFirstError());
      else if (err instanceof ApiError) setError(err.message);
      else setError("Gagal menyimpan perubahan. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadImage = async (file: File) => {
    setIsUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.postFormData<any>("/admin/products/upload-image", formData, token!);
      setMainImage(res.data.url);
      setImagePreviewError(false);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Gagal upload gambar. Coba lagi.");
    } finally {
      setIsUploading(false);
    }
  };

  const formatPrice = (v: number) =>
    new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(v);

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
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/products"
          className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
          title="Kembali"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="font-headline-md text-headline-md text-primary">
            {isLoading ? "Memuat..." : `Edit Produk — ${product?.name || ""}`}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Update detail informasi produk untuk ditampilkan di katalog pelanggan.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
          <div className="lg:col-span-2 space-y-5">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-surface-container rounded-xl" />)}
          </div>
          <div className="space-y-5">
            {[1, 2].map(i => <div key={i} className="h-48 bg-surface-container rounded-xl" />)}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Error / Success banners */}
          {error && (
            <div className="mb-6 bg-error-container text-on-error-container p-4 rounded-xl text-sm flex items-start gap-3 border border-error/20">
              <span className="material-symbols-outlined text-[20px] mt-0.5 shrink-0">error</span>
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 bg-tertiary-container text-on-tertiary-container p-4 rounded-xl text-sm flex items-start gap-3 border border-tertiary/20">
              <span className="material-symbols-outlined text-[20px] mt-0.5 shrink-0">check_circle</span>
              {successMsg}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* ── Left Column ───────────────────────────────────────── */}
            <div className="flex-1 space-y-6">

              {/* Informasi Dasar */}
              <div className="bg-surface rounded-xl p-6 border border-outline-variant/20" style={{ boxShadow: "0 4px 12px rgba(136,81,32,0.05)" }}>
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-5">
                  Informasi Dasar
                </h3>
                <div className="space-y-5">

                  {/* Nama */}
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-2" htmlFor="productName">
                      Nama Produk <span className="text-error">*</span>
                    </label>
                    <div className="bg-surface-container-low border border-outline-variant/50 rounded-lg p-3 flex items-center focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                      <input
                        id="productName"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm text-on-surface"
                        placeholder="Nama produk"
                        required
                      />
                    </div>
                  </div>

                  {/* Deskripsi */}
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-2" htmlFor="productDesc">
                      Deskripsi Produk
                    </label>
                    <div className="bg-surface-container-low border border-outline-variant/50 rounded-lg p-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                      <textarea
                        id="productDesc"
                        rows={4}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm text-on-surface resize-none"
                        placeholder="Deskripsi singkat produk..."
                      />
                    </div>
                  </div>

                  {/* Kategori & Harga */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-2" htmlFor="category">
                        Kategori <span className="text-error">*</span>
                      </label>
                      <div className="relative">
                        <select
                          id="category"
                          value={categoryId}
                          onChange={e => setCategoryId(Number(e.target.value))}
                          className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg p-3 text-sm text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                          required
                        >
                          <option value="">-- Pilih Kategori --</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-2" htmlFor="price">
                        Harga (Rp) <span className="text-error">*</span>
                      </label>
                      <div className="bg-surface-container-low border border-outline-variant/50 rounded-lg p-3 flex items-center gap-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                        <span className="text-on-surface-variant text-sm font-semibold shrink-0">Rp</span>
                        <input
                          id="price"
                          type="number"
                          value={basePrice}
                          onChange={e => setBasePrice(e.target.value)}
                          className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm text-on-surface"
                          placeholder="45000"
                          required
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stok & Satuan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-2" htmlFor="stock">
                        Stok <span className="text-error">*</span>
                      </label>
                      <div className="bg-surface-container-low border border-outline-variant/50 rounded-lg p-3 flex items-center focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                        <input
                          id="stock"
                          type="number"
                          value={stock}
                          onChange={e => setStock(e.target.value)}
                          className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm text-on-surface"
                          placeholder="100"
                          required
                          min="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-2" htmlFor="unit">
                        Satuan
                      </label>
                      <div className="bg-surface-container-low border border-outline-variant/50 rounded-lg p-3 flex items-center focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                        <input
                          id="unit"
                          type="text"
                          value={unit}
                          onChange={e => setUnit(e.target.value)}
                          className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm text-on-surface"
                          placeholder="Pcs / Loaf / Kotak"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tag */}
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-2">
                      Tag Produk
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {TAGS.map(t => (
                        <button
                          key={t || "none"}
                          type="button"
                          onClick={() => setTag(t)}
                          className={`px-4 py-2 rounded-full text-xs font-bold transition-colors border ${
                            tag === t
                              ? "bg-primary text-on-primary border-primary"
                              : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
                          }`}
                        >
                          {t || "Tidak Ada"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right Column ──────────────────────────────────────── */}
            <div className="w-full lg:w-80 space-y-6">

              {/* Media & Status */}
              <div className="bg-surface rounded-xl p-6 border border-outline-variant/20" style={{ boxShadow: "0 4px 12px rgba(136,81,32,0.05)" }}>
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-5">
                  Media &amp; Status
                </h3>

                {/* Image Preview */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-on-surface-variant mb-3">
                    Foto Produk
                  </label>

                  {/* Drop zone / preview */}
                  <div
                    className="relative rounded-lg overflow-hidden border-2 border-dashed border-outline-variant aspect-square mb-3 bg-surface-container group cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file) handleUploadImage(file);
                    }}
                  >
                    {isUploading ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-primary text-[36px]">progress_activity</span>
                        <p className="text-xs text-on-surface-variant">Mengupload...</p>
                      </div>
                    ) : mainImage && !imagePreviewError ? (
                      <>
                        <Image
                          src={mainImage}
                          alt={name}
                          fill
                          className="object-cover"
                          unoptimized
                          onError={() => setImagePreviewError(true)}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-5xl">cloud_upload</span>
                        <p className="text-xs font-semibold">Klik atau seret foto</p>
                        <p className="text-xs">JPG, PNG, WebP · 5MB</p>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadImage(file);
                    }}
                  />

                  {/* URL Input fallback */}
                  <div className="bg-surface-container-low border border-outline-variant/50 rounded-lg p-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all mb-3">
                    <input
                      type="text"
                      value={mainImage}
                      onChange={e => { setMainImage(e.target.value); setImagePreviewError(false); }}
                      className="w-full bg-transparent border-none p-0 focus:ring-0 text-xs text-on-surface"
                      placeholder="Atau tempel URL gambar..."
                    />
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="border-t border-outline-variant/30 pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-on-surface-variant">Status Produk</p>
                      <p className="text-xs text-outline mt-0.5">
                        {isActive ? "Tampil di toko" : "Disembunyikan"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsActive(!isActive)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                        isActive ? "bg-tertiary" : "bg-outline-variant"
                      }`}
                      aria-pressed={isActive}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                          isActive ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Info Card (read-only) */}
              {product && (
                <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 space-y-2">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Info Produk</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant">Slug</span>
                    <span className="font-mono text-on-surface">{product.slug}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant">ID Produk</span>
                    <span className="font-mono text-on-surface">#{product.id}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant">Harga Saat Ini</span>
                    <span className="font-bold text-primary">Rp {formatPrice(product.base_price)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant">Stok Saat Ini</span>
                    <span className={`font-bold ${product.stock === 0 ? "text-error" : "text-on-surface"}`}>
                      {product.stock} unit
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 pt-6 border-t border-outline-variant/30 flex flex-col-reverse sm:flex-row justify-end gap-4">
            <Link
              href="/admin/products"
              className="px-6 h-12 rounded-lg border border-outline text-on-surface-variant text-sm font-bold hover:bg-surface-container-low transition-colors flex items-center justify-center"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 h-12 rounded-lg bg-primary text-on-primary text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? (
                <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Menyimpan...</>
              ) : (
                <><span className="material-symbols-outlined text-[18px]">save</span> Simpan Perubahan</>
              )}
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
