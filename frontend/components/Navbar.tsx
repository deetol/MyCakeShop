"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { cartCount, setCartOpen } = useCart();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Produk", href: "/products" },
    { name: "Testimoni", href: "/testimonials" },
  ];

  return (
    <header className={`w-full sticky top-0 z-50 bg-surface-container transition-all duration-300 ${scrolled ? "nav-scrolled shadow-md" : "shadow-sm"}`}>
      <div className="max-w-container-max mx-auto px-margin-desktop md:px-margin-desktop px-margin-mobile flex justify-between items-center h-20">
        {/* Logo */}
        <Link
          href="/"
          className="animate-fade-down font-display-lg text-display-lg font-bold text-primary hover:opacity-90 transition-opacity hover:scale-[1.02]"
        >
          MyCakeShop
        </Link>

        {/* Desktop Nav Links */}
        <nav className="animate-fade-down animation-delay-100 hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`font-body-md text-body-md transition-colors relative ${
                  isActive
                    ? "text-primary font-bold border-b-2 border-primary pb-1"
                    : "text-on-surface-variant hover:text-primary link-underline"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="animate-fade-down animation-delay-200 flex items-center space-x-4">
          {/* Cart Button */}
          <button
            onClick={() => setCartOpen(true)}
            aria-label="shopping_cart"
            className="relative p-2 text-primary hover:text-primary-container transition-all hover:scale-110"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
              shopping_cart
            </span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-tertiary text-on-tertiary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-scale-in">
                {cartCount}
              </span>
            )}
          </button>

          {/* Profile Button */}
          <Link
            href={!user ? "/login" : user.role === "admin" ? "/admin" : "/profile"}
            aria-label="person"
            className="p-2 text-primary hover:text-primary-container transition-all hover:scale-110"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
              {user ? "account_circle" : "person"}
            </span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-primary focus:outline-none transition-transform hover:scale-110"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined transition-all duration-200" style={{ fontSize: "24px" }}>
              {isMobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-surface-container border-b border-outline-variant px-margin-mobile py-4 space-y-3 shadow-md animate-fade-down">
          {navLinks.map((link, i) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ animationDelay: `${i * 0.06}s` }}
                className={`block py-2 font-body-md text-body-md transition-colors animate-fade-up ${
                  isActive
                    ? "text-primary font-bold border-l-4 border-primary pl-3"
                    : "text-on-surface-variant hover:text-primary pl-3"
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
