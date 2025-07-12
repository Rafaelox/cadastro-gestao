#!/bin/bash

# Script de Deploy para Easypanel
# Uso: ./deploy-easypanel.sh [ambiente]

AMBIENTE=${1:-production}
APP_NAME="sistema-gestao-comunicacao"

echo "🚀 Iniciando deploy para Easypanel..."
echo "📦 Ambiente: $AMBIENTE"
echo "📋 App: $APP_NAME"

# Verificar se está em um repositório git
if [ ! -d ".git" ]; then
    echo "❌ Erro: Este não é um repositório git"
    exit 1
fi

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Aviso: Há mudanças não commitadas"
    read -p "Deseja continuar? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build local para validar
echo "🔨 Testando build local..."
if ! npm run build; then
    echo "❌ Erro no build local"
    exit 1
fi

# Docker build test
echo "🐳 Testando Docker build..."
if ! docker build -t $APP_NAME-test .; then
    echo "❌ Erro no Docker build"
    exit 1
fi

echo "✅ Testes passaram!"

# Push para o repositório
echo "📤 Fazendo push para o repositório..."
git push origin main

echo "🎯 Deploy iniciado no Easypanel!"
echo "📊 Acompanhe o progresso em: https://app.easypanel.io"

# Opcional: Healthcheck
echo "⏳ Aguardando deploy..."
sleep 30

echo "🏥 Testando healthcheck..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Deploy concluído com sucesso!"
else
    echo "⚠️  Deploy pode ter falhado. Verifique os logs no Easypanel."
fi