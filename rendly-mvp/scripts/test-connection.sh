#!/bin/bash

echo "🧪 Testing Rendly Services..."

services=(
  "3011:Auth"
  "3012:User"
  "3013:Matching"
  "3004:CCS (Chat)"
  "3005:Video"
  "3006:Moderation"
  "3007:Huddle"
  "3008:Admin"
)

for service in "${services[@]}"; do
  port="${service%:*}"
  name="${service#*:}"

  if curl -s "http://localhost:$port/health" > /dev/null 2>&1; then
    echo "✅ $name ($port) - OK"
  else
    echo "❌ $name ($port) - FAILED"
  fi
done

echo ""
echo "Frontend: http://localhost:3000"
echo "API Gateway: http://localhost:80"
