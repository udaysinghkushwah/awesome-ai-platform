#!/bin/bash

# Port gateway is running on
PORT=4000
API_URL="http://localhost:$PORT"

echo "=================================================="
echo "🛡️  AWESOME AI PLATFORM - E2E AUTH & TENANCY TEST"
echo "=================================================="

# 1. Register a new user (which auto-provisions their Org & Team)
echo -e "\n1. Registering user john.doe@example.com..."
REG_RESP=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@example.com","password":"securepassword123","firstName":"John","lastName":"Doe"}')

echo "Registration Response:"
echo "$REG_RESP" | jq . 2>/dev/null || echo "$REG_RESP"

# 2. Login to get JWT
echo -e "\n2. Logging in..."
LOGIN_RESP=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@example.com","password":"securepassword123"}')

TOKEN=$(echo "$LOGIN_RESP" | jq -r '.token' 2>/dev/null)
ORG_ID=$(echo "$LOGIN_RESP" | jq -r '.user.organizationId' 2>/dev/null)

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login Failed. Could not extract token."
  exit 1
fi

echo "✅ Logged in successfully!"
echo "JWT Token: ${TOKEN:0:15}...[truncated]"
echo "Assigned Org ID: $ORG_ID"

# 3. Retrieve Profile details
echo -e "\n3. Testing GET /auth/me profile..."
PROFILE=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN")
echo "$PROFILE" | jq . 2>/dev/null || echo "$PROFILE"

# 4. List User's Organizations
echo -e "\n4. Testing GET /orgs (List organizations)..."
ORGS=$(curl -s -X GET "$API_URL/orgs" \
  -H "Authorization: Bearer $TOKEN")
echo "$ORGS" | jq . 2>/dev/null || echo "$ORGS"

# 5. Create a Project inside organization
echo -e "\n5. Creating Project 'AI Search Engine' inside Organization $ORG_ID..."
CREATE_PROJ=$(curl -s -X POST "$API_URL/orgs/$ORG_ID/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"AI Search Engine"}')
echo "$CREATE_PROJ" | jq . 2>/dev/null || echo "$CREATE_PROJ"

# 6. List Projects inside organization
echo -e "\n6. Listing Projects in Organization $ORG_ID..."
PROJS=$(curl -s -X GET "$API_URL/orgs/$ORG_ID/projects" \
  -H "Authorization: Bearer $TOKEN")
echo "$PROJS" | jq . 2>/dev/null || echo "$PROJS"

# 7. Test Security Guard (Attempt to access a fake Org context)
FAKE_ORG="00000000-0000-0000-0000-000000000000"
echo -e "\n7. Testing Security: Requesting projects for unauthorized Org ID: $FAKE_ORG..."
SECURITY_TEST=$(curl -s -X GET "$API_URL/orgs/$FAKE_ORG/projects" \
  -H "Authorization: Bearer $TOKEN")
echo "Response:"
echo "$SECURITY_TEST" | jq . 2>/dev/null || echo "$SECURITY_TEST"

echo -e "\n=================================================="
echo "🎉 E2E TEST COMPLETED!"
echo "=================================================="
