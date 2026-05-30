import { SyncData } from './types';

export const initialSyncData: SyncData = {
  config: {
    name: "Tatou Masjid",
    logoType: 'preset',
    logoPreset: 'crescent',
    address: "786 Mercy Way, London, UK",
    city: "London",
    country: "United Kingdom",
    contactPhone: "+44 20 7946 0192",
    pinCode: "1234",
    hijriAdjustment: 0,
    themeId: 'editorial-aesthetic',
    
    // Default prayer calculations settings
    useCalculatedTimes: false,
    latitude: 51.5074,
    longitude: -0.1278,
    calculationMethod: 'MuslimWorldLeague',
    madhab: 'Shafi'
  },
  prayers: [
    {
      id: 'fajr',
      name: 'Fajr',
      arabicName: 'الفجر',
      adhan: '04:35',
      iqamahType: 'relative',
      iqamahValue: '15',
      icon: 'Sunrise'
    },
    {
      id: 'sunrise',
      name: 'Sunrise',
      arabicName: 'الشروق',
      adhan: '05:55',
      iqamahType: 'fixed',
      iqamahValue: '--:--',
      icon: 'Sun'
    },
    {
      id: 'dhuhr',
      name: 'Dhuhr',
      arabicName: 'الظهر',
      adhan: '13:10',
      iqamahType: 'relative',
      iqamahValue: '10',
      icon: 'SunMedium'
    },
    {
      id: 'asr',
      name: 'Asr',
      arabicName: 'العصر',
      adhan: '16:55',
      iqamahType: 'relative',
      iqamahValue: '15',
      icon: 'CloudSun'
    },
    {
      id: 'maghrib',
      name: 'Maghrib',
      arabicName: 'المغرب',
      adhan: '19:12',
      iqamahType: 'relative',
      iqamahValue: '7',
      icon: 'Sunset'
    },
    {
      id: 'isha',
      name: 'Isha',
      arabicName: 'العشاء',
      adhan: '20:45',
      iqamahType: 'relative',
      iqamahValue: '15',
      icon: 'Moon'
    }
  ],
  jummah: [
    {
      id: 'jummah1',
      name: 'Friday Jummah',
      khutbahTime: '13:00',
      iqamahTime: '13:20',
      khateeb: 'Sheikh Dr. Ahmed El-Amin'
    }
  ],
  announcements: [
    {
      id: 'ann-1',
      title: 'Summer Youth Camp Registration',
      content: 'Registration is now open for the Annual Summer Youth Camp (Ages 12-18). Starts July 1st.',
      createdAt: '2026-05-20',
      active: true
    },
    {
      id: 'ann-2',
      title: 'Weekly Tajweed & Quran Halaqa',
      content: 'Every Saturday after Maghrib prayer in the Main Prayer Hall. Brothers and sisters welcome.',
      createdAt: '2026-05-18',
      active: true
    },
    {
      id: 'ann-3',
      title: 'Mosque Expansion Fundraiser',
      content: 'Help us expand the sister section. Donate at the kiosk or via the website portal.',
      createdAt: '2026-05-15',
      active: true
    }
  ],
  quotes: [
    {
      id: 'quote-1',
      text: 'Verily, in the remembrance of Allah do hearts find rest.',
      source: 'Quran 13:28'
    },
    {
      id: 'quote-2',
      text: 'Establish prayer, indeed prayer prohibits immorality and wrongdoing.',
      source: 'Quran 29:45'
    },
    {
      id: 'quote-3',
      text: 'The most beloved deeds to Allah are those done consistently, even if they are small.',
      source: 'Sahih Al-Bukhari'
    }
  ],
  lastUpdated: '2026-05-22T12:00:00Z'
};
