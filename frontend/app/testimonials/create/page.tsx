"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError, ValidationError } from "@/lib/api";

interface ReviewableProduct {
  product_id: number;
  product_name: string;
  main_image: string | null;
  is_reviewed: boolean;
}

interface ReviewableOrder {
  order_id: number;
  order_number: string;
  created_at: string;
  all_reviewed: boolean;
  products: ReviewableProduct[];
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  const labels = ["", "Sangat Buruk", "Buruk", "Cukup", "Baik", "Sangat Baik"];

  return (
    <div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            className={`material-symbols-outlined text-4xl cursor-pointer transition-all hover:scale-110 active:scale-95 ${
              s <= active ? "text-primary" : "text-outline-variant"
            }`}
            style={{ fontVariationSettings: s <= active ? "'FILL' 1" : "'FILL' 0" }}
            aria-label={`Beri rating ${s}`}
          >
            star
          </button>
        ))}
      </div>
      {active > 0 && (
        <p className="mt-1 text-sm font-medium text-primary">{labels[active]}</p>
      )}
    </div>
  );
}

export default function CreateTestimonialPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<ReviewableOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<ReviewableOrder | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ReviewableProduct | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoadingOrders(true);
    try {
      const res = await api.get<ReviewableOrder[]>("/reviews/reviewable-orders", token);
      setOrders(res.data);
    } catch {
      // silent — tampilkan empty state
    } finally {
      setLoadingOrders(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?redirect=/testimonials/create");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user && token) fetchOrders();
  }, [user, token, fetchOrders]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !selectedProduct) return;
    if (rating === 0) {
      setErrorMsg("Silakan pilih rating bintang terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      await api.post(
        "/reviews",
        {
          order_id: selectedOrder.order_id,
          product_id: selectedProduct.product_id,
          rating,
          comment,
        },
        token ?? undefined
      );
      setSuccess(true);
      // refresh daftar order setelah submit
      await fetchOrders();
      // reset form
      setRating(0);
      setComment("");
      setSelectedProduct(null);
    } catch (err) {
      if (err instanceof ValidationError) {
        setErrorMsg(err.getFirstError());
      } else if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="bg-background min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">refresh</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow w-full py-12 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/testimonials"
              className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors mb-4"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Kembali ke Ulasan
            </Link>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">Tulis Ulasan</h1>
            <p className="text-on-surface-variant mt-1">
              Bagikan pengalamanmu untuk membantu pelanggan lain.
            </p>
          </div>

          {/* Success state */}
          {success && (
            <div className="bg-tertiary-container text-on-tertiary-container rounded-xl p-5 mb-6 flex items-start gap-3">
              <span className="material-symbols-outlined text-2xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <div>
                <p className="font-semibold">Ulasan berhasil dikirim!</p>
                <p className="text-sm mt-0.5">Terima kasih telah berbagi pengalamanmu. Ulasan kamu akan segera tampil.</p>
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => setSuccess(false)}
                    className="text-sm font-semibold underline"
                  >
                    Tulis ulasan lain
                  </button>
                  <Link href="/testimonials" className="text-sm font-semibold underline">
                    Lihat semua ulasan
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Loading orders */}
          {loadingOrders && (
            <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-8 text-center">
              <span className="material-symbols-outlined animate-spin text-3xl text-primary block mb-2">refresh</span>
              <p className="text-on-surface-variant text-sm">Memuat daftar pesanan...</p>
            </div>
          )}

          {/* No reviewable orders */}
          {!loadingOrders && orders.length === 0 && (
            <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-10 text-center">
              <span className="material-symbols-outlined text-5xl text-outline block mb-3">shopping_bag</span>
              <p className="font-headline-sm text-on-surface font-bold mb-1">Belum ada pesanan selesai</p>
              <p className="text-on-surface-variant text-sm max-w-xs mx-auto mb-6">
                Kamu hanya bisa memberikan ulasan untuk produk yang sudah kamu pesan dan diterima.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-[18px]">storefront</span>
                Belanja Sekarang
              </Link>
            </div>
          )}

          {/* Form */}
          {!loadingOrders && orders.length > 0 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Pilih Order */}
              <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-6">
                <h2 className="font-title-md text-on-surface font-semibold mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center font-bold">1</span>
                  Pilih Pesanan
                </h2>
                <div className="space-y-2">
                  {orders.map((order) => (
                    <button
                      key={order.order_id}
                      type="button"
                      onClick={() => {
                        setSelectedOrder(order);
                        setSelectedProduct(null);
                        setSuccess(false);
                        setErrorMsg("");
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                        selectedOrder?.order_id === order.order_id
                          ? "border-primary bg-primary-container/20"
                          : "border-surface-container hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-on-surface text-sm">{order.order_number}</p>
                          <p className="text-xs text-on-surface-variant mt-0.5">{order.created_at}</p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            selectedOrder?.order_id === order.order_id
                              ? "bg-primary text-on-primary"
                              : "bg-surface-container text-on-surface-variant"
                          }`}
                        >
                          {order.products.filter((p) => !p.is_reviewed).length} produk belum diulas
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Pilih Produk */}
              {selectedOrder && (
                <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-6">
                  <h2 className="font-title-md text-on-surface font-semibold mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center font-bold">2</span>
                    Pilih Produk
                  </h2>
                  <div className="space-y-2">
                    {selectedOrder.products.map((product) => (
                      <button
                        key={product.product_id}
                        type="button"
                        disabled={product.is_reviewed}
                        onClick={() => {
                          if (!product.is_reviewed) {
                            setSelectedProduct(product);
                            setSuccess(false);
                            setErrorMsg("");
                          }
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center gap-3 ${
                          product.is_reviewed
                            ? "border-surface-container opacity-50 cursor-not-allowed"
                            : selectedProduct?.product_id === product.product_id
                            ? "border-primary bg-primary-container/20"
                            : "border-surface-container hover:border-primary/50"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container shrink-0">
                          {product.main_image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.main_image}
                              alt={product.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-outline text-lg">cake</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-on-surface text-sm truncate">{product.product_name}</p>
                        </div>
                        {product.is_reviewed && (
                          <span className="flex items-center gap-1 text-xs text-tertiary shrink-0">
                            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            Sudah diulas
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Rating & Komentar */}
              {selectedProduct && (
                <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-6 space-y-5">
                  <h2 className="font-title-md text-on-surface font-semibold flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-xs flex items-center justify-center font-bold">3</span>
                    Berikan Penilaianmu
                  </h2>

                  <div className="bg-surface-container rounded-lg px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container-low shrink-0">
                      {selectedProduct.main_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selectedProduct.main_image}
                          alt={selectedProduct.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-outline">cake</span>
                        </div>
                      )}
                    </div>
                    <p className="font-semibold text-on-surface text-sm">{selectedProduct.product_name}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                      Rating
                    </label>
                    <StarPicker value={rating} onChange={setRating} />
                  </div>

                  <div>
                    <label
                      htmlFor="comment"
                      className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2"
                    >
                      Ulasan kamu
                    </label>
                    <textarea
                      id="comment"
                      required
                      minLength={10}
                      maxLength={1000}
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Ceritakan pengalaman kamu menikmati produk ini..."
                      className="w-full p-4 rounded-lg bg-surface-container-low border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary text-on-surface text-sm resize-none"
                    />
                    <p className="text-right text-xs text-on-surface-variant mt-1">{comment.length}/1000</p>
                  </div>

                  {errorMsg && (
                    <div className="flex items-center gap-2 text-error text-sm bg-error-container/20 rounded-lg px-4 py-3">
                      <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || rating === 0}
                    className="w-full h-12 bg-primary text-on-primary rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[20px]">send</span>
                        Kirim Ulasan
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
