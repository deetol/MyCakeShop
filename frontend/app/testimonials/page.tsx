import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export const metadata: Metadata = {
  title: "Testimonials & Customer Gallery | MyCakeShop",
  description: "Kesenangan yang dibagikan terasa dua kali lebih manis. Simak cerita hangat dari sahabat MyCakeShop tentang rasa klasik yang membangkitkan kenangan.",
};

const TESTIMONIALS = [
  {
    id: 1,
    rating: 5,
    text: "Roti sisir pandannya juara banget! Teksturnya lembut dan wangi pandan aslinya bener-bener berasa. Inget banget jajanan waktu kecil.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5TD6mHL3TvMkiKckxDRX-NIsD2p9p_wP4nTtfz6juSikIMWhnjUhB-0uENPisv5MEgw1KTSIm7D9obA6dEyAKGMbrRVygc0beK7uDrvjgPTdwvlFT-jbtuJ0SVGcathIl09x3LjOUFtqlcXEzJTbKb1wPEDI7APy58NJ-VKz--lSvJvPEz-rdIafBFn7sIgTAa1Hta0eDXJPBrO_r8W_AOP045ffgEg8S81jqe5feJbwUYWrYa7aAaFLYRZB6tKGYRoGv55YoaYBL",
    name: "Siti Rahayu",
    role: "Pecinta Roti",
  },
  {
    id: 2,
    rating: 5,
    text: "Beli hampers kue basah buat acara lamaran kemarin, semuanya suka! Penampilannya cantik dan rasanya otentik.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC77lSilF37K3civ1s4XATcYCRacfyrB0iuFY1i0C9ibFzTqsKdjGCFZUvS3V6UVJ7aWrVitoJD019pdyScvvu56pOMZ_XFRENTHxOtLO0AfWX5_sCWuTB0Egw_IltepI9jRy0a6SpKZM__d_cPzvEnhG2U3ck3lGjI5fGMRTK7zN8Mutprhw8tybNuibTonAH8mxA1WpOoH2By_xEBfzUw_V5oZRsyzK3R8aMFnWsD76V-JPTxpmFVpnNy5M5-Cu74staI-Mp8D5tj",
    name: "Budi Santoso",
    role: "Pelanggan Setia",
  },
  {
    id: 3,
    rating: 5,
    text: "Cokelat meises-nya melimpah banget! Anak-anak paling suka roti sobek cokelatnya. Tekstur rotinya bener-bener premium.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdg0qK7l1BiE7VVfxD88EIgVyKIinDr5oS20odG0ZsKn2iCOf26_2MarJ-pL9LkMGmnN4hugN1pBNQgkT1y9hdhbrmSTyeE-1ulseE6Y6HCOKV-cq5fmzm9xHKNGQMJAWqzed7wRAaSFN-KYGub0mHfP-lNm9JMEcRawTpWpupiN2fPzSs_sXLq_ALXC3q2Fz3CnUROSNycmd3xY-cmqvxnBSIvdMeoAL7_sPiR-7MowfT352vHkeK59rT133vRrA70PSkk5A_LEEq",
    name: "Linda Wijaya",
    role: "Ibu Rumah Tangga",
  },
  {
    id: 4,
    rating: 5,
    text: "Lapis legitnya juara! Layer-nya rapi dan bumbunya pas banget, nggak bikin eneg. Cocok buat temen ngeteh sore.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC77lSilF37K3civ1s4XATcYCRacfyrB0iuFY1i0C9ibFzTqsKdjGCFZUvS3V6UVJ7aWrVitoJD019pdyScvvu56pOMZ_XFRENTHxOtLO0AfWX5_sCWuTB0Egw_IltepI9jRy0a6SpKZM__d_cPzvEnhG2U3ck3lGjI5fGMRTK7zN8Mutprhw8tybNuibTonAH8mxA1WpOoH2By_xEBfzUw_V5oZRsyzK3R8aMFnWsD76V-JPTxpmFVpnNy5M5-Cu74staI-Mp8D5tj",
    name: "Andi Wijaya",
    role: "Penikmat Kuliner",
  },
  {
    id: 5,
    rating: 5,
    text: "Kue sus-nya lumer di mulut. Isian vla-nya nggak terlalu manis, pas banget. Selalu jadi rebutan kalau dibawa ke kantor.",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5TD6mHL3TvMkiKckxDRX-NIsD2p9p_wP4nTtfz6juSikIMWhnjUhB-0uENPisv5MEgw1KTSIm7D9obA6dEyAKGMbrRVygc0beK7uDrvjgPTdwvlFT-jbtuJ0SVGcathIl09x3LjOUFtqlcXEzJTbKb1wPEDI7APy58NJ-VKz--lSvJvPEz-rdIafBFn7sIgTAa1Hta0eDXJPBrO_r8W_AOP045ffgEg8S81jqe5feJbwUYWrYa7aAaFLYRZB6tKGYRoGv55YoaYBL",
    name: "Dewi Lestari",
    role: "Karyawan Swasta",
  },
  {
    id: 6,
    rating: 5,
    text: "Pelayanan ramah dan pengiriman cepat. Roti tawar gandumnya lembut banget, beda sama yang lain. Recommended!",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC77lSilF37K3civ1s4XATcYCRacfyrB0iuFY1i0C9ibFzTqsKdjGCFZUvS3V6UVJ7aWrVitoJD019pdyScvvu56pOMZ_XFRENTHxOtLO0AfWX5_sCWuTB0Egw_IltepI9jRy0a6SpKZM__d_cPzvEnhG2U3ck3lGjI5fGMRTK7zN8Mutprhw8tybNuibTonAH8mxA1WpOoH2By_xEBfzUw_V5oZRsyzK3R8aMFnWsD76V-JPTxpmFVpnNy5M5-Cu74staI-Mp8D5tj",
    name: "Rizky Pratama",
    role: "Pelanggan Baru",
  },
];

export default function TestimonialsPage() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      {/* Shared Header Navigation */}
      <Navbar />

      <main className="flex-grow w-full">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32 bg-surface-container-low">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary-fixed rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-tertiary-fixed rounded-full blur-3xl translate-x-1/4 translate-y-1/4"></div>
          </div>
          <div className="relative px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
            <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm uppercase tracking-wider font-semibold">
              Kisah Manis
            </span>
            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-6 font-bold">
              Apa Kata Mereka?
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Kesenangan yang dibagikan terasa dua kali lebih manis. Simak cerita hangat dari sahabat MyCakeShop tentang rasa klasik yang membangkitkan kenangan.
            </p>
          </div>
        </section>

        {/* Testimonial Grid */}
        <section className="py-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Ulasan Pilihan</h2>
              <p className="text-on-surface-variant mt-2">Kebahagiaan dalam setiap gigitan dari pelanggan setia kami.</p>
            </div>
            <div className="flex items-center gap-2 bg-surface-container-highest px-4 py-2 rounded-full border border-outline-variant">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              <span className="font-bold text-primary">4.9/5.0</span>
              <span className="text-on-surface-variant text-sm">dari 1.2k+ ulasan</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="card-hover bg-surface-container-lowest rounded-xl border border-surface-container shadow-xs flex flex-col h-full p-6 transition-all duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-primary text-sm"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="font-body-md text-on-surface mb-6 flex-grow italic text-sm">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container flex-shrink-0 relative">
                    <Image
                      className="object-cover"
                      src={t.avatar}
                      alt={t.name}
                      fill
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-sm">{t.name}</p>
                    <p className="text-[10px] text-on-surface-variant">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="bg-primary-container rounded-[2rem] p-8 md:p-16 text-center text-on-primary-container relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-1/4 -translate-y-1/4">
              <span className="material-symbols-outlined text-[120px]">auto_awesome</span>
            </div>
            <h2 className="font-headline-md text-headline-md md:text-[32px] mb-6 relative z-10 font-bold">
              Punya Cerita Manis Bersama Kami?
            </h2>
            <p className="font-body-lg text-body-lg mb-10 max-w-xl mx-auto opacity-90 relative z-10">
              Bagikan pengalamanmu menikmati kehangatan MyCakeShop dan dapatkan voucher khusus untuk pembelian berikutnya.
            </p>
            <button className="inline-flex items-center gap-2 bg-on-primary-container text-primary-container px-10 py-4 rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-lg relative z-10 cursor-pointer">
              <span>Bagikan Ceritamu</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </section>
      </main>

      {/* Shared Footer */}
      <Footer />

      {/* Slide-over Drawer */}
      <CartDrawer />
    </div>
  );
}
