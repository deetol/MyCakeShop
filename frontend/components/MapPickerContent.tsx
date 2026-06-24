"use client";

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPickerContentProps {
  initialLat: number;
  initialLng: number;
  onSelectLocation: (location: { 
    lat: number; 
    lng: number; 
    address: string;
    city?: string;
    province?: string;
    postalCode?: string;
  }) => void;
  onClose: () => void;
}

function LocationMarker({ position, setPosition, onPositionChange }: any) {
  const map = useMapEvents({
    click(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      onPositionChange(newPos[0], newPos[1]);
    },
  });

  return position ? (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          const newPos: [number, number] = [pos.lat, pos.lng];
          setPosition(newPos);
          onPositionChange(pos.lat, pos.lng);
        },
      }}
    />
  ) : null;
}

export default function MapPickerContent({
  initialLat,
  initialLng,
  onSelectLocation,
  onClose,
}: MapPickerContentProps) {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Update position when initial coordinates change
  useEffect(() => {
    setPosition([initialLat, initialLng]);
    // Fetch address for initial position
    fetchAddress(initialLat, initialLng);
  }, [initialLat, initialLng]);

  // Reverse geocoding function using Nominatim (OpenStreetMap)
  const fetchAddress = async (lat: number, lng: number) => {
    setIsLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'id', // Request Indonesian language
          },
        }
      );
      const data = await response.json();
      
      if (data && data.address) {
        const addr = data.address;
        
        // Extract address components
        const road = addr.road || addr.hamlet || addr.neighbourhood || '';
        const suburb = addr.suburb || addr.village || addr.town || '';
        const cityName = addr.city || addr.city_district || addr.county || addr.state_district || '';
        const provinceName = addr.state || '';
        const postal = addr.postcode || '';
        
        // Build full address string
        let fullAddress = '';
        if (road) fullAddress += road;
        if (suburb) fullAddress += (fullAddress ? ', ' : '') + suburb;
        
        setAddress(fullAddress || data.display_name);
        setCity(cityName);
        setProvince(provinceName);
        setPostalCode(postal);
      } else {
        // Fallback to coordinates if no address found
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        setCity('');
        setProvince('');
        setPostalCode('');
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      setCity('');
      setProvince('');
      setPostalCode('');
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleConfirm = () => {
    onSelectLocation({
      lat: position[0],
      lng: position[1],
      address: address,
      city: city,
      province: province,
      postalCode: postalCode,
    });
    onClose();
  };

  return (
    <div className="space-y-4">
      {/* Map */}
      <div className="w-full h-96 rounded-lg overflow-hidden border-2 border-outline-variant">
        <MapContainer
          center={position}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            position={position} 
            setPosition={setPosition}
            onPositionChange={fetchAddress}
          />
        </MapContainer>
      </div>

      {/* Selected Location Info */}
      <div className="bg-surface-container-low p-4 rounded-lg space-y-3">
        {isLoadingAddress ? (
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary animate-spin">progress_activity</span>
            <p className="text-sm text-on-surface-variant">Mencari alamat...</p>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-1">location_on</span>
              <div className="flex-grow">
                <p className="text-sm font-semibold text-on-surface mb-1">Lokasi Terpilih:</p>
                <p className="text-sm text-on-surface">{address || 'Alamat tidak ditemukan'}</p>
              </div>
            </div>
            
            {(city || province || postalCode) && (
              <div className="pl-9 space-y-1">
                {city && <p className="text-xs text-on-surface-variant">Kota: <span className="font-medium text-on-surface">{city}</span></p>}
                {province && <p className="text-xs text-on-surface-variant">Provinsi: <span className="font-medium text-on-surface">{province}</span></p>}
                {postalCode && <p className="text-xs text-on-surface-variant">Kode Pos: <span className="font-medium text-on-surface">{postalCode}</span></p>}
              </div>
            )}
            
            <div className="pl-9 pt-2 border-t border-outline-variant">
              <p className="text-xs text-on-surface-variant font-mono">
                Koordinat: {position[0].toFixed(6)}, {position[1].toFixed(6)}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="bg-tertiary-container p-3 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-on-tertiary-container text-[18px] mt-0.5">info</span>
          <p className="text-xs text-on-tertiary-container">
            <strong>Cara menggunakan:</strong> Klik pada peta untuk memilih lokasi, atau geser marker merah ke posisi yang diinginkan. Alamat akan dicari otomatis.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 border-2 border-outline-variant rounded-lg text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-all"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isLoadingAddress}
          className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-bold hover:bg-primary-container transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[18px]">check</span>
          Gunakan Lokasi Ini
        </button>
      </div>
    </div>
  );
}
