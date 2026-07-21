#!/bin/bash

# Port gateway is running on
PORT=4000
API_URL="http://localhost:$PORT"

echo "=================================================="
echo "🔍  AWESOME AI PLATFORM - E2E SEARCH & INDEXING TEST"
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
echo -e "\n2. Creating a project for search testing..."
CREATE_PROJ=$(curl -s -X POST "$API_URL/orgs/$ORG_ID/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Semantic Search Test Area"}')

PROJECT_ID=$(echo "$CREATE_PROJ" | jq -r '.id' 2>/dev/null)
if [ "$PROJECT_ID" == "null" ] || [ -z "$PROJECT_ID" ]; then
  # Fallback to listing projects if already created
  echo "Project already exists, listing projects..."
  PROJS=$(curl -s -X GET "$API_URL/orgs/$ORG_ID/projects" \
    -H "Authorization: Bearer $TOKEN")
  PROJECT_ID=$(echo "$PROJS" | jq -r '.[0].id' 2>/dev/null)
fi

echo "Active Project ID: $PROJECT_ID"

# 3. Create dummy code files for testing
TEST_DIR="./temp-test-code-dir"
echo -e "\n3. Creating temporary source files in $TEST_DIR..."
mkdir -p "$TEST_DIR"

cat << 'EOF' > "$TEST_DIR/math.ts"
// Math utilities
export function calculateFactorial(n: number): number {
  if (n <= 1) return 1;
  return n * calculateFactorial(n - 1);
}

export function computeFibonacci(limit: number): number[] {
  const sequence = [0, 1];
  while (sequence[sequence.length - 1] + sequence[sequence.length - 2] < limit) {
    sequence.push(sequence[sequence.length - 1] + sequence[sequence.length - 2]);
  }
  return sequence;
}
EOF

cat << 'EOF' > "$TEST_DIR/auth.py"
# Python Authentication helper
import hashlib

def hash_secret_password(password, salt="development_salt"):
    salted = password + salt
    return hashlib.sha256(salted.encode()).hexdigest()

def verify_token_session(token):
    if not token:
        return False
    return token.startswith("valid_session_")
EOF

echo "Created math.ts and auth.py."

# 4. Run the Worker CLI to chunk & index files
echo -e "\n4. Running Ingestion Worker..."
pnpm --filter worker build
node apps/worker/dist/main.js --dir "$TEST_DIR" --project "$PROJECT_ID" --org "$ORG_ID"

# 5. Query Search Endpoint
echo -e "\n5. Performing Semantic Search on query: 'factorial calculation'..."
SEARCH_RESP=$(curl -s -X GET "$API_URL/orgs/$ORG_ID/projects/$PROJECT_ID/search?q=factorial+calculation" \
  -H "Authorization: Bearer $TOKEN")

echo "Search Results:"
echo "$SEARCH_RESP" | jq . 2>/dev/null || echo "$SEARCH_RESP"

# 6. Cleanup
echo -e "\n6. Cleaning up temporary code directory..."
rm -rf "$TEST_DIR"

echo -e "\n=================================================="
echo "🎉 E2E SEARCH TEST COMPLETED!"
echo "=================================================="
