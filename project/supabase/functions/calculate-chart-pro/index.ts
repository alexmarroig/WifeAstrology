import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import * as Astronomy from "npm:astronomy-engine@2.1.19";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChartRequest {
  name: string;
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  language?: string;
}

interface PlanetPosition {
  name: string;
  longitude: number;
  latitude: number;
  sign: string;
  degree: number;
  minute: number;
  house: number;
  isRetrograde: boolean;
}

const ZODIAC_SIGNS = [
  'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
  'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'
];

const PLANET_NAMES: Record<string, string> = {
  'Sun': 'Sol',
  'Moon': 'Lua',
  'Mercury': 'Mercúrio',
  'Venus': 'Vênus',
  'Mars': 'Marte',
  'Jupiter': 'Júpiter',
  'Saturn': 'Saturno',
  'Uranus': 'Urano',
  'Neptune': 'Netuno',
  'Pluto': 'Plutão'
};

function eclipticToZodiac(longitude: number): {
  sign: string;
  degree: number;
  minute: number;
  signIndex: number;
} {
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const degreeInSign = normalized % 30;
  const degree = Math.floor(degreeInSign);
  const minute = Math.floor((degreeInSign - degree) * 60);

  return {
    sign: ZODIAC_SIGNS[signIndex],
    degree,
    minute,
    signIndex
  };
}

function calculateHousesPlacidus(
  lst: number,
  latitude: number,
  obliquity: number
): number[] {
  const houses: number[] = [];
  const latRad = (latitude * Math.PI) / 180;
  const oblRad = (obliquity * Math.PI) / 180;

  const mc = lst;
  const ic = (mc + 180) % 360;

  const ramc = (lst * Math.PI) / 180;

  for (let i = 0; i < 12; i++) {
    if (i === 0) {
      const ascendant = calculateAscendant(lst, latitude, obliquity);
      houses.push(ascendant);
    } else if (i === 3) {
      houses.push(ic);
    } else if (i === 6) {
      const descendant = (houses[0] + 180) % 360;
      houses.push(descendant);
    } else if (i === 9) {
      houses.push(mc);
    } else if (i >= 1 && i <= 2) {
      const f = (i - 1) / 3;
      const cuspAngle = ic + f * ((houses[0] + 180) % 360 - ic);
      houses.push(cuspAngle % 360);
    } else if (i >= 4 && i <= 5) {
      const f = (i - 4) / 3;
      const cuspAngle = houses[0] + f * (ic - houses[0]);
      houses.push(cuspAngle % 360);
    } else if (i >= 7 && i <= 8) {
      const f = (i - 7) / 3;
      const cuspAngle = (houses[0] + 180) % 360 + f * (mc - ((houses[0] + 180) % 360));
      houses.push(cuspAngle % 360);
    } else {
      const f = (i - 10) / 3;
      const cuspAngle = mc + f * (houses[0] - mc);
      houses.push(cuspAngle % 360);
    }
  }

  return houses;
}

function calculateAscendant(
  lst: number,
  latitude: number,
  obliquity: number
): number {
  const lstRad = (lst * Math.PI) / 180;
  const latRad = (latitude * Math.PI) / 180;
  const oblRad = (obliquity * Math.PI) / 180;

  const y = -Math.cos(lstRad);
  const x = Math.sin(lstRad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad);

  let ascendant = (Math.atan2(y, x) * 180) / Math.PI;
  if (ascendant < 0) ascendant += 360;

  return ascendant;
}

function getPlanetHouse(planetLongitude: number, houses: number[]): number {
  const normalizedPlanet = ((planetLongitude % 360) + 360) % 360;

  for (let i = 0; i < 12; i++) {
    const currentHouse = houses[i];
    const nextHouse = houses[(i + 1) % 12];

    if (nextHouse > currentHouse) {
      if (normalizedPlanet >= currentHouse && normalizedPlanet < nextHouse) {
        return i + 1;
      }
    } else {
      if (normalizedPlanet >= currentHouse || normalizedPlanet < nextHouse) {
        return i + 1;
      }
    }
  }

  return 1;
}

function calculateAspects(planets: PlanetPosition[]): Array<{
  planet1: string;
  planet2: string;
  aspect: string;
  angle: number;
  orb: number;
}> {
  const aspects = [];
  const aspectTypes = [
    { name: 'Conjunção', angle: 0, orb: 8 },
    { name: 'Oposição', angle: 180, orb: 8 },
    { name: 'Trígono', angle: 120, orb: 8 },
    { name: 'Quadratura', angle: 90, orb: 7 },
    { name: 'Sextil', angle: 60, orb: 6 }
  ];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      let diff = Math.abs(planets[i].longitude - planets[j].longitude);
      if (diff > 180) diff = 360 - diff;

      for (const aspectType of aspectTypes) {
        const orbDiff = Math.abs(diff - aspectType.angle);
        if (orbDiff <= aspectType.orb) {
          aspects.push({
            planet1: planets[i].name,
            planet2: planets[j].name,
            aspect: aspectType.name,
            angle: aspectType.angle,
            orb: parseFloat(orbDiff.toFixed(2))
          });
        }
      }
    }
  }

  return aspects;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: ChartRequest = await req.json();
    const { name, birthDate, birthTime, latitude, longitude, timezone = 'America/Sao_Paulo', language = 'pt-BR' } = body;

    const [year, month, day] = birthDate.split('-').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);

    const birthDateTime = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
    const timezoneOffsetHours = timezone === 'America/Sao_Paulo' ? 3 : 0;
    const utcDate = new Date(birthDateTime.getTime() + timezoneOffsetHours * 3600000);

    const astroDate = new Astronomy.AstroTime(utcDate);

    const planets: PlanetPosition[] = [];
    const planetBodies = [
      'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
      'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'
    ];

    for (const bodyName of planetBodies) {
      const ecliptic = Astronomy.Ecliptic(bodyName, astroDate);

      const zodiacInfo = eclipticToZodiac(ecliptic.elon);

      let isRetrograde = false;
      if (bodyName !== 'Sun' && bodyName !== 'Moon') {
        const futureDate = astroDate.AddDays(1);
        const futureEcliptic = Astronomy.Ecliptic(bodyName, futureDate);
        isRetrograde = futureEcliptic.elon < ecliptic.elon;
      }

      planets.push({
        name: PLANET_NAMES[bodyName],
        longitude: ecliptic.elon,
        latitude: ecliptic.elat,
        sign: `${zodiacInfo.sign} ${zodiacInfo.degree}°${zodiacInfo.minute}'`,
        degree: zodiacInfo.degree,
        minute: zodiacInfo.minute,
        house: 0,
        isRetrograde
      });
    }

    const jd = astroDate.tt + 2451545.0;
    const T = (jd - 2451545.0) / 36525.0;
    const theta0 = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - (T * T * T) / 38710000.0;
    const lst = ((theta0 + longitude) % 360 + 360) % 360;

    const obliquity = 23.439291 - 0.0130042 * T;

    const houses = calculateHousesPlacidus(lst, latitude, obliquity);

    for (const planet of planets) {
      planet.house = getPlanetHouse(planet.longitude, houses);
    }

    const aspects = calculateAspects(planets);

    const chartData = {
      name,
      planets,
      houses: houses.map((h, i) => {
        const zodiacInfo = eclipticToZodiac(h);
        return {
          number: i + 1,
          longitude: h,
          sign: `${zodiacInfo.sign} ${zodiacInfo.degree}°${zodiacInfo.minute}'`
        };
      }),
      aspects,
      birthData: {
        date: birthDate,
        time: birthTime,
        latitude,
        longitude,
        timezone
      }
    };

    return new Response(
      JSON.stringify({ success: true, chartData }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error('Error calculating chart:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});