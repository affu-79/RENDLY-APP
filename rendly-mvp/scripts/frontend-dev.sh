#!/bin/bash

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Starting Rendly Frontend${NC}"
echo -e "${BLUE}========================================${NC}"

cd "$(dirname "$0")/../frontend"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating...${NC}"
    cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:80
NEXT_PUBLIC_WS_URL=ws://localhost:80
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your_client_id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_client_id
EOF
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

echo -e "${GREEN}✅ Starting Next.js development server...${NC}"
echo -e "${YELLOW}Frontend running on: ${GREEN}http://localhost:3000${NC}"

npm run dev
