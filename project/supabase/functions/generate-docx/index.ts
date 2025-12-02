import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GenerateDocxRequest {
  orderData: {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    birthDate: string;
    birthTime: string;
    birthCity: string;
    birthState: string;
    latitude: number;
    longitude: number;
    clientNotes?: string;
  };
  chartData: {
    planets: Array<{
      name: string;
      sign: string;
      house: number;
      isRetrograde: boolean;
    }>;
    houses: Array<{
      number: number;
      sign: string;
    }>;
    aspects: Array<{
      planet1: string;
      planet2: string;
      aspect: string;
      orb: number;
    }>;
  };
  productType: string;
}

function generateDocxContent(data: GenerateDocxRequest): string {
  const { orderData, chartData, productType } = data;

  let content = `MAPA ASTRAL - ANÁLISE PROFISSIONAL
══════════════════════════════════════════════════════════════

DADOS DO CLIENTE
─────────────────────────────────────────────────────────────
Nome: ${orderData.clientName}
Email: ${orderData.clientEmail}
Telefone: ${orderData.clientPhone}

DADOS NATAIS
─────────────────────────────────────────────────────────────
Data de Nascimento: ${orderData.birthDate}
Horário: ${orderData.birthTime}
Local: ${orderData.birthCity}, ${orderData.birthState}
Coordenadas: ${orderData.latitude}°, ${orderData.longitude}°
`;

  if (orderData.clientNotes) {
    content += `\nOBSERVAÇÕES DO CLIENTE:\n${orderData.clientNotes}\n`;
  }

  content += `\n\n══════════════════════════════════════════════════════════════
POSIÇÕES PLANETÁRIAS
══════════════════════════════════════════════════════════════\n\n`;

  chartData.planets.forEach(planet => {
    const retrograde = planet.isRetrograde ? ' (Retrógrado)' : '';
    content += `${planet.name.padEnd(12)} | ${planet.sign.padEnd(20)} | Casa ${planet.house}${retrograde}\n`;
  });

  content += `\n\n══════════════════════════════════════════════════════════════
CASAS ASTROLÓGICAS
══════════════════════════════════════════════════════════════\n\n`;

  chartData.houses.forEach(house => {
    content += `Casa ${String(house.number).padStart(2)}     | ${house.sign}\n`;
  });

  content += `\n\n══════════════════════════════════════════════════════════════
ASPECTOS PRINCIPAIS
══════════════════════════════════════════════════════════════\n\n`;

  chartData.aspects.slice(0, 20).forEach((aspect, index) => {
    content += `${String(index + 1).padStart(2)}. ${aspect.planet1} ${aspect.aspect} ${aspect.planet2} (orbe: ${aspect.orb}°)\n`;
  });

  content += `\n\n══════════════════════════════════════════════════════════════
SEÇÃO PARA ANÁLISE PERSONALIZADA
══════════════════════════════════════════════════════════════

[Camila, adicione aqui sua interpretação personalizada]

PERSONALIDADE (Sol, Lua, Ascendente)
─────────────────────────────────────────────────────────────



AMOR E RELACIONAMENTOS (Vênus, Marte, Casa 7)
─────────────────────────────────────────────────────────────



CARREIRA E VOCAÇÃO (Meio do Céu, Casa 10)
─────────────────────────────────────────────────────────────



ESPIRITUALIDADE E PROPÓSITO (Casa 12, Netuno)
─────────────────────────────────────────────────────────────



TEMAS IMPORTANTES DO MAPA
─────────────────────────────────────────────────────────────



ORIENTAÇÕES E CONSELHOS
─────────────────────────────────────────────────────────────




══════════════════════════════════════════════════════════════
Material preparado por: Camila Veloso - Astróloga Profissional
Formação: Escola GAIA de Astrologia
Instagram: @astrologacamila
Site: www.astrologacamila.com.br
══════════════════════════════════════════════════════════════
`;

  return content;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: GenerateDocxRequest = await req.json();

    const docxContent = generateDocxContent(body);

    const blob = new Blob([docxContent], { type: 'text/plain' });
    const base64Content = btoa(String.fromCharCode(...new Uint8Array(await blob.arrayBuffer())));

    return new Response(
      JSON.stringify({
        success: true,
        content: base64Content,
        filename: `Mapa_${body.orderData.clientName.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error('Error generating DOCX:', error);
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