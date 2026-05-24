import React, { createContext, useContext, useState, useEffect } from 'react';
import { SyncData, PrayerTime, JummahSession, Announcement, IslamicQuote, MosqueConfig } from './types';
import { initialSyncData } from './initialData';
import { calculatePrayersForMosque } from './utils';
import { db, auth, rtdb, isFirebaseEnabled, handleFirestoreError, OperationType, GoogleAuthProvider, signInWithPopup, signOut, signInAnonymously } from './firebase';
import { doc, onSnapshot, setDoc, collection, getDocs } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';

interface AllMosqueMeta {
  slug: string;
  name: string;
  city: string;
  country: string;
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
  toggleAnnouncement: (id: string) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  addQuote: (text: string, source: string) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
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
    // Initial sync data baseline
    return { ...initialSyncData };
  });

  const [allMosques, setAllMosques] = useState<AllMosqueMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [simulatedUser, setSimulatedUser] = useState<any>(() => {
    const cached = localStorage.getItem('mosque_simulated_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [pinAuthenticated, setPinAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(PIN_AUTH_KEY) === 'true';
  });
  const [rtdbData, setRtdbData] = useState<any>(null);

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
            mosquesList.push({
              slug: doc.id,
              name: docData.config.name,
              city: docData.config.city || '',
              country: docData.config.country || ''
            });
          }
        });

        // Seed default template mosques in Firestore if empty
        if (mosquesList.length === 0) {
          console.log("No remote mosques found in Firestore. Bootstrapping initial defaults...");
          const defaultNoor = { ...initialSyncData };
          const defaultRahma = {
            ...initialSyncData,
            config: {
              ...initialSyncData.config,
              name: "Masjid Ar-Rahman",
              city: "New York",
              country: "United States",
              address: "123 Faith Rd, NY, USA",
              contactPhone: "+1 212 555 0199",
              latitude: 40.7128,
              longitude: -74.0060,
              pinCode: "1234",
              hijriAdjustment: 0,
              themeId: "emerald-dark" as const
            }
          };
          try {
            if (auth && !auth.currentUser) {
              await signInAnonymously(auth);
            }
            await setDoc(doc(db, FIRESTORE_COLLECTION, 'tatou-masjid'), defaultNoor);
            await setDoc(doc(db, FIRESTORE_COLLECTION, 'masjid-rahma'), defaultRahma);
            mosquesList.push(
              { slug: 'tatou-masjid', name: "Tatou Masjid", city: "London", country: "United Kingdom" },
              { slug: 'masjid-rahma', name: "Masjid Ar-Rahman", city: "New York", country: "United States" }
            );
          } catch (err) {
            console.error("Failed to seed default mosques", err);
          }
        }
        setAllMosques(mosquesList);
      } catch (error) {
        console.error("Error fetching all mosques:", error);
      }
    } else {
      // Offline Local Storage dict directory fallback
      const offlineDict = JSON.parse(localStorage.getItem('mosque_offline_dict') || '{}');
      const mosquesList = Object.keys(offlineDict).map(slug => {
        const docData = offlineDict[slug] as SyncData;
        return {
          slug,
          name: docData.config.name,
          city: docData.config.city || '',
          country: docData.config.country || ''
        };
      });

      // Seed offline local storage if completely empty
      if (mosquesList.length === 0) {
        const defaultList = [
          { slug: 'tatou-masjid', name: "Tatou Masjid", city: "London", country: "United Kingdom" },
          { slug: 'masjid-rahma', name: "Masjid Ar-Rahman", city: "New York", country: "United States" }
        ];
        const initialDict: Record<string, SyncData> = {};
        initialDict['tatou-masjid'] = { ...initialSyncData };
        initialDict['masjid-rahma'] = {
          ...initialSyncData,
          config: {
            ...initialSyncData.config,
            name: "Masjid Ar-Rahman",
            city: "New York",
            country: "United States",
            address: "123 Faith Rd, NY, USA",
            contactPhone: "+1 212 555 0199",
            latitude: 40.7128,
            longitude: -74.0060,
            pinCode: "1234",
            hijriAdjustment: 0,
            themeId: "emerald-dark"
          }
        };
        localStorage.setItem('mosque_offline_dict', JSON.stringify(initialDict));
        setAllMosques(defaultList);
      } else {
        setAllMosques(mosquesList);
      }
    }
  };

  // Trigger loading list of mosques
  useEffect(() => {
    refreshAllMosques();
  }, [isFirebaseEnabled]);

  // Connect to Firebase Realtime Database for live updates on prayer times and announcements
  useEffect(() => {
    if (!isFirebaseEnabled || !rtdb) {
      return;
    }
    const rtdbRef = ref(rtdb, 'mosques/tatoumasjid');
    const unsubscribeRtdb = onValue(rtdbRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        console.log("Realtime Database update for mosques/tatoumasjid received:", val);
        setRtdbData(val);
      }
    }, (error) => {
      console.warn("Realtime Database subscription error:", error);
    });
    return () => unsubscribeRtdb();
  }, [isFirebaseEnabled]);

  // Sync state with selected Firestore document or offline cache
  useEffect(() => {
    if (!mosqueSlug) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    if (!isFirebaseEnabled || !db) {
      // Offline fallback state management helper
      const offlineDict = JSON.parse(localStorage.getItem('mosque_offline_dict') || '{}');
      if (offlineDict[mosqueSlug]) {
        setData(offlineDict[mosqueSlug]);
      } else if (mosqueSlug === 'tatou-masjid' || mosqueSlug === 'masjid-al-noor') {
        setData(initialSyncData);
      } else if (mosqueSlug === 'masjid-rahma') {
        setData({
          ...initialSyncData,
          config: {
            ...initialSyncData.config,
            name: "Masjid Ar-Rahman",
            city: "New York",
            country: "United States",
            address: "123 Faith Rd, NY, USA",
            contactPhone: "+1 212 555 0199",
            latitude: 40.7128,
            longitude: -74.0060,
            pinCode: "1234",
            hijriAdjustment: 0,
            themeId: "emerald-dark"
          }
        });
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
        // Automatically seed if slug path doesn't exist yet but was selected
        console.log(`Dynamic mosque '${mosqueSlug}' accessed but doc does not exist. Auto-creating...`);
        const seededDraft: SyncData = {
          ...initialSyncData,
          config: {
            ...initialSyncData.config,
            name: mosqueSlug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
            city: "Update City",
            country: "Update Country"
          }
        };
        try {
          if (auth && !auth.currentUser) {
            await signInAnonymously(auth);
          }
          await setDoc(docRef, seededDraft);
          setData(seededDraft);
        } catch (error) {
          console.error("Error automatic seeding dynamic mosque:", error);
          setData(seededDraft);
        }
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
        useCalculatedTimes: true,
        latitude: 51.5074,
        longitude: -0.1278,
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

    setAllMosques(prev => [...prev, { slug: cleanSlug, name, city, country }]);
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

  // Derived Admin authorization
  const isAdmin = pinAuthenticated || !!activeUser;

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
    const baseResolved = {
      ...data,
      prayers: resolvedPrayers
    };

    // Only apply if we are on 'tatou-masjid' and we have rtdbData
    if (mosqueSlug !== 'tatou-masjid' || !rtdbData) {
      return baseResolved;
    }

    // Copy prayers and override
    const overriddenPrayers = baseResolved.prayers.map(p => {
      const pId = p.id;
      if (['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].includes(pId)) {
        // Direct key check (e.g. rtdbData.fajr)
        const rtdbVal = rtdbData[pId as keyof typeof rtdbData];
        
        // Handle explicit adhan/iqamah keys (e.g. rtdbData.fajr_adhan, rtdbData.fajr_iqamah)
        const adhanKey = `${pId}_adhan`;
        const iqamahKey = `${pId}_iqamah`;
        const iqamahValKey = `${pId}_iqamahValue`;
        
        const directAdhan = rtdbData[adhanKey as keyof typeof rtdbData];
        const directIqamah = rtdbData[iqamahKey as keyof typeof rtdbData] || rtdbData[iqamahValKey as keyof typeof rtdbData];
        
        if (directAdhan !== undefined && directAdhan !== null) {
          const updated = { ...p, adhan: String(directAdhan) };
          if (directIqamah !== undefined && directIqamah !== null) {
            updated.iqamahType = 'fixed' as const;
            updated.iqamahValue = String(directIqamah);
          }
          return updated;
        }

        if (rtdbVal !== undefined && rtdbVal !== null) {
          if (typeof rtdbVal === 'string') {
            if (rtdbVal.includes('/')) {
              const parts = rtdbVal.split('/');
              return {
                ...p,
                adhan: parts[0].trim(),
                iqamahType: 'fixed' as const,
                iqamahValue: parts[1].trim()
              };
            } else if (rtdbVal.includes(',')) {
              const parts = rtdbVal.split(',');
              return {
                ...p,
                adhan: parts[0].trim(),
                iqamahType: 'fixed' as const,
                iqamahValue: parts[1].trim()
              };
            } else {
              return {
                ...p,
                adhan: rtdbVal
              };
            }
          } else if (typeof rtdbVal === 'object') {
            const parsed: Partial<PrayerTime> = {};
            if ('adhan' in rtdbVal && typeof rtdbVal.adhan === 'string') {
              parsed.adhan = rtdbVal.adhan;
            } else if ('time' in rtdbVal && typeof rtdbVal.time === 'string') {
              parsed.adhan = rtdbVal.time;
            }
            
            if ('iqamah' in rtdbVal && typeof rtdbVal.iqamah === 'string') {
              parsed.iqamahType = 'fixed' as const;
              parsed.iqamahValue = rtdbVal.iqamah;
            } else if ('iqamahValue' in rtdbVal && typeof rtdbVal.iqamahValue === 'string') {
              parsed.iqamahValue = rtdbVal.iqamahValue;
              if ('iqamahType' in rtdbVal && typeof rtdbVal.iqamahType === 'string') {
                parsed.iqamahType = rtdbVal.iqamahType as any;
              }
            }
            return {
              ...p,
              ...parsed
            };
          }
        }
      }
      return p;
    });

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
      announcements
    };
  }, [data, resolvedPrayers, rtdbData, mosqueSlug]);

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
        toggleAnnouncement,
        deleteAnnouncement,
        addQuote,
        deleteQuote
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
