# 🚀 GUIA COMPLETO DE DEPLOY - Camila Veloso

## ✨ O QUE FOI IMPLEMENTADO

### ✅ Fotos Adicionadas
- **Logo no cabeçalho:** Sua linda mandala astrológica
- **Foto profissional:** Na seção "Sobre" da landing page
- **Favicon:** Logo aparece na aba do navegador
- **Meta tags:** Para compartilhamento em redes sociais

### ✅ Design Atualizado
- Landing page profissional com sua identidade visual
- Cards de produtos com preços
- Seção sobre você com suas credenciais
- Depoimentos de clientes
- FAQ completo

## 🌐 COMO FAZER O DEPLOY (PASSO A PASSO)

### OPÇÃO 1: VERCEL (MAIS FÁCIL E RECOMENDADO) 🏆

#### Passo 1: Criar Conta na Vercel
1. Acesse: https://vercel.com/signup
2. Clique em "Continue with GitHub" (ou Email)
3. Faça login/crie sua conta

#### Passo 2: Importar Projeto
Você tem 2 opções:

**A) Upload Direto (Mais Simples)**
1. Na dashboard da Vercel, clique "Add New Project"
2. Clique "Upload" (ou arraste a pasta do projeto)
3. Arraste a pasta `/tmp/cc-agent/60966709/project`
4. Vercel detecta automaticamente que é Vite
5. Clique "Deploy"
6. Aguarde 2-3 minutos
7. SEU SITE ESTÁ NO AR! 🎉

**B) Via GitHub (Profissional)**
1. Crie repositório no GitHub
2. Faça upload do projeto
3. Na Vercel: "Add New Project" → "Import Git Repository"
4. Selecione seu repositório
5. Clique "Deploy"
6. Deploy automático a cada commit!

#### Passo 3: Configurar Variáveis de Ambiente
1. No dashboard do projeto na Vercel
2. Vá em "Settings" → "Environment Variables"
3. Adicione:
   - `VITE_SUPABASE_URL`: https://itevhzzlwrgdomkxupbw.supabase.co
   - `VITE_SUPABASE_ANON_KEY`: [a chave que está no .env]

#### Passo 4: Conectar Domínio Customizado
1. Vá em "Settings" → "Domains"
2. Adicione: `astrologacamila.com.br`
3. Vercel mostra os DNS necessários:
   ```
   A Record: 76.76.21.21
   CNAME: cname.vercel-dns.com
   ```
4. Entre no painel do Registro.br (ou seu provedor)
5. Adicione esses registros DNS
6. Aguarde 24h para propagar
7. Pronto! Seu site estará em www.astrologacamila.com.br

---

### OPÇÃO 2: NETLIFY (TAMBÉM EXCELENTE)

#### Passo 1: Criar Conta
1. Acesse: https://app.netlify.com/signup
2. Faça login com GitHub ou Email

#### Passo 2: Deploy
1. Arraste a pasta do projeto na área "Sites"
2. Ou clique "Add new site" → "Deploy manually"
3. Aguarde o build
4. Site no ar em segundos!

#### Passo 3: Configurar
1. "Site settings" → "Build & deploy"
2. Build command: `npm run build`
3. Publish directory: `dist`

#### Passo 4: Domínio Customizado
1. "Domain settings" → "Add custom domain"
2. Digite: `astrologacamila.com.br`
3. Configure DNS no Registro.br

---

## 📱 TESTANDO LOCALMENTE ANTES

```bash
# No terminal, entre na pasta do projeto:
cd /tmp/cc-agent/60966709/project

# Instale dependências:
npm install

# Rode o servidor de desenvolvimento:
npm run dev

# Abra no navegador:
# http://localhost:5173
```

**O que você verá:**
- ✅ Logo no cabeçalho
- ✅ Sua foto na seção "Sobre"
- ✅ Cards de produtos
- ✅ Depoimentos
- ✅ FAQ
- ✅ Footer com suas informações

---

## 🎯 CHECKLIST PÓS-DEPLOY

Após o site estar no ar, teste:

- [ ] Site abre corretamente
- [ ] Logo aparece no cabeçalho
- [ ] Sua foto aparece na seção "Sobre"
- [ ] Cards de produtos estão visíveis
- [ ] Cores estão bonitas
- [ ] Site funciona no celular
- [ ] Favicon aparece na aba do navegador

---

## 🔧 PROBLEMAS COMUNS

### "Imagens não aparecem"
**Solução:** As imagens estão em `/public`, Vercel/Netlify as copia automaticamente.

### "Erro 404"
**Solução:** Verifique se o arquivo `vercel.json` foi incluído no deploy.

### "Variáveis de ambiente não funcionam"
**Solução:**
1. Adicione no painel da Vercel/Netlify
2. Faça redeploy do site

---

## 📞 PRÓXIMOS PASSOS

Agora que o site está online, podemos implementar:

1. **Sistema de Checkout**
   - Formulário completo de dados do cliente
   - Coleta de dados natais

2. **Integração Mercado Pago**
   - PIX instantâneo
   - Cartão de crédito
   - Boleto

3. **Painel Administrativo**
   - Você gerencia pedidos
   - Vê dados dos clientes
   - Marca como concluído

4. **Área do Cliente**
   - Cliente faz login
   - Vê histórico de compras
   - Download dos mapas

---

## 💰 CUSTOS

- **Vercel/Netlify:** R$ 0/mês (plano gratuito)
- **Domínio:** ~R$ 40/ano (você já tem)
- **Supabase:** R$ 0/mês (até 500MB de dados)

**Total: R$ 0/mês para começar!** 🎉

---

## 🎨 SOBRE AS IMAGENS USADAS

**Logo (logo-camila.png):**
- Mandala astrológica linda com seu nome
- Usada no cabeçalho, favicon e meta tags
- Tamanho: 1.4MB (otimizada automaticamente)

**Foto (camila-veloso.png):**
- Sua foto profissional com fundo removido
- Perfeita para seção "Sobre"
- Tamanho: 96KB
- Borda dourada e efeito de brilho adicionados

---

## 📧 SUPORTE

Se tiver qualquer dúvida durante o deploy:
1. Leia este guia novamente
2. Veja a documentação da Vercel: https://vercel.com/docs
3. Me pergunte! Estou aqui para ajudar

---

**Seu site está PRONTO para ir ao ar! 🚀✨**

Faça o deploy e compartilhe o link comigo para eu ver online!
