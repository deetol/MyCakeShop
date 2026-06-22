"use client";

import { useState, useRef, DragEvent, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

const PRODUCTS_LIST = [
  "Roti Sisir Klasik",
  "Lapis Legit Pandan",
  "Bolu Gulung Keju",
  "Hampers Hari Raya",
  "Roti Sobek Cokelat",
  "Kue Sus Susu",
  "Roti Tawar Gandum",
];

export default function CreateTestimonialPage() {
  const [name, setName] = useState("Budi Santoso");
  const [email, setEmail] = useState("budi.santoso@email.com");
  const [selectedProduct, setSelectedProduct] = useState("Roti Sisir Klasik");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [message, setMessage] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Silakan berikan rating bintang Anda terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      alert("Terima kasih! Testimoni Anda telah terkirim. Voucher diskon 10% telah dikirim ke email Anda.");
      setIsSubmitting(false);
      setName("Budi Santoso");
      setEmail("budi.santoso@email.com");
      setSelectedProduct("Roti Sisir Klasik");
      setRating(0);
      setHoveredRating(0);
      setMessage("");
      setUploadedFile(null);
      setConsent(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 1500);
  };

  const activeRating = hoveredRating || rating;

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      {/* Shared Header Navigation */}
      <Navbar />

      <main className="flex-grow w-full pt-12 pb-24 px-margin-mobile md:px-0">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <header className="text-center mb-16">
            <h1 className="font-display-lg text-display-lg md:text-display-lg text-primary mb-4 font-bold">
              Bagikan Cerita Manis Anda
            </h1>
            <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Terima kasih telah menjadi bagian dari perjalanan kami. Setiap cerita Anda memberikan semangat bagi kami untuk terus menyajikan kehangatan di setiap gigitan.
            </p>
          </header>

          {/* Testimonial Form Container */}
          <div className="bg-surface-container-low rounded-xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 border border-surface-container">
            {/* Left Side: Visual/Context */}
            <div className="lg:col-span-4 relative hidden lg:block overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600')",
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-on-background/70 to-transparent flex flex-col justify-end p-8">
                <div className="text-surface-bright italic font-body-md mb-2 text-sm">
                  &ldquo;Setiap kue punya cerita, dan kami ingin mendengar cerita Anda.&rdquo;
                </div>
                <div className="h-1 w-12 bg-primary-fixed-dim rounded-full"></div>
              </div>
            </div>

            {/* Right Side: The Form */}
            <div className="lg:col-span-8 p-8 md:p-12 bg-surface-container-lowest">
              <form onSubmit={handleSubmit} className="space-y-8" id="testimonialForm">
                {/* User Identity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                  <div className="space-y-2">
                    <label className="block font-label-sm text-on-surface-variant uppercase tracking-wider text-xs font-semibold" htmlFor="name">
                      Nama Lengkap
                    </label>
                    <input
                      className="w-full h-12 px-4 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary text-on-surface font-body-md"
                      id="name"
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-label-sm text-on-surface-variant uppercase tracking-wider text-xs font-semibold" htmlFor="email">
                      Email
                    </label>
                    <input
                      className="w-full h-12 px-4 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary text-on-surface font-body-md"
                      id="email"
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Product & Rating */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter items-end">
                  <div className="space-y-2">
                    <label className="block font-label-sm text-on-surface-variant uppercase tracking-wider text-xs font-semibold" htmlFor="product">
                      Produk yang Dibeli
                    </label>
                    <div className="relative">
                      <select
                        className="w-full h-12 pl-4 pr-10 rounded-lg bg-surface-container-low border-none appearance-none focus:ring-2 focus:ring-primary text-on-surface font-body-md cursor-pointer"
                        id="product"
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                      >
                        <option value="">Pilih produk...</option>
                        {PRODUCTS_LIST.map((prod) => (
                          <option key={prod} value={prod}>
                            {prod}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-outline">
                        expand_more
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-label-sm text-on-surface-variant uppercase tracking-wider text-xs font-semibold">
                      Rating Anda
                    </label>
                    <div className="flex gap-2 h-12 items-center" id="starContainer">
                      {[1, 2, 3, 4, 5].map((value) => {
                        const isStarred = value <= activeRating;
                        return (
                          <button
                            key={value}
                            type="button"
                            className={`material-symbols-outlined text-3xl cursor-pointer transition-all hover:scale-110 active:scale-95 ${
                              isStarred ? "text-surface-tint" : "text-outline-variant"
                            }`}
                            style={{ fontVariationSettings: isStarred ? "'FILL' 1" : "'FILL' 0" }}
                            onClick={() => setRating(value)}
                            onMouseEnter={() => setHoveredRating(value)}
                            onMouseLeave={() => setHoveredRating(0)}
                          >
                            star
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Testimonial Message */}
                <div className="space-y-2">
                  <label className="block font-label-sm text-on-surface-variant uppercase tracking-wider text-xs font-semibold" htmlFor="message">
                    Pesan Testimoni
                  </label>
                  <textarea
                    className="w-full p-4 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary text-on-surface font-body-md custom-scrollbar resize-none"
                    id="message"
                    placeholder="Ceritakan pengalaman Anda saat mencicipi kue kami..."
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  ></textarea>
                </div>

                {/* Photo Upload Section */}
                <div className="space-y-2">
                  <label className="block font-label-sm text-on-surface-variant uppercase tracking-wider text-xs font-semibold">
                    Unggah Foto (Opsional)
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                    className="border-2 border-dashed border-outline-variant hover:border-primary rounded-lg p-6 text-center cursor-pointer transition-colors bg-surface-container-low flex flex-col items-center justify-center min-h-[140px]"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                    />
                    {uploadedFile ? (
                      <div className="flex flex-col items-center">
                        <span className="material-symbols-outlined text-4xl text-tertiary">check_circle</span>
                        <p className="font-body-md text-tertiary font-bold mt-2 text-sm">{uploadedFile.name}</p>
                        <p className="text-[10px] uppercase tracking-widest text-outline mt-1">Berhasil diunggah</p>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="mt-3 text-xs text-error hover:underline cursor-pointer"
                        >
                          Hapus Foto
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-4xl text-outline mb-2">add_a_photo</span>
                        <p className="font-body-md text-on-surface-variant text-sm">Klik atau tarik foto ke sini</p>
                        <p className="text-[10px] uppercase tracking-widest text-outline mt-1">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Submit Section */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <input
                      className="rounded text-primary focus:ring-primary bg-surface-container border-none h-5 w-5 cursor-pointer"
                      id="consent"
                      required
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    <label className="font-body-md text-on-surface-variant text-sm cursor-pointer" htmlFor="consent">
                      Saya setuju testimoni ini ditampilkan di website.
                    </label>
                  </div>
                  <button
                    className="w-full sm:w-auto px-10 h-14 bg-primary text-on-primary font-headline-md rounded-full shadow-md hover:bg-primary-container hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="material-symbols-outlined animate-spin">refresh</span>
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <span>Kirim Testimoni</span>
                        <span className="material-symbols-outlined">send</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Shared Footer */}
      <Footer />

      {/* Slide-over Drawer */}
      <CartDrawer />
    </div>
  );
}
