#!/bin/bash

echo "🚀 Iniciando deploy da Plataforma Camila Veloso..."

echo "📦 Instalando dependências..."
npm install

echo "🔨 Fazendo build do projeto..."
npm run build

echo "✅ Build concluído! Arquivos em /dist"

echo ""
echo "🌐 Para fazer deploy:"
echo ""
echo "OPÇÃO 1 - Vercel (Recomendado):"
echo "  npm i -g vercel"
echo "  vercel login"
echo "  vercel --prod"
echo ""
echo "OPÇÃO 2 - Netlify:"
echo "  npm i -g netlify-cli"
echo "  netlify login"
echo "  netlify deploy --prod --dir=dist"
echo ""
echo "OPÇÃO 3 - Manual:"
echo "  Faça upload da pasta /dist para seu servidor"
echo ""
