import React, { useEffect, useRef } from 'react';
import { useDashboard } from '../DashboardContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Compass } from 'lucide-react';
import { VISUAL_THEMES } from './ThemeStyles';

export const MosqueMap: React.FC = () => {
  const { data } = useDashboard();
  const theme = VISUAL_THEMES[data.config.themeId] || VISUAL_THEMES['editorial-aesthetic'];

  const lat = data.config.latitude !== undefined ? Number(data.config.latitude) : 51.5074;
  const lng = data.config.longitude !== undefined ? Number(data.config.longitude) : -0.1278;

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const handleOpenInGoogleMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  // Custom active mosque pin that fits the dashboard's aesthetics
  const activeMosqueIcon = L.divIcon({
    html: `
      <div class="flex items-center justify-center relative shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#D4AF37" class="w-8 h-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        <div class="absolute top-[8px] w-2.5 h-2.5 rounded-full bg-amber-950"></div>
      </div>
    `,
    className: 'custom-active-mosque-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });

  // Initialize and maintain map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 14,
      zoomControl: true,
      dragging: true,
      scrollWheelZoom: false, // gentle zoom on hover so it doesn't hijack user scrolling
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const marker = L.marker([lat, lng], {
      icon: activeMosqueIcon
    }).addTo(map);

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Sync coordinates when the active mosque config changes
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 14, { animate: true });
      markerRef.current.setLatLng([lat, lng]);
    }
  }, [lat, lng]);

  return (
    <div id="mosque-map-section" className={`p-6 rounded-3xl ${theme.cardClass} border border-white/5 shadow-xl flex flex-col justify-between relative overflow-hidden transition-all duration-300`}>
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-[#D4AF37]">
              <Compass className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-sans">
                Masjid Location & Map
              </h4>
              <p className="text-[10px] text-stone-400 font-mono">
                {data.config.name} • {data.config.city}
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenInGoogleMaps}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37]/10 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold transition-all active:scale-95 cursor-pointer"
            title="Open in Google Maps"
            id="open-google-maps-btn"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open Maps</span>
          </button>
        </div>

        {/* Address Display */}
        <div className="p-3 bg-black/25 border border-white/5 rounded-xl flex items-start gap-2.5">
          <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
          <div>
            <span className="text-[9px] text-stone-500 uppercase block font-mono">Registered Address</span>
            <span className="text-xs text-slate-200 block font-sans" id="map-address-text">
              {data.config.address || "London, UK"}
            </span>
          </div>
        </div>

        {/* Leaflet OSM Map */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-inner h-40 bg-stone-900">
          <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '160px' }} />
        </div>
      </div>
    </div>
  );
};
