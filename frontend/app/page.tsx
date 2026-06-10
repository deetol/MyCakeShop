import Image from "next/image";
import { ShoppingCart, User } from "lucide-react";

export default function Home() {
  return (
    <>
      {/* TopNavBar */}
      <nav className="bg-surface dark:bg-surface-dim w-full sticky top-0 z-50 bg-surface-container dark:bg-surface-container-high shadow-sm">
        <div className="max-w-container-max mx-auto px-margin-desktop flex justify-between items-center h-20">
          <div className="font-display-lg text-display-lg font-bold text-primary dark:text-primary-fixed-dim">
            MyCakeShop
          </div>
          <div className="hidden md:flex gap-gutter font-body-md text-body-md">
            <a
              className="text-primary font-bold border-b-2 border-primary pb-1 active:scale-95 transition-transform hover:text-primary-container transition-all"
              href="#"
            >
              Beranda
            </a>
            <a
              className="text-on-surface-variant dark:text-on-surface hover:text-primary transition-colors active:scale-95 transition-transform hover:text-primary-container transition-all"
              href="#"
            >
              Produk
            </a>
            <a
              className="text-on-surface-variant dark:text-on-surface hover:text-primary transition-colors active:scale-95 transition-transform hover:text-primary-container transition-all"
              href="#"
            >
              Tentang Kami
            </a>
          </div>
          <div className="flex gap-[16px]">
            <button
              aria-label="shopping_cart"
              className="text-primary hover:text-primary-container transition-all active:scale-95 transition-transform"
            >
              <ShoppingCart className="w-6 h-6" />
            </button>
            <button
              aria-label="person"
              className="text-primary hover:text-primary-container transition-all active:scale-95 transition-transform"
            >
              <User className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      <main className="w-full">
        {/* Hero Section */}
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-[64px] flex flex-col md:flex-row items-center gap-[48px]">
          <div className="flex-1 space-y-[24px]">
            <h1 className="font-display-lg text-display-lg text-on-background">
              Kehangatan Tradisi di Setiap Gigitan.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
              Nikmati sajian roti dan kue tradisional Indonesia yang dibuat dengan resep warisan keluarga dan bahan alami pilihan. Menyajikan kenyamanan dalam setiap momen spesial Anda.
            </p>
            <div className="flex gap-[16px] pt-[16px]">
              <button className="bg-primary text-on-primary font-label-sm text-label-sm h-[48px] px-[32px] rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all shadow-[0_4px_12px_rgba(112,62,14,0.15)]">
                Pesan Sekarang
              </button>
              <button className="border border-tertiary text-tertiary font-label-sm text-label-sm h-[48px] px-[32px] rounded-full hover:bg-surface-container transition-all">
                Lihat Menu
              </button>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-primary-container/10 rounded-2xl transform translate-x-4 translate-y-4"></div>
            <div className="relative w-full h-[400px] md:h-[500px] z-10">
              <Image
                alt="Kue Tradisional"
                className="object-cover rounded-2xl shadow-[0_8px_24px_rgba(112,62,14,0.08)]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCd-PFKsf2VHhCnmsZg7r3v77nQJOT0A5W_7trX6KybZ_QVrRYP28MZsOphJAdZiz_eiNYxOvAYlYzwxUix_19lbgku3pCCirfkwHSJwhY3q0vVhalEDK7AZokuD3k3Edvnco_Bajg44s5Vm9NZa_XF0kk9oWHg4t5qklyfaxIXiZ9p7Tw6iQ-MOuNQwWKlQlNApv2Bc_64fxsihpGegLfXnDFFGEf_y4nWtzaMg_SKc-7tJ08_zla5cusoIJ2-beHg7dmBlR7dWNav"
                fill
                priority
              />
            </div>
          </div>
        </section>

        {/* Kategori Populer */}
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-[64px]">
          <div className="text-center mb-[48px]">
            <h2 className="font-headline-md text-headline-md text-primary mb-[8px]">Pilihan Favorit</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Jelajahi kategori terlaris dari dapur kami.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Card 1 */}
            <div className="bg-surface rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(112,62,14,0.05)] hover:shadow-[0_8px_24px_rgba(112,62,14,0.1)] transition-all group cursor-pointer border border-surface-container">
              <div className="h-[240px] relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-tertiary text-on-tertiary font-label-sm text-label-sm px-3 py-1 rounded-full z-10">
                  Tradisional
                </div>
                <Image
                  alt="Roti Manis"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCe6PqN6eQf_CwHvCvZEhGaNd8Q6m6acLTBhdd8Odi-kF-ZvDd1ggx4ZfINgKtJEwaInkscS0LvkmjB0rj_zK8upwombuXM93x2px1WepJ-zMx-bQLWxUXU4d3uZBnl2b1OcMox_U1r574_w7jpqIILjh--3AYuQt-dHe1taIRgfwLaZs-ya_k7HS4Fh4vRPtq_X7EXzNVL1NrlbbdXrXUwDBnG3tMDr458AkjgXd5lR_rSFfIC_UAeD3pConitIxMNAYmnDYl4aJDz"
                  fill
                />
              </div>
              <div className="p-[24px]">
                <h3 className="font-headline-md text-headline-md text-on-background mb-[8px]">Roti Manis</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-[16px]">Lembut dengan isian melimpah khas resep keluarga.</p>
                <p className="font-body-lg text-body-lg font-bold text-primary">Mulai Rp 12.000</p>
              </div>
            </div>
            {/* Card 2 */}
            <div className="bg-surface rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(112,62,14,0.05)] hover:shadow-[0_8px_24px_rgba(112,62,14,0.1)] transition-all group cursor-pointer border border-surface-container">
              <div className="h-[240px] relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-tertiary text-on-tertiary font-label-sm text-label-sm px-3 py-1 rounded-full z-10">
                  Favorit
                </div>
                <Image
                  alt="Kue Basah"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZw1fFDTyETRsDVXKOhZnZtxuYuH-kxjf5EWkoWFNb8Uyz3V2gGjt0KKiJ4q8-cj9Dj0FrUsw_hgrkNVhT1spOQngExz_i9BrNpJNSuE2Tjh_LzLGH-ZCuGfz2A2KX8Mj8-IQ39LWbG-OCbtafNU-PHKK9Nir_SFokjJWfoc2jcu7t6YDMSKbkLW8ls5sjk1Ezd3-BZ5TqETZTxV9gBSPpHXVJ7vN0hayRK3QV--U0bHWa7szl0LwmsWmQnL_4BFOFbRCug_1zy325"
                  fill
                />
              </div>
              <div className="p-[24px]">
                <h3 className="font-headline-md text-headline-md text-on-background mb-[8px]">Kue Basah</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-[16px]">Manis legit teman setia minum teh sore hari.</p>
                <p className="font-body-lg text-body-lg font-bold text-primary">Mulai Rp 5.000</p>
              </div>
            </div>
            {/* Card 3 */}
            <div className="bg-surface rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(112,62,14,0.05)] hover:shadow-[0_8px_24px_rgba(112,62,14,0.1)] transition-all group cursor-pointer border border-surface-container">
              <div className="h-[240px] relative overflow-hidden">
                <Image
                  alt="Cake Premium"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWQ-VBmnDBtcoX1pPlu2nJg9ZJUovc907njeag3n-QMMCHfpZr2oM0KNjdhZ_mvGgUt5CmdcGT9wJM9WlLStLRfrO9P-7HLi847ZICn7oyU9bTFB4Q01gwn2tWk4IcATU4HOTnEiIddcJr892LMecZMFHRYwkM2tJyeuct-L4vwz6n5wG4EWjWGyWef8sJg0Yhn4FN5Bz2UzMUSOQPkv7Tt2MaxAB_YLrwHKIhvjWkn86s-aRHjwSqDnOcr-byIb7WUrt-17sSyatA"
                  fill
                />
              </div>
              <div className="p-[24px]">
                <h3 className="font-headline-md text-headline-md text-on-background mb-[8px]">Cake Premium</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-[16px]">Lapis Legit dan Bolu istimewa untuk momen berharga.</p>
                <p className="font-body-lg text-body-lg font-bold text-primary">Mulai Rp 150.000</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container dark:bg-surface-container-lowest w-full py-16 bg-surface-container-low border-t border-outline-variant flat no shadows">
        <div className="max-w-container-max mx-auto px-margin-desktop grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <div className="space-y-4">
            <div className="font-headline-md text-headline-md text-primary">
              MyCakeShop
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Menyajikan kehangatan dan kenyamanan melalui kue dan roti tradisional berkualitas tinggi sejak 2010.
            </p>
          </div>
          <div className="flex flex-col space-y-2 font-body-md text-body-md">
            <a className="text-on-surface-variant hover:text-primary transition-opacity duration-200 hover:opacity-80" href="#">Kebijakan Privasi</a>
            <a className="text-on-surface-variant hover:text-primary transition-opacity duration-200 hover:opacity-80" href="#">Syarat &amp; Ketentuan</a>
            <a className="text-on-surface-variant hover:text-primary transition-opacity duration-200 hover:opacity-80" href="#">Hubungi Kami</a>
          </div>
          <div className="flex flex-col justify-end text-left md:text-right font-body-md text-body-md text-on-surface-variant">
            © 2026 MyCakeShop - Kehangatan Tradisi di Setiap Gigitan
          </div>
        </div>
      </footer>
    </>
  );
}
