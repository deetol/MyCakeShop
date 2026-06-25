"use client";

import React, { useState, useEffect } from "react";
import { api, ApiError, ValidationError } from "@/lib/api";

interface Category { id: number; name: string; }
interface Product {
  id: number; name: string; description: string;
  base_price: number; stock: number; unit: string; tag: string;
  main_image: string; is_active: boolean;
  category: { id: number; name: string } | null;
}

interface Props {
  product: Product | null;
  categories: Category[];
  token: string;
  onClose: () => void;
  onSaved: () => void;
}

const TAGS = ["Favorit", "Terlaris", "Baru", "Promo"];

export default function ProductFormModal({ product, categories, token, onClose, onSaved }: Props) {
  const isEdit = !!product;

  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [categoryId, setCategoryId] = useState<number | "">(product?.category?.id || "");
  const [basePrice, setBasePrice] = useState(product?.base_price?.toString() || "");
  const [stock, setStock] = useState(product?.stock?.toString() || "");
  const [unit, setUnit] = useState(product?.unit || "");
  const [tag, setTag] = useState(product?.tag || "");
  const [mainImage, setMainImage] = useState(product?.main_image || "");
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Prevent background scroll
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!categoryId) { setError("Pilih kategori terlebih dahulu"); return; }

    setIsSubmitting(true);
    try {
      const payload = {
        name, description, category_id: categoryId,
        base_price: parseFloat(basePrice),
        stock: parseInt(stock),
        unit, tag, main_image: mainImage, is_active: isActive,
      };

      if (isEdit) {
        await api.put(`/admin/products/${product.id}`, payload, token);
      } else {
        await api.post("/admin/products", payload, token);
      }
      onSaved();
    } catch (err) {
      if (err instanceof ValidationError) setError(err.getFirstError());
      else if (err instanceof ApiError) setError(err.message);
      else setError("Gagal menyimpan produk. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-surface rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-surface-container relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-surface-container sticky top-0 bg-surface z-10">
          <h2 className="text-lg font-bold text-primary">
            {isEdit ? "Edit Produk" : "Tambah Produk Baru"}
          </h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-primary p-2 rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-error-container text-on-error-container p-3 rounded-lg text-sm flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] mt-0.5">error</span>
              {error}
            </div>
          )}

          {/* Nama & Kategori */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                Nama Produk <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 border border-outline-variant bg-surface-container-low rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Contoh: Roti Manis Coklat Keju"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                Kategori <span className="text-error">*</span>
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(Number(e.target.value))}
                className="w-full px-4 py-3 border border-outline-variant bg-surface-container-low rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">Deskripsi</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-outline-variant bg-surface-container-low rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Deskripsi singkat produk..."
            />
          </div>

          {/* Harga, Stok, Satuan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                Harga (Rp) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                value={basePrice}
                onChange={e => setBasePrice(e.target.value)}
                className="w-full px-4 py-3 border border-outline-variant bg-surface-container-low rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="12000"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                Stok <span className="text-error">*</span>
              </label>
              <input
                type="number"
                value={stock}
                onChange={e => setStock(e.target.value)}
                className="w-full px-4 py-3 border border-outline-variant bg-surface-container-low rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="100"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">Satuan</label>
              <input
                type="text"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full px-4 py-3 border border-outline-variant bg-surface-container-low rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Pcs / Loaf / Kotak"
              />
            </div>
          </div>

          {/* Tag */}
          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">Tag</label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setTag("")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-colors border ${!tag ? "bg-primary text-on-primary border-primary" : "border-outline-variant text-on-surface-variant hover:bg-surface-container"}`}>
                Tidak Ada
              </button>
              {TAGS.map(t => (
                <button type="button" key={t} onClick={() => setTag(t)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-colors border ${tag === t ? "bg-primary text-on-primary border-primary" : "border-outline-variant text-on-surface-variant hover:bg-surface-container"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Gambar URL */}
          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">URL Gambar</label>
            <input
              type="text"
              value={mainImage}
              onChange={e => setMainImage(e.target.value)}
              className="w-full px-4 py-3 border border-outline-variant bg-surface-container-low rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://..."
            />
            {mainImage && (
              <div className="mt-2 w-24 h-24 rounded-lg overflow-hidden border border-outline-variant relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mainImage} alt="Preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
              </div>
            )}
          </div>

          {/* Status */}
          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-on-surface">Status Produk</p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {isActive ? "Produk aktif & tampil di toko" : "Produk tidak aktif / disembunyikan"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? "bg-primary" : "bg-outline-variant"}`}
              aria-pressed={isActive}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isActive ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2 border-t border-surface-container">
            <button type="button" onClick={onClose}
              className="px-6 py-2.5 border-2 border-outline-variant rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">
              Batal
            </button>
            <button type="submit" disabled={isSubmitting}
              className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50">
              {isSubmitting ? (
                <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Menyimpan...</>
              ) : (
                <><span className="material-symbols-outlined text-[18px]">check</span> {isEdit ? "Update Produk" : "Simpan Produk"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
