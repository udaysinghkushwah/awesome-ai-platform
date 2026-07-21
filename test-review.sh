#!/bin/bash

# Port gateway is running on
PORT=4000
API_URL="http://localhost:$PORT"

echo "=================================================="
echo "🕵️‍♂️  AWESOME AI PLATFORM - E2E CODE REVIEW & SQL ANALYSIS TEST"
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
  # Create one if list is empty
  CREATE_PROJ=$(curl -s -X POST "$API_URL/orgs/$ORG_ID/projects" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"Code Review Workspace"}')
  PROJECT_ID=$(echo "$CREATE_PROJ" | jq -r '.id' 2>/dev/null)
fi

echo "Active Project ID: $PROJECT_ID"

# 3. Test POST /reviews/analyze
echo -e "\n3. Testing AI Code Review (/reviews/analyze) with mock vulnerable code..."
CODE_PAYLOAD='{
  "filename": "server.ts",
  "language": "typescript",
  "code": "import express from '\''express'\'';\nconst app = express();\nconst port = 3000;\n\napp.get('\''/user'\'', (req, res) => {\n  const id = req.query.id;\n  // VULNERABLE: Direct SQL injection\n  const query = \`SELECT * FROM users WHERE id = '\''\${id}'\''\`;\n  db.query(query, (err, result) => {\n    res.send(result);\n  });\n});\n"
}'

REVIEW_RESP=$(curl -s -X POST "$API_URL/orgs/$ORG_ID/projects/$PROJECT_ID/reviews/analyze" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$CODE_PAYLOAD")

echo "Review Response:"
echo "$REVIEW_RESP" | jq . 2>/dev/null || echo "$REVIEW_RESP"

# 4. Test POST /reviews/sql
echo -e "\n4. Testing SQL Optimizer (/reviews/sql) with unindexed query..."
SQL_PAYLOAD='{
  "query": "SELECT id, email, created_at FROM users WHERE status = '\''PENDING'\'' ORDER BY created_at DESC;",
  "schema": "CREATE TABLE users (id UUID PRIMARY KEY, email VARCHAR(255) UNIQUE, status VARCHAR(50), created_at TIMESTAMP);"
}'

SQL_RESP=$(curl -s -X POST "$API_URL/orgs/$ORG_ID/projects/$PROJECT_ID/reviews/sql" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$SQL_PAYLOAD")

echo "SQL Analysis Response:"
echo "$SQL_RESP" | jq . 2>/dev/null || echo "$SQL_RESP"

echo -e "\n=================================================="
echo "🎉 E2E CODE REVIEW & SQL ANALYSIS TEST COMPLETED!"
echo "=================================================="
