"use client";

import Link from "next/link";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function Footer() {
  const ref = useScrollReveal<HTMLElement>();

  return (
    <footer
      ref={ref}
      className="bg-surface-container-low w-full py-16 border-t border-outline-variant mt-auto"
    >
      <div className="max-w-container-max mx-auto px-margin-desktop grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="reveal space-y-4">
          <h2 className="font-headline-md text-headline-md text-primary">MyCakeShop</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
            Menyajikan kehangatan dan kenyamanan melalui kue dan roti tradisional berkualitas tinggi sejak 2010.
          </p>
        </div>

        <div className="reveal reveal-delay-1 flex flex-col space-y-3 font-body-md text-body-md">
          {[
            { href: "/privacy",  label: "Kebijakan Privasi" },
            { href: "/terms",    label: "Syarat & Ketentuan" },
            { href: "/contact",  label: "Hubungi Kami" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-on-surface-variant hover:text-primary transition-colors link-underline w-fit"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="reveal reveal-delay-2 flex flex-col justify-end text-left md:text-right font-body-md text-body-md text-on-surface-variant">
          <p>© 2026 MyCakeShop</p>
          <p className="text-sm mt-1 opacity-70">Kehangatan Tradisi di Setiap Gigitan</p>
        </div>
      </div>
    </footer>
  );
}
