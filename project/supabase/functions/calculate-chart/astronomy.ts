export function calculateJulianDay(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;

  let y = year;
  let m = month;

  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);

  const jd = Math.floor(365.25 * (y + 4716)) +
             Math.floor(30.6001 * (m + 1)) +
             day + hour / 24 + b - 1524.5;

  return jd;
}

export function calculateSiderealTime(jd: number, longitude: number): number {
  const T = (jd - 2451545.0) / 36525.0;

  let theta0 = 280.46061837 +
               360.98564736629 * (jd - 2451545.0) +
               0.000387933 * T * T -
               T * T * T / 38710000.0;

  theta0 = theta0 % 360;
  if (theta0 < 0) theta0 += 360;

  const lst = (theta0 + longitude) % 360;
  return lst;
}

export function calculateSunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;

  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;

  const Mrad = M * Math.PI / 180;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
            (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
            0.000289 * Math.sin(3 * Mrad);

  const sunLong = (L0 + C) % 360;
  return sunLong < 0 ? sunLong + 360 : sunLong;
}

export function calculateMoonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;

  const L = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T;
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T;
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T;
  const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T;

  const Lrad = L * Math.PI / 180;
  const Drad = D * Math.PI / 180;
  const Mrad = M * Math.PI / 180;
  const Frad = F * Math.PI / 180;

  let longitude = L +
    6.288774 * Math.sin(Lrad) +
    1.274027 * Math.sin(2 * Drad - Lrad) +
    0.658314 * Math.sin(2 * Drad) +
    0.213618 * Math.sin(2 * Lrad) -
    0.185116 * Math.sin(Mrad) -
    0.114332 * Math.sin(2 * Frad);

  longitude = longitude % 360;
  return longitude < 0 ? longitude + 360 : longitude;
}

export function calculatePlanetLongitude(jd: number, planet: string): number {
  const T = (jd - 2451545.0) / 36525.0;

  const orbitalElements: Record<string, number[]> = {
    'Mercury': [252.25, 149474.07, 0.0, 0.387098, 7.00, 48.33, 77.46],
    'Venus': [181.98, 58519.21, 0.0, 0.723330, 3.39, 76.68, 131.53],
    'Mars': [355.43, 19141.70, 0.0, 1.523688, 1.85, 49.56, 336.04],
    'Jupiter': [34.35, 3036.30, 0.0, 5.202603, 1.31, 100.46, 14.33],
    'Saturn': [50.08, 1223.51, 0.0, 9.554747, 2.49, 113.67, 93.06],
    'Uranus': [314.05, 428.48, 0.0, 19.218446, 0.77, 74.01, 173.01],
    'Neptune': [304.35, 218.46, 0.0, 30.110387, 1.77, 131.78, 48.12],
    'Pluto': [238.93, 145.18, 0.0, 39.482117, 17.14, 110.30, 224.07]
  };

  const elem = orbitalElements[planet];
  if (!elem) return 0;

  const L = (elem[0] + elem[1] * T) % 360;
  return L < 0 ? L + 360 : L;
}

export function calculateAscendant(lst: number, latitude: number, obliquity: number): number {
  const latRad = latitude * Math.PI / 180;
  const lstRad = lst * Math.PI / 180;
  const oblRad = obliquity * Math.PI / 180;

  const x = Math.cos(lstRad);
  const y = -Math.sin(lstRad) * Math.cos(oblRad) - Math.tan(latRad) * Math.sin(oblRad);

  let asc = Math.atan2(y, x) * 180 / Math.PI;
  if (asc < 0) asc += 360;

  return asc % 360;
}

export function calculateMC(lst: number): number {
  return lst % 360;
}

export function calculateHousesPlacidus(
  asc: number,
  mc: number,
  latitude: number,
  obliquity: number
): number[] {
  const houses: number[] = new Array(12);

  houses[0] = asc;
  houses[9] = mc;
  houses[3] = (mc + 180) % 360;
  houses[6] = (asc + 180) % 360;

  const latRad = latitude * Math.PI / 180;
  const oblRad = obliquity * Math.PI / 180;

  for (let i = 0; i < 3; i++) {
    const f = (i + 1) / 3.0;
    const ramc = mc * Math.PI / 180;

    const md = ramc + f * Math.PI / 2;

    const x = Math.atan(Math.tan(md) * Math.cos(oblRad));
    const y = Math.atan(Math.sin(x) / (Math.cos(x) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad)));

    let cusp = y * 180 / Math.PI;
    if (cusp < 0) cusp += 360;

    houses[i + 9] = (mc + (cusp - mc) * f) % 360;
    houses[i] = (houses[i + 9] + 180) % 360;
  }

  for (let i = 3; i < 6; i++) {
    const f = (i - 2) / 3.0;
    houses[i + 3] = (asc + (mc - asc + 180) * f) % 360;
    houses[i] = (houses[i + 3] + 180) % 360;
  }

  return houses;
}

export function getObliquity(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const epsilon = 23.439291 - 0.0130042 * T - 0.00000164 * T * T + 0.000000504 * T * T * T;
  return epsilon;
}
