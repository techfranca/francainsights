#!/bin/bash

# ============================================
# FRANCA INSIGHTS - Script de Setup
# ============================================

echo "🚀 FRANCA INSIGHTS - Setup Inicial"
echo "=================================="
echo ""

# Verifica Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 18+ primeiro."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js versão 18+ necessária. Versão atual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Instala dependências
echo ""
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo "✅ Dependências instaladas"

# Cria arquivo .env.local se não existir
if [ ! -f .env.local ]; then
    echo ""
    echo "📝 Criando arquivo .env.local..."
    cp .env.example .env.local
    echo "✅ Arquivo .env.local criado"
    echo ""
    echo "⚠️  IMPORTANTE: Edite o arquivo .env.local com suas credenciais!"
    echo ""
else
    echo "✅ Arquivo .env.local já existe"
fi

# Gera JWT_SECRET se não existir no .env.local
if grep -q "sua-chave-secreta-jwt-aqui" .env.local 2>/dev/null; then
    echo ""
    echo "🔐 Gerando JWT_SECRET..."
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/sua-chave-secreta-jwt-aqui/$JWT_SECRET/" .env.local
    else
        sed -i "s/sua-chave-secreta-jwt-aqui/$JWT_SECRET/" .env.local
    fi
    
    echo "✅ JWT_SECRET gerado"
fi

echo ""
echo "=================================="
echo "✅ Setup concluído!"
echo ""
echo "Próximos passos:"
echo "1. Edite .env.local com suas credenciais do Supabase e UAZAPI"
echo "2. Execute a migration SQL no Supabase"
echo "3. Rode: npm run dev"
echo ""
echo "📚 Consulte o README.md para instruções detalhadas"
echo ""
