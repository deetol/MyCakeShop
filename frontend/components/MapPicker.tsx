"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import map to avoid SSR issues
const MapPickerContent = dynamic(
  () => import('./MapPickerContent'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-surface-container rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-on-surface-variant text-sm">Memuat peta...</p>
        </div>
      </div>
    )
  }
);

interface MapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: {
    lat: number;
    lng: number;
    address: string;
    city?: string;
    province?: string;
    postalCode?: string;
  }) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function MapPicker({
  isOpen,
  onClose,
  onSelectLocation,
  initialLat = -6.200000,
  initialLng = 106.816666,
}: MapPickerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="bg-surface rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl border border-surface-container relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-surface-container">
          <div>
            <h2 className="font-headline-md text-lg text-primary font-bold">
              Pilih Lokasi dari Peta
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              Klik pada peta untuk memilih lokasi atau geser marker
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary p-2 rounded-full hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Map Content */}
        <div className="p-4">
          <MapPickerContent
            initialLat={initialLat}
            initialLng={initialLng}
            onSelectLocation={onSelectLocation}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}
