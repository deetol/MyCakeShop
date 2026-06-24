"use client";

import React, { useState, useEffect } from "react";

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialAddress?: string;
}

interface LocationData {
  address: string;
  city: string;
  province: string;
  postalCode: string;
  lat: number;
  lng: number;
}

export default function LocationPicker({ onLocationSelect, initialAddress = "" }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [isSearching, setIsSearching] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  // Check if browser supports geolocation
  const supportsGeolocation = typeof window !== 'undefined' && 'geolocation' in navigator;

  // Get current location
  const getCurrentLocation = () => {
    if (!supportsGeolocation) {
      alert('Browser Anda tidak mendukung geolocation');
      return;
    }

    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCurrentLocation({ lat, lng });
        reverseGeocode(lat, lng);
        setShowMap(true);
      },
      (error) => {
        setIsSearching(false);
        console.error('Error getting location:', error);
        alert('Tidak dapat mengakses lokasi Anda. Pastikan Anda mengizinkan akses lokasi.');
      }
    );
  };

  // Reverse geocode using Nominatim (OpenStreetMap) - Free, no API key needed
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'MyCakeShop',
          },
        }
      );
      const data = await response.json();
      
      if (data && data.address) {
        const locationData: LocationData = {
          address: data.display_name || '',
          city: data.address.city || data.address.town || data.address.village || data.address.county || '',
          province: data.address.state || '',
          postalCode: data.address.postcode || '',
          lat,
          lng,
        };
        
        setSelectedLocation(locationData);
        setSearchQuery(data.display_name);
        onLocationSelect(locationData);
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
      alert('Gagal mengambil alamat dari lokasi tersebut');
    } finally {
      setIsSearching(false);
    }
  };

  // Search location using Nominatim
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=1`,
        {
          headers: {
            'User-Agent': 'MyCakeShop',
          },
        }
      );
      const results = await response.json();
      
      if (results && results.length > 0) {
        const result = results[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        setCurrentLocation({ lat, lng });
        reverseGeocode(lat, lng);
        setShowMap(true);
      } else {
        alert('Lokasi tidak ditemukan. Coba gunakan kata kunci yang lebih spesifik.');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Gagal mencari lokasi');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchLocation();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div>
        <label className="block text-sm font-semibold text-on-surface mb-2">
          Pilih Lokasi <span className="text-error">*</span>
        </label>
        
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              type="text"
              className="w-full pl-11 pr-4 py-3 border border-outline-variant bg-surface-container-low rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Cari alamat... (contoh: Jl. Sudirman Jakarta)"
            />
          </div>
          <button
            type="button"
            onClick={searchLocation}
            disabled={isSearching || !searchQuery.trim()}
            className="px-4 py-3 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSearching ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-[20px]">search</span>
            )}
            Cari
          </button>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isSearching || !supportsGeolocation}
            className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">my_location</span>
            Gunakan Lokasi Saat Ini
          </button>
        </div>
      </div>

      {/* Map Display */}
      {showMap && currentLocation && (
        <div className="border-2 border-primary rounded-xl overflow-hidden">
          <div className="bg-primary-container p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">location_on</span>
              <span className="text-sm font-semibold text-on-primary-container">
                Lokasi Terpilih
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowMap(false)}
              className="text-on-primary-container hover:text-primary p-1"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          
          {/* OpenStreetMap Embed */}
          <div className="relative h-64 bg-surface-container">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${currentLocation.lng - 0.01},${currentLocation.lat - 0.01},${currentLocation.lng + 0.01},${currentLocation.lat + 0.01}&layer=mapnik&marker=${currentLocation.lat},${currentLocation.lng}`}
              style={{ border: 0 }}
            />
          </div>

          {selectedLocation && (
            <div className="p-4 bg-surface-container-low">
              <div className="text-sm space-y-2">
                <div className="flex gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                  <div className="flex-grow">
                    <p className="font-medium text-on-surface">{selectedLocation.address}</p>
                    {selectedLocation.city && (
                      <p className="text-xs text-on-surface-variant mt-1">
                        {selectedLocation.city}, {selectedLocation.province} {selectedLocation.postalCode}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-on-surface-variant">
        💡 <strong>Tips:</strong> Gunakan "Lokasi Saat Ini" jika Anda berada di lokasi pengiriman, atau cari alamat lengkap untuk hasil terbaik
      </p>
    </div>
  );
}
