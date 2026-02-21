#!/bin/bash

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}RENDLY MVP - Setup & Installation${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 20+ from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node --version)${NC}"

# Check if Docker is installed
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker is installed: $(docker --version)${NC}"
else
    echo -e "${YELLOW}⚠️  Docker not found. You'll need it for PostgreSQL & Redis${NC}"
fi

# Navigate to project root
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

echo -e "${BLUE}\n📁 Project Root: $PROJECT_ROOT${NC}"

# Create environment files
echo -e "${YELLOW}\n📝 Creating environment files...${NC}"

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✅ Created backend/.env${NC}"
else
    echo -e "${YELLOW}⚠️  backend/.env already exists${NC}"
fi

if [ ! -f "frontend/.env.local" ]; then
    cat > frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:80
NEXT_PUBLIC_WS_URL=ws://localhost:80
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your_linkedin_client_id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
EOF
    echo -e "${GREEN}✅ Created frontend/.env.local${NC}"
fi

# Install backend dependencies
echo -e "${BLUE}\n📦 Installing backend dependencies...${NC}"
cd "$PROJECT_ROOT/backend"

if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Backend node_modules already exists${NC}"
fi

# Install individual service dependencies
echo -e "${BLUE}\n📦 Installing microservice dependencies...${NC}"

for service in auth-service user-service matching-service chat-service ccs-service video-service moderation-service huddle-service admin-service; do
    SERVICE_PATH="$PROJECT_ROOT/backend/services/$service"
    if [ -d "$SERVICE_PATH" ]; then
        echo -e "${YELLOW}Installing $service...${NC}"
        cd "$SERVICE_PATH"
        npm install
        echo -e "${GREEN}✅ $service ready${NC}"
    fi
done

# Install shared dependencies
echo -e "${BLUE}\n📦 Installing shared module...${NC}"
cd "$PROJECT_ROOT/backend/shared"
npm install
echo -e "${GREEN}✅ Shared module ready${NC}"

# Install frontend dependencies
echo -e "${BLUE}\n📦 Installing frontend dependencies...${NC}"
cd "$PROJECT_ROOT/frontend"

if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend node_modules already exists${NC}"
fi

echo -e "${GREEN}\n========================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "${BLUE}\nNext Steps:${NC}"
echo -e "1. Update backend/.env with your credentials"
echo -e "2. Start Docker containers: ${YELLOW}docker-compose -f backend/docker-compose.yml up -d${NC}"
echo -e "3. Run backend services: ${YELLOW}cd backend && npm run dev${NC}"
echo -e "4. Run frontend: ${YELLOW}cd frontend && npm run dev${NC}"
echo -e "\nFrontend: ${GREEN}http://localhost:3000${NC}"
echo -e "Backend API: ${GREEN}http://localhost:80${NC}"
