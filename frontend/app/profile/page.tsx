"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

interface Address {
  id: string;
  label: string;
  isDefault: boolean;
  name: string;
  phone: string;
  line: string;
  city: string;
  province: string;
  postalCode: string;
}

export default function ProfilePage() {
  const router = useRouter();

  // Profile fields state
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [phone, setPhone] = useState("+62 812 3456 7890");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Address list state
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "addr-1",
      label: "Rumah",
      isDefault: true,
      name: "John Doe",
      phone: "+62 812 3456 7890",
      line: "Jl. Kebon Jeruk Raya No. 15, RT 01/RW 02",
      city: "Kecamatan Kebon Jeruk, Kota Jakarta Barat",
      province: "DKI Jakarta",
      postalCode: "11530",
    },
  ]);

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [modalAddressId, setModalAddressId] = useState<string | null>(null);
  const [modalLabel, setModalLabel] = useState("");
  const [modalName, setModalName] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [modalLine, setModalLine] = useState("");
  const [modalCity, setModalCity] = useState("");
  const [modalProvince, setModalProvince] = useState("");
  const [modalPostalCode, setModalPostalCode] = useState("");
  const [modalIsDefault, setModalIsDefault] = useState(false);

  const [mounted, setMounted] = useState(false);

  // Load user data from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        if (userObj.name) setName(userObj.name);
        if (userObj.email) setEmail(userObj.email);
        if (userObj.phone) setPhone(userObj.phone);
      }
      const storedAddresses = localStorage.getItem("mycakeshop_addresses");
      if (storedAddresses) {
        setAddresses(JSON.parse(storedAddresses));
      }
    } catch (e) {
      console.error("Failed to load data from storage", e);
    }
  }, []);

  const saveAddressesToStorage = (newAddresses: Address[]) => {
    setAddresses(newAddresses);
    try {
      localStorage.setItem("mycakeshop_addresses", JSON.stringify(newAddresses));
    } catch (e) {
      console.error("Failed to save addresses to localStorage", e);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingProfile(false);
    try {
      const storedUser = localStorage.getItem("user");
      const baseUser = storedUser ? JSON.parse(storedUser) : {};
      localStorage.setItem("user", JSON.stringify({ ...baseUser, name, email, phone }));
    } catch (e) {
      console.error("Failed to save profile", e);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("user");
    } catch (e) {
      console.error(e);
    }
    router.push("/login");
  };

  const handleOpenAddressModal = (address?: Address) => {
    if (address) {
      setModalAddressId(address.id);
      setModalLabel(address.label);
      setModalName(address.name);
      setModalPhone(address.phone);
      setModalLine(address.line);
      setModalCity(address.city);
      setModalProvince(address.province);
      setModalPostalCode(address.postalCode);
      setModalIsDefault(address.isDefault);
    } else {
      setModalAddressId(null);
      setModalLabel("");
      setModalName(name);
      setModalPhone(phone);
      setModalLine("");
      setModalCity("");
      setModalProvince("");
      setModalPostalCode("");
      setModalIsDefault(addresses.length === 0);
    }
    setShowAddressModal(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    let newAddresses = [...addresses];

    if (modalIsDefault) {
      newAddresses = newAddresses.map((addr) => ({ ...addr, isDefault: false }));
    }

    if (modalAddressId) {
      // Edit existing
      newAddresses = newAddresses.map((addr) =>
        addr.id === modalAddressId
          ? {
              ...addr,
              label: modalLabel,
              name: modalName,
              phone: modalPhone,
              line: modalLine,
              city: modalCity,
              province: modalProvince,
              postalCode: modalPostalCode,
              isDefault: modalIsDefault,
            }
          : addr
      );
    } else {
      // Add new
      newAddresses.push({
        id: `addr-${Date.now()}`,
        label: modalLabel,
        name: modalName,
        phone: modalPhone,
        line: modalLine,
        city: modalCity,
        province: modalProvince,
        postalCode: modalPostalCode,
        isDefault: modalIsDefault,
      });
    }

    // Default address always first
    newAddresses.sort((a, b) => (a.isDefault ? -1 : b.isDefault ? 1 : 0));
    saveAddressesToStorage(newAddresses);
    setShowAddressModal(false);
  };

  const handleDeleteAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let newAddresses = addresses.filter((addr) => addr.id !== id);
    if (addresses.find((a) => a.id === id)?.isDefault && newAddresses.length > 0) {
      newAddresses[0].isDefault = true;
    }
    saveAddressesToStorage(newAddresses);
  };

  const getInitials = (fullName: string) =>
    fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "U";

  if (!mounted) {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-24 pb-16">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-on-surface-variant font-medium">Memuat halaman profil...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full flex flex-col md:flex-row gap-8">

        {/* ── Sidebar ── */}
        <aside className="w-full md:w-64 shrink-0 bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant h-fit">
          {/* User info */}
          <div className="flex items-center space-x-4 mb-8 p-2">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg select-none">
              {getInitials(name)}
            </div>
            <div className="min-w-0">
              <div className="font-headline-md text-body-lg text-on-surface truncate font-bold">{name}</div>
              <div className="font-body-md text-label-sm text-on-surface-variant truncate">{email}</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-col space-y-2">
            {/* Active: Profil Saya */}
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary-container text-on-primary-container font-semibold">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                person
              </span>
              <span className="font-body-md text-body-md">Profil Saya</span>
            </div>

            {/* Pesanan Saya → /order */}
            <Link
              href="/order"
              className="flex items-center space-x-3 p-3 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">receipt_long</span>
              <span className="font-body-md text-body-md">Pesanan Saya</span>
            </Link>

            <div className="my-4 border-t border-outline-variant" />

            {/* Keluar */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 p-3 rounded-lg text-error hover:bg-error-container w-full text-left transition-colors"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="font-body-md text-body-md">Keluar</span>
            </button>
          </nav>
        </aside>

        {/* ── Profile Content ── */}
        <section className="flex-grow">
          <h1 className="font-headline-md text-headline-md text-on-surface mb-6 font-bold">Profil Saya</h1>

          <div className="space-y-6">
            {/* Profile Information */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-headline-md text-body-lg text-on-surface font-bold">Informasi Profil</h2>
                {!isEditingProfile && (
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(true)}
                    className="text-primary hover:text-primary-container font-label-sm text-label-sm flex items-center space-x-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    <span>Ubah</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-75 disabled:cursor-not-allowed"
                      disabled={!isEditingProfile}
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">
                      Email
                    </label>
                    <input
                      className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-75 disabled:cursor-not-allowed"
                      disabled={!isEditingProfile}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">
                      Nomor Telepon
                    </label>
                    <input
                      className="w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-75 disabled:cursor-not-allowed"
                      disabled={!isEditingProfile}
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Save / Cancel — only visible when editing */}
                {isEditingProfile && (
                  <div className="flex justify-end space-x-4 pt-4 border-t border-outline-variant">
                    <button
                      type="button"
                      className="px-6 py-2 rounded-lg border border-outline-variant text-on-surface-variant font-body-md text-body-md hover:bg-surface-container transition-colors"
                      onClick={() => {
                        setIsEditingProfile(false);
                        // Reset to stored values
                        try {
                          const storedUser = localStorage.getItem("user");
                          if (storedUser) {
                            const u = JSON.parse(storedUser);
                            if (u.name) setName(u.name);
                            if (u.email) setEmail(u.email);
                            if (u.phone) setPhone(u.phone);
                          }
                        } catch {}
                      }}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-lg bg-primary-container text-on-primary-container font-body-md text-body-md hover:bg-primary hover:text-on-primary transition-colors font-semibold"
                    >
                      Simpan
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Shipping Address */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="font-headline-md text-body-lg text-on-surface font-bold">Alamat Pengiriman</h2>
                <button
                  onClick={() => handleOpenAddressModal()}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-primary-container text-on-primary-container font-body-md text-body-md hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center space-x-2 h-10 font-semibold"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Tambah Alamat</span>
                </button>
              </div>

              <div className="space-y-4">
                {addresses.length === 0 ? (
                  <p className="text-on-surface-variant text-sm text-center py-6 italic border border-dashed border-outline-variant rounded-lg">
                    Belum ada alamat pengiriman. Tambahkan satu untuk mempermudah checkout.
                  </p>
                ) : (
                  addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => handleOpenAddressModal(addr)}
                      className={`border rounded-lg p-5 bg-surface-container-lowest hover:border-primary transition-colors relative group cursor-pointer ${
                        addr.isDefault ? "border-primary/60 shadow-sm" : "border-outline-variant"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="font-body-lg text-body-md font-bold text-on-surface">
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded text-xs font-semibold">
                              Utama
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-3 absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenAddressModal(addr); }}
                            className="text-on-surface-variant hover:text-primary transition-colors bg-surface-container p-1 rounded"
                            title="Ubah Alamat"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button
                            onClick={(e) => handleDeleteAddress(addr.id, e)}
                            className="text-on-surface-variant hover:text-error transition-colors bg-surface-container p-1 rounded"
                            title="Hapus Alamat"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </div>
                      <div className="font-body-md text-body-md text-on-surface-variant space-y-1 pr-16">
                        <p className="font-semibold text-on-surface">{addr.name}</p>
                        <p>{addr.phone}</p>
                        <p className="pt-2">{addr.line}</p>
                        <p>{addr.city}</p>
                        <p>{addr.province}, {addr.postalCode}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddressModal(false)}
          />
          <div className="bg-surface rounded-2xl max-w-lg w-full p-6 shadow-xl border border-surface-container relative z-10">
            <div className="flex justify-between items-center border-b border-surface-container pb-4 mb-4">
              <h2 className="font-headline-md text-lg text-primary font-bold">
                {modalAddressId ? "Ubah Alamat Pengiriman" : "Tambah Alamat Pengiriman"}
              </h2>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-on-surface-variant hover:text-primary p-2 rounded-full hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Label Alamat (misal: Rumah, Kantor)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-sm"
                    value={modalLabel}
                    onChange={(e) => setModalLabel(e.target.value)}
                    placeholder="Rumah / Kantor"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Nama Penerima
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-sm"
                    value={modalName}
                    onChange={(e) => setModalName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-sm"
                  value={modalPhone}
                  onChange={(e) => setModalPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Detail Alamat (Jalan, No Rumah, RT/RW)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-sm"
                  value={modalLine}
                  onChange={(e) => setModalLine(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Kota / Kecamatan
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-sm"
                    value={modalCity}
                    onChange={(e) => setModalCity(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Provinsi
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-sm"
                    value={modalProvince}
                    onChange={(e) => setModalProvince(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Kode Pos
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-outline-variant bg-surface-container-low rounded-lg text-sm"
                    value={modalPostalCode}
                    onChange={(e) => setModalPostalCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="modalIsDefault"
                  checked={modalIsDefault}
                  disabled={addresses.length === 0 && modalIsDefault}
                  onChange={(e) => setModalIsDefault(e.target.checked)}
                  className="rounded border-outline-variant text-primary focus:ring-primary"
                />
                <label htmlFor="modalIsDefault" className="text-xs font-semibold text-on-surface-variant cursor-pointer">
                  Jadikan Alamat Utama
                </label>
              </div>

              <div className="flex justify-end space-x-3 border-t border-surface-container pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold hover:bg-primary-container transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
      <CartDrawer />
    </div>
  );
}
