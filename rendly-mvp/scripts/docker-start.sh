#!/bin/bash

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Starting Docker Containers${NC}"
echo -e "${BLUE}========================================${NC}"

cd "$(dirname "$0")/../backend"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker daemon is not running${NC}"
    echo "Please start Docker Desktop or Docker daemon"
    exit 1
fi

echo -e "${YELLOW}Pulling latest images...${NC}"
docker-compose pull

echo -e "${YELLOW}Starting containers...${NC}"
docker-compose up -d

# Wait for services to be ready
echo -e "${YELLOW}\nWaiting for services to start...${NC}"
sleep 10

# Check health
echo -e "${BLUE}\nService Status:${NC}"

docker ps --filter "label=com.docker.compose.project=backend" --format "table {{.Names}}\t{{.Status}}" 2>/dev/null || docker ps -a --filter "name=rendly-" --format "table {{.Names}}\t{{.Status}}"

echo -e "${GREEN}\n========================================${NC}"
echo -e "${GREEN}✅ Docker containers started!${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "${BLUE}\nAccess Points:${NC}"
echo -e "PostgreSQL: ${GREEN}localhost:5432${NC}"
echo -e "Redis: ${GREEN}localhost:6379${NC}"
echo -e "Nginx (API Gateway): ${GREEN}localhost:80${NC}"

echo -e "\nCheck logs: ${YELLOW}docker-compose logs -f [service-name]${NC}"
