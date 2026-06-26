"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { cartCount, setCartOpen } = useCart();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Produk", href: "/products" },
    { name: "Testimoni", href: "/testimonials" },
  ];

  return (
    <header className="w-full sticky top-0 z-50 bg-surface dark:bg-surface-dim bg-surface-container dark:bg-surface-container-high shadow-sm">
      <div className="max-w-container-max mx-auto px-margin-desktop md:px-margin-desktop px-margin-mobile flex justify-between items-center h-20">
        {/* Logo */}
        <Link
          href="/"
          className="font-display-lg text-display-lg font-bold text-primary dark:text-primary-fixed-dim hover:opacity-90 transition-opacity"
        >
          MyCakeShop
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`font-body-md text-body-md transition-colors ${
                  isActive
                    ? "text-primary font-bold border-b-2 border-primary pb-1"
                    : "text-on-surface-variant dark:text-on-surface hover:text-primary"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          {/* Cart Button */}
          <button
            onClick={() => setCartOpen(true)}
            aria-label="shopping_cart"
            className="relative p-2 text-primary dark:text-primary-fixed-dim hover:text-primary-container transition-all active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
              shopping_cart
            </span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-tertiary text-on-tertiary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          {/* Profile Button — redirect berdasarkan role */}
          <Link
            href={
              !user
                ? "/login"
                : user.role === "admin"
                ? "/admin"
                : "/profile"
            }
            aria-label="person"
            className="p-2 text-primary dark:text-primary-fixed-dim hover:text-primary-container transition-all active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
              {user ? "account_circle" : "person"}
            </span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-primary dark:text-primary-fixed-dim focus:outline-none"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
              {isMobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-surface-container border-b border-outline-variant px-margin-mobile py-4 space-y-3 shadow-md animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-2 font-body-md text-body-md transition-colors ${
                  isActive
                    ? "text-primary font-bold border-l-4 border-primary pl-3"
                    : "text-on-surface-variant dark:text-on-surface hover:text-primary pl-3"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
