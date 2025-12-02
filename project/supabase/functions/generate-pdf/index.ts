import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PDFRequest {
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  interpretation: string;
  chartData?: any;
}

function generateHTMLContent(data: PDFRequest): string {
  const { name, birthDate, birthTime, birthLocation, interpretation, chartData } = data;
  
  const formattedDate = new Date(birthDate).toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
  
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mapa Natal - ${name}</title>
  <style>
    @page {
      size: A4;
      margin: 1.5cm;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Georgia', 'Garamond', serif;
      line-height: 1.7;
      color: #1a1a2e;
      background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
      padding: 0;
      margin: 0;
    }
    
    .page {
      background: white;
      max-width: 210mm;
      margin: 0 auto;
      padding: 0;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    
    .cosmic-header {
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e293b 100%);
      padding: 40px 50px;
      text-align: center;
      position: relative;
      overflow: hidden;
      border-bottom: 4px solid #d97706;
    }
    
    .cosmic-header::before {
      content: '★';
      position: absolute;
      top: 20px;
      left: 50px;
      font-size: 24px;
      color: rgba(217, 119, 6, 0.3);
    }
    
    .cosmic-header::after {
      content: '☆';
      position: absolute;
      bottom: 20px;
      right: 50px;
      font-size: 20px;
      color: rgba(217, 119, 6, 0.3);
    }
    
    .main-title {
      font-size: 42px;
      font-weight: bold;
      color: #fbbf24;
      letter-spacing: 6px;
      text-transform: uppercase;
      margin-bottom: 8px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .subtitle {
      font-size: 18px;
      color: #fcd34d;
      font-style: italic;
      letter-spacing: 2px;
    }
    
    .decorative-line {
      width: 200px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #d97706, transparent);
      margin: 15px auto;
    }
    
    .content {
      padding: 50px;
    }
    
    .birth-info {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-left: 6px solid #d97706;
      padding: 30px;
      margin-bottom: 40px;
      box-shadow: 0 4px 15px rgba(217, 119, 6, 0.15);
      border-radius: 0 8px 8px 0;
    }
    
    .birth-info h2 {
      color: #92400e;
      font-size: 24px;
      margin-bottom: 20px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    
    .info-item {
      display: flex;
      align-items: center;
    }
    
    .info-label {
      font-weight: bold;
      color: #92400e;
      margin-right: 8px;
      font-size: 14px;
    }
    
    .info-value {
      color: #451a03;
      font-size: 14px;
    }
    
    .interpretation-section {
      margin-top: 40px;
    }
    
    .interpretation-content {
      white-space: pre-wrap;
      font-size: 13px;
      line-height: 1.9;
      color: #1f2937;
      text-align: justify;
      text-justify: inter-word;
      padding: 25px;
      background: #fafaf9;
      border-radius: 8px;
      border: 1px solid #e7e5e4;
    }
    
    .section-divider {
      width: 100%;
      height: 3px;
      background: linear-gradient(90deg, transparent, #d97706, transparent);
      margin: 35px 0;
    }
    
    .planets-overview {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 30px 0;
    }
    
    .planet-card {
      background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #d97706;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .planet-symbol {
      font-size: 28px;
      text-align: center;
      margin-bottom: 8px;
      color: #d97706;
    }
    
    .planet-name {
      font-weight: bold;
      color: #92400e;
      font-size: 14px;
      text-align: center;
      margin-bottom: 5px;
    }
    
    .planet-position {
      font-size: 11px;
      color: #78716c;
      text-align: center;
    }
    
    .footer {
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
      padding: 35px 50px;
      text-align: center;
      border-top: 4px solid #d97706;
      margin-top: 50px;
    }
    
    .astrologer-name {
      color: #fbbf24;
      font-size: 22px;
      font-weight: bold;
      margin-bottom: 8px;
      letter-spacing: 2px;
    }
    
    .astrologer-title {
      color: #fcd34d;
      font-size: 14px;
      font-style: italic;
      margin-bottom: 20px;
    }
    
    .footer-note {
      color: #d1d5db;
      font-size: 11px;
      line-height: 1.6;
      margin-top: 15px;
      border-top: 1px solid rgba(217, 119, 6, 0.3);
      padding-top: 15px;
    }
    
    .mystical-symbol {
      font-size: 32px;
      color: #d97706;
      opacity: 0.5;
      margin: 20px 0;
    }
    
    @media print {
      body {
        background: white;
      }
      .page {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="cosmic-header">
      <div class="mystical-symbol">★</div>
      <h1 class="main-title">Mapa Natal</h1>
      <div class="decorative-line"></div>
      <p class="subtitle">Análise Astrológica Profunda</p>
    </div>
    
    <div class="content">
      <div class="birth-info">
        <h2>Dados de Nascimento</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Nome:</span>
            <span class="info-value">${name}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Data:</span>
            <span class="info-value">${formattedDate}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Hora:</span>
            <span class="info-value">${birthTime}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Local:</span>
            <span class="info-value">${birthLocation}</span>
          </div>
        </div>
      </div>
      
      ${chartData && chartData.planets ? `
      <div class="planets-overview">
        ${chartData.planets.slice(0, 6).map((planet: any) => `
          <div class="planet-card">
            <div class="planet-symbol">${getPlanetSymbol(planet.name)}</div>
            <div class="planet-name">${planet.name}</div>
            <div class="planet-position">${planet.sign}</div>
          </div>
        `).join('')}
      </div>
      ` : ''}
      
      <div class="section-divider"></div>
      
      <div class="interpretation-section">
        <div class="interpretation-content">${interpretation}</div>
      </div>
    </div>
    
    <div class="footer">
      <div class="astrologer-name">Camila Veloso</div>
      <div class="astrologer-title">Astróloga Profissional</div>
      <div class="footer-note">
        Este documento foi elaborado com base em cálculos astronômicos precisos<br>
        para o momento exato do seu nascimento.<br>
        © ${new Date().getFullYear()} AstroLumen - Todos os direitos reservados
      </div>
    </div>
  </div>
</body>
</html>`;
  return html;
}

function getPlanetSymbol(planetName: string): string {
  const symbols: Record<string, string> = {
    'Sol': '☉',
    'Lua': '☽',
    'Mercúrio': '☿',
    'Vênus': '♀',
    'Marte': '♂',
    'Júpiter': '♃',
    'Saturno': '♄',
    'Urano': '♅',
    'Netuno': '♆',
    'Plutão': '♇'
  };
  return symbols[planetName] || '★';
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: PDFRequest = await req.json();
    const htmlContent = generateHTMLContent(body);
    const encoder = new TextEncoder();
    const data = encoder.encode(htmlContent);
    const base64Html = btoa(String.fromCharCode(...data));

    return new Response(
      JSON.stringify({ success: true, htmlBase64: base64Html }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});