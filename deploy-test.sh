#!/bin/bash

# Script para fazer deploy de teste no Vercel
# Execute: chmod +x deploy-test.sh && ./deploy-test.sh

echo "🚀 Iniciando deploy de teste no Vercel..."

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js primeiro."
    echo "   Visite: https://nodejs.org/"
    exit 1
fi

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Por favor, instale o npm primeiro."
    exit 1
fi

echo "✅ Node.js e npm encontrados"

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Build do projeto
echo "🔨 Fazendo build do projeto..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build. Por favor, verifique os erros acima."
    exit 1
fi

echo "✅ Build concluído com sucesso"

# Deploy no Vercel usando npx (não requer instalação global)
echo "🚀 Fazendo deploy de teste no Vercel..."
echo "📝 Nota: Se for a primeira vez, você precisará fazer login no Vercel"
echo ""

npx vercel --yes

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deploy de teste concluído com sucesso!"
    echo "🌐 Você receberá uma URL de preview do deploy"
else
    echo "❌ Erro no deploy. Verifique as mensagens acima."
    exit 1
fi


