import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '../DashboardContext';
import { 
  Plus, 
  Search, 
  MapPin, 
  Phone, 
  MoonStar, 
  ArrowRight, 
  Sparkles, 
  PlusCircle, 
  ShieldAlert,
  Globe,
  Compass,
  Navigation,
  Clock,
  Bell,
  Lock,
  Settings,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthMenu } from './AuthMenu';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom gorgeous Leaflet markers utilizing SVG to avoid broken relative image asset paths
const userLocationIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center w-6 h-6">
      <span class="absolute inline-flex w-full h-full rounded-full bg-blue-500 opacity-75 animate-ping"></span>
      <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-600 border-2 border-white shadow-md"></span>
    </div>
  `,
  className: 'custom-user-pin',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const getMosqueIcon = (isSelected: boolean, isOSM?: boolean) => {
  const pinColor = isSelected ? '#fbbf24' : (isOSM ? '#0984e3' : '#10b981'); // Gold if selected, Solid Sky Blue/Blue if OSM, Emerald if Firebase
  const domeColor = isSelected ? '#1e1b4b' : '#ffffff'; // Dark indigo if selected, white if unselected
  const borderColor = isSelected ? '#ffffff' : (isOSM ? '#bae6fd' : '#a7f3d0');

  return L.divIcon({
    html: `
      <div class="flex flex-col items-center justify-center relative shadow-xl ${isSelected ? 'scale-110 z-[1000]' : 'z-20'} transition-all duration-200">
        <!-- Pin Shape with Custom Mosque Dome inside -->
        <div class="relative w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2" style="background-color: ${pinColor}; border-color: ${borderColor};">
          <svg viewBox="0 0 24 24" class="w-5 h-5" style="color: ${domeColor}; fill: currentColor;">
            <!-- Simple Mosque Dome and Minaret Silhouette -->
            <path d="M12 4.5c-2.5 0-4.5 1.8-4.5 4v4.5A1.5 1.5 0 009 14.5h6a1.5 1.5 0 001.5-1.5V8.5c0-2.2-2-4-4.5-4zM12 2.5a.5.5 0 01.5.5v1.5h-1V3a.5.5 0 01.5-.5zM5.5 8h1v5H5.5V8zm12 0h1v5h-1V8zm-13-1h2v1h-2V7zm14 0h2v1h-2V7z M4 20h16v1.5H4V20z" />
          </svg>
        </div>
        <!-- Little arrow indicator at bottom -->
        <div class="w-2 h-2 rotate-45 -mt-1 shadow-md" style="background-color: ${pinColor};"></div>
      </div>
    `,
    className: 'custom-mosque-pin-container',
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    popupAnchor: [0, -42]
  });
};

export const MultiMosqueSelector: React.FC = () => {
  const { allMosques, createMosque, selectMosque, subscription, isSuperAdmin } = useDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Discovery / Geolocation temporary states
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(() => {
    const cached = sessionStorage.getItem('mosque_user_location');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [locationPermissionState, setLocationPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>(() => {
    const cached = sessionStorage.getItem('mosque_user_location');
    return cached ? 'granted' : 'prompt';
  });
  const [detectedCity, setDetectedCity] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [selectedMapMosque, setSelectedMapMosque] = useState<string | null>(null);

  // Leaflet Map Refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);

  // Default Map center coordinates (Bangkok, Thailand is used as standard starting test coordinate)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 13.7563, lng: 100.5018 });
  const [mapZoom, setMapZoom] = useState<number>(12);

  // OpenStreetMap dynamically requested backup state elements
  const [osmMosques, setOsmMosques] = useState<any[]>([]);
  const [isSearchingOsm, setIsSearchingOsm] = useState<boolean>(false);

  // Haversine distance helper
  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Run reverse geocoding to acquire city string
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`;
      const res = await fetch(url, { headers: { 'User-Agent': 'TatouMasjid-App' } });
      const json = await res.json();
      if (json && json.address) {
        const cityVal = json.address.city || json.address.town || json.address.village || json.address.municipality || json.address.county || '';
        const stateVal = json.address.state || json.address.region || '';
        const countryVal = json.address.country || '';
        const parts = [cityVal, stateVal, countryVal].filter(Boolean);
        setDetectedCity(parts.slice(0, 2).join(', '));
      }
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
    }
  };

  // Initiate temporary location querying
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationPermissionState('unsupported');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(coords);
        setLocationPermissionState('granted');
        setIsLocating(false);
        reverseGeocode(coords.lat, coords.lng);
        sessionStorage.setItem('mosque_user_location', JSON.stringify(coords));
      },
      (error) => {
        console.error("Geolocation request issue:", error);
        setLocationPermissionState('denied');
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
    );
  };

  // Autodetect GPS permission if granted previously
  useEffect(() => {
    // If userLocation was retrieved from cache, reverse geocode to load address and skip getCurrentPosition
    if (userLocation) {
      reverseGeocode(userLocation.lat, userLocation.lng);
      return;
    }

    if (navigator.permissions && navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          requestLocation();
        }
        result.onchange = () => {
          if (result.state === 'granted') {
            requestLocation();
          } else if (result.state === 'denied') {
            setLocationPermissionState('denied');
            setUserLocation(null);
            sessionStorage.removeItem('mosque_user_location');
          }
        };
      });
    }
  }, []);

  // Expose connect callback globally to receive actions from raw HTML leaflet popups
  useEffect(() => {
    (window as any).handleMapConnect = (slug: string) => {
      selectMosque(slug);
    };
    return () => {
      delete (window as any).handleMapConnect;
    };
  }, [selectMosque]);

  // Initialize Leaflet Map exactly once on mount, using gorgeous CartoDB Dark Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCenter = userLocation || mapCenter;
    const initialZoom = isPremiumActive ? mapZoom : Math.min(mapZoom, 13);

    const map = L.map(mapContainerRef.current, {
      center: [initialCenter.lat, initialCenter.lng],
      zoom: initialZoom,
      zoomControl: true,
      scrollWheelZoom: false,
      maxZoom: isPremiumActive ? 18 : 13,
      minZoom: 2
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);

    const markerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    markerGroupRef.current = markerGroup;

    map.on('moveend', () => {
      const c = map.getCenter();
      setMapCenter({ lat: c.lat, lng: c.lng });
    });

    map.on('zoomend', () => {
      const z = map.getZoom();
      setMapZoom(z);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerGroupRef.current = null;
      }
    };
  }, []); // Only run once on mount

  // Sync user location to leaflet center when first detected
  useEffect(() => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 13, {
        animate: true,
        duration: 0.8
      });
    }
  }, [userLocation]);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('1234');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate slug helper
  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // remove special chars
      .replace(/\s+/g, '-')          // replace spaces with hyphens
      .replace(/-+/g, '-');         // remove multiple consecutive hyphens
    setSlug(generatedSlug);
  };

  const handleSlugChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setSlug(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !slug || !city || !country || !address) {
      setErrorMsg("All fields with an asterisk (*) are required.");
      return;
    }

    if (slug.length < 3) {
      setErrorMsg("URL Slug must be at least 3 characters.");
      return;
    }

    setIsSubmitting(true);
    const success = await createMosque(slug, name, city, country, phone, address, pin);
    setIsSubmitting(false);

    if (success) {
      // Form fields reset
      setName('');
      setSlug('');
      setCity('');
      setCountry('');
      setAddress('');
      setPhone('');
      setPin('1234');
      setIsFormOpen(false);
    } else {
      setErrorMsg("Failed to create the mosque. The URL slug may already be taken.");
    }
  };

  // Filter list of mosques
  const filteredMosques = allMosques.filter(m => {
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.city.toLowerCase().includes(q) ||
      m.country.toLowerCase().includes(q) ||
      m.slug.toLowerCase().includes(q)
    );
  });

  const isPremiumActive = subscription?.status === 'premium' || 
    subscription?.status === 'standard' || 
    (subscription?.status === 'trial' && subscription?.daysLeft > 0);

  const [searchRadius, setSearchRadius] = useState<number>(5); // 5 km default as requested

  // Automatically expand radius dynamically based on Firebase mosque distance limits
  useEffect(() => {
    if (!userLocation) return;

    // Filter mosques which have valid coordinates
    const firebaseWithDistance = allMosques.filter(m => m.latitude !== undefined && m.longitude !== undefined);
    if (firebaseWithDistance.length === 0) {
      setSearchRadius(50); // Fall back to search radius 50km
      return;
    }

    const distances = firebaseWithDistance.map(m => getDistanceKm(userLocation.lat, userLocation.lng, m.latitude!, m.longitude!));
    const minDistance = Math.min(...distances);

    if (minDistance <= 5) {
      setSearchRadius(5);
    } else if (minDistance <= 15) {
      setSearchRadius(15);
    } else {
      setSearchRadius(50);
    }
  }, [userLocation, allMosques]);

  // OSM Search Trigger: automatically queries OpenStreetMap Overpass API if Firebase yields no nearby mosques in range
  useEffect(() => {
    if (!userLocation) return;

    // Count how many Firebase mosques are inside current searchRadius
    const firebaseNearbyCount = allMosques.filter(m => {
      if (m.latitude === undefined || m.longitude === undefined) return false;
      const d = getDistanceKm(userLocation.lat, userLocation.lng, m.latitude, m.longitude);
      return d <= searchRadius;
    }).length;

    // Trigger OSM query if and only if Firebase has 0 nearby mosques!
    if (firebaseNearbyCount === 0) {
      const fetchOsm = async () => {
        setIsSearchingOsm(true);
        try {
          const radiusMeters = Math.min(searchRadius * 1000, 50000);
          const query = `[out:json];(node(around:${radiusMeters},${userLocation.lat},${userLocation.lng})["amenity"="place_of_worship"]["religion"="muslim"];);out;`;
          const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
          const response = await fetch(url);
          const data = await response.json();
          if (data && data.elements) {
            const parsed = data.elements.map((el: any) => {
              const subAddress = el.tags['addr:street'] 
                ? `${el.tags['addr:housenumber'] || ''} ${el.tags['addr:street']}`.trim()
                : '';
              const cityVal = el.tags['addr:city'] || el.tags['addr:province'] || 'Bangkok';
              const countryVal = el.tags['addr:country'] || 'Thailand';
              const fullAddress = [
                subAddress,
                el.tags['addr:suburb'] || el.tags['addr:district'],
                cityVal,
                countryVal
              ].filter(Boolean).join(', ');

              return {
                slug: `osm-${el.id}`,
                name: el.tags.name || el.tags['name:en'] || el.tags['name:th'] || "Local Masjid",
                city: cityVal,
                country: countryVal,
                address: fullAddress || "Near coordinates area",
                latitude: el.lat,
                longitude: el.lon,
                isOSM: true,
                prayers: [
                  { id: 'fajr', name: 'Fajr', adhan: '04:45', iqamahType: 'fixed', iqamahValue: '05:00' },
                  { id: 'dhuhr', name: 'Dhuhr', adhan: '12:20', iqamahType: 'fixed', iqamahValue: '12:30' },
                  { id: 'asr', name: 'Asr', adhan: '15:40', iqamahType: 'fixed', iqamahValue: '15:50' },
                  { id: 'maghrib', name: 'Maghrib', adhan: '18:35', iqamahType: 'fixed', iqamahValue: '18:40' },
                  { id: 'isha', name: 'Isha', adhan: '19:50', iqamahType: 'fixed', iqamahValue: '20:00' }
                ]
              };
            });
            setOsmMosques(parsed);
          }
        } catch (err) {
          console.error("OSM Overpass lookup failed:", err);
        } finally {
          setIsSearchingOsm(false);
        }
      };
      fetchOsm();
    } else {
      setOsmMosques([]);
    }
  }, [userLocation, searchRadius, allMosques]);

  // Merge primary Firebase mosques and secondary backup OSM mosques selectively (deduplicating duplicates)
  const mergedNearbyUnfiltered = [...allMosques];
  osmMosques.forEach((osm) => {
    const isDuplicate = allMosques.some((fb) => {
      if (fb.latitude !== undefined && fb.longitude !== undefined && osm.latitude !== undefined && osm.longitude !== undefined) {
        const d = getDistanceKm(fb.latitude, fb.longitude, osm.latitude, osm.longitude);
        if (d < 0.25) return true; // duplicate if within 250 meters
      }
      const normFb = fb.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normOsm = osm.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normFb === normOsm || normFb.includes(normOsm) || normOsm.includes(normFb)) return true;
      return false;
    });
    if (!isDuplicate) {
      mergedNearbyUnfiltered.push(osm);
    }
  });

  // Calculate nearby list of mosques dynamically sorted by distance ASC
  const nearbyMosquesUnfiltered = mergedNearbyUnfiltered
    .map(m => {
      let distance = 99999;
      if (userLocation && m.latitude !== undefined && m.longitude !== undefined) {
        distance = getDistanceKm(userLocation.lat, userLocation.lng, m.latitude, m.longitude);
      }
      return { ...m, distance };
    })
    .sort((a, b) => a.distance - b.distance);

  // Filter nearby mosques strictly within range to avoid showing random far-away ones
  const nearbyMosques = nearbyMosquesUnfiltered.filter(m => m.distance <= searchRadius);

  const nearbySuggested = nearbyMosques;

  // Premium allows unlimited nearby results, free is limited to 3 (showing 3 nearest mosques max)
  const displayedNearby = isPremiumActive ? nearbyMosques : nearbyMosques.slice(0, 3);

  // Sync Leaflet markers and popup info reactively
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markerGroup = markerGroupRef.current;
    if (!map || !markerGroup) return;

    markerGroup.clearLayers();

    // Plot user Location Marker
    if (userLocation) {
      const uMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userLocationIcon
      }).bindPopup(`
        <div style="color: #cbd5e1; font-family: system-ui, sans-serif; font-size: 11px; padding: 2px;">
          <strong style="color: #60a5fa; font-size: 12px; display: block; margin-bottom: 2px;">📍 Your Location</strong>
          <span style="color: #94a3b8;">GPS Coordinates Active.</span>
        </div>
      `);
      markerGroup.addLayer(uMarker);
    }

    // Plot Mosque Markers (Plot ALL within physical radius so users can explore, but keep list interaction separate)
    nearbyMosques
      .filter(m => m.latitude !== undefined && m.longitude !== undefined)
      .forEach(m => {
        const isSelected = selectedMapMosque === m.slug;
        const mosqueMarker = L.marker([m.latitude!, m.longitude!], {
          icon: getMosqueIcon(isSelected, m.isOSM)
        });

        // 1. Calculate estimated times
        let estimatedTimesHtml = '';
        if (m.distance !== undefined && m.distance !== 99999) {
          const d = m.distance;
          const distanceStr = d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)} km`;
          const drivingMins = Math.max(1, Math.round(d * 3));
          const walkingMins = Math.max(1, Math.round(d * 12));
          estimatedTimesHtml = `
            <div style="display: flex; flex-wrap: wrap; gap: 6px; font-size: 9px; color: #a1a1aa; margin: 4px 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
              <span style="color: #fbbf24; font-weight: 700;">📍 ${distanceStr} away</span>
              <span style="color: #4b5563;">•</span>
              <span>🚗 ${drivingMins} min drive</span>
              <span style="color: #4b5563;">•</span>
              <span>🚶 ${walkingMins} min walk</span>
            </div>
          `;
        }

        // 2. Build phone number html
        const phoneHtml = m.phone 
          ? `<div style="font-size: 10px; color: #cbd5e1; margin: 4px 0; display: flex; align-items: center; gap: 4px;">📞 <span>${m.phone}</span></div>` 
          : '';

        // 3. Build prayer and iqamah schedules grid
        let prayersHtml = '';
        if (m.prayers && m.prayers.length > 0) {
          prayersHtml = `
            <div style="margin: 8px 0; background: rgba(0,0,0,0.5); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: 8px; padding: 6px; font-family: system-ui, sans-serif; min-width: 170px;">
              <div style="display: grid; grid-template-columns: 1.8fr 1.1fr 1.1fr; font-size: 8px; font-weight: 750; text-transform: uppercase; color: #6b7280; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 3px; margin-bottom: 4px;">
                <span>Prayer</span>
                <span style="text-align: center;">Adhan</span>
                <span style="text-align: right;">Iqamah</span>
              </div>
              ${m.prayers.slice(0, 5).map((p: any) => {
                const isFixed = p.iqamahType === 'fixed';
                const iqVal = isFixed ? p.iqamahValue : `+${p.iqamahValue}m`;
                return `
                  <div style="display: grid; grid-template-columns: 1.8fr 1.1fr 1.1fr; font-size: 10px; color: #e2e8f0; line-height: 1.5; align-items: center;">
                    <span style="font-weight: 600; color: #94a3b8;">${p.name}</span>
                    <span style="text-align: center; font-family: monospace; color: #fbbf24; font-weight: bold;">${p.adhan}</span>
                    <span style="text-align: right; font-family: monospace; color: #10b981; font-weight: bold;">${iqVal}</span>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        } else {
          prayersHtml = `
            <div style="margin: 8px 0; background: rgba(255,255,255,0.03); border-radius: 6px; padding: 6.5px; font-size: 9px; text-align: center; color: #71717a; font-family: system-ui, sans-serif;">
              Monitored times not loaded. Launch dashboard config to synchronize calculations.
            </div>
          `;
        }

        // 4. Create action buttons
        const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${m.latitude},${m.longitude}`;
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation ? `${userLocation.lat},${userLocation.lng}` : ''}&destination=${m.latitude},${m.longitude}`;

        const buttonsHtml = `
          <div style="margin-top: 8px; display: flex; flex-direction: column; gap: 5px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 6px; font-family: system-ui, sans-serif;">
            <div style="display: flex; gap: 4px;">
              <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #059669; color: #ffffff !important; padding: 5px 6px; border-radius: 6px; font-weight: 700; text-decoration: none !important; font-size: 9px; border: 1px solid #10b981; display: inline-block;">
                📍 Directions
              </a>
              <a href="${googleMapsSearchUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background: #1e293b; color: #cbd5e1 !important; padding: 5px 6px; border-radius: 6px; font-weight: 600; text-decoration: none !important; font-size: 9px; border: 1px solid #334155; display: inline-block;">
                🗺️ Google Maps
              </a>
            </div>
            <button onclick="window.handleMapConnect('${m.slug}')" style="width: 100%; text-align: center; background: #fbbf24; color: #022c22 !important; padding: 6px 10px; border-radius: 6px; font-weight: 700; border: none; font-size: 9.5px; cursor: pointer; transition: background 0.1s ease; display: block; box-shadow: 0 2px 4px rgba(0,0,0,0.15);">
              🖥️ Open Mosque Dashboard
            </button>
          </div>
        `;

        const popupContent = `
          <div style="color: #f1f5f9; font-family: system-ui, -apple-system, sans-serif; font-size: 11px; padding: 4px; border-radius: 8px; min-width: 190px; max-width: 230px;">
            <h4 style="font-weight: 750; font-size: 13.5px; color: #d4af37; margin: 0 0 3px 0; line-height: 1.25; font-family: Georgia, serif;">${m.name}</h4>
            <p style="color: #94a3b8; font-size: 9.5px; margin: 0 0 4px 0; line-height: 1.3;">${m.address || `${m.city}, ${m.country}`}</p>
            ${estimatedTimesHtml}
            ${phoneHtml}
            ${prayersHtml}
            ${buttonsHtml}
          </div>
        `;

        mosqueMarker.bindPopup(popupContent, { maxWidth: 240, className: 'dark-mosque-popup' });

        // Add visible name directly on the map using permanent tooltip when zoomed in mapZoom >= 13
        mosqueMarker.bindTooltip(m.name, {
          permanent: mapZoom >= 13,
          direction: 'bottom',
          className: 'custom-mosque-tooltip',
          offset: [0, 8]
        });

        mosqueMarker.on('click', () => {
          setSelectedMapMosque(m.slug);
        });

        markerGroup.addLayer(mosqueMarker);

        if (isSelected) {
          setTimeout(() => {
            mosqueMarker.openPopup();
          }, 100);
        }
      });
  }, [nearbyMosques, userLocation, selectedMapMosque, mapZoom]);

  // Pan smoothly on active selection or change in user coordinates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedMapMosque) {
      const selected = nearbyMosques.find(m => m.slug === selectedMapMosque);
      if (selected && selected.latitude !== undefined && selected.longitude !== undefined) {
        map.setView([selected.latitude, selected.longitude], isPremiumActive ? 15 : 13, {
          animate: true,
          duration: 0.8
        });
      }
    } else if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], isPremiumActive ? 13 : 13, {
        animate: true,
        duration: 0.8
      });
    }
  }, [selectedMapMosque, userLocation, nearbyMosques]);

  const isSearching = searchQuery.trim() !== '';
  const searchResults = isSearching
    ? allMosques.filter(m => {
        const q = searchQuery.toLowerCase().trim();
        return (
          m.name.toLowerCase().includes(q) ||
          m.city.toLowerCase().includes(q) ||
          m.country.toLowerCase().includes(q) ||
          m.slug.toLowerCase().includes(q)
        );
      })
    : [];

  return (
    <div className="min-h-screen bg-[#06140E] bg-radial-[at_top_right] from-[#0E2E1F] via-[#06140E] to-[#030A07] text-stone-200 py-6 md:py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Top-Right Header Bar */}
        <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4 md:mb-8">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
              <svg viewBox="0 0 100 100" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="tatouGold" x1="15%" y1="15%" x2="85%" y2="85%">
                    <stop offset="0%" stopColor="#FFECA1" />
                    <stop offset="40%" stopColor="#E9C149" />
                    <stop offset="70%" stopColor="#C39A2B" />
                    <stop offset="100%" stopColor="#87620F" />
                  </linearGradient>
                </defs>
                <path 
                  d="M62 18 C41 18 24 35 24 56 C24 77 41 94 62 94 C48 94 36 82 36 56 C36 30 48 18 62 18 Z" 
                  fill="url(#tatouGold)" 
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-widest text-[#D4AF37] font-serif uppercase leading-none">
                Tatou Masjid
              </span>
              <span className="text-[8px] uppercase tracking-wide text-stone-400 font-mono mt-1">
                Sanctuary Directory
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={() => selectMosque('register-mosque')}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/5 transition-all cursor-pointer font-sans"
              >
                Register Mosque
              </button>
              <button
                onClick={() => selectMosque('admin-login')}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-[#D4AF37] hover:text-amber-300 hover:bg-[#D4AF37]/5 transition-all cursor-pointer font-sans"
              >
                Admin Login
              </button>
              {isSuperAdmin && (
                <button
                  onClick={() => selectMosque('super-admin')}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-purple-500/5 transition-all cursor-pointer font-sans"
                >
                  Super Admin
                </button>
              )}
            </div>
            <AuthMenu 
              onEnterAdminConsole={() => setIsFormOpen(!isFormOpen)}
            />
          </div>
        </div>
        
        {/* Header Block with elegant Islamic geometric mood */}
        <div className="text-center relative py-8 mb-12">
          {/* Subtle Arch decorative layout in bg */}
          <div className="absolute inset-0 flex justify-center opacity-5 pointer-events-none -top-6">
            <svg viewBox="0 0 100 100" fill="currentColor" className="w-48 h-48 text-emerald-400">
              <path d="M50,0 C75,25 100,50 100,100 L0,100 C0,50 25,25 50,0 Z" />
            </svg>
          </div>

          <div className="flex justify-center mb-4">
            <div className="p-1 bg-amber-500/5 rounded-full border border-amber-500/20 shadow-[0_0_25px_rgba(212,175,55,0.06)] animate-pulse">
              <svg viewBox="0 0 100 100" className="w-16 h-16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="headerGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFECA1" />
                    <stop offset="50%" stopColor="#D4AF37" />
                    <stop offset="100%" stopColor="#AA7C11" />
                  </linearGradient>
                  <filter id="crescentGlowHeader" x="-10%" y="-10%" width="120%" height="120%">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                {/* Thin golden background geometry */}
                <circle cx="50" cy="50" r="42" stroke="url(#headerGoldGrad)" strokeWidth="0.5" strokeDasharray="3 6" className="opacity-30" />
                <circle cx="50" cy="50" r="39" stroke="url(#headerGoldGrad)" strokeWidth="0.25" className="opacity-20" />
                
                {/* Handcrafted Golden Crescent */}
                <path 
                  d="M56 26 C39 26 26 39 26 56 C26 73 39 86 56 86 C44 86 34 76 34 56 C34 36 44 26 56 26 Z" 
                  fill="url(#headerGoldGrad)"
                  filter="url(#crescentGlowHeader)"
                  className="drop-shadow-[0_2px_10px_rgba(212,175,55,0.4)]"
                />

                {/* Sparkling 8-Point Star nestled nicely */}
                <g transform="translate(62, 54) scale(0.8)">
                  <polygon points="-8,0 0,-8 8,0 0,8" fill="url(#headerGoldGrad)" />
                  <polygon points="-5.65,-5.65 5.65,-5.65 5.65,5.65 -5.65,5.65" fill="url(#headerGoldGrad)" />
                  <circle cx="0" cy="0" r="1.5" fill="#FFF" className="animate-ping" style={{ animationDuration: '2.5s' }} />
                </g>
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold font-serif text-[#D4AF37] tracking-tight mt-0">
            Islamic Sanctuary Boards
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 max-w-2xl mx-auto mt-2 leading-relaxed">
            Beautifully synchronizing adhan time calculations, manual overrides, and scrolling bulletin announcements on secondary lobby TVs worldwide.
          </p>

          {/* Quick-action buttons for smaller mobile dimensions */}
          <div className="flex sm:hidden justify-center gap-2.5 mt-5">
            <button
              onClick={() => selectMosque('register-mosque')}
              className="px-3 py-1.5 rounded-lg border border-emerald-500/20 text-emerald-400 bg-emerald-500/5 text-xs font-semibold tracking-wide font-sans cursor-pointer active:scale-95 transition-all"
              id="mobile-register-mosque-btn"
            >
              Register Mosque
            </button>
            <button
              onClick={() => selectMosque('admin-login')}
              className="px-3 py-1.5 rounded-lg border border-yellow-500/20 text-[#D4AF37] bg-yellow-500/5 text-xs font-semibold tracking-wide font-sans cursor-pointer active:scale-95 transition-all"
              id="mobile-admin-login-btn"
            >
              Admin Login
            </button>
            {isSuperAdmin && (
              <button
                onClick={() => selectMosque('super-admin')}
                className="px-3 py-1.5 rounded-lg border border-purple-500/20 text-purple-400 bg-purple-500/5 text-xs font-semibold tracking-wide font-sans cursor-pointer active:scale-95 transition-all"
                id="mobile-super-admin-btn"
              >
                Super Admin
              </button>
            )}
          </div>
        </div>

        {/* Mosques Near You Section */}
        <div id="mosques-near-you-section" className="mb-12 bg-emerald-950/20 border border-emerald-500/10 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
          {/* Ambient header line */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-emerald-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <Compass className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-[#D4AF37]">
                  Mosques Near You
                </h2>
                <p className="text-xs text-stone-400">
                  Discover local prayer schedules and live displays based on your physical location.
                </p>
              </div>
            </div>

            {/* Location Permission button */}
            {locationPermissionState !== 'granted' ? (
              <button
                onClick={requestLocation}
                disabled={isLocating}
                className="px-4 py-2 bg-[#D4AF37] hover:bg-[#FFECA1] disabled:bg-stone-600 disabled:text-stone-300 text-stone-900 font-medium text-xs rounded-xl transition duration-150 flex items-center justify-center gap-2 border border-yellow-300/20 shadow-[0_4px_12px_rgba(212,175,55,0.15)] cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                {isLocating ? "Acquiring GPS..." : "Find Nearest Mosques"}
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/15 py-1 px-3 rounded-full text-[11px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>GPS Active {detectedCity ? `• ${detectedCity}` : ''}</span>
              </div>
            )}
          </div>

          {/* Conditional Layouts */}
          {locationPermissionState !== 'granted' ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-full mb-4">
                <MapPin className="w-10 h-10 text-amber-500/80" />
              </div>
              <p className="text-sm text-stone-300 max-w-md leading-relaxed mb-4">
                Allow <strong>TatouMasjid</strong> to access your temporary GPS position to see local sanctuaries, current distances, and live times. Your location is handled strictly inside the browser and is never stored on our servers.
              </p>
              <button
                onClick={requestLocation}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl tracking-wide transition shadow-lg cursor-pointer"
              >
                Allow Location Access
              </button>
            </div>
          ) : (
            <div>
              {/* Discovery & Advanced Controls Panel */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-black/30 rounded-xl border border-white/5 mb-5">
                <div className="flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="text-[11px] font-semibold text-stone-300">Discovery Controls:</span>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  {/* Radius selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-400 font-mono">Radius Range:</span>
                    <div className="flex items-center bg-black/40 p-0.5 rounded-lg border border-white/10">
                      {[5, 15, 50].map((radius) => {
                        const isSelected = searchRadius === radius;
                        const isAllowed = radius <= 15 || isPremiumActive;

                        return (
                          <button
                            key={radius}
                            type="button"
                            onClick={() => {
                              if (isAllowed) {
                                setSearchRadius(radius);
                              } else {
                                alert("Choosing ranges larger than 15 km is a Premium Feature. Try adjusting your trial profile or upgrade package.");
                              }
                            }}
                            className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                              isSelected 
                                ? 'bg-emerald-600 text-white shadow-md' 
                                : 'text-stone-400 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <span>{radius} km</span>
                            {!isAllowed && <Lock className="w-2.5 h-2.5 text-stone-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Limits indicator */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-stone-400 font-mono">Tier:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                      isPremiumActive 
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(212,175,55,0.05)]' 
                        : 'bg-stone-500/10 text-stone-400 border border-stone-500/25'
                    }`}>
                      {isPremiumActive ? "Premium (Unlimited)" : "Free (3 Max)"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
                {/* Nearby list Column (7/12) */}
                <div className="md:col-span-7 space-y-4 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
                  {displayedNearby.length === 0 ? (
                    <div className="text-center py-12 rounded-xl bg-black/20 border border-white/5 max-w-md mx-auto text-stone-400 text-sm">
                      <Compass className="w-8 h-8 text-stone-500 mx-auto mb-2 animate-pulse" />
                      No mosques found within a {searchRadius} km radius of your location.
                      <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto leading-normal">
                        Try expanding the radius control or search manually in the bar below.
                      </p>
                    </div>
                  ) : (
                    <>
                      {displayedNearby.map((mosque, idx) => {
                        // Render custom prayer grids for mosques
                        const distanceStr = mosque.distance !== undefined && mosque.distance !== 99999
                          ? mosque.distance < 1
                            ? `${Math.round(mosque.distance * 1000)}m away`
                            : `${mosque.distance.toFixed(1)} km away`
                          : 'Distance unavailable';

                        return (
                          <div 
                            key={mosque.slug}
                            id={`mosque-nearby-card-${mosque.slug}`}
                            className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                              selectedMapMosque === mosque.slug 
                                ? 'bg-emerald-950/40 border-[#D4AF37]/50 shadow-lg relative z-10 scale-[1.01]' 
                                : 'bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10'
                            }`}
                            onClick={() => setSelectedMapMosque(mosque.slug)}
                          >
                            <div className="flex justify-between items-start gap-3 mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  {idx === 0 && (
                                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded shrink-0">
                                      Nearest
                                    </span>
                                  )}
                                  <h3 className="font-serif font-semibold text-stone-100 text-base md:text-lg mt-0 leading-tight">
                                    {mosque.name}
                                  </h3>
                                </div>
                                <p className="text-xs text-stone-400 flex items-center gap-1.5 mt-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                                  <span className="truncate max-w-[200px] sm:max-w-xs">{mosque.address || `${mosque.city}, ${mosque.country}`}</span>
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 py-0.5 px-2 rounded-full">
                                  {distanceStr}
                                </span>
                              </div>
                            </div>

                            {/* Compact prayer schedule */}
                            {mosque.prayers && mosque.prayers.length > 0 && (
                              <div className="grid grid-cols-5 gap-1 my-3 bg-black/20 p-2 rounded-lg border border-white/5">
                                {mosque.prayers.slice(0, 5).map(p => {
                                  const isFixed = p.iqamahType === 'fixed';
                                  const iqVal = isFixed ? p.iqamahValue : `+${p.iqamahValue}m`;
                                  return (
                                    <div key={p.id} className="text-center p-1">
                                      <div className="text-[9px] uppercase text-stone-400 font-mono tracking-wider font-semibold">{p.name}</div>
                                      <div className="text-xs font-bold text-stone-200 mt-0.5">{p.adhan}</div>
                                      <div className="text-[9px] text-amber-400 font-mono mt-0.5">{iqVal}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectMosque(mosque.slug);
                                }}
                                className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition duration-150 flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                                Connect Monitor
                              </button>
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation ? `${userLocation.lat},${userLocation.lng}` : ''}&destination=${mosque.latitude},${mosque.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="h-9 px-3 bg-white/5 hover:bg-white/10 text-stone-300 font-semibold text-xs rounded-lg border border-white/10 transition duration-150 flex items-center justify-center gap-1 decoration-transparent whitespace-nowrap"
                              >
                                <Navigation className="w-3 h-3" />
                                Directions
                              </a>
                            </div>
                          </div>
                        );
                      })}

                      {/* Paywall locked upgrade footer for Free users */}
                      {!isPremiumActive && nearbyMosques.length > 3 && (
                        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/10 text-center space-y-2 mt-4">
                          <div className="flex items-center justify-center gap-1.5 text-[#D4AF37] font-semibold text-xs">
                            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                            <span>Unlock more nearby mosques and full map ranges</span>
                          </div>
                          <p className="text-[10px] text-stone-300 max-w-md mx-auto leading-relaxed font-sans">
                            You are currently on the Free Tier and can only discover up to 3 nearby mosques. Upgrade to Standard or Premium to seek all local sanctuaries, enjoy full maps, and use custom radius ranges!
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Dynamic Map Column (5/12) */}
                <div className="md:col-span-5 h-[340px] md:h-auto min-h-[300px] rounded-xl overflow-hidden border border-white/5 relative bg-[#07100D] shadow-inner font-sans text-slate-800 z-10">
                  <div ref={mapContainerRef} className="w-full h-full animate-fade-in" style={{ minHeight: '300px' }} />
                  {isSearchingOsm && (
                    <div className="absolute top-2.5 right-2.5 bg-black/85 text-[10px] font-mono text-emerald-400 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-md shadow-lg z-[1000] animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                      <span>Querying OpenStreetMap...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic directory panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Directory Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search and Top Row */}
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative flex-grow w-full">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-500" />
                <input
                  type="text"
                  placeholder="Search by name, city, or country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-black/40 border border-white/10 text-xs font-medium text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
                  id="search-mosques-input"
                />
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => {
                    requestLocation();
                    const element = document.getElementById('mosques-near-you-section');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="h-11 px-4 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/20 font-sans text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md select-none cursor-pointer whitespace-nowrap"
                  id="toggle-create-form-btn"
                >
                  <Compass className="w-4 h-4 text-[#D4AF37] animate-spin-slow" />
                  <span>Mosques Near You</span>
                </button>
              </div>
            </div>

            {/* Suggestions / Results below Search Bar */}
            {isSearching ? (
              // Search Mode: Display dynamically filtered mosque results matching the search query
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs text-stone-400 font-medium">
                    Search Results for "{searchQuery}"
                  </span>
                </div>
                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {searchResults.map((mosque) => {
                      const mosqueWithDistance = nearbyMosques.find(m => m.slug === mosque.slug);
                      const distance = mosqueWithDistance?.distance;
                      const distanceStr = distance !== undefined && distance !== 99999
                        ? distance < 1
                          ? `${Math.round(distance * 1000)}m away`
                          : `${distance.toFixed(1)} km away`
                        : null;

                      return (
                        <div
                          key={mosque.slug}
                          onClick={() => selectMosque(mosque.slug)}
                          className="p-5 rounded-2xl bg-stone-900/40 border border-white/5 hover:border-[#D4AF37]/35 hover:bg-black/40 transition-all duration-300 cursor-pointer flex flex-col justify-between group shadow-lg group-hover:shadow-[#D4AF37]/5"
                          id={`mosque-card-${mosque.slug}`}
                        >
                          <div>
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 lowercase tracking-wider">
                                /{mosque.slug}
                              </span>
                              {distanceStr && (
                                <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 py-0.5 px-2 rounded-full">
                                  {distanceStr}
                                </span>
                              )}
                            </div>

                            <h3 className="text-base font-bold text-white font-serif tracking-tight leading-snug group-hover:text-[#D4AF37] transition-colors mt-0">
                              {mosque.name}
                            </h3>

                            <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-2 font-sans">
                              <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                              <span>{mosque.city || "Various"}, {mosque.country || "Global"}</span>
                            </div>

                            {/* Compact prayer schedule inside card */}
                            {mosque.prayers && mosque.prayers.length > 0 && (
                              <div className="grid grid-cols-5 gap-1 mt-4 mb-1 bg-black/35 p-2 rounded-xl border border-white/5">
                                {mosque.prayers.slice(0, 5).map(p => {
                                  const isFixed = p.iqamahType === 'fixed';
                                  const iqVal = isFixed ? p.iqamahValue : `+${p.iqamahValue}m`;
                                  return (
                                    <div key={p.id} className="text-center p-0.5">
                                      <div className="text-[8px] uppercase text-stone-400 font-mono tracking-wider font-semibold">{p.name}</div>
                                      <div className="text-[11px] font-bold text-stone-200 mt-0.5">{p.adhan}</div>
                                      <div className="text-[8px] text-amber-500/90 font-mono mt-0.5">{iqVal}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-[#D4AF37]">
                            <span>Connect Monitor</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center rounded-2xl bg-black/20 border border-white/5">
                    <p className="text-stone-400 text-sm">No synchronized mosques match your search query.</p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-3 text-xs font-semibold text-[#D4AF37] hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Empty Search: Automatically show nearby suggested mosques based on user location
              <div className="space-y-4">
                {locationPermissionState === 'granted' && userLocation ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
                      <span className="text-xs text-stone-300 font-semibold font-serif">
                        Suggested Mosques Near You
                      </span>
                    </div>

                    {nearbySuggested.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {nearbySuggested.map((mosque, idx) => {
                          const distanceStr = mosque.distance !== undefined && mosque.distance !== 99999
                            ? mosque.distance < 1
                              ? `${Math.round(mosque.distance * 1000)}m away`
                              : `${mosque.distance.toFixed(1)} km away`
                            : 'Distance unavailable';

                          return (
                            <div
                              key={mosque.slug}
                              onClick={() => selectMosque(mosque.slug)}
                              className="p-5 rounded-2xl bg-stone-900/40 border border-white/5 hover:border-[#D4AF37]/35 hover:bg-black/40 transition-all duration-300 cursor-pointer flex flex-col justify-between group shadow-lg group-hover:shadow-[#D4AF37]/5"
                              id={`mosque-card-suggested-${mosque.slug}`}
                            >
                              <div>
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 lowercase tracking-wider">
                                      /{mosque.slug}
                                    </span>
                                    {idx === 0 && (
                                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded">
                                        Nearest
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 py-0.5 px-2 rounded-full">
                                    {distanceStr}
                                  </span>
                                </div>

                                <h3 className="text-base font-bold text-white font-serif tracking-tight leading-snug group-hover:text-[#D4AF37] transition-colors mt-0">
                                  {mosque.name}
                                </h3>

                                <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-2 font-sans">
                                  <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                                  <span>{mosque.city || "Various"}, {mosque.country || "Global"}</span>
                                </div>

                                {/* Compact prayer schedule with prayer times */}
                                {mosque.prayers && mosque.prayers.length > 0 && (
                                  <div className="grid grid-cols-5 gap-1 mt-4 mb-1 bg-black/35 p-2 rounded-xl border border-white/5">
                                    {mosque.prayers.slice(0, 5).map(p => {
                                      const isFixed = p.iqamahType === 'fixed';
                                      const iqVal = isFixed ? p.iqamahValue : `+${p.iqamahValue}m`;
                                      return (
                                        <div key={p.id} className="text-center p-0.5">
                                          <div className="text-[8px] uppercase text-stone-400 font-mono tracking-wider font-semibold">{p.name}</div>
                                          <div className="text-[11px] font-bold text-stone-200 mt-0.5">{p.adhan}</div>
                                          <div className="text-[8px] text-amber-500/90 font-mono mt-0.5">{iqVal}</div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-[#D4AF37]">
                                <span>Connect Monitor</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center rounded-2xl bg-black/20 border border-white/5">
                        <p className="text-stone-400 text-sm">No mosques found nearby (within 500 km).</p>
                        <p className="text-stone-500 text-xs mt-1">Please type a name, city, or country in the search bar above to search manually.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Location not detected or permission denied
                  <div className="p-8 text-center rounded-2xl bg-black/25 border border-white/5 flex flex-col items-center justify-center">
                    <div className="p-3 bg-emerald-500/5 rounded-full mb-3 text-emerald-400/80 border border-emerald-500/10">
                      <Compass className="w-6 h-6 animate-pulse" />
                    </div>
                    <p className="text-stone-300 text-sm font-serif font-medium">Discover Sanctuaries Near You</p>
                    <p className="text-stone-400 text-xs mt-2 max-w-sm leading-relaxed">
                      Allow GPS-location detection to show the mosques closest to you instantly, or start typing in the search bar above to look up any mosque.
                    </p>
                    <button
                      onClick={requestLocation}
                      className="mt-4 px-4 py-2 bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-xl transition cursor-pointer"
                    >
                      Enable Location Detection
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form & Sidebar Column */}
          <div className="space-y-6">
            
            {/* Direct dynamic form render */}
            <AnimatePresence mode="wait">
              {isFormOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="p-6 rounded-2xl bg-stone-900/60 border border-[#D4AF37]/20 shadow-2xl relative"
                >
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-1.5 font-serif mt-0">
                    <PlusCircle className="w-4 h-4 text-[#D4AF37]" />
                    Register Your Sanctuary
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    {errorMsg && (
                      <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex gap-1.5">
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>{errorMsg}</div>
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Mosque Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Al-Noor Islamic Center"
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-black/60 border border-white/10 text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                        id="form-mosque-name"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-mono text-[#D4AF37] block mb-1">URL Address path Slug *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-mono text-stone-500 select-none">/</span>
                        <input
                          type="text"
                          placeholder="e.g. al-noor-center"
                          value={slug}
                          onChange={(e) => handleSlugChange(e.target.value)}
                          className="w-full h-10 pl-6 pr-3 rounded-lg bg-black/60 border border-white/15 text-xs text-amber-300 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          required
                          id="form-mosque-slug"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">City *</label>
                        <input
                          type="text"
                          placeholder="e.g. Cardiff"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg bg-black/60 border border-white/10 text-xs text-white"
                          required
                          id="form-mosque-city"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Country *</label>
                        <input
                          type="text"
                          placeholder="e.g. Wales"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg bg-black/60 border border-white/10 text-xs text-white"
                          required
                          id="form-mosque-country"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Street Address *</label>
                      <input
                        type="text"
                        placeholder="e.g. 52 Castle Way, CF10 1BS"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-black/60 border border-white/10 text-xs text-white"
                        required
                        id="form-mosque-address"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Inquiries Phone Number</label>
                      <input
                        type="text"
                        placeholder="e.g. +44 29 2048 0122"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-black/60 border border-white/10 text-xs text-white font-mono"
                        id="form-mosque-phone"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-mono text-stone-400 block mb-1">Admin console passcode PIN</label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="e.g. 1234"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full h-10 px-3 rounded-lg bg-black/60 border border-[#D4AF37]/15 text-xs text-[#D4AF37] font-mono tracking-widest font-semibold"
                        id="form-mosque-pin"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-bold active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 select-none cursor-pointer mt-5"
                      id="submit-register-btn"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      <span>{isSubmitting ? "Provisioning..." : "Launch Board Terminal"}</span>
                    </button>
                  </form>
                </motion.div>
              ) : (
                <div className="p-6 rounded-2xl bg-stone-900/30 border border-white/5 space-y-4">
                  <h3 className="text-base font-bold text-white font-serif mt-0">
                    Administrator QuickStart
                  </h3>
                  <p className="text-[11px] text-stone-400 leading-relaxed font-sans">
                    Setting up a synchronized TV screen in your masjid lobby takes less than two minutes. Click <button onClick={() => setIsFormOpen(true)} className="text-[#D4AF37] hover:underline font-bold bg-transparent border-none p-0 inline cursor-pointer">Register Your Sanctuary</button> to configure coordinates for automated prayer computations and broadcast live instantly.
                  </p>
                  
                  <div className="p-3.5 bg-black/20 rounded-xl border border-white/5 flex gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 shrink-0 animate-ping"></div>
                    <p className="text-[10px] text-stone-300 leading-relaxed">
                      All dashboards fully support **real-time cloud synchronization**. Any adjustment saved in the administrative console synchronizes loaded lobby screens on physical monitors within milliseconds.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>
    </div>
  );
};
