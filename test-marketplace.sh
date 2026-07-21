#!/bin/bash

# Port gateway is running on
PORT=4000
API_URL="http://localhost:$PORT"

echo "=================================================="
echo "🔌  AWESOME AI PLATFORM - E2E MARKETPLACE & TEMPLATE TEST"
echo "=================================================="

# 1. Login to get JWT
echo -e "\n1. Logging in..."
LOGIN_RESP=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@example.com","password":"securepassword123"}')

TOKEN=$(echo "$LOGIN_RESP" | jq -r '.token' 2>/dev/null)
ORG_ID=$(echo "$LOGIN_RESP" | jq -r '.user.organizationId' 2>/dev/null)

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login Failed. Please run ./test-auth.sh first to register the user."
  exit 1
fi

echo "✅ Logged in successfully!"

# 2. Get/Create Project
echo -e "\n2. Listing projects to get a valid Project ID..."
PROJS=$(curl -s -X GET "$API_URL/orgs/$ORG_ID/projects" \
  -H "Authorization: Bearer $TOKEN")
PROJECT_ID=$(echo "$PROJS" | jq -r '.[0].id' 2>/dev/null)

if [ "$PROJECT_ID" == "null" ] || [ -z "$PROJECT_ID" ]; then
  CREATE_PROJ=$(curl -s -X POST "$API_URL/orgs/$ORG_ID/projects" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"Marketplace Workspace"}')
  PROJECT_ID=$(echo "$CREATE_PROJ" | jq -r '.id' 2>/dev/null)
fi

echo "Active Project ID: $PROJECT_ID"

# 3. List Marketplace Plugins
echo -e "\n3. Listing available marketplace plugins..."
curl -s -X GET "$API_URL/plugins" \
  -H "Authorization: Bearer $TOKEN" | jq .

# 4. Register new plugin in Marketplace
echo -e "\n4. Publishing a new custom plugin to marketplace..."
NEW_PLUGIN_PAYLOAD='{
  "name": "Svelte Tailwind Compiler",
  "description": "Auto-compiles Svelte components with design configurations.",
  "author": "Front-End Guru",
  "version": "1.0.4",
  "category": "DevOps"
}'

curl -s -X POST "$API_URL/plugins" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$NEW_PLUGIN_PAYLOAD" | jq .

# 5. Install plugin to project
echo -e "\n5. Installing plugin'\''svelte-tailwind-compiler'\'' in active project..."
curl -s -X POST "$API_URL/orgs/$ORG_ID/projects/$PROJECT_ID/plugins/svelte-tailwind-compiler/install" \
  -H "Authorization: Bearer $TOKEN" | jq .

# 6. List project plugins
echo -e "\n6. Checking installed plugins list for project..."
curl -s -X GET "$API_URL/orgs/$ORG_ID/projects/$PROJECT_ID/plugins" \
  -H "Authorization: Bearer $TOKEN" | jq .

# 7. List Community Templates
echo -e "\n7. Listing available community templates..."
curl -s -X GET "$API_URL/templates" \
  -H "Authorization: Bearer $TOKEN" | jq .

# 8. Get template detail
echo -e "\n8. Fetching NestJS CRUD skeleton files..."
curl -s -X GET "$API_URL/templates/nestjs-crud-api" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo -e "\n=================================================="
echo "🎉 E2E MARKETPLACE & TEMPLATE TEST COMPLETED!"
echo "=================================================="
