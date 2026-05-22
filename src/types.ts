export interface PrayerTime {
  id: string; // 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'
  name: string; // e.g., "Fajr"
  arabicName: string; // e.g., "الفجر"
  adhan: string; // e.g., "05:14" (24h format or HH:MM)
  iqamahType: 'fixed' | 'relative'; // fixed time or minutes after adhan
  iqamahValue: string; // e.g., "05:30" or "20" (minutes)
  icon: string; // lucide icon name
}

export interface JummahSession {
  id: string;
  name: string; // e.g., "1st Khutbah"
  khutbahTime: string; // e.g., "13:15"
  iqamahTime: string; // e.g., "13:30"
  khateeb: string; // Speaker name
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string; // ISO format or string
  active: boolean;
}

export interface IslamicQuote {
  id: string;
  text: string;
  source: string; // e.g., "Sahih Bukhari" or "Surah Baqarah 2:186"
}

export interface MosqueConfig {
  name: string;
  logoType: 'preset' | 'url';
  logoPreset: string; // e.g., "crescent", "mosque", "kaaba", "star"
  logoUrl?: string;
  address: string;
  city: string; // e.g., "London"
  country: string; // e.g., "UK"
  contactPhone: string; // e.g., "+44 20 7946 0192"
  pinCode: string; // Quick admin credential pin (e.g., "1234")
  hijriAdjustment: number; // e.g. -1, 0, +1 days
  themeId: 'editorial-aesthetic' | 'emerald-dark' | 'emerald-light' | 'slate-gold' | 'royal-blue';
  
  // Prayer calculation module settings
  useCalculatedTimes?: boolean;
  latitude?: number;
  longitude?: number;
  calculationMethod?: 'MuslimWorldLeague' | 'Egyptian' | 'Karachi' | 'UmmAlQura' | 'Dubai' | 'MoonsightingCommittee' | 'NorthAmerica' | 'Kuwait' | 'Qatar' | 'Singapore' | 'Tehran' | 'Turkey' | 'Other';
  madhab?: 'Shafi' | 'Hanafi';
}

export interface SyncData {
  prayers: PrayerTime[];
  jummah: JummahSession[];
  announcements: Announcement[];
  quotes: IslamicQuote[];
  config: MosqueConfig;
  lastUpdated: string;
}
