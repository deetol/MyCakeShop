"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { href: "/admin", label: "Ringkasan", icon: "dashboard" },
  { href: "/admin/products", label: "Manajemen Produk", icon: "bakery_dining" },
  { href: "/admin/stock", label: "Stok & Harga", icon: "inventory_2" },
  { href: "/admin/orders", label: "Pesanan", icon: "shopping_bag" },
  { href: "/admin/users", label: "Pelanggan", icon: "group" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="bg-surface-container-low text-on-surface font-body-md min-h-screen flex">
      {/* Sidebar */}
      <nav className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex flex-col py-6 px-4 border-r border-outline-variant z-20">
        {/* Brand */}
        <div className="mb-8 px-4">
          <h1 className="font-headline-md text-headline-md font-bold text-primary">MyCakeShop</h1>
          <p className="text-xs text-on-surface-variant mt-1">Admin Dashboard</p>
        </div>

        {/* CTA */}
        <div className="px-2 mb-6">
          <Link
            href="/admin/products/create"
            className="w-full bg-primary text-on-primary text-xs font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Tambah Produk Baru
          </Link>
        </div>

        {/* Nav */}
        <ul className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                    active
                      ? "text-primary font-bold bg-secondary-container"
                      : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Footer */}
        <ul className="mt-auto space-y-1 pt-6 border-t border-outline-variant">
          <li>
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg text-sm transition-colors">
              <span className="material-symbols-outlined text-[20px]">storefront</span>
              Lihat Toko
            </Link>
          </li>
          <li>
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg text-sm transition-colors">
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Logout
            </button>
          </li>
        </ul>
      </nav>

      {/* Main */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* TopBar */}
        <header className="bg-surface shadow-sm flex justify-between items-center h-16 px-10 sticky top-0 z-10 border-b border-outline-variant/30">
          <div className="flex-1 max-w-md relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input
              className="w-full bg-surface-container-low border border-outline-variant rounded-full py-2 pl-10 pr-4 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
              placeholder="Cari di MyCakeShop..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button className="text-on-surface-variant hover:text-primary p-2 rounded-full hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
          </div>
        </header>

        <main className="flex-1 p-10 w-full max-w-[1400px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
