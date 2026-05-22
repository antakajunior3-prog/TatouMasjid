import { PrayerTime, MosqueConfig } from './types';
import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';

// Approximate Hijri Calendar calculation (Kuwaiti Algorithm standard variant)
export function getHijriDate(date: Date, adjustment: number = 0): {
  day: number;
  month: string;
  monthArabic: string;
  year: number;
} {
  // Apply manual adjustment (days as milliseconds)
  const adjustedDate = new Date(date.getTime() + adjustment * 24 * 60 * 60 * 1000);
  
  let gday = adjustedDate.getDate();
  let gmonth = adjustedDate.getMonth() + 1;
  let gyear = adjustedDate.getFullYear();

  // Calculate Julian Day
  if (gmonth < 3) {
    gyear -= 1;
    gmonth += 12;
  }
  let a = Math.floor(gyear / 100);
  let b = Math.floor(a / 4);
  let c = 2 - a + b;
  let e = Math.floor(365.25 * (gyear + 4716));
  let f = Math.floor(30.6001 * (gmonth + 1));
  let jd = c + gday + e + f - 1524.5;

  // Calculate Hijri details
  let jdShift = jd + 0.5 - 1948439.5;
  let cyc = Math.floor(jdShift / 10631);
  let r = jdShift - cyc * 10631;
  let j = Math.floor((r - 0.12) / 354.36667);
  let hdayShift = r - Math.floor(j * 354.36667 + 0.5 * j);
  
  let hday = Math.floor(hdayShift) + 1;
  let hmonth = Math.floor((hdayShift - hday + 29.5) / 29.5) + 1;
  let hyear = cyc * 30 + j + 1;

  // Extra correction for day/month rollover
  if (hday > 30) {
    hday = 1;
    hmonth += 1;
  }
  if (hmonth > 12) {
    hmonth = 1;
    hyear += 1;
  }

  const hijriMonths = [
    { en: "Muharram", ar: "المحرّم" },
    { en: "Safar", ar: "صفر" },
    { en: "Rabi' al-Awwal", ar: "ربيع الأول" },
    { en: "Rabi' al-Thani", ar: "ربيع الآخر" },
    { en: "Jumada al-Awwal", ar: "جمادى الأولى" },
    { en: "Jumada al-Thani", ar: "جمادى الآخرة" },
    { en: "Rajab", ar: "رجب" },
    { en: "Sha'ban", ar: "شعبان" },
    { en: "Ramadan", ar: "رمضان" },
    { en: "Shawwal", ar: "شوال" },
    { en: "Dhu al-Qadah", ar: "ذو القعدة" },
    { en: "Dhu al-Hijjah", ar: "ذو الحجة" }
  ];

  const monthIdx = Math.max(1, Math.min(12, hmonth)) - 1;
  return {
    day: hday,
    month: hijriMonths[monthIdx].en,
    monthArabic: hijriMonths[monthIdx].ar,
    year: hyear
  };
}

// Convert HH:MM to minutes since midnight
export function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Format minutes to HH:MM
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = Math.floor(minutes % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Computes the absolute Iqamah time based on type
export function calculateIqamahTime(prayer: PrayerTime): string {
  if (prayer.id === 'sunrise') return '--:--';
  if (prayer.iqamahType === 'fixed') return prayer.iqamahValue;
  
  // Calculate relative increment
  const adhanMins = timeToMinutes(prayer.adhan);
  const relativeMins = parseInt(prayer.iqamahValue, 10) || 0;
  return minutesToTime(adhanMins + relativeMins);
}

// Identify current next prayer and whether it is on the next day
export function getNextPrayer(prayers: PrayerTime[], now: Date): {
  prayer: PrayerTime;
  isTomorrow: boolean;
} {
  // Exclude sunrise from next prayer calculations because it is not an obligatory prayer
  const activePrayers = prayers.filter(p => p.id !== 'sunrise');
  
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTotalMins = currentHours * 60 + currentMinutes;

  // Search for the first prayer of today that is in the future
  for (const p of activePrayers) {
    const prayerMins = timeToMinutes(p.adhan);
    if (prayerMins > currentTotalMins) {
      return { prayer: p, isTomorrow: false };
    }
  }

  // If none are left today, the next prayer is Fajr tomorrow
  const fajr = activePrayers.find(p => p.id === 'fajr') || activePrayers[0];
  return { prayer: fajr, isTomorrow: true };
}

// Formulate beautiful countdown string (HH:MM:SS)
export function getCountdown(targetAdhan: string, isTomorrow: boolean, now: Date): string {
  const targetMins = timeToMinutes(targetAdhan);
  const curHours = now.getHours();
  const curMinutes = now.getMinutes();
  const curSeconds = now.getSeconds();
  const curTotalSeconds = (curHours * 60 + curMinutes) * 60 + curSeconds;

  let targetTotalSeconds = targetMins * 60;
  if (isTomorrow) {
    targetTotalSeconds += 24 * 60 * 60; // Add 24 hours
  }

  let diffSeconds = targetTotalSeconds - curTotalSeconds;
  if (diffSeconds < 0) diffSeconds = 0;

  const h = Math.floor(diffSeconds / 3600);
  const m = Math.floor((diffSeconds % 3600) / 60);
  const s = Math.floor(diffSeconds % 60);

  const hStr = h > 0 ? `${h}h ` : '';
  return `${hStr}${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

// Dynamically calculate the five daily prayer times based on Mosque's configuration
export function calculatePrayersForMosque(
  config: MosqueConfig,
  currentDate: Date,
  originalPrayers: PrayerTime[]
): PrayerTime[] {
  if (!config.useCalculatedTimes || config.latitude === undefined || config.longitude === undefined) {
    return originalPrayers;
  }

  try {
    const lat = Number(config.latitude);
    const lng = Number(config.longitude);
    if (isNaN(lat) || isNaN(lng)) {
      return originalPrayers;
    }

    const coords = new Coordinates(lat, lng);
    
    // Choose correct calculation parameters based on selection config
    const methodName = config.calculationMethod || 'MuslimWorldLeague';
    const methodFn = CalculationMethod[methodName as keyof typeof CalculationMethod] || CalculationMethod.MuslimWorldLeague;
    const params = methodFn();
    
    // Configure Madhab for Asr times
    params.madhab = config.madhab === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;
    
    const times = new PrayerTimes(coords, currentDate, params);
    
    const formatTime = (d: Date | null | undefined): string | null => {
      if (!d || isNaN(d.getTime())) return null;
      const h = d.getHours().toString().padStart(2, '0');
      const m = d.getMinutes().toString().padStart(2, '0');
      return `${h}:${m}`;
    };

    const calculatedMap: Record<string, string | null> = {
      fajr: formatTime(times.fajr),
      sunrise: formatTime(times.sunrise),
      dhuhr: formatTime(times.dhuhr),
      asr: formatTime(times.asr),
      maghrib: formatTime(times.maghrib),
      isha: formatTime(times.isha),
    };

    return originalPrayers.map(p => {
      const calculatedAdhan = calculatedMap[p.id];
      if (calculatedAdhan) {
        return {
          ...p,
          adhan: calculatedAdhan
        };
      }
      return p;
    });
  } catch (err) {
    console.error("Failed to dynamically calculate prayer times:", err);
    return originalPrayers;
  }
}
