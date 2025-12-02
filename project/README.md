# 🌟 Camila Veloso - Plataforma de Astrologia Profissional

Plataforma completa para venda de análises astrológicas personalizadas.

## 📋 Sobre o Projeto

Sistema profissional de astrologia desenvolvido para a Astróloga Camila Veloso, graduada pela Escola GAIA de Astrologia.

### Funcionalidades Implementadas

✅ **Landing Page Profissional**
- Design moderno e responsivo
- Seção sobre a astróloga
- Catálogo de serviços com preços
- Depoimentos de clientes
- FAQ completo

✅ **Cálculos Astrológicos Precisos**
- Edge Function com `astronomy-engine`
- Posições planetárias exatas
- Sistema de Casas Placidus
- Detecção de retrogradação
- Cálculo de aspectos

✅ **Banco de Dados Completo**
- Gestão de clientes
- Catálogo de produtos
- Sistema de pedidos
- Assinaturas mensais
- Programa de afiliados
- Sistema de avaliações

✅ **Geração de Documentos**
- Arquivos TXT formatados
- Dados completos do mapa
- Seções para análise personalizada

✅ **Sistema de Notificações**
- Emails automáticos para a astróloga
- Notificação de novos pedidos
- Templates HTML profissionais

## 🚀 Deploy

### Vercel (Recomendado)

1. Instalar Vercel CLI:
```bash
npm i -g vercel
```

2. Fazer login:
```bash
vercel login
```

3. Deploy do projeto:
```bash
vercel
```

4. Deploy em produção:
```bash
vercel --prod
```

### Netlify

1. Conectar repositório no dashboard da Netlify
2. Configurar:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
3. Deploy automático a cada commit

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 📦 Produtos Cadastrados

1. **Mapa Natal Básico** - R$ 37,00 (automatizado)
2. **Mapa Natal Completo** - R$ 170,00 (análise personalizada)
3. **Revolução Solar** - R$ 270,00
4. **Sinastria de Casal** - R$ 300,00
5. **Pacote Anual VIP** - R$ 500,00
6. **Assinatura Astro Plus** - R$ 29,00/mês
7. **Assinatura Astro Pro** - R$ 79,00/mês

## 🔐 Variáveis de Ambiente

Arquivo `.env` já configurado com:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 📱 Próximas Implementações

- [ ] Sistema de checkout completo
- [ ] Integração Mercado Pago
- [ ] Painel administrativo
- [ ] Área do cliente
- [ ] Sistema de emails transacionais
- [ ] Programa de afiliados ativo

## 🎨 Stack Tecnológica

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Cálculos:** astronomy-engine
- **Auth:** Supabase Auth
- **Hospedagem:** Vercel/Netlify

## 👩‍💼 Sobre Camila Veloso

Astróloga profissional graduada pela Escola GAIA de Astrologia, com mais de 6 anos de experiência em análises personalizadas.

- **Instagram:** @astrologacamila
- **Site:** www.astrologacamila.com.br

---

Desenvolvido com ✨ e precisão astronômica
