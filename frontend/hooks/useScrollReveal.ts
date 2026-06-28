"use client";

import { useEffect, useRef } from "react";

/**
 * useScrollReveal
 *
 * Pakai IntersectionObserver untuk menambahkan class "visible"
 * ke semua elemen dengan class "reveal" di dalam container ref.
 *
 * Cara pakai:
 *   const ref = useScrollReveal();
 *   <main ref={ref}>
 *     <div className="reveal">...</div>
 *     <div className="reveal reveal-delay-1">...</div>
 *     <div className="reveal reveal-left reveal-delay-2">...</div>
 *   </main>
 */
export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            // Lepas observer setelah terlihat agar tidak animasi ulang
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
        ...options,
      }
    );

    const elements = root.querySelectorAll<HTMLElement>(".reveal");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [options]);

  return ref;
}
