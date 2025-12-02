import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { signInterpretations, houseInterpretations, aspectInterpretations, getPlanetInHouseInterpretation } from './interpretations.ts';
import {
  calculateJulianDay as calcJD,
  calculateSiderealTime,
  calculateSunLongitude,
  calculateMoonLongitude,
  calculatePlanetLongitude,
  calculateAscendant,
  calculateMC,
  calculateHousesPlacidus,
  getObliquity
} from './astronomy.ts';

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
  timezone: string;
  language: string;
}

function calculateJulianDay(date: Date): number {
  const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
  const y = date.getFullYear() + 4800 - a;
  const m = (date.getMonth() + 1) + 12 * a - 3;
  
  let jd = date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  
  const hours = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  jd += (hours - 12) / 24;
  
  return jd;
}

function calculatePlanetPosition(jd: number, planetIndex: number): { longitude: number; latitude: number } {
  const T = (jd - 2451545.0) / 36525;
  
  const meanLongitudes = [
    [218.3164477, 481267.88123421, -0.0015786, 1.0 / 538841, -1.0 / 65194000],
    [100.4644, 35999.3729, 0.0003, 0, 0],
    [357.5291092, 35999.0502909, -0.0001536, 1.0 / 24490000, 0],
    [355.433, 19140.299, 0.0003, 0, 0],
    [34.351519, 3034.9056606, -0.0008501, -1.0 / 2300000, 0],
    [50.077444, 1222.1138488, 0.0006, 0, 0],
    [314.055005, 429.8640561, 0.0003, 0, 0],
    [304.348665, 219.8833092, 0.0003, 0, 0],
    [238.92881, 145.18042, 0, 0, 0]
  ];
  
  if (planetIndex >= meanLongitudes.length) {
    return { longitude: 0, latitude: 0 };
  }
  
  const coeffs = meanLongitudes[planetIndex];
  let longitude = coeffs[0] + coeffs[1] * T + coeffs[2] * T * T + coeffs[3] * T * T * T + coeffs[4] * T * T * T * T;
  longitude = longitude % 360;
  if (longitude < 0) longitude += 360;
  
  return { longitude, latitude: 0 };
}

function calculateSunPosition(jd: number): { longitude: number } {
  const T = (jd - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * Math.PI / 180) +
            (0.019993 - 0.000101 * T) * Math.sin(2 * M * Math.PI / 180) +
            0.000289 * Math.sin(3 * M * Math.PI / 180);
  
  let longitude = (L0 + C) % 360;
  if (longitude < 0) longitude += 360;
  
  return { longitude };
}

function calculateHouses(jd: number, latitude: number, longitude: number): number[] {
  const T = (jd - 2451545.0) / 36525;
  const theta0 = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000;
  const localSiderealTime = (theta0 + longitude) % 360;
  
  const houses: number[] = [];
  
  for (let i = 0; i < 12; i++) {
    const houseAngle = (localSiderealTime + i * 30) % 360;
    houses.push(houseAngle);
  }
  
  return houses;
}

function getZodiacSign(longitude: number): string {
  const signs = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];
  const normalizedLongitude = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLongitude / 30) % 12;
  const degree = normalizedLongitude % 30;
  return `${signs[signIndex]} ${Math.floor(degree)}°${Math.floor((degree % 1) * 60)}'`;
}

function getSignName(longitude: number): string {
  const signs = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];
  const index = Math.floor(longitude / 30) % 12;
  return signs[index] || 'Áries';
}

function calculateAspects(planets: any[]): any[] {
  const aspects = [];
  const aspectTypes = [
    { name: 'Conjunção', angle: 0, orb: 8 },
    { name: 'Oposição', angle: 180, orb: 8 },
    { name: 'Trígono', angle: 120, orb: 8 },
    { name: 'Quadratura', angle: 90, orb: 8 },
    { name: 'Sextil', angle: 60, orb: 6 }
  ];
  
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const diff = Math.abs(planets[i].longitude - planets[j].longitude);
      const angle = diff > 180 ? 360 - diff : diff;
      
      for (const aspectType of aspectTypes) {
        if (Math.abs(angle - aspectType.angle) <= aspectType.orb) {
          aspects.push({
            planet1: planets[i].name,
            planet2: planets[j].name,
            aspect: aspectType.name,
            orb: Math.abs(angle - aspectType.angle).toFixed(2)
          });
        }
      }
    }
  }
  
  return aspects;
}

function getPlanetHouse(planetLongitude: number, houses: number[]): number {
  for (let i = 0; i < houses.length; i++) {
    const currentHouse = houses[i];
    const nextHouse = houses[(i + 1) % 12];
    
    if (nextHouse > currentHouse) {
      if (planetLongitude >= currentHouse && planetLongitude < nextHouse) {
        return i + 1;
      }
    } else {
      if (planetLongitude >= currentHouse || planetLongitude < nextHouse) {
        return i + 1;
      }
    }
  }
  return 1;
}

function generateDetailedInterpretation(data: any, language: string, name: string): string {
  if (language !== 'pt-BR') {
    return `COMPLETE ASTROLOGICAL ANALYSIS\n\nNatal Chart for ${name}\nPrepared by: Camila Veloso — Astrologer\n\n[Detailed interpretation in English]`;
  }

  const sun = data.planets.find((p: any) => p.name === 'Sol');
  const moon = data.planets.find((p: any) => p.name === 'Lua');
  const mercury = data.planets.find((p: any) => p.name === 'Mercúrio');
  const venus = data.planets.find((p: any) => p.name === 'Vênus');
  const mars = data.planets.find((p: any) => p.name === 'Marte');

  if (!sun || !moon || !data.houses || data.houses.length === 0) {
    return 'Erro: Dados planetários incompletos.';
  }

  const ascendant = data.houses[0];
  const ascendantSign = getSignName(ascendant.longitude);
  const sunSign = getSignName(sun.longitude);
  const moonSign = getSignName(moon.longitude);

  let text = `═══════════════════════════════════════════\n`;
  text += `    ANÁLISE ASTROLÓGICA PROFUNDA\n`;
  text += `═══════════════════════════════════════════\n\n`;
  text += `Carta Natal de ${name}\n`;
  text += `Elaborada por: Camila Veloso — Astróloga\n\n`;

  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `🌟 ASCENDENTE EM ${ascendantSign.toUpperCase()}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  text += `Seu Ascendente representa a máscara que você usa ao interagir com o mundo, sua primeira impressão e como você inicia novos ciclos.\n\n`;
  
  const ascInterpretation = signInterpretations[ascendantSign];
  if (ascInterpretation) {
    text += `ESSÊNCIA: ${ascInterpretation.essence}\n\n`;
    text += `FORÇAS: ${ascInterpretation.strengths}\n\n`;
    text += `DESAFIOS: ${ascInterpretation.challenges}\n\n`;
  }

  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `☉ SOL EM ${sunSign.toUpperCase()}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  text += `Seu Sol representa sua essência vital, seu ego, propósito de vida e como você brilha no mundo.\n\n`;
  text += `POSIÇÃO: ${sun.sign}\n`;
  text += `CASA: ${sun.house}\n\n`;
  
  const sunInterpretation = signInterpretations[sunSign];
  if (sunInterpretation) {
    text += `ESSÊNCIA: ${sunInterpretation.essence}\n\n`;
    text += `DONS NATURAIS: ${sunInterpretation.strengths}\n\n`;
    text += `ÁREAS DE CRESCIMENTO: ${sunInterpretation.challenges}\n\n`;
    text += `PROPÓSITO: ${sunInterpretation.purpose}\n\n`;
  }
  
  text += `SOL NA CASA ${sun.house}: ${getPlanetInHouseInterpretation('Sol', sun.house)}\n\n`;

  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `☽ LUA EM ${moonSign.toUpperCase()}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  text += `Sua Lua governa suas emoções, necessidades internas, instintos e como você se sente seguro.\n\n`;
  text += `POSIÇÃO: ${moon.sign}\n`;
  text += `CASA: ${moon.house}\n\n`;
  
  const moonInterpretation = signInterpretations[moonSign];
  if (moonInterpretation) {
    text += `NATUREZA EMOCIONAL: ${moonInterpretation.essence}\n\n`;
    text += `NECESSIDADES: ${moonInterpretation.strengths}\n\n`;
    text += `VULNERABILIDADES: ${moonInterpretation.challenges}\n\n`;
  }
  
  text += `LUA NA CASA ${moon.house}: ${getPlanetInHouseInterpretation('Lua', moon.house)}\n\n`;

  if (mercury) {
    const mercurySign = getSignName(mercury.longitude);
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `☿ MERCÚRIO EM ${mercurySign.toUpperCase()}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `Mercúrio rege sua mente, comunicação, aprendizado e como você processa informações.\n\n`;
    text += `POSIÇÃO: ${mercury.sign} na Casa ${mercury.house}\n\n`;
    text += `Seu estilo de pensamento é influenciado por ${mercurySign}, trazendo características únicas à sua forma de comunicar e aprender.\n\n`;
  }

  if (venus) {
    const venusSign = getSignName(venus.longitude);
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `♀ VÊNUS EM ${venusSign.toUpperCase()}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `Vênus governa amor, relacionamentos, valores, beleza e o que você atrai.\n\n`;
    text += `POSIÇÃO: ${venus.sign} na Casa ${venus.house}\n\n`;
    text += `Sua forma de amar e se relacionar é colorida por ${venusSign}, determinando o que você valoriza e como expressa afeto.\n\n`;
  }

  if (mars) {
    const marsSign = getSignName(mars.longitude);
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `♂ MARTE EM ${marsSign.toUpperCase()}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `Marte rege ação, energia, desejo, coragem e como você luta por seus objetivos.\n\n`;
    text += `POSIÇÃO: ${mars.sign} na Casa ${mars.house}\n\n`;
    text += `Sua energia e forma de agir são moldadas por ${marsSign}, determinando como você persegue desejos e enfrenta desafios.\n\n`;
  }

  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `🏠 AS 12 CASAS ASTROLÓGICAS\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  text += `As casas revelam as áreas específicas da vida onde as energias planetárias se manifestam.\n\n`;
  
  for (let i = 0; i < 12; i++) {
    const house = data.houses[i];
    const houseSign = getSignName(house.longitude);
    const houseInterp = houseInterpretations[i];
    
    text += `CASA ${i + 1} em ${houseSign}\n`;
    text += `${houseInterp.theme}: ${houseInterp.description}\n`;
    text += `Com ${houseSign} nesta casa, você aborda ${houseInterp.theme.toLowerCase()} com as qualidades deste signo.\n\n`;
  }

  if (data.aspects && data.aspects.length > 0) {
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `✧ ASPECTOS PLANETÁRIOS\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    text += `Aspectos revelam o diálogo entre diferentes partes da sua psique e como energias planetárias interagem.\n\n`;
    
    const majorAspects = data.aspects.slice(0, 10);
    majorAspects.forEach((aspect: any, index: number) => {
      const aspectInterp = aspectInterpretations[aspect.aspect];
      text += `${index + 1}. ${aspect.planet1} ${aspect.aspect} ${aspect.planet2} (orbe ${aspect.orb}°)\n`;
      if (aspectInterp) {
        text += `   ${aspectInterp.description} ${aspectInterp.influence}\n`;
      }
      text += `\n`;
    });
  }

  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `🌠 SÍNTESE E ORIENTAÇÃO\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  text += `Seu mapa natal é um mandala única da sua alma. Cada planeta, signo, casa e aspecto contribui para a complexa sinfonia que é você.\n\n`;
  
  text += `Com Ascendente em ${ascendantSign}, você se apresenta ao mundo de forma ${ascendantSign === 'Áries' ? 'corajosa e direta' : ascendantSign === 'Touro' ? 'estável e confiável' : ascendantSign === 'Gêmeos' ? 'comunicativa e versátil' : 'única'}. `;
  text += `Seu Sol em ${sunSign} revela que sua essência busca ${sunSign === 'Áries' ? 'pioneirismo' : sunSign === 'Touro' ? 'segurança' : sunSign === 'Gêmeos' ? 'conhecimento' : 'realização'}. `;
  text += `Enquanto sua Lua em ${moonSign} mostra que emocionalmente você precisa de ${moonSign === 'Áries' ? 'independência' : moonSign === 'Touro' ? 'estabilidade' : moonSign === 'Gêmeos' ? 'variedade' : 'conexão'}.\n\n`;
  
  text += `Este é um momento poderoso para integrar todas estas facetas. Use o autoconhecimento astrológico como mapa para navegar sua jornada. `;  
  text += `Lembre-se: os astros mostram potenciais, mas você é quem escolhe como manifestá-los. Você é co-criador ativo do seu destino.\n\n`;
  
  text += `═══════════════════════════════════════════\n\n`;
  text += `Este relatório foi elaborado especialmente para você com precisão técnica e sensibilidade humana.\n\n`;
  text += `Para consultas personalizadas e aprofundadas, entre em contato através do nosso site.\n\n`;
  text += `Com luz e sabedoria,\nCamila Veloso — Astróloga Profissional`;
  
  return text;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: ChartRequest = await req.json();
    const { name, birthDate, birthTime, latitude, longitude, timezone, language } = body;

    const [year, month, day] = birthDate.split('-').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);

    const localDate = new Date(year, month - 1, day, hour, minute, 0);
    const timezoneOffset = (timezone || -3) * 60;
    const utcDate = new Date(localDate.getTime() - timezoneOffset * 60000);

    const jd = calcJD(utcDate);

    const obliquity = getObliquity(jd);
    const lst = calculateSiderealTime(jd, longitude);
    const asc = calculateAscendant(lst, latitude, obliquity);
    const mc = calculateMC(lst);
    const houses = calculateHousesPlacidus(asc, mc, latitude, obliquity);

    const sunLong = calculateSunLongitude(jd);
    const moonLong = calculateMoonLongitude(jd);

    const planets = [
      {
        name: 'Sol',
        longitude: sunLong,
        latitude: 0,
        sign: getZodiacSign(sunLong),
        house: getPlanetHouse(sunLong, houses)
      },
      {
        name: 'Lua',
        longitude: moonLong,
        latitude: 0,
        sign: getZodiacSign(moonLong),
        house: getPlanetHouse(moonLong, houses)
      }
    ];

    const planetNames = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    const planetNamesPT = ['Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno', 'Urano', 'Netuno', 'Plutão'];

    for (let i = 0; i < planetNames.length; i++) {
      const pLong = calculatePlanetLongitude(jd, planetNames[i]);
      planets.push({
        name: planetNamesPT[i],
        longitude: pLong,
        latitude: 0,
        sign: getZodiacSign(pLong),
        house: getPlanetHouse(pLong, houses)
      });
    }

    const aspects = calculateAspects(planets);

    const chartData = {
      planets,
      houses: houses.map((h, i) => ({
        number: i + 1,
        longitude: h,
        sign: getZodiacSign(h)
      })),
      aspects,
      julianDay: jd,
      birthData: {
        date: birthDate,
        time: birthTime,
        latitude,
        longitude,
        timezone
      }
    };

    const interpretation = generateDetailedInterpretation(chartData, language, name);

    return new Response(
      JSON.stringify({ success: true, chartData, interpretation }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});