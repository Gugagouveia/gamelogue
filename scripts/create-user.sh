#!/bin/bash

# Script para criar um usuário de teste no Gamelogue

PORT=${PORT:-3001}
API_URL="http://localhost:$PORT/api/users"

echo "🎮 Gamelogue - Criação de Usuário"
echo "=================================="
echo ""

# Prompt para informações
read -p "Email: " email
read -p "Username: " username
read -p "Nome (opcional): " name

# Se nome estiver vazio, usa o username
if [ -z "$name" ]; then
  name="$username"
fi

echo ""
echo "Criando usuário..."
echo ""

# Fazer requisição
response=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$email\",
    \"username\": \"$username\",
    \"name\": \"$name\"
  }")

# Verificar se foi sucesso
if echo "$response" | grep -q '"success":true'; then
  echo "✅ Usuário criado com sucesso!"
  echo ""
  echo "📋 Detalhes:"
  echo "$response" | jq '.'
  echo ""
  echo "⚠️  IMPORTANTE: Copie o 'id' acima para usar no upload!"
  echo ""
else
  echo "❌ Erro ao criar usuário:"
  echo "$response" | jq '.'
  echo ""
fi
