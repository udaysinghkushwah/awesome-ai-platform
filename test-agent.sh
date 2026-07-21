#!/bin/bash

# Port gateway is running on
PORT=4000
API_URL="http://localhost:$PORT"

echo "=================================================="
echo "🤖  AWESOME AI PLATFORM - E2E MULTI-AGENT TEST"
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
    -d '{"name":"Multi-Agent Workspace"}')
  PROJECT_ID=$(echo "$CREATE_PROJ" | jq -r '.id' 2>/dev/null)
fi

echo "Active Project ID: $PROJECT_ID"

# 3. Test POST /agents/execute
echo -e "\n3. Testing Agent Mesh (/agents/execute) with custom requirement..."
AGENT_PAYLOAD='{
  "requirement": "Create a secure Task List API endpoint with Postgres DB and basic Jest testing cases."
}'

AGENT_RESP=$(curl -s -X POST "$API_URL/orgs/$ORG_ID/projects/$PROJECT_ID/agents/execute" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$AGENT_PAYLOAD")

echo -e "\n=============================================="
echo "🤖 ARCHITECT AGENT OUTPUT:"
echo "=============================================="
echo "$AGENT_RESP" | jq -r '.architect' 2>/dev/null || echo "$AGENT_RESP"

echo -e "\n=============================================="
echo "💻 DEVELOPER AGENT OUTPUT:"
echo "=============================================="
echo "$AGENT_RESP" | jq -r '.developer' 2>/dev/null || echo "$AGENT_RESP"

echo -e "\n=============================================="
echo "🧪 TESTER (QA) AGENT OUTPUT:"
echo "=============================================="
echo "$AGENT_RESP" | jq -r '.tester' 2>/dev/null || echo "$AGENT_RESP"

echo -e "\n=============================================="
echo "🐳 DEVOPS AGENT OUTPUT:"
echo "=============================================="
echo "$AGENT_RESP" | jq -r '.devops' 2>/dev/null || echo "$AGENT_RESP"

echo -e "\n=================================================="
echo "🎉 E2E MULTI-AGENT TEST COMPLETED!"
echo "=================================================="
