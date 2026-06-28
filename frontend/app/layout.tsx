import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import IntroWrapper from "../components/IntroWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MyCakeShop - Beranda",
  description: "Nikmati sajian roti dan kue tradisional Indonesia yang dibuat dengan resep warisan keluarga dan bahan alami pilihan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${interTight.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        {/*
          SSR overlay: div ini di-render server, langsung menutupi layar.
          React di client akan hydrate & IntroWrapper mengambil alih.
          Tidak perlu script apapun — overlay ada sejak byte HTML pertama.
        */}
        <style>{`
          #ssr-intro {
            position: fixed;
            inset: 0;
            z-index: 9999;
            background: #2b1613;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
          }
          /* Sembunyikan SSR overlay setelah React hydration selesai
             (IntroWrapper JS akan remove element ini) */
        `}</style>
      </head>
      <body
        className="min-h-full flex flex-col bg-background text-on-background font-body-md text-body-md antialiased selection:bg-primary-container selection:text-on-primary-container"
        style={{ fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif" }}
      >
        <AuthProvider>
          <CartProvider>
            <IntroWrapper />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
