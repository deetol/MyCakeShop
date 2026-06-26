"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import MapPicker from "@/components/MapPicker";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError, ValidationError } from "@/lib/api";

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
  const { user, token, loading: authLoading, logout: authLogout, login: updateAuth } = useAuth();

  // Profile fields state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Address list state
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [modalAddressId, setModalAddressId] = useState<string | null>(null);
  const [modalLabel, setModalLabel] = useState("");
  const [modalName, setModalName] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [modalLine, setModalLine] = useState("");
  const [modalCity, setModalCity] = useState("");
  const [modalProvince, setModalProvince] = useState("");
  const [modalPostalCode, setModalPostalCode] = useState("");
  const [modalIsDefault, setModalIsDefault] = useState(false);
  const [modalDetailAddress, setModalDetailAddress] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [mapInitialLat, setMapInitialLat] = useState(-6.200000);
  const [mapInitialLng, setMapInitialLng] = useState(106.816666);

  const [mounted, setMounted] = useState(false);

  // Fetch addresses from backend
  const fetchAddresses = async () => {
    if (!token) return;

    try {
      const response = await api.get<any[]>('/addresses', token);
      
      // Map backend addresses to frontend format
      const mappedAddresses: Address[] = response.data.map((addr: any) => ({
        id: addr.id.toString(),
        label: addr.label || 'Alamat',
        isDefault: addr.is_default || false,
        name: addr.recipient_name,
        phone: addr.recipient_phone,
        line: addr.address_line,
        city: addr.city,
        province: addr.province,
        postalCode: addr.postal_code,
      }));
      
      setAddresses(mappedAddresses);
    } catch (error) {
      console.warn('Failed to fetch addresses from backend');
    }
  };

  // Load user data
  useEffect(() => {
    setMounted(true);
    
    // Check if user is authenticated
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    // Admin tidak boleh akses halaman profile user
    if (!authLoading && user && user.role === 'admin') {
      router.push("/admin");
      return;
    }

    // Load user data from auth context
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      
      // Load addresses from backend
      fetchAddresses();
    }
  }, [authLoading, user, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await api.put<{ user: any }>('/profile', {
        name: name,
        phone: phone,
        // Note: email is read-only in backend
      }, token);

      // Update AuthContext with new user data
      updateAuth(response.data.user, token!);
      setIsEditingProfile(false);
      alert('Profil berhasil diperbarui!');
    } catch (error) {
      if (error instanceof ValidationError) {
        alert(error.getFirstError());
      } else if (error instanceof ApiError) {
        alert(error.message);
      } else {
        alert('Gagal menyimpan profil. Silakan coba lagi.');
      }
    }
  };

  const handleLogout = () => {
    authLogout();
  };

  const handleOpenAddressModal = (address?: Address) => {
    if (address) {
      setModalAddressId(address.id);
      setModalLabel(address.label);
      setModalName(address.name);
      setModalPhone(address.phone.startsWith('+62') ? address.phone : '+62' + address.phone.replace(/^0/, ''));
      setModalLine(address.line);
      setModalCity(address.city);
      setModalProvince(address.province);
      setModalPostalCode(address.postalCode);
      setModalDetailAddress(""); // Reset detail address for editing
      setModalIsDefault(address.isDefault);
    } else {
      setModalAddressId(null);
      setModalLabel("Rumah");
      setModalName(name);
      setModalPhone(phone.startsWith('+62') ? phone : '+62' + phone.replace(/^0/, ''));
      setModalLine("");
      setModalCity("");
      setModalProvince("");
      setModalPostalCode("");
      setModalDetailAddress("");
      setModalIsDefault(addresses.length === 0);
    }
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    // Custom validation untuk nomor telepon
    const phoneDigits = modalPhone.replace(/^\+62/, '');
    if (!phoneDigits || phoneDigits.length < 9) {
      alert('Nomor telepon minimal 9 digit (contoh: 81234567890)');
      return;
    }

    // Validasi kode pos
    if (!modalPostalCode || modalPostalCode.length !== 5) {
      alert('Kode pos harus 5 digit');
      return;
    }

    try {
      const addressData = {
        label: modalLabel,
        recipient_name: modalName,
        recipient_phone: modalPhone,
        address_line: modalLine,
        city: modalCity,
        province: modalProvince,
        postal_code: modalPostalCode,
        is_default: modalIsDefault,
      };

      if (modalAddressId) {
        // Edit existing address
        await api.put(`/addresses/${modalAddressId}`, addressData, token);
      } else {
        // Add new address
        await api.post('/addresses', addressData, token);
      }

      // Refresh addresses from backend
      await fetchAddresses();
      setShowAddressModal(false);
    } catch (error) {
      if (error instanceof ValidationError) {
        alert(error.getFirstError());
      } else if (error instanceof ApiError) {
        alert(error.message);
      } else {
        alert('Gagal menyimpan alamat. Silakan coba lagi.');
      }
    }
  };

  const handleDeleteAddress = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Apakah Anda yakin ingin menghapus alamat ini?')) {
      return;
    }

    try {
      await api.delete(`/addresses/${id}`, token);
      // Refresh addresses from backend
      await fetchAddresses();
    } catch (error) {
      if (error instanceof ApiError) {
        alert(error.message);
      } else {
        alert('Gagal menghapus alamat. Silakan coba lagi.');
      }
    }
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
                        // Reset to current user values
                        if (user) {
                          setName(user.name || "");
                          setEmail(user.email || "");
                          setPhone(user.phone || "");
                        }
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
          <div className="bg-surface rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl border border-surface-container relative z-10">
            <div className="flex justify-between items-center border-b border-surface-container pb-4 mb-6">
              <h2 className="font-headline-md text-xl text-primary font-bold">
                {modalAddressId ? "Ubah Alamat Pengiriman" : "Tambah Alamat Pengiriman"}
              </h2>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-on-surface-variant hover:text-primary p-2 rounded-full hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-5">
              {/* Nama Penerima - Full Width */}
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">
                  Nama Penerima <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                    person
                  </span>
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-3 border border-outline-variant bg-surface-container-low rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={modalName}
                    onChange={(e) => setModalName(e.target.value)}
                    placeholder="Nama lengkap penerima"
                    required
                  />
                </div>
                <p className="text-xs text-on-surface-variant mt-1 ml-1">
                  Nama ini akan digunakan saat kurir mengirim pesanan
                </p>
              </div>

              {/* Nomor Telepon dengan +62 */}
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">
                  Nomor Telepon <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                    call
                  </span>
                  <div className="absolute left-11 top-1/2 -translate-y-1/2 text-on-surface font-medium text-sm select-none pointer-events-none">
                    +62
                  </div>
                  <input
                    type="text"
                    inputMode="tel"
                    className="w-full pl-[76px] pr-4 py-3 border border-outline-variant bg-surface-container-low rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={modalPhone.replace(/^\+62/, '')}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 13) {
                        setModalPhone('+62' + value);
                      }
                    }}
                    onInvalid={(e) => {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      const value = modalPhone.replace(/^\+62/, '');
                      if (!value) {
                        input.setCustomValidity('Nomor telepon harus diisi');
                      } else if (value.length < 9) {
                        input.setCustomValidity('Nomor telepon minimal 9 digit (contoh: 81234567890)');
                      } else {
                        input.setCustomValidity('');
                      }
                    }}
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      input.setCustomValidity('');
                    }}
                    placeholder="81234567890"
                    required
                  />
                </div>
                <p className="text-xs text-on-surface-variant mt-1 ml-1">
                  Nomor aktif untuk dihubungi kurir (minimal 9 digit, tanpa 0 di depan)
                </p>
              </div>

              {/* Label Alamat */}
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">
                  Label Alamat <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Rumah', 'Kantor', 'Apartemen'].map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setModalLabel(label)}
                      className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                        modalLabel === label
                          ? 'border-primary bg-primary-container text-on-primary-container'
                          : 'border-outline-variant text-on-surface-variant hover:border-primary'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-outline-variant bg-surface-container-low rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={!['Rumah', 'Kantor', 'Apartemen'].includes(modalLabel) ? modalLabel : ''}
                    onChange={(e) => setModalLabel(e.target.value)}
                    placeholder="Atau tulis label custom (misal: Kost, Toko)"
                  />
                </div>
              </div>

              {/* Pilih Lokasi dengan Maps */}
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">
                  Pilih Lokasi <span className="text-error">*</span>
                </label>
                
                {/* Single Location Button with Map */}
                <button
                  type="button"
                  onClick={() => {
                    if ('geolocation' in navigator) {
                      setIsGettingLocation(true);
                      
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          const { latitude, longitude } = position.coords;
                          // Set koordinat untuk map
                          setMapInitialLat(latitude);
                          setMapInitialLng(longitude);
                          setIsGettingLocation(false);
                          // Langsung buka peta dengan lokasi yang terdeteksi
                          setShowMapPicker(true);
                        },
                        (error) => {
                          setIsGettingLocation(false);
                          // Jika user menolak atau error, tetap buka peta di lokasi default
                          setMapInitialLat(-6.200000);
                          setMapInitialLng(106.816666);
                          setShowMapPicker(true);
                        }
                      );
                    } else {
                      // Browser tidak support, buka peta di lokasi default
                      setMapInitialLat(-6.200000);
                      setMapInitialLng(106.816666);
                      setShowMapPicker(true);
                    }
                  }}
                  disabled={isGettingLocation}
                  className="w-full mb-4 py-3 border-2 border-primary text-primary rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary hover:text-on-primary transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGettingLocation ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                      <span>Mendeteksi lokasi...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">location_on</span>
                      <span>Pilih Lokasi dari Peta</span>
                    </>
                  )}
                </button>

                {/* Manual Address Input */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant text-[20px]">
                    location_on
                  </span>
                  <textarea
                    className="w-full pl-11 pr-4 py-3 border border-outline-variant bg-surface-container-low rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    value={modalLine}
                    onChange={(e) => setModalLine(e.target.value)}
                    placeholder="Masukkan alamat lengkap&#10;Contoh: Jl. Sudirman No. 123, RT 01/RW 05, Kelurahan Senayan, Kebayoran Baru"
                    required
                    rows={3}
                    minLength={10}
                  />
                </div>
                
                <p className="text-xs text-on-surface-variant mt-2 ml-1 flex items-start gap-1">
                  <span className="material-symbols-outlined text-[14px] mt-0.5">info</span>
                  <span>Klik tombol di atas untuk membuka peta, pilih lokasi dengan klik atau geser marker. Alamat akan terisi otomatis berdasarkan lokasi yang dipilih.</span>
                </p>
              </div>

              {/* Kota, Provinsi, Kode Pos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">
                    Kota <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-outline-variant bg-surface-container-low rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={modalCity}
                    onChange={(e) => setModalCity(e.target.value)}
                    placeholder="Jakarta Selatan"
                    required
                    minLength={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">
                    Provinsi <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-outline-variant bg-surface-container-low rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={modalProvince}
                    onChange={(e) => setModalProvince(e.target.value)}
                    placeholder="DKI Jakarta"
                    required
                    minLength={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">
                    Kode Pos <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full px-4 py-2.5 border border-outline-variant bg-surface-container-low rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={modalPostalCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 5) {
                        setModalPostalCode(value);
                      }
                    }}
                    onInvalid={(e) => {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      if (!modalPostalCode) {
                        input.setCustomValidity('Kode pos harus diisi');
                      } else if (modalPostalCode.length !== 5) {
                        input.setCustomValidity('Kode pos harus 5 digit');
                      } else {
                        input.setCustomValidity('');
                      }
                    }}
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      input.setCustomValidity('');
                    }}
                    placeholder="12345"
                    required
                  />
                </div>
              </div>

              {/* Detail Alamat (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-2">
                  Catatan Tambahan <span className="text-on-surface-variant text-xs font-normal">(Opsional)</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant text-[20px]">
                    note
                  </span>
                  <textarea
                    className="w-full pl-11 pr-4 py-3 border border-outline-variant bg-surface-container-low rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    value={modalDetailAddress}
                    onChange={(e) => setModalDetailAddress(e.target.value)}
                    placeholder="Patokan: Dekat minimarket, rumah pagar hijau, lantai 3 unit 305"
                    rows={2}
                    maxLength={200}
                  />
                </div>
                <p className="text-xs text-on-surface-variant mt-1 ml-1">
                  Informasi tambahan untuk memudahkan kurir menemukan lokasi
                </p>
              </div>

              {/* Toggle Default Address */}
              <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 hover:border-primary transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        star
                      </span>
                      <span className="text-sm font-semibold text-on-surface">
                        Jadikan Alamat Utama
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant ml-7">
                      Alamat ini akan otomatis terpilih saat checkout
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalIsDefault(!modalIsDefault)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      modalIsDefault ? 'bg-primary' : 'bg-outline-variant'
                    }`}
                    role="switch"
                    aria-checked={modalIsDefault}
                    aria-label="Jadikan alamat utama"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                        modalIsDefault ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-surface-container pt-6 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="w-full sm:w-auto px-6 py-2.5 border-2 border-outline-variant rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-bold hover:bg-primary-container hover:shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  {modalAddressId ? 'Update Alamat' : 'Simpan Alamat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Map Picker Modal */}
      <MapPicker
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onSelectLocation={(location) => {
          // Update semua field alamat dengan data dari reverse geocoding
          setModalLine(location.address);
          if (location.city) setModalCity(location.city);
          if (location.province) setModalProvince(location.province);
          if (location.postalCode) setModalPostalCode(location.postalCode);
        }}
        initialLat={mapInitialLat}
        initialLng={mapInitialLng}
      />

      <Footer />
      <CartDrawer />
    </div>
  );
}
