import React, { createContext, useContext, useState, useEffect } from 'react';
import { SyncData, PrayerTime, JummahSession, Announcement, IslamicQuote, MosqueConfig } from './types';
import { initialSyncData } from './initialData';
import { calculatePrayersForMosque } from './utils';
import { db, auth, rtdb, isFirebaseEnabled, handleFirestoreError, OperationType, GoogleAuthProvider, signInWithPopup, signOut, signInAnonymously } from './firebase';
import { doc, onSnapshot, setDoc, collection, getDocs } from 'firebase/firestore';
import { ref, onValue, update, set } from 'firebase/database';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';

interface AllMosqueMeta {
  slug: string;
  name: string;
  city: string;
  country: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  prayers?: PrayerTime[];
  jummah?: JummahSession[];
  phone?: string;
  approvalStatus?: 'Pending Approval' | 'Approved' | 'Disabled';
  subscriptionPlan?: 'trial' | 'basic' | 'standard' | 'premium' | 'expired';
}

interface DashboardContextType {
  data: SyncData;
  isLoading: boolean;
  isFirebaseActive: boolean;
  isAdmin: boolean;
  adminUser: User | null;
  pinAuthenticated: boolean;
  authenticatePIN: (pin: string) => boolean;
  clearPINAuthentication: () => void;
  loginWithGoogle: () => Promise<void>;
  registerWithEmailAndPass: (email: string, pass: string, name: string) => Promise<void>;
  loginWithEmailAndPass: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Multi-mosque dynamic selection properties
  mosqueSlug: string;
  allMosques: AllMosqueMeta[];
  selectMosque: (slug: string) => void;
  createMosque: (slug: string, name: string, city: string, country: string, phone: string, address: string, pin: string) => Promise<boolean>;
  refreshAllMosques: () => Promise<void>;
  
  updatePrayerTime: (id: string, updates: Partial<PrayerTime>) => Promise<void>;
  updateJummah: (id: string, updates: Partial<JummahSession>) => Promise<void>;
  updateConfig: (updates: Partial<MosqueConfig>) => Promise<void>;
  addAnnouncement: (title: string, content: string) => Promise<void>;
  updateAnnouncement: (id: string, title: string, content: string) => Promise<void>;
  toggleAnnouncement: (id: string) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  addQuote: (text: string, source: string) => Promise<void>;
  updateQuote: (id: string, text: string, source: string) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  saveManualPrayerTimes: (
    automaticCalculationEnabled: boolean,
    prayers: PrayerTime[],
    jummah: JummahSession[]
  ) => Promise<void>;

  // Subscription and Free trial fields
  subscription: {
    status: 'trial' | 'basic' | 'standard' | 'premium' | 'expired';
    trialStartDate: string;
    expirationDate: string;
    packageType: 'None' | 'Basic' | 'Standard' | 'Premium';
    daysLeft: number;
  };
  upgradeSubscription: (plan: 'Basic' | 'Standard' | 'Premium') => Promise<void>;
  simulateExpiration: () => Promise<void>;
  simulateResetTrial: () => Promise<void>;

  // Mosque SaaS Systems Integration
  isSuperAdmin: boolean;
  mosqueAdmin: { email: string; slug: string } | null;
  submitRegistration: (fields: { mosqueName: string; managerName: string; email: string; phone: string; city: string; country: string; address: string }) => Promise<boolean>;
  getRegistrations: () => Promise<any[]>;
  updateRegistrationStatus: (regId: string, status: 'Approved' | 'Rejected', plan?: string) => Promise<any>;
  requestLoginOTP: (email: string) => Promise<{ success: boolean; error?: string; code?: string }>;
  verifyLoginOTP: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  loginMosqueAdmin: (code: string, pass: string) => Promise<boolean>;
  logoutMosqueAdmin: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'mosque_dashboard_state';
const PIN_AUTH_KEY = 'mosque_pin_authenticated_session';
const FIRESTORE_COLLECTION = 'mosqueData';

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & slug setup
  const [mosqueSlug, setMosqueSlug] = useState<string>(() => {
    const parts = window.location.pathname.split('/').filter(Boolean);
    return parts.length > 0 ? parts[0] : '';
  });

  const [data, setData] = useState<SyncData>(() => {
    // Attempt to load from offline cache based on current URL path slug immediately
    const parts = window.location.pathname.split('/').filter(Boolean);
    const initialSlug = parts.length > 0 ? parts[0] : '';
    if (initialSlug) {
      const offlineDict = JSON.parse(localStorage.getItem('mosque_offline_dict') || '{}');
      if (offlineDict[initialSlug]) {
        return offlineDict[initialSlug];
      }
    }
    return { ...initialSyncData };
  });

  const [allMosques, setAllMosques] = useState<AllMosqueMeta[]>([]);
  const [isLoading, setIsLoading] = useState(() => {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const initialSlug = parts.length > 0 ? parts[0] : '';
    if (!initialSlug) return false;
    const offlineDict = JSON.parse(localStorage.getItem('mosque_offline_dict') || '{}');
    return !offlineDict[initialSlug];
  });
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [simulatedUser, setSimulatedUser] = useState<any>(() => {
    const cached = localStorage.getItem('mosque_simulated_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [pinAuthenticated, setPinAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(PIN_AUTH_KEY) === 'true';
  });
  const [rtdbData, setRtdbData] = useState<any>(null);

  const [mosqueAdmin, setMosqueAdmin] = useState<{ email: string; slug: string } | null>(() => {
    const cached = localStorage.getItem('mosque_admin_session');
    return cached ? JSON.parse(cached) : null;
  });

  const isSuperAdmin = (adminUser?.email === 'antakajunior3@gmail.com') || (simulatedUser?.email === 'antakajunior3@gmail.com');

  // If a mosque admin session is active, lock navigation strictly to that mosque's slug
  useEffect(() => {
    if (mosqueAdmin && mosqueSlug !== mosqueAdmin.slug) {
      setMosqueSlug(mosqueAdmin.slug);
      window.history.pushState({}, '', `/${mosqueAdmin.slug}`);
    }
  }, [mosqueAdmin, mosqueSlug]);

  // Track popstate to support browser Back/Forward navigation!
  useEffect(() => {
    const handleLocationChange = () => {
      const parts = window.location.pathname.split('/').filter(Boolean);
      setMosqueSlug(parts.length > 0 ? parts[0] : '');
    };
    window.addEventListener('popstate', handleLocationChange);
    
    // Patch pushState & replaceState to listen to inside-app programmatic routing
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      handleLocationChange();
    };
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  // Check auth state
  useEffect(() => {
    if (!isFirebaseEnabled || !auth) {
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAdminUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch all mosques list (directory) on load or navigation
  const refreshAllMosques = async () => {
    if (isFirebaseEnabled && db) {
      try {
        const colRef = collection(db, FIRESTORE_COLLECTION);
        const querySnapshot = await getDocs(colRef);
        const mosquesList: AllMosqueMeta[] = [];
        querySnapshot.forEach((doc) => {
          const docData = doc.data() as SyncData;
          if (docData && docData.config) {
            const computedPrayers = calculatePrayersForMosque(docData.config, new Date(), docData.prayers || []);
            mosquesList.push({
              slug: doc.id,
              name: docData.config.name,
              city: docData.config.city || '',
              country: docData.config.country || '',
              address: docData.config.address || '',
              latitude: docData.config.latitude ?? 51.5074,
              longitude: docData.config.longitude ?? -0.1278,
              prayers: computedPrayers,
              jummah: docData.jummah || [],
              phone: docData.config.contactPhone || '',
              approvalStatus: docData.config.approvalStatus,
              subscriptionPlan: docData.config.subscriptionPlan
            });
          }
        });

        setAllMosques(mosquesList);
      } catch (error) {
        console.error("Error fetching all mosques:", error);
      }
    } else {
      // Offline Local Storage dict directory fallback
      const offlineDict = JSON.parse(localStorage.getItem('mosque_offline_dict') || '{}');
      const mosquesList = Object.keys(offlineDict).map(slug => {
        const docData = offlineDict[slug] as SyncData;
        const computedPrayers = calculatePrayersForMosque(docData.config, new Date(), docData.prayers || []);
        return {
          slug,
          name: docData.config.name,
          city: docData.config.city || '',
          country: docData.config.country || '',
          address: docData.config.address || '',
          latitude: docData.config.latitude ?? 51.5074,
          longitude: docData.config.longitude ?? -0.1278,
          prayers: computedPrayers,
          jummah: docData.jummah || [],
          phone: docData.config.contactPhone || '',
          approvalStatus: docData.config.approvalStatus,
          subscriptionPlan: docData.config.subscriptionPlan
        };
      });

      setAllMosques(mosquesList);
    }
  };

  // Trigger loading list of mosques
  useEffect(() => {
    refreshAllMosques();
  }, [isFirebaseEnabled]);

  // Connect to Firebase Realtime Database for live updates on prayer times, announcements, and subscription
  useEffect(() => {
    if (!isFirebaseEnabled || !rtdb || !mosqueSlug) {
      return;
    }
    const cleanRtdbSlug = mosqueSlug.replace(/[^a-zA-Z0-9]/g, '');
    const rtdbRef = ref(rtdb, `mosques/${cleanRtdbSlug}`);
    const unsubscribeRtdb = onValue(rtdbRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        console.log(`Realtime Database update for mosques/${cleanRtdbSlug} received:`, val);
        setRtdbData(val);
      } else {
        setRtdbData(null);
      }
    }, (error) => {
      console.warn("Realtime Database subscription error:", error);
    });
    return () => unsubscribeRtdb();
  }, [isFirebaseEnabled, mosqueSlug]);

  // Sync state with selected Firestore document or offline cache
  useEffect(() => {
    if (!mosqueSlug) {
      setIsLoading(false);
      return;
    }

    const offlineDict = JSON.parse(localStorage.getItem('mosque_offline_dict') || '{}');
    if (offlineDict[mosqueSlug]) {
      setData(offlineDict[mosqueSlug]);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    if (!isFirebaseEnabled || !db) {
      // Offline fallback state management helper
      const offlineDict = JSON.parse(localStorage.getItem('mosque_offline_dict') || '{}');
      if (offlineDict[mosqueSlug]) {
        setData(offlineDict[mosqueSlug]);
      } else {
        // Fallback placeholder dynamically built
        setData({
          ...initialSyncData,
          config: {
            ...initialSyncData.config,
            name: mosqueSlug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
            city: "Custom City",
            country: "Custom Country",
          }
        });
      }
      setIsLoading(false);
      return;
    }

    // Connect real-time single-mosque snapshot
    const docRef = doc(db, FIRESTORE_COLLECTION, mosqueSlug);
    
    const unsubscribeSnapshot = onSnapshot(docRef, async (documentSnapshot) => {
      if (documentSnapshot.exists()) {
        const remoteData = documentSnapshot.data() as SyncData;
        setData(remoteData);
        // Backup to local storage dictionary
        const offlineDict = JSON.parse(localStorage.getItem('mosque_offline_dict') || '{}');
        offlineDict[mosqueSlug] = remoteData;
        localStorage.setItem('mosque_offline_dict', JSON.stringify(offlineDict));
      } else {
        // Non-existent mosque. Use generic fallback local state but DO NOT auto-create in database
        console.log(`Dynamic mosque '${mosqueSlug}' accessed but doc does not exist. Generic fallback state loaded.`);
        const seededDraft: SyncData = {
          ...initialSyncData,
          config: {
            ...initialSyncData.config,
            name: mosqueSlug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
            city: "Update City",
            country: "Update Country"
          }
        };
        setData(seededDraft);
      }
      setIsLoading(false);
    }, (error) => {
      console.warn("Firestore snapshot loading issue page context fallback:", error);
      setIsLoading(false);
    });

    return () => unsubscribeSnapshot();
  }, [mosqueSlug]);

  // Navigate to slug path
  const selectMosque = (slug: string) => {
    window.history.pushState({}, '', slug ? `/${slug}` : '/');
    setMosqueSlug(slug);
    
    // Instantly load data from local caches if present to ensure 0ms UI delay
    if (slug) {
      const offlineDict = JSON.parse(localStorage.getItem('mosque_offline_dict') || '{}');
      if (offlineDict[slug]) {
        setData(offlineDict[slug]);
        setIsLoading(false);
      } else {
        const found = allMosques.find(m => m.slug === slug);
        if (found) {
          setData(prev => ({
            ...prev,
            config: {
              ...prev.config,
              name: found.name,
              address: found.address || '',
              city: found.city,
              country: found.country,
              latitude: found.latitude,
              longitude: found.longitude,
            },
            prayers: found.prayers || prev.prayers,
            jummah: found.jummah || prev.jummah,
          }));
          setIsLoading(false);
        }
      }
    }
  };

  // Create a new mosque
  const createMosque = async (
    slug: string,
    name: string,
    city: string,
    country: string,
    phone: string,
    address: string,
    pin: string
  ): Promise<boolean> => {
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!cleanSlug) return false;

    if (allMosques.some(m => m.slug === cleanSlug)) {
      alert("A mosque with this url path slug is already registered!");
      return false;
    }

    // Geocode user city coordinates
    let lat = 51.5074;
    let lng = -0.1278;

    const cityLower = city.toLowerCase().trim();
    const cityMap: Record<string, { lat: number; lng: number }> = {
      'london': { lat: 51.5074, lng: -0.1278 },
      'cardiff': { lat: 51.4816, lng: -3.1791 },
      'new york': { lat: 40.7128, lng: -74.0060 },
      'ny': { lat: 40.7128, lng: -74.0060 },
      'toronto': { lat: 43.6532, lng: -79.3832 },
      'chicago': { lat: 41.8781, lng: -87.6298 },
      'houston': { lat: 29.7604, lng: -95.3698 },
      'los angeles': { lat: 34.0522, lng: -118.2437 },
      'paris': { lat: 48.8566, lng: 2.3522 },
      'cairo': { lat: 30.0444, lng: 31.2357 },
      'riyadh': { lat: 24.7136, lng: 46.6753 },
      'mecca': { lat: 21.3891, lng: 39.8579 },
      'medina': { lat: 24.5246, lng: 39.5692 },
      'singapore': { lat: 1.3521, lng: 103.8198 },
      'sydney': { lat: -33.8688, lng: 151.2093 },
      'kuala lumpur': { lat: 3.1390, lng: 101.6869 }
    };

    if (cityMap[cityLower]) {
      lat = cityMap[cityLower].lat;
      lng = cityMap[cityLower].lng;
    } else {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city + ', ' + country)}&limit=1`;
        const res = await fetch(url, { headers: { 'User-Agent': 'TatouMasjid-App' } });
        const json = await res.json();
        if (json && json.length > 0) {
          lat = parseFloat(json[0].lat);
          lng = parseFloat(json[0].lon);
        }
      } catch (err) {
        console.error("Geocoding failed, using fallback:", err);
      }
    }

    const customSyncData: SyncData = {
      config: {
        name,
        logoType: 'preset',
        logoPreset: 'mosque',
        address,
        city,
        country,
        contactPhone: phone || "+44 20 7946 0192",
        pinCode: pin || "1234",
        hijriAdjustment: 0,
        themeId: 'editorial-aesthetic',
        useCalculatedTimes: false,
        latitude: lat,
        longitude: lng,
        calculationMethod: 'MuslimWorldLeague',
        madhab: 'Shafi'
      },
      prayers: [
        { id: 'fajr', name: 'Fajr', arabicName: 'الفجر', adhan: '04:35', iqamahType: 'relative', iqamahValue: '15', icon: 'Sunrise' },
        { id: 'sunrise', name: 'Sunrise', arabicName: 'الشروق', adhan: '05:55', iqamahType: 'fixed', iqamahValue: '--:--', icon: 'Sun' },
        { id: 'dhuhr', name: 'Dhuhr', arabicName: 'الظهر', adhan: '13:10', iqamahType: 'relative', iqamahValue: '10', icon: 'SunMedium' },
        { id: 'asr', name: 'Asr', arabicName: 'العصر', adhan: '16:55', iqamahType: 'relative', iqamahValue: '15', icon: 'CloudSun' },
        { id: 'maghrib', name: 'Maghrib', arabicName: 'المغرب', adhan: '19:12', iqamahType: 'relative', iqamahValue: '7', icon: 'Sunset' },
        { id: 'isha', name: 'Isha', arabicName: 'العشاء', adhan: '20:45', iqamahType: 'relative', iqamahValue: '15', icon: 'Moon' }
      ],
      jummah: [
        { id: 'jummah1', name: 'First Jummah', khutbahTime: '13:00', iqamahTime: '13:20', khateeb: 'Sheikh Dr. Ahmed El-Amin' }
      ],
      announcements: [
        { id: 'ann-1', title: 'Welcome Greeting', content: 'Welcome to our new interactive sanctuary information layout screen.', createdAt: new Date().toISOString().split('T')[0], active: true }
      ],
      quotes: [
        { id: 'quote-1', text: 'Verily, in the remembrance of Allah do hearts find rest.', source: 'Quran 13:28' }
      ],
      lastUpdated: new Date().toISOString()
    };

    if (isFirebaseEnabled && db) {
      const docRef = doc(db, FIRESTORE_COLLECTION, cleanSlug);
      try {
        if (auth && !auth.currentUser) {
          await signInAnonymously(auth);
        }
        await setDoc(docRef, customSyncData);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `${FIRESTORE_COLLECTION}/${cleanSlug}`);
        return false;
      }
    } else {
      // Offline local cache dictionary list
      const offlineDict = JSON.parse(localStorage.getItem('mosque_offline_dict') || '{}');
      offlineDict[cleanSlug] = customSyncData;
      localStorage.setItem('mosque_offline_dict', JSON.stringify(offlineDict));
    }

    setAllMosques(prev => [
      ...prev,
      {
        slug: cleanSlug,
        name,
        city,
        country,
        address,
        latitude: lat,
        longitude: lng,
        prayers: customSyncData.prayers,
        jummah: customSyncData.jummah
      }
    ]);
    selectMosque(cleanSlug);
    return true;
  };

  // PIN Authentication logic
  const authenticatePIN = (pin: string): boolean => {
    if (pin === data.config.pinCode) {
      setPinAuthenticated(true);
      localStorage.setItem(PIN_AUTH_KEY, 'true');
      
      // Attempt background anonymous auth to allow DB writes
      if (isFirebaseEnabled && auth && !auth.currentUser) {
        signInAnonymously(auth).catch(e => {
          console.error("Background auth error in database write permissions", e);
        });
      }
      return true;
    }
    return false;
  };

  const clearPINAuthentication = () => {
    setPinAuthenticated(false);
    localStorage.removeItem(PIN_AUTH_KEY);
  };

  // Google Sign-In (for high security Admin access)
  const loginWithGoogle = async () => {
    if (!isFirebaseEnabled || !auth) {
      alert("Firebase is not fully initialized. Entering simulated local credentials.");
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google authentication portal error:", error);
    }
  };

  const registerWithEmailAndPass = async (email: string, pass: string, name: string) => {
    if (isFirebaseEnabled && auth) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
        setAdminUser(userCredential.user);
      }
    } else {
      // Simulated Local Storage fallback
      const mockUser = {
        uid: 'sim-' + Date.now(),
        email,
        displayName: name,
        emailVerified: true
      };
      setSimulatedUser(mockUser);
      localStorage.setItem('mosque_simulated_user', JSON.stringify(mockUser));
    }
  };

  const loginWithEmailAndPass = async (email: string, pass: string) => {
    if (isFirebaseEnabled && auth) {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      setAdminUser(userCredential.user);
    } else {
      // Simulated Local Storage auth login
      const mockUser = {
        uid: 'sim-user',
        email,
        displayName: email.split('@')[0],
        emailVerified: true
      };
      setSimulatedUser(mockUser);
      localStorage.setItem('mosque_simulated_user', JSON.stringify(mockUser));
    }
  };

  const logout = async () => {
    if (isFirebaseEnabled && auth) {
      await signOut(auth);
    }
    setSimulatedUser(null);
    localStorage.removeItem('mosque_simulated_user');
    clearPINAuthentication();
  };

  // State mapping for simulated or live Cloud user records
  const activeUser = isFirebaseEnabled ? adminUser : simulatedUser;

  // Derived Admin authorization: Authenticated non-anonymous admin users check, or logged-in mosque admin, or super admin
  const isAdmin = (
    (isFirebaseEnabled && !!adminUser && !adminUser.isAnonymous) ||
    (pinAuthenticated || !!simulatedUser) ||
    (mosqueAdmin !== null && mosqueAdmin.slug === mosqueSlug) ||
    isSuperAdmin
  );

  // Persist local and remote records helper
  const saveState = async (updatedData: SyncData) => {
    if (!mosqueSlug) return;

    const timestamped = {
      ...updatedData,
      lastUpdated: new Date().toISOString()
    };
    
    // Update local state instantly for robust fluid UI reactivity
    setData(timestamped);

    // Save in local dictionary
    const offlineDict = JSON.parse(localStorage.getItem('mosque_offline_dict') || '{}');
    offlineDict[mosqueSlug] = timestamped;
    localStorage.setItem('mosque_offline_dict', JSON.stringify(offlineDict));

    if (isFirebaseEnabled && db) {
      const docRef = doc(db, FIRESTORE_COLLECTION, mosqueSlug);
      try {
        if (auth && !auth.currentUser) {
          await signInAnonymously(auth);
        }
        await setDoc(docRef, timestamped);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `${FIRESTORE_COLLECTION}/${mosqueSlug}`);
      }
    }
  };

  // Data modifications APIs
  const updatePrayerTime = async (id: string, updates: Partial<PrayerTime>) => {
    const nextPrayers = data.prayers.map(p => {
      if (p.id === id) {
        return { ...p, ...updates };
      }
      return p;
    });
    await saveState({ ...data, prayers: nextPrayers });
  };

  const updateJummah = async (id: string, updates: Partial<JummahSession>) => {
    const nextJummah = data.jummah.map(j => {
      if (j.id === id) {
        return { ...j, ...updates };
      }
      return j;
    });
    await saveState({ ...data, jummah: nextJummah });
  };

  const updateConfig = async (updates: Partial<MosqueConfig>) => {
    const nextConfig = { ...data.config, ...updates };
    await saveState({ ...data, config: nextConfig });
  };

  const addAnnouncement = async (title: string, content: string) => {
    const newAnn: Announcement = {
      id: 'ann-' + Date.now(),
      title,
      content,
      createdAt: new Date().toISOString().split('T')[0],
      active: true
    };
    await saveState({
      ...data,
      announcements: [newAnn, ...data.announcements]
    });
  };

  const toggleAnnouncement = async (id: string) => {
    const nextAnn = data.announcements.map(ann => {
      if (ann.id === id) {
        return { ...ann, active: !ann.active };
      }
      return ann;
    });
    await saveState({ ...data, announcements: nextAnn });
  };

  const deleteAnnouncement = async (id: string) => {
    const nextAnn = data.announcements.filter(ann => ann.id !== id);
    await saveState({ ...data, announcements: nextAnn });
  };

  const updateAnnouncement = async (id: string, title: string, content: string) => {
    const nextAnn = data.announcements.map(ann => ann.id === id ? { ...ann, title, content } : ann);
    await saveState({ ...data, announcements: nextAnn });
  };

  const addQuote = async (text: string, source: string) => {
    const newQuote: IslamicQuote = {
      id: 'quote-' + Date.now(),
      text,
      source
    };
    await saveState({
      ...data,
      quotes: [...data.quotes, newQuote]
    });
  };

  const deleteQuote = async (id: string) => {
    const nextQuotes = data.quotes.filter(q => q.id !== id);
    await saveState({ ...data, quotes: nextQuotes });
  };

  const updateQuote = async (id: string, text: string, source: string) => {
    const nextQuotes = data.quotes.map(q => q.id === id ? { ...q, text, source } : q);
    await saveState({ ...data, quotes: nextQuotes });
  };

  // Dynamic daily prayer calculation trigger block
  const [currentCalcDate, setCurrentCalcDate] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (
        now.getDate() !== currentCalcDate.getDate() ||
        now.getMonth() !== currentCalcDate.getMonth() ||
        now.getFullYear() !== currentCalcDate.getFullYear()
      ) {
        setCurrentCalcDate(now);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [currentCalcDate]);

  const resolvedPrayers = React.useMemo(() => {
    return calculatePrayersForMosque(data.config, currentCalcDate, data.prayers);
  }, [data.config, data.prayers, currentCalcDate]);

  const resolvedData = React.useMemo(() => {
    let currentConfig = { ...data.config };

    // Apply overrides if rtdbData is present
    if (rtdbData) {
      currentConfig.name = rtdbData.name !== undefined && rtdbData.name !== null ? String(rtdbData.name) : currentConfig.name;
      currentConfig.city = rtdbData.city !== undefined && rtdbData.city !== null ? String(rtdbData.city) : currentConfig.city;
      currentConfig.address = rtdbData.mosqueAddress !== undefined && rtdbData.mosqueAddress !== null ? String(rtdbData.mosqueAddress) : currentConfig.address;
      currentConfig.latitude = rtdbData.latitude !== undefined && rtdbData.latitude !== null ? Number(rtdbData.latitude) : currentConfig.latitude;
      currentConfig.longitude = rtdbData.longitude !== undefined && rtdbData.longitude !== null ? Number(rtdbData.longitude) : currentConfig.longitude;
      
      if (rtdbData.automaticCalculationEnabled !== undefined && rtdbData.automaticCalculationEnabled !== null) {
        currentConfig.useCalculatedTimes = Boolean(rtdbData.automaticCalculationEnabled);
      }
    }

    // Now calculate prayers using the possibly overridden config
    const computedPrayers = calculatePrayersForMosque(currentConfig, currentCalcDate, data.prayers);

    const baseResolved = {
      ...data,
      config: currentConfig,
      prayers: computedPrayers
    };

    if (!rtdbData) {
      return baseResolved;
    }

    // Copy prayers and override with manual inputs when calculations are off
    const overriddenPrayers = baseResolved.prayers.map(p => {
      const pId = p.id;
      if (['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].includes(pId)) {
        // Direct key check (e.g. rtdbData.fajr)
        const rtdbVal = rtdbData[pId as keyof typeof rtdbData];
        
        // Handle explicit adhan/iqamah keys
        const adhanKey = `${pId}_adhan`;
        const iqamahKey = `${pId}_iqamah`;
        const iqamahValKey = `${pId}_iqamahValue`;
        
        const directAdhan = rtdbData[adhanKey as keyof typeof rtdbData];
        const directIqamah = rtdbData[iqamahKey as keyof typeof rtdbData] || rtdbData[iqamahValKey as keyof typeof rtdbData];
        
        let updatedAdhan = p.adhan;
        let updatedIqamahType = p.iqamahType;
        let updatedIqamahValue = p.iqamahValue;

        // Adhan times should be overridden only if automatic calculations are OFF
        if (!currentConfig.useCalculatedTimes) {
          if (directAdhan !== undefined && directAdhan !== null) {
            updatedAdhan = String(directAdhan);
          } else if (rtdbVal !== undefined && rtdbVal !== null) {
            if (typeof rtdbVal === 'string') {
              if (rtdbVal.includes('/')) {
                const parts = rtdbVal.split('/');
                updatedAdhan = parts[0].trim();
                updatedIqamahValue = parts[1].trim();
                updatedIqamahType = 'fixed' as const;
              } else if (rtdbVal.includes(',')) {
                const parts = rtdbVal.split(',');
                updatedAdhan = parts[0].trim();
                updatedIqamahValue = parts[1].trim();
                updatedIqamahType = 'fixed' as const;
              } else {
                updatedAdhan = rtdbVal;
              }
            } else if (typeof rtdbVal === 'object') {
              if ('adhan' in rtdbVal && typeof rtdbVal.adhan === 'string') {
                updatedAdhan = rtdbVal.adhan;
              } else if ('time' in rtdbVal && typeof rtdbVal.time === 'string') {
                updatedAdhan = rtdbVal.time;
              }
            }
          }
        }

        // Iqamah value overrides can always apply if provided
        if (pId !== 'sunrise') {
          if (directIqamah !== undefined && directIqamah !== null) {
            updatedIqamahType = 'fixed' as const;
            updatedIqamahValue = String(directIqamah);
          } else if (rtdbVal !== undefined && rtdbVal !== null && typeof rtdbVal === 'object') {
            if ('iqamah' in rtdbVal && typeof rtdbVal.iqamah === 'string') {
              updatedIqamahType = 'fixed' as const;
              updatedIqamahValue = rtdbVal.iqamah;
            } else if ('iqamahValue' in rtdbVal && typeof rtdbVal.iqamahValue === 'string') {
              updatedIqamahValue = rtdbVal.iqamahValue;
              if ('iqamahType' in rtdbVal && typeof rtdbVal.iqamahType === 'string') {
                updatedIqamahType = rtdbVal.iqamahType as any;
              }
            }
          }
        }

        return {
          ...p,
          adhan: updatedAdhan,
          iqamahType: updatedIqamahType,
          iqamahValue: updatedIqamahValue
        };
      }
      return p;
    });

    // Handle Friday Jummah overrides
    let overriddenJummah = baseResolved.jummah;
    if (rtdbData.jummah) {
      if (Array.isArray(rtdbData.jummah)) {
        overriddenJummah = rtdbData.jummah;
      } else if (typeof rtdbData.jummah === 'object') {
        overriddenJummah = baseResolved.jummah.map(j => {
          const rtdbSession = rtdbData.jummah[j.id];
          if (rtdbSession) {
            return {
              ...j,
              ...rtdbSession
            };
          }
          return j;
        });
      }
    } else if (rtdbData.jummah_1_khutbah || rtdbData.jummah_1_iqamah) {
      overriddenJummah = baseResolved.jummah.map((j, idx) => {
        const idx1 = idx + 1;
        const kValue = rtdbData[`jummah_${idx1}_khutbah`];
        const iValue = rtdbData[`jummah_${idx1}_iqamah`];
        const nValue = rtdbData[`jummah_${idx1}_name`];
        const sValue = rtdbData[`jummah_${idx1}_khateeb`];
        return {
          ...j,
          khutbahTime: kValue !== undefined && kValue !== null ? String(kValue) : j.khutbahTime,
          iqamahTime: iValue !== undefined && iValue !== null ? String(iValue) : j.iqamahTime,
          name: nValue !== undefined && nValue !== null ? String(nValue) : j.name,
          khateeb: sValue !== undefined && sValue !== null ? String(sValue) : j.khateeb,
        };
      });
    }

    // Handle announcements
    let announcements = baseResolved.announcements;
    const rtdbAnnVal = rtdbData.announcement;
    if (rtdbAnnVal !== undefined && rtdbAnnVal !== null) {
      if (typeof rtdbAnnVal === 'string' && rtdbAnnVal.trim() !== '') {
        const existingRtdbAnnIdx = announcements.findIndex(a => a.id === 'rt-announcement');
        const rtAnn: Announcement = {
          id: 'rt-announcement',
          title: 'Official Announcement',
          content: rtdbAnnVal,
          createdAt: new Date().toISOString().split('T')[0],
          active: true
        };

        if (existingRtdbAnnIdx > -1) {
          announcements = announcements.map((a, idx) => idx === existingRtdbAnnIdx ? rtAnn : a);
        } else {
          announcements = [rtAnn, ...announcements];
        }
      } else if (typeof rtdbAnnVal === 'object') {
        const title = rtdbAnnVal.title || 'Official Announcement';
        const content = rtdbAnnVal.content || rtdbAnnVal.text || '';
        const active = rtdbAnnVal.active !== undefined ? rtdbAnnVal.active : true;
        if (content) {
          const rtAnn: Announcement = {
            id: 'rt-announcement',
            title,
            content,
            createdAt: rtdbAnnVal.createdAt || new Date().toISOString().split('T')[0],
            active
          };
          const existingRtdbAnnIdx = announcements.findIndex(a => a.id === 'rt-announcement');
          if (existingRtdbAnnIdx > -1) {
            announcements = announcements.map((a, idx) => idx === existingRtdbAnnIdx ? rtAnn : a);
          } else {
            announcements = [rtAnn, ...announcements];
          }
        }
      }
    }

    return {
      ...baseResolved,
      prayers: overriddenPrayers,
      jummah: overriddenJummah,
      announcements
    };
  }, [data, currentCalcDate, rtdbData, mosqueSlug]);

  // Memoized Subscription status calculation
  const subscriptionInfo = React.useMemo(() => {
    let status: 'trial' | 'basic' | 'standard' | 'premium' | 'expired' = 'trial';
    let trialStartDate = '';
    let expirationDate = '';
    let packageType: 'None' | 'Basic' | 'Standard' | 'Premium' = 'None';

    const cleanRtdbSlug = mosqueSlug ? mosqueSlug.replace(/[^a-zA-Z0-9]/g, '') : 'default';
    const localKey = `sub_info_${cleanRtdbSlug}`;

    if (rtdbData) {
      status = rtdbData.subscriptionStatus || 'trial';
      trialStartDate = rtdbData.trialStartDate || '';
      expirationDate = rtdbData.expirationDate || '';
      packageType = rtdbData.packageType || 'None';
    } else {
      const localCached = localStorage.getItem(localKey);
      if (localCached) {
        try {
          const parsed = JSON.parse(localCached);
          status = parsed.status || 'trial';
          trialStartDate = parsed.trialStartDate || '';
          expirationDate = parsed.expirationDate || '';
          packageType = parsed.packageType || 'None';
        } catch (e) {
          // Ignore
        }
      }
    }

    if (!trialStartDate || !expirationDate) {
      const now = new Date();
      trialStartDate = now.toISOString();
      const exp = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30-day free trial
      expirationDate = exp.toISOString();
      status = 'trial';
      packageType = 'None';

      localStorage.setItem(localKey, JSON.stringify({
        status,
        trialStartDate,
        expirationDate,
        packageType
      }));
    }

    const expTime = new Date(expirationDate).getTime();
    const nowTime = Date.now();
    const diffTime = expTime - nowTime;
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (packageType === 'None' && (status === 'trial' || status === 'expired') && daysLeft <= 0) {
      status = 'expired';
    }

    if (packageType !== 'None') {
      status = packageType.toLowerCase() as any;
    }

    return {
      status,
      trialStartDate,
      expirationDate,
      packageType,
      daysLeft: daysLeft > 0 ? daysLeft : 0
    };
  }, [rtdbData, mosqueSlug]);

  const upgradeSubscription = async (plan: 'Basic' | 'Standard' | 'Premium') => {
    if (!mosqueSlug) return;
    const cleanRtdbSlug = mosqueSlug.replace(/[^a-zA-Z0-9]/g, '');
    const localKey = `sub_info_${cleanRtdbSlug}`;

    const now = new Date();
    const exp = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days active limit
    const updatedSub = {
      subscriptionStatus: plan.toLowerCase() as any,
      trialStartDate: subscriptionInfo.trialStartDate || now.toISOString(),
      expirationDate: exp.toISOString(),
      packageType: plan
    };

    localStorage.setItem(localKey, JSON.stringify({
      status: plan.toLowerCase(),
      trialStartDate: updatedSub.trialStartDate,
      expirationDate: updatedSub.expirationDate,
      packageType: plan
    }));

    if (isFirebaseEnabled && rtdb) {
      try {
        const rtdbRef = ref(rtdb, `mosques/${cleanRtdbSlug}`);
        await update(rtdbRef, updatedSub);
      } catch (err) {
        console.error("Realtime database upgrade failed:", err);
      }
    } else {
      setRtdbData((prev: any) => ({
        ...prev,
        ...updatedSub
      }));
    }
  };

  const simulateExpiration = async () => {
    if (!mosqueSlug) return;
    const cleanRtdbSlug = mosqueSlug.replace(/[^a-zA-Z0-9]/g, '');
    const localKey = `sub_info_${cleanRtdbSlug}`;

    const now = new Date();
    const pastStart = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000);
    const pastExp = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

    const updatedSub = {
      subscriptionStatus: 'expired' as const,
      trialStartDate: pastStart.toISOString(),
      expirationDate: pastExp.toISOString(),
      packageType: 'None' as const
    };

    localStorage.setItem(localKey, JSON.stringify({
      status: 'expired',
      trialStartDate: updatedSub.trialStartDate,
      expirationDate: updatedSub.expirationDate,
      packageType: 'None'
    }));

    if (isFirebaseEnabled && rtdb) {
      try {
        const rtdbRef = ref(rtdb, `mosques/${cleanRtdbSlug}`);
        await update(rtdbRef, updatedSub);
      } catch (err) {
        console.error("Realtime database status change failed:", err);
      }
    } else {
      setRtdbData((prev: any) => ({
        ...prev,
        ...updatedSub
      }));
    }
  };

  const simulateResetTrial = async () => {
    if (!mosqueSlug) return;
    const cleanRtdbSlug = mosqueSlug.replace(/[^a-zA-Z0-9]/g, '');
    const localKey = `sub_info_${cleanRtdbSlug}`;

    const now = new Date();
    const futureExp = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const updatedSub = {
      subscriptionStatus: 'trial' as const,
      trialStartDate: now.toISOString(),
      expirationDate: futureExp.toISOString(),
      packageType: 'None' as const
    };

    localStorage.setItem(localKey, JSON.stringify({
      status: 'trial',
      trialStartDate: updatedSub.trialStartDate,
      expirationDate: updatedSub.expirationDate,
      packageType: 'None'
    }));

    if (isFirebaseEnabled && rtdb) {
      try {
        const rtdbRef = ref(rtdb, `mosques/${cleanRtdbSlug}`);
        await update(rtdbRef, updatedSub);
      } catch (err) {
        console.error("Realtime database reset failed:", err);
      }
    } else {
      setRtdbData((prev: any) => ({
        ...prev,
        ...updatedSub
      }));
    }
  };

  // ==========================================
  // MOSQUE SAAS CORE IMPLEMENTATIONS
  // ==========================================

  const submitRegistration = async (fields: {
    mosqueName: string;
    managerName: string;
    email: string;
    phone: string;
    city: string;
    country: string;
    address: string;
  }): Promise<boolean> => {
    const regId = `reg_${Date.now()}`;
    const newReg = {
      id: regId,
      ...fields,
      status: 'Pending Approval' as const,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseEnabled && db) {
      try {
        await setDoc(doc(db, 'mosqueRegistrations', regId), newReg);
        return true;
      } catch (err) {
        console.error("Firebase registration submit error:", err);
      }
    }

    // Always fallback/cache in Local Storage
    const cachedRegs = JSON.parse(localStorage.getItem('mosque_registrations') || '[]');
    cachedRegs.push(newReg);
    localStorage.setItem('mosque_registrations', JSON.stringify(cachedRegs));
    return true;
  };

  const getRegistrations = async (): Promise<any[]> => {
    if (isFirebaseEnabled && db) {
      try {
        const colRef = collection(db, 'mosqueRegistrations');
        const querySnapshot = await getDocs(colRef);
        const list: any[] = [];
        querySnapshot.forEach(doc => {
          list.push(doc.data());
        });
        if (list.length > 0) return list;
      } catch (err) {
        console.error("Firebase fetch registrations error:", err);
      }
    }

    // Local fallback
    return JSON.parse(localStorage.getItem('mosque_registrations') || '[]');
  };

  const updateRegistrationStatus = async (
    regId: string,
    status: 'Approved' | 'Rejected',
    plan: string = 'trial'
  ): Promise<any> => {
    let targetReg: any = null;

    // 1. Fetch registration
    if (isFirebaseEnabled && db) {
      try {
        const colRef = collection(db, 'mosqueRegistrations');
        const querySnapshot = await getDocs(colRef);
        querySnapshot.forEach(doc => {
          const d = doc.data();
          if (d.id === regId) {
            targetReg = d;
          }
        });
      } catch (err) {
        console.error(err);
      }
    }

    if (!targetReg) {
      const cachedRegs = JSON.parse(localStorage.getItem('mosque_registrations') || '[]');
      targetReg = cachedRegs.find((r: any) => r.id === regId);
    }

    if (!targetReg) {
      throw new Error("Registration form request not found.");
    }

    // Update status locally & remotely
    targetReg.status = status;
    
    if (isFirebaseEnabled && db) {
      try {
        await setDoc(doc(db, 'mosqueRegistrations', regId), targetReg);
      } catch (err) {
        console.error(err);
      }
    } else {
      const cachedRegs = JSON.parse(localStorage.getItem('mosque_registrations') || '[]');
      const updated = cachedRegs.map((r: any) => r.id === regId ? targetReg : r);
      localStorage.setItem('mosque_registrations', JSON.stringify(updated));
    }

    if (status === 'Approved') {
      // 2. Generate unique mosque code & temporary password
      const prefix = targetReg.mosqueName.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5).padEnd(5, 'X');
      const numCode = Math.floor(100 + Math.random() * 900);
      const mCode = `${prefix}${numCode}`;
      const mPass = Math.floor(100000 + Math.random() * 899999).toString();

      // Define standard slug
      const slug = targetReg.mosqueName.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      // Check if slug is taken, otherwise add unique index
      let finalSlug = slug;
      if (allMosques.some(m => m.slug === finalSlug)) {
        finalSlug = `${slug}-${numCode}`;
      }

      // Initialize the real mosque's Firestore syncData
      const now = new Date();
      const trialEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const newConfigObj = {
        ...initialSyncData.config,
        name: targetReg.mosqueName,
        city: targetReg.city,
        country: targetReg.country,
        address: targetReg.address,
        contactPhone: targetReg.phone,
        managerName: targetReg.imamName,
        managerEmail: targetReg.email,
        mosqueCode: mCode,
        adminPassword: mPass,
        subscriptionPlan: plan as any,
        trialStartDate: now.toISOString(),
        trialEndDate: trialEndDate.toISOString(),
        approvalStatus: 'Approved' as const
      };

      const newMosqueData: SyncData = {
        ...initialSyncData,
        config: newConfigObj,
        lastUpdated: now.toISOString()
      };

      // Create in Firestore
      if (isFirebaseEnabled && db) {
        try {
          await setDoc(doc(db, FIRESTORE_COLLECTION, finalSlug), newMosqueData);
          
          // Store in approved mosqueAdmins collection
          await setDoc(doc(db, 'mosqueAdmins', targetReg.email.toLowerCase()), {
            mosqueId: finalSlug,
            adminEmail: targetReg.email.toLowerCase(),
            approvalStatus: 'Approved',
            subscriptionPlan: plan
          });
          
          // Also set up default entry in RTDB
          if (rtdb) {
            const cleanRtdbSlug = finalSlug.replace(/[^a-zA-Z0-9]/g, '');
            await set(ref(rtdb, `mosques/${cleanRtdbSlug}`), {
              subscriptionStatus: plan,
              trialStartDate: now.toISOString(),
              expirationDate: trialEndDate.toISOString(),
              packageType: plan === 'trial' ? 'None' : (plan.charAt(0).toUpperCase() + plan.slice(1))
            });
          }
        } catch (err) {
          console.error("Error creating approved mosque data:", err);
        }
      }

      // Store approved admin cache locally
      const cachedAdmins = JSON.parse(localStorage.getItem('mosque_approved_admins') || '{}');
      cachedAdmins[targetReg.email.toLowerCase()] = {
        mosqueId: finalSlug,
        adminEmail: targetReg.email.toLowerCase(),
        approvalStatus: 'Approved',
        subscriptionPlan: plan
      };
      localStorage.setItem('mosque_approved_admins', JSON.stringify(cachedAdmins));

      // Always save to offline backup dictionary
      const offlineDict = JSON.parse(localStorage.getItem('mosque_offline_dict') || '{}');
      offlineDict[finalSlug] = newMosqueData;
      localStorage.setItem('mosque_offline_dict', JSON.stringify(offlineDict));

      // Refresh directory list
      await refreshAllMosques();

      return { code: mCode, pass: mPass };
    }

    return null;
  };

  const checkEmailApproved = async (email: string): Promise<{ isApproved: boolean; slug?: string; subscriptionPlan?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Fallback dictionary search first (offline)
    const offlineDict = JSON.parse(localStorage.getItem('mosque_offline_dict') || '{}');
    let foundSlug = '';
    let foundPlan = 'trial';
    
    // Check locally in cache
    Object.keys(offlineDict).forEach(slug => {
      const mosqueDataObj = offlineDict[slug] as SyncData;
      if (mosqueDataObj && mosqueDataObj.config && mosqueDataObj.config.managerEmail) {
        if (mosqueDataObj.config.managerEmail.trim().toLowerCase() === cleanEmail) {
          foundSlug = slug;
          foundPlan = mosqueDataObj.config.subscriptionPlan || 'trial';
        }
      }
    });

    // Check pre-approved local admins list
    const cachedAdmins = JSON.parse(localStorage.getItem('mosque_approved_admins') || '{}');
    if (cachedAdmins[cleanEmail]) {
      foundSlug = cachedAdmins[cleanEmail].mosqueId;
      foundPlan = cachedAdmins[cleanEmail].subscriptionPlan || 'trial';
    }

    // Default development bypass: if user email is antakajunior3@gmail.com and we don't have any matching mosque slug yet,
    // let's default to the current active mosqueSlug, or first available slug, or 'london-central'!
    if (cleanEmail === 'antakajunior3@gmail.com' && !foundSlug) {
      foundSlug = mosqueSlug || 'london-central';
      foundPlan = 'premium';
    }

    // Now if online and firebase is enabled, query Firestore for the definitive answer
    if (isFirebaseEnabled && db) {
      try {
        // A. Check in mosqueAdmins collection
        const { getDoc } = await import('firebase/firestore');
        const adminDocRef = doc(db, 'mosqueAdmins', cleanEmail);
        const adminDocSnap = await getDoc(adminDocRef);
        if (adminDocSnap.exists()) {
          const adminDocData = adminDocSnap.data();
          if (adminDocData && adminDocData.approvalStatus === 'Approved') {
            return {
              isApproved: true,
              slug: adminDocData.mosqueId,
              subscriptionPlan: adminDocData.subscriptionPlan || 'trial'
            };
          }
        }

        // B. Check in mosqueData configs
        const colRef = collection(db, FIRESTORE_COLLECTION);
        const querySnapshot = await getDocs(colRef);
        let fbSlug = '';
        let fbPlan = 'trial';
        querySnapshot.forEach(docSnap => {
          const docData = docSnap.data() as SyncData;
          if (docData && docData.config && docData.config.managerEmail) {
            if (docData.config.managerEmail.trim().toLowerCase() === cleanEmail) {
              fbSlug = docSnap.id;
              fbPlan = docData.config.subscriptionPlan || 'trial';
            }
          }
        });

        if (fbSlug) {
          return {
            isApproved: true,
            slug: fbSlug,
            subscriptionPlan: fbPlan
          };
        }
      } catch (err) {
        console.error("Firestore approved email check failed:", err);
      }
    }

    // If cache search succeeded, return it
    if (foundSlug) {
      return {
        isApproved: true,
        slug: foundSlug,
        subscriptionPlan: foundPlan as any
      };
    }

    return { isApproved: false };
  };

  const requestLoginOTP = async (email: string): Promise<{ success: boolean; error?: string; code?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    
    // 1. Verify email belongs to an approved mosque admin
    const checkResult = await checkEmailApproved(cleanEmail);
    if (!checkResult.isApproved || !checkResult.slug) {
      return { 
        success: false, 
        error: "This email address is not authorized or approved as a Mosque Administrator." 
      };
    }

    // 2. Generate a secure 6-digit numeric verification code
    const generatedCode = Math.floor(100000 + Math.random() * 899999).toString();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 10 * 60 * 1000); // 10 minutes expiration

    // 3. Store OTP in database/local storage
    const otpRecord = {
      email: cleanEmail,
      code: generatedCode,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      mosqueId: checkResult.slug,
      approvalStatus: 'Approved',
      subscriptionPlan: checkResult.subscriptionPlan || 'trial',
      used: false
    };

    // Storing in Firestore if enabled
    if (isFirebaseEnabled && db) {
      try {
        // Save to 'mosqueLoginOTPs' collection indexed by email
        await setDoc(doc(db, 'mosqueLoginOTPs', cleanEmail), otpRecord);
      } catch (err) {
        console.error("Failed to write login OTP record to Firestore:", err);
      }
    }

    // Always store in local storage dictionary as well for seamless offline compatibility!
    const localOTPs = JSON.parse(localStorage.getItem('mosque_login_otps') || '{}');
    localOTPs[cleanEmail] = otpRecord;
    localStorage.setItem('mosque_login_otps', JSON.stringify(localOTPs));

    return { 
      success: true, 
      code: generatedCode 
    };
  };

  const verifyLoginOTP = async (email: string, enteredCode: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = enteredCode.trim();

    let otpRecord: any = null;

    // Load from Firestore if online
    if (isFirebaseEnabled && db) {
      try {
        const { getDoc } = await import('firebase/firestore');
        const docRef = doc(db, 'mosqueLoginOTPs', cleanEmail);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          otpRecord = docSnap.data();
        }
      } catch (err) {
        console.error("Error fetching login OTP from Firestore:", err);
      }
    }

    // Load from local storage fallback
    if (!otpRecord) {
      const localOTPs = JSON.parse(localStorage.getItem('mosque_login_otps') || '{}');
      otpRecord = localOTPs[cleanEmail];
    }

    if (!otpRecord) {
      return { success: false, error: "No OTP was requested for this email. Please request a new code." };
    }

    // Security Checks:
    // 1. Correct code check
    if (otpRecord.code !== cleanCode) {
      return { success: false, error: "Invalid verification code. Please check and try again." };
    }

    // 2. Already used check
    if (otpRecord.used) {
      return { success: false, error: "This verification code has already been used. Please request a new one." };
    }

    // 3. Expiration check (10 minutes)
    const expiresAt = new Date(otpRecord.expiresAt);
    const now = new Date();
    if (now.getTime() > expiresAt.getTime()) {
      return { success: false, error: "This code has expired. OTPs are only valid for 10 minutes. Please request a new code." };
    }

    // Mark OTP as used securely to prevent replay attacks
    otpRecord.used = true;
    if (isFirebaseEnabled && db) {
      try {
        await setDoc(doc(db, 'mosqueLoginOTPs', cleanEmail), otpRecord);
      } catch (err) {
        console.error("Error setting OTP as used in Firestore:", err);
      }
    }
    const localOTPs = JSON.parse(localStorage.getItem('mosque_login_otps') || '{}');
    localOTPs[cleanEmail] = otpRecord;
    localStorage.setItem('mosque_login_otps', JSON.stringify(localOTPs));

    // Sign in the user securely using Firebase Authentication
    if (isFirebaseEnabled && auth) {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Firebase Auth sign in failed during OTP verification:", err);
      }
    }

    // Double check email is approved one more time immediately prior to session creation
    const checkResult = await checkEmailApproved(cleanEmail);
    if (!checkResult.isApproved || !checkResult.slug) {
      return { success: false, error: "This email address is not authorized." };
    }

    // Log the user into their mosque dashboard session
    const session = { email: cleanEmail, slug: checkResult.slug };
    setMosqueAdmin(session);
    localStorage.setItem('mosque_admin_session', JSON.stringify(session));

    // Store in admin database collection if online
    if (isFirebaseEnabled && db) {
      try {
        await setDoc(doc(db, 'mosqueAdmins', cleanEmail), {
          mosqueId: checkResult.slug,
          adminEmail: cleanEmail,
          approvalStatus: 'Approved',
          subscriptionPlan: checkResult.subscriptionPlan || 'trial'
        });
      } catch (err) {
        console.error("Error storing session record in mosqueAdmins:", err);
      }
    }

    // In-memory check and write to local list
    const cachedAdmins = JSON.parse(localStorage.getItem('mosque_approved_admins') || '{}');
    cachedAdmins[cleanEmail] = {
      mosqueId: checkResult.slug,
      adminEmail: cleanEmail,
      approvalStatus: 'Approved',
      subscriptionPlan: checkResult.subscriptionPlan || 'trial'
    };
    localStorage.setItem('mosque_approved_admins', JSON.stringify(cachedAdmins));

    // Navigate to that specific mosque dashboard slug
    setMosqueSlug(checkResult.slug);
    window.history.pushState({}, '', `/${checkResult.slug}`);

    return { success: true };
  };

  const loginMosqueAdmin = async (code: string, pass: string): Promise<boolean> => {
    console.warn("Legacy credentials login call. Fails by default.");
    return false;
  };

  const logoutMosqueAdmin = () => {
    setMosqueAdmin(null);
    localStorage.removeItem('mosque_admin_session');
    setMosqueSlug('');
    window.history.pushState({}, '', '/');
  };

  const saveManualPrayerTimes = async (
    automaticCalculationEnabled: boolean,
    updatedPrayers: PrayerTime[],
    updatedJummah: JummahSession[]
  ) => {
    if (!mosqueSlug) return;
    const cleanRtdbSlug = mosqueSlug.replace(/[^a-zA-Z0-9]/g, '');

    // 1. Maintain Firestore config and local state
    const nextConfig = {
      ...data.config,
      useCalculatedTimes: automaticCalculationEnabled
    };
    await saveState({
      ...data,
      config: nextConfig,
      prayers: updatedPrayers,
      jummah: updatedJummah
    });

    // 2. Synchronize to Firebase Realtime Database
    if (isFirebaseEnabled && rtdb) {
      try {
        const rtdbRef = ref(rtdb, `mosques/${cleanRtdbSlug}`);
        const updates: Record<string, any> = {
          automaticCalculationEnabled,
          name: data.config.name,
          city: data.config.city,
          mosqueAddress: data.config.address,
          latitude: data.config.latitude,
          longitude: data.config.longitude,
        };

        updatedPrayers.forEach(p => {
          const pId = p.id;
          updates[`${pId}_adhan`] = p.adhan;
          if (pId !== 'sunrise') {
            updates[`${pId}_iqamah`] = p.iqamahValue;
            updates[`${pId}_iqamahValue`] = p.iqamahValue;
            updates[`${pId}_iqamahType`] = p.iqamahType;
            updates[pId] = {
              adhan: p.adhan,
              time: p.adhan,
              iqamah: p.iqamahValue,
              iqamahValue: p.iqamahValue,
              iqamahType: p.iqamahType
            };
          } else {
            updates[pId] = p.adhan;
          }
        });

        updates.jummah = updatedJummah;
        updatedJummah.forEach((j, idx) => {
          updates[`jummah_${idx + 1}_name`] = j.name;
          updates[`jummah_${idx + 1}_khutbah`] = j.khutbahTime;
          updates[`jummah_${idx + 1}_iqamah`] = j.iqamahTime;
          updates[`jummah_${idx + 1}_khateeb`] = j.khateeb;
        });

        await update(rtdbRef, updates);
      } catch (err) {
        console.error("Failed to update Firebase Realtime Database:", err);
      }
    } else {
      // Offline fallback: update local rtdbData simulated state
      const simulatedRtdbUpdates: Record<string, any> = {
        automaticCalculationEnabled,
      };
      updatedPrayers.forEach(p => {
        const pId = p.id;
        simulatedRtdbUpdates[`${pId}_adhan`] = p.adhan;
        if (pId !== 'sunrise') {
          simulatedRtdbUpdates[`${pId}_iqamah`] = p.iqamahValue;
          simulatedRtdbUpdates[`${pId}_iqamahValue`] = p.iqamahValue;
          simulatedRtdbUpdates[`${pId}_iqamahType`] = p.iqamahType;
          simulatedRtdbUpdates[pId] = {
            adhan: p.adhan,
            time: p.adhan,
            iqamah: p.iqamahValue,
            iqamahValue: p.iqamahValue,
            iqamahType: p.iqamahType
          };
        } else {
          simulatedRtdbUpdates[pId] = p.adhan;
        }
      });
      updatedJummah.forEach((j, idx) => {
        simulatedRtdbUpdates[`jummah_${idx + 1}_name`] = j.name;
        simulatedRtdbUpdates[`jummah_${idx + 1}_khutbah`] = j.khutbahTime;
        simulatedRtdbUpdates[`jummah_${idx + 1}_iqamah`] = j.iqamahTime;
        simulatedRtdbUpdates[`jummah_${idx + 1}_khateeb`] = j.khateeb;
      });
      setRtdbData((prev: any) => ({
        ...prev,
        ...simulatedRtdbUpdates
      }));
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        data: resolvedData,
        isLoading,
        isFirebaseActive: isFirebaseEnabled,
        isAdmin,
        adminUser: activeUser,
        pinAuthenticated,
        authenticatePIN,
        clearPINAuthentication,
        loginWithGoogle,
        registerWithEmailAndPass,
        loginWithEmailAndPass,
        logout,
        
        mosqueSlug,
        allMosques,
        selectMosque,
        createMosque,
        refreshAllMosques,
        
        updatePrayerTime,
        updateJummah,
        updateConfig,
        addAnnouncement,
        updateAnnouncement,
        toggleAnnouncement,
        deleteAnnouncement,
        addQuote,
        updateQuote,
        deleteQuote,
        saveManualPrayerTimes,

        subscription: subscriptionInfo,
        upgradeSubscription,
        simulateExpiration,
        simulateResetTrial,

        // Mosque SaaS Systems Integration
        isSuperAdmin,
        mosqueAdmin,
        submitRegistration,
        getRegistrations,
        updateRegistrationStatus,
        requestLoginOTP,
        verifyLoginOTP,
        loginMosqueAdmin,
        logoutMosqueAdmin
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
