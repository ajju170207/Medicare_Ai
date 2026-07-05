#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${1:-http://localhost:5001}

echo "Verifying backend at $BASE_URL"

check() {
  local url=$1
  local method=${2:-GET}
  local data=${3:-}

  if [ "$method" = "GET" ]; then
    http_status=$(curl -s -o /dev/null -w "%{http_code}" "$url" ) || true
  else
    http_status=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url" ) || true
  fi

  echo " - $method $url -> $http_status"
  if [ "$http_status" != "200" ]; then
    echo "FAILED: $method $url returned $http_status"
    return 1
  fi
  return 0
}

all_ok=true

echo "Checking /health"
if ! check "$BASE_URL/health" GET; then all_ok=false; fi

echo "Checking hospitals nearby endpoint"
HOSP_URL="$BASE_URL/api/v1/hospitals/nearby?lat=18.531255130644205&lng=73.86877383019156"
if ! check "$HOSP_URL" GET; then all_ok=false; fi

echo "Checking diseases search endpoint"
if ! check "$BASE_URL/api/v1/diseases?search=test" GET; then all_ok=false; fi

if [ "$all_ok" = true ]; then
  echo "\nAll checks passed. Backend appears operational."
  exit 0
else
  echo "\nOne or more checks failed. See output above."
  exit 2
fi
