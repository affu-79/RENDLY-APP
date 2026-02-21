# Rendly MVP - Complete Microservice Architecture

## Project Structure

- `frontend/` - Next.js React frontend application
- `backend/` - Node.js microservices backend
  - `services/` - Individual microservices
  - `shared/` - Shared utilities and types
  - `config/` - Configuration files

## Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### Installation

1. Clone repository:
```bash
git clone <repo>
cd rendly-mvp
```

2. Setup environment:
```bash
cp .env.example .env
# Update .env with your credentials
```

3. Install dependencies:

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
npm install
npx lerna bootstrap
```

### Development

Start infrastructure and backend services (run from backend directory):
```bash
cd backend
docker-compose up -d
npm run dev
```

Start frontend:
```bash
cd frontend
npm run dev
```

Frontend: http://localhost:3000
API Gateway: http://localhost:80 (when running docker-compose from backend/)

### Services

- Auth Service: :3001
- User Service: :3002
- Matching Service: :3003
- Chat Service: :3004
- Video Service: :3005
- Moderation Service: :3006
- Huddle Service: :3007
- Admin Service: :3008
- API Gateway: :80

### Building
```bash
# Frontend
cd frontend && npm run build

# Backend
cd backend && npm run build
```

### Deployment
```bash
cd backend
docker-compose -f docker-compose.yml up -d
```

## License

MIT
