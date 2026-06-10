import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default function Home() {
  return (
    <>
      {/* Shared Header Navigation */}
      <Navbar />

      <main className="w-full">
        {/* Hero Section */}
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-[64px] flex flex-col md:flex-row items-center gap-[48px]">
          <div className="flex-1 space-y-[24px]">
            <h1 className="font-display-lg text-display-lg text-on-background font-bold">
              Kehangatan Tradisi di Setiap Gigitan.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
              Nikmati sajian roti dan kue tradisional Indonesia yang dibuat dengan resep warisan keluarga dan bahan alami pilihan. Menyajikan kenyamanan dalam setiap momen spesial Anda.
            </p>
            <div className="flex gap-[16px] pt-[16px]">
              <Link
                href="/products"
                className="bg-primary text-on-primary font-label-sm text-label-sm h-[48px] px-[32px] rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all shadow-[0_4px_12px_rgba(112,62,14,0.15)] flex items-center justify-center font-bold"
              >
                Pesan Sekarang
              </Link>
              <Link
                href="/products"
                className="border border-tertiary text-tertiary font-label-sm text-label-sm h-[48px] px-[32px] rounded-full hover:bg-surface-container transition-all flex items-center justify-center font-bold"
              >
                Lihat Menu
              </Link>
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
        <section id="about" className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-[64px]">
          <div className="text-center mb-[48px]">
            <h2 className="font-headline-md text-headline-md text-primary mb-[8px] font-bold">Pilihan Favorit</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Jelajahi kategori terlaris dari dapur kami.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Card 1 */}
            <Link
              href="/products"
              className="bg-surface rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(112,62,14,0.05)] hover:shadow-[0_8px_24px_rgba(112,62,14,0.1)] transition-all group cursor-pointer border border-surface-container flex flex-col hover:-translate-y-1 duration-300"
            >
              <div className="h-[240px] relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-tertiary text-on-tertiary font-label-sm text-label-sm px-3 py-1 rounded-full z-10 font-semibold">
                  Tradisional
                </div>
                <Image
                  alt="Roti Manis"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCe6PqN6eQf_CwHvCvZEhGaNd8Q6m6acLTBhdd8Odi-kF-ZvDd1ggx4ZfINgKtJEwaInkscS0LvkmjB0rj_zK8upwombuXM93x2px1WepJ-zMx-bQLWxUXU4d3uZBnl2b1OcMox_U1r574_w7jpqIILjh--3AYuQt-dHe1taIRgfwLaZs-ya_k7HS4Fh4vRPtq_X7EXzNVL1NrlbbdXrXUwDBnG3tMDr458AkjgXd5lR_rSFfIC_UAeD3pConitIxMNAYmnDYl4aJDz"
                  fill
                />
              </div>
              <div className="p-[24px] flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-background mb-[8px] font-bold">Roti Manis</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-[16px]">Lembut dengan isian melimpah khas resep keluarga.</p>
                </div>
                <p className="font-body-lg text-body-lg font-bold text-primary">Mulai Rp 12.000</p>
              </div>
            </Link>

            {/* Card 2 */}
            <Link
              href="/products"
              className="bg-surface rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(112,62,14,0.05)] hover:shadow-[0_8px_24px_rgba(112,62,14,0.1)] transition-all group cursor-pointer border border-surface-container flex flex-col hover:-translate-y-1 duration-300"
            >
              <div className="h-[240px] relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-tertiary text-on-tertiary font-label-sm text-label-sm px-3 py-1 rounded-full z-10 font-semibold">
                  Favorit
                </div>
                <Image
                  alt="Kue Basah"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZw1fFDTyETRsDVXKOhZnZtxuYuH-kxjf5EWkoWFNb8Uyz3V2gGjt0KKiJ4q8-cj9Dj0FrUsw_hgrkNVhT1spOQngExz_i9BrNpJNSuE2Tjh_LzLGH-ZCuGfz2A2KX8Mj8-IQ39LWbG-OCbtafNU-PHKK9Nir_SFokjJWfoc2jcu7t6YDMSKbkLW8ls5sjk1Ezd3-BZ5TqETZTxV9gBSPpHXVJ7vN0hayRK3QV--U0bHWa7szl0LwmsWmQnL_4BFOFbRCug_1zy325"
                  fill
                />
              </div>
              <div className="p-[24px] flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-background mb-[8px] font-bold">Kue Basah</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-[16px]">Manis legit teman setia minum teh sore hari.</p>
                </div>
                <p className="font-body-lg text-body-lg font-bold text-primary">Mulai Rp 5.000</p>
              </div>
            </Link>

            {/* Card 3 */}
            <Link
              href="/products"
              className="bg-surface rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(112,62,14,0.05)] hover:shadow-[0_8px_24px_rgba(112,62,14,0.1)] transition-all group cursor-pointer border border-surface-container flex flex-col hover:-translate-y-1 duration-300"
            >
              <div className="h-[240px] relative overflow-hidden">
                <Image
                  alt="Cake Premium"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWQ-VBmnDBtcoX1pPlu2nJg9ZJUovc907njeag3n-QMMCHfpZr2oM0KNjdhZ_mvGgUt5CmdcGT9wJM9WlLStLRfrO9P-7HLi847ZICn7oyU9bTFB4Q01gwn2tWk4IcATU4HOTnEiIddcJr892LMecZMFHRYwkM2tJyeuct-L4vwz6n5wG4EWjWGyWef8sJg0Yhn4FN5Bz2UzMUSOQPkv7Tt2MaxAB_YLrwHKIhvjWkn86s-aRHjwSqDnOcr-byIb7WUrt-17sSyatA"
                  fill
                />
              </div>
              <div className="p-[24px] flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-background mb-[8px] font-bold">Cake Premium</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-[16px]">Lapis Legit dan Bolu istimewa untuk momen berharga.</p>
                </div>
                <p className="font-body-lg text-body-lg font-bold text-primary">Mulai Rp 150.000</p>
              </div>
            </Link>
          </div>
        </section>
      </main>

      {/* Shared Footer */}
      <Footer />

      {/* Drawer */}
      <CartDrawer />
    </>
  );
}
