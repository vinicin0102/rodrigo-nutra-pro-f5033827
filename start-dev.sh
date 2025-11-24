#!/bin/bash

# Script para iniciar o servidor de desenvolvimento
# Execute: chmod +x start-dev.sh && ./start-dev.sh

# Configurar o PATH para incluir Node.js do nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Ativar Node.js padrão
nvm use default 2>/dev/null || nvm use node 2>/dev/null

# Verificar se Node.js está disponível
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    echo "Por favor, instale o Node.js ou configure o nvm."
    exit 1
fi

echo "✅ Node.js $(node --version) encontrado"
echo "✅ npm $(npm --version) disponível"

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Instalando dependências (isso pode levar alguns minutos)..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo "❌ Erro ao instalar dependências"
        exit 1
    fi
    echo "✅ Dependências instaladas com sucesso"
fi

echo ""
echo "🚀 Iniciando servidor de desenvolvimento..."
echo "📍 O servidor estará disponível em: http://localhost:8080"
echo "💡 As alterações serão recarregadas automaticamente (Hot Module Replacement)"
echo ""
echo "Pressione Ctrl+C para parar o servidor"
echo ""

# Iniciar o servidor de desenvolvimento
npm run dev

