import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface-container dark:bg-surface-container-lowest w-full py-16 bg-surface-container-low border-t border-outline-variant flat no shadows mt-auto">
      <div className="max-w-container-max mx-auto px-margin-desktop grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="space-y-4">
          <h2 className="font-headline-md text-headline-md text-primary">
            MyCakeShop
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
            Menyajikan kehangatan dan kenyamanan melalui kue dan roti tradisional berkualitas tinggi sejak 2010.
          </p>
        </div>
        <div className="flex flex-col space-y-3 font-body-md text-body-md justify-start">
          <Link
            className="text-on-surface-variant hover:text-primary transition-colors hover:opacity-80"
            href="/privacy"
          >
            Kebijakan Privasi
          </Link>
          <Link
            className="text-on-surface-variant hover:text-primary transition-colors hover:opacity-80"
            href="/terms"
          >
            Syarat & Ketentuan
          </Link>
          <Link
            className="text-on-surface-variant hover:text-primary transition-colors hover:opacity-80"
            href="/contact"
          >
            Hubungi Kami
          </Link>
        </div>
        <div className="flex flex-col justify-end text-left md:text-right font-body-md text-body-md text-on-surface-variant">
          <p>© 2026 MyCakeShop - Kehangatan Tradisi di Setiap Gigitan</p>
        </div>
      </div>
    </footer>
  );
}
