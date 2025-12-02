import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailNotificationRequest {
  orderNumber: string;
  productName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  birthState: string;
  clientNotes?: string;
  docxDownloadUrl: string;
}

function generateEmailHTML(data: EmailNotificationRequest): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .section-title { color: #667eea; font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #667eea; padding-bottom: 5px; }
    .info-row { margin: 8px 0; }
    .label { font-weight: bold; color: #555; }
    .value { color: #333; }
    .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .button:hover { background: #5568d3; }
    .notes { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌟 NOVO PEDIDO RECEBIDO!</h1>
      <p style="margin: 0; font-size: 18px;">Pedido #${data.orderNumber}</p>
    </div>

    <div class="content">
      <div class="section">
        <div class="section-title">📦 Detalhes do Pedido</div>
        <div class="info-row">
          <span class="label">Produto:</span>
          <span class="value">${data.productName}</span>
        </div>
        <div class="info-row">
          <span class="label">Número do Pedido:</span>
          <span class="value">${data.orderNumber}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">👤 Dados do Cliente</div>
        <div class="info-row">
          <span class="label">Nome:</span>
          <span class="value">${data.clientName}</span>
        </div>
        <div class="info-row">
          <span class="label">Email:</span>
          <span class="value">${data.clientEmail}</span>
        </div>
        <div class="info-row">
          <span class="label">Telefone/WhatsApp:</span>
          <span class="value">${data.clientPhone}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">🌙 Dados Natais</div>
        <div class="info-row">
          <span class="label">Data de Nascimento:</span>
          <span class="value">${data.birthDate}</span>
        </div>
        <div class="info-row">
          <span class="label">Horário:</span>
          <span class="value">${data.birthTime}</span>
        </div>
        <div class="info-row">
          <span class="label">Local:</span>
          <span class="value">${data.birthCity}, ${data.birthState}</span>
        </div>
      </div>

      ${data.clientNotes ? `
      <div class="notes">
        <strong>💭 Observações do Cliente:</strong><br>
        ${data.clientNotes}
      </div>
      ` : ''}

      <div style="text-align: center;">
        <a href="${data.docxDownloadUrl}" class="button">
          📥 BAIXAR MAPA GERADO
        </a>
        <p style="color: #666; font-size: 14px;">
          O arquivo com todos os cálculos astrológicos está pronto para você analisar e personalizar!
        </p>
      </div>

      <div class="section" style="background: #e8f5e9;">
        <div class="section-title" style="color: #2e7d32; border-color: #2e7d32;">
          ✅ Próximos Passos
        </div>
        <ol style="margin: 10px 0; padding-left: 20px;">
          <li>Baixe o arquivo com os cálculos astrológicos</li>
          <li>Analise o mapa e adicione suas interpretações personalizadas</li>
          <li>Grave o áudio complementar (se desejado)</li>
          <li>Envie o material final ao cliente por email</li>
          <li>Marque o pedido como concluído no painel administrativo</li>
        </ol>
      </div>
    </div>

    <div class="footer">
      <p>Este é um email automático do sistema de gestão de pedidos.</p>
      <p>Plataforma Astróloga Camila Veloso | www.astrologacamila.com.br</p>
    </div>
  </div>
</body>
</html>
`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: EmailNotificationRequest = await req.json();

    const emailHTML = generateEmailHTML(body);
    const emailSubject = `NOVO PEDIDO - ${body.productName} - ${body.clientName}`;

    console.log('Email would be sent to: astrologacamila@gmail.com');
    console.log('Subject:', emailSubject);
    console.log('Client:', body.clientName);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email notification prepared successfully',
        to: 'astrologacamila@gmail.com',
        subject: emailSubject,
        htmlPreview: emailHTML.substring(0, 500)
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error('Error sending email notification:', error);
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