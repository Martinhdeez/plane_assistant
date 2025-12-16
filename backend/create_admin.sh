#!/bin/sh

# Script para crear el primer usuario administrador
# Este endpoint solo funciona si NO existe ningún admin todavía

echo "=== Creando primer usuario administrador ==="
echo ""

# Datos del admin
USERNAME="admin"
EMAIL="admin@planeassistant.com"
PASSWORD="admin123"  # CAMBIAR DESPUÉS DEL PRIMER LOGIN

echo "Creando usuario: $USERNAME"
echo "Email: $EMAIL"
echo ""

# Hacer la petición
curl -X POST http://localhost:8000/api/admin/init \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"role\": \"administrador\"
  }" | jq .

# echo ""
# echo "=== Credenciales del administrador ==="
# echo "Usuario: $USERNAME"
# echo "Email: $EMAIL"
# echo "Contraseña: $PASSWORD"
# echo ""
# echo "⚠️  IMPORTANTE: Cambia la contraseña después del primer login"
# echo ""
# echo "Para iniciar sesión:"
# echo "1. Ve a http://localhost:5173/login"
# echo "2. Usa el email: $EMAIL"
# echo "3. Contraseña: $PASSWORD"
# echo "4. Accede al panel admin en: http://localhost:5173/admin"
