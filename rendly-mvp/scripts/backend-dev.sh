#!/bin/bash

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Starting Rendly Backend Services${NC}"
echo -e "${BLUE}========================================${NC}"

cd "$(dirname "$0")/../backend"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please update .env with your credentials before running services${NC}"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

echo -e "${GREEN}\n✅ Starting all services...${NC}"
echo -e "${YELLOW}Services starting on ports:${NC}"
echo -e "  Auth Service: ${GREEN}3001${NC}"
echo -e "  User Service: ${GREEN}3002${NC}"
echo -e "  Matching Service: ${GREEN}3003${NC}"
echo -e "  Chat Service (CCS): ${GREEN}3004${NC}"
echo -e "  Video Service: ${GREEN}3005${NC}"
echo -e "  Moderation Service: ${GREEN}3006${NC}"
echo -e "  Huddle Service: ${GREEN}3007${NC}"
echo -e "  Admin Service: ${GREEN}3008${NC}"
echo -e "  API Gateway (Nginx): ${GREEN}80${NC}"

npm run dev
