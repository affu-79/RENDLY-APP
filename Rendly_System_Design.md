# RENDLY - Global System Architecture & Design Document

**Tagline:** Know Your Why, Find Your Who

## Executive Summary

Rendly is a next-generation social platform designed to handle **1 billion concurrent users** with **intent-based matching**, real-time video communication (both group huddles and one-on-one), and an advanced AI workflow agent system. This document provides a comprehensive technical blueprint for building a world-class, horizontally-scalable microservices architecture with enterprise-grade security, performance optimization, and AI integration.

**Key Highlights:**
- Microservices Architecture (30+ independent services)
- Real-time Communication (WebRTC + WebSockets)
- Intent-based ML Matching Engine
- AI Workflow Agent for user personalization
- Multi-region deployment with 99.99% uptime
- End-to-end encryption with zero-knowledge architecture
- Supabase as primary database with PostgreSQL + real-time subscriptions

---

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Core Microservices](#core-microservices)
3. [Data Models & Database Design](#data-models--database-design)
4. [Authentication & Authorization](#authentication--authorization)
5. [Real-time Communication Systems](#real-time-communication-systems)
6. [Intent-based Matching Engine](#intent-based-matching-engine)
7. [AI Workflow Agent](#ai-workflow-agent)
8. [Scalability & Load Balancing](#scalability--load-balancing)
9. [Security Architecture](#security-architecture)
10. [UI/UX Design Principles](#uiux-design-principles)
11. [DevOps & Deployment](#devops--deployment)
12. [Performance Optimization](#performance-optimization)
13. [Monitoring & Observability](#monitoring--observability)

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     GLOBAL CDN LAYER (CloudFlare/Akamai)        │
│                    (Static Assets, DDoS Protection)              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                 API GATEWAY CLUSTER (Kong/Nginx)                │
│    (Rate Limiting, Request Routing, Load Balancing, TLS)        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│                    MICROSERVICES LAYER                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │  Auth Service    │  │  User Service    │  │  Profile Service │ │
│  │  (OAuth/OIDC)    │  │  (CRUD, Search)  │  │  (Interests,     │ │
│  │                  │  │                  │  │   Preferences)   │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │ Matching Engine  │  │  Real-time       │  │  Media Service   │ │
│  │ (Intent-based ML)│  │  Signaling       │  │  (Image, Video   │ │
│  │                  │  │  Service (WS)    │  │   Upload/Store)  │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │  Huddle Service  │  │  Chat Service    │  │  Connection      │ │
│  │  (Group Video)   │  │  (Persistence)   │  │  Service (P2P)   │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │ Social Service   │  │  AI Agent        │  │  Analytics       │ │
│  │ (Requests, List) │  │  (Personalization)│ │  Service         │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              DATA LAYER (Supabase PostgreSQL)                   │
│              (Real-time Subscriptions, Full-Text Search)        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│                    CACHE & SESSION LAYER                            │
├──────────────────────────────────────────────────────────────────────┤
│  Redis Cluster (Session, Cache, Real-time Data)                     │
│  Memcached (Hot Data Cache)                                         │
│  Elasticsearch (Full-text search, Analytics)                        │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES & INFRASTRUCTURE                  │
├──────────────────────────────────────────────────────────────────────┤
│  AWS S3 (Media Storage) | Firebase Cloud Messaging (Push)           │
│  Twilio (TURN Servers) | Datadog (Monitoring) | Segment (Analytics)│
└──────────────────────────────────────────────────────────────────────┘
```

### 1.2 Architecture Principles

1. **Horizontal Scalability**: All services can scale independently
2. **Event-Driven**: Async communication via message queues
3. **Data Consistency**: Eventually consistent with eventual consistency patterns
4. **Resilience**: Circuit breakers, retries, fallbacks
5. **Security First**: Zero-trust, encryption at rest & in transit
6. **Observability**: Comprehensive logging, tracing, metrics

---

## 2. Core Microservices

### 2.1 Auth Service (Authentication & Authorization)

**Responsibilities:**
- OAuth 2.0 + OpenID Connect integration (LinkedIn, GitHub)
- JWT token generation and validation
- Multi-factor authentication (MFA)
- Session management
- Permission & role-based access control (RBAC)

**Tech Stack:**
- Node.js/Express or Go
- PostgreSQL (Supabase) for user credentials (encrypted)
- Redis for session storage
- OpenID Connect libraries

**API Endpoints:**
```
POST   /auth/oauth/linkedin/callback
POST   /auth/oauth/github/callback
POST   /auth/refresh-token
POST   /auth/logout
GET    /auth/verify-token
POST   /auth/mfa/enable
POST   /auth/mfa/verify
```

**Data Model:**
```sql
CREATE TABLE auth_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  refresh_token VARCHAR(500) NOT NULL,
  access_token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_permissions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  permission_slug VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.2 User Service

**Responsibilities:**
- User CRUD operations
- User search with full-text indexing
- User profile data management
- User blocking/reporting
- Presence tracking

**API Endpoints:**
```
GET    /users/:id
POST   /users
PUT    /users/:id
DELETE /users/:id
GET    /users/search?q=name
POST   /users/:id/block/:blocked_user_id
GET    /users/:id/blocked-list
POST   /users/:id/report
```

**Implementation Notes:**
- Implement soft deletes for GDPR compliance
- Use read replicas for search queries
- Cache frequently accessed user data in Redis
- Full-text search via PostgreSQL tsvector or Elasticsearch

### 2.3 Profile Service

**Responsibilities:**
- User interests and preferences management
- Profile picture management
- Skill/expertise tagging
- Social links integration
- Privacy settings

**Key Features:**
```
- Intent Tags: ["Photography", "Gaming", "Music", "Tech"]
- Skills: Array of user-defined skills
- Privacy Settings: Public/Friends-only/Private
- Social Profiles: LinkedIn, GitHub URLs
- Verification Status: Verified/Unverified badge
```

### 2.4 Matching Engine (Intent-Based ML)

**Core Functionality:**
The matching engine uses ML algorithms to pair users based on:
- Shared interests/intents
- Skill complementarity
- Location proximity
- Activity history
- Real-time availability

**Algorithm Architecture:**

```
┌─────────────────────────────────────────────────────┐
│           MATCHING ENGINE ARCHITECTURE              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. FEATURE EXTRACTION LAYER                       │
│     ├─ Interest Vector Embedding (Word2Vec)        │
│     ├─ Location Proximity Scoring                  │
│     ├─ Behavioral Scoring (interaction history)    │
│     └─ Time Zone Compatibility                     │
│                                                     │
│  2. MODEL INFERENCE LAYER                          │
│     ├─ TensorFlow/PyTorch Model Serving            │
│     ├─ Collaborative Filtering (matrix factorization)
│     ├─ Content-Based Filtering (semantic similarity)
│     └─ Hybrid Approach (weighted combination)       │
│                                                     │
│  3. RANKING & FILTERING LAYER                      │
│     ├─ Score Filtering (threshold-based)           │
│     ├─ Diversity Ranking (avoid repetition)        │
│     ├─ Freshness Boost (new users priority)        │
│     └─ Quality Control (blocked/reported users)     │
│                                                     │
│  4. REAL-TIME AVAILABILITY CHECK                   │
│     ├─ Online Status Verification                  │
│     ├─ Huddle Capacity Check                       │
│     └─ Connection Rate Limiting                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Tech Stack:**
- Python: FastAPI for model serving
- TensorFlow/PyTorch for ML models
- Scikit-learn for data preprocessing
- Apache Spark for batch processing
- Redis for real-time scoring cache

**API:**
```
POST   /match/find-random
POST   /match/find-by-intent?intent=Photography&limit=10
POST   /match/get-recommendation/:user_id
GET    /match/compatibility/:user_id/:target_user_id
```

**Detailed Algorithm (Hybrid Matching):**

```python
def calculate_match_score(user1, user2):
    """
    Composite score = Weighted combination of:
    1. Interest similarity (40%)
    2. Skill compatibility (25%)
    3. Behavioral similarity (20%)
    4. Location proximity (15%)
    """
    
    # Interest embedding similarity (cosine distance)
    interest_score = cosine_similarity(
        user1.interest_embedding,
        user2.interest_embedding
    )  # 0-1
    
    # Skill complementarity (can user2 help user1?)
    skill_score = calculate_skill_match(
        user1.skills,
        user2.skills
    )  # 0-1
    
    # Behavioral similarity (interaction patterns, response times)
    behavior_score = cosine_similarity(
        user1.behavior_vector,
        user2.behavior_vector
    )  # 0-1
    
    # Location proximity scoring
    distance = haversine_distance(user1.location, user2.location)
    location_score = 1 / (1 + distance_in_km / 10)  # Decay with distance
    
    # Weighted combination
    composite_score = (
        0.40 * interest_score +
        0.25 * skill_score +
        0.20 * behavior_score +
        0.15 * location_score
    )
    
    return composite_score
```

### 2.5 Real-time Signaling Service (WebSocket)

**Responsibilities:**
- Manages WebSocket connections
- Handles signaling for WebRTC (offer/answer/ICE candidates)
- Presence status (online/offline)
- Connection request forwarding
- Group huddle initialization

**Implementation:**
```javascript
// WebSocket Events
socket.on('user:presence', {status: 'online'|'offline'})
socket.on('huddle:create', {title, max_participants})
socket.on('huddle:invite', {huddle_id, user_ids[]})
socket.on('connection:request', {target_user_id, intent})
socket.on('connection:accept', {request_id})
socket.on('connection:decline', {request_id})

// WebRTC Signaling
socket.on('webrtc:offer', {session_id, offer})
socket.on('webrtc:answer', {session_id, answer})
socket.on('webrtc:ice-candidate', {session_id, candidate})
```

**Tech Stack:**
- Node.js with Socket.IO or native WebSockets
- Redis Pub/Sub for multi-server broadcasting
- PostgreSQL for signaling state persistence

### 2.6 Media Service (Image & Video Management)

**Responsibilities:**
- Media upload handling (images, videos)
- Virus/malware scanning
- Image optimization & resizing
- Video transcoding
- Content moderation (AI-powered)
- CDN integration

**Architecture:**

```
Upload → Validation → Virus Scan → S3 Upload → 
  → Image Optimization (thumbnails) → 
  → Content Moderation AI → 
  → CDN Cache → URL Generation → DB Record
```

**Tech Stack:**
- Node.js for upload handling
- FFmpeg for video transcoding
- ClamAV for virus scanning
- AWS S3 for storage
- AWS Lambda for serverless transcoding
- Google Vision/AWS Rekognition for content moderation

**Endpoints:**
```
POST   /media/upload
GET    /media/:media_id
DELETE /media/:media_id
GET    /media/:media_id/thumbnails
```

### 2.7 Huddle Service (Group Video Conferences)

**Responsibilities:**
- Huddle creation and lifecycle management
- Participant management (add/remove)
- Recording (optional)
- Huddle persistence
- Participant permissions

**Data Model:**
```sql
CREATE TABLE huddles (
  id UUID PRIMARY KEY,
  created_by UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  max_participants INT DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE huddle_participants (
  id UUID PRIMARY KEY,
  huddle_id UUID NOT NULL REFERENCES huddles(id),
  user_id UUID NOT NULL REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT NOW(),
  left_at TIMESTAMP,
  is_host BOOLEAN DEFAULT false
);

CREATE TABLE huddle_messages (
  id UUID PRIMARY KEY,
  huddle_id UUID NOT NULL REFERENCES huddles(id),
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**API:**
```
POST   /huddles
GET    /huddles/:id
PUT    /huddles/:id
DELETE /huddles/:id
POST   /huddles/:id/join
POST   /huddles/:id/leave
POST   /huddles/:id/invite
GET    /huddles/:id/participants
POST   /huddles/:id/messages
```

### 2.8 Chat Service (Persistent Messaging) & Central Chat Server (CCS)

**Responsibilities:**
- **Central Chat Server (CCS):** Single service/layer for all real-time chat—1:1 and group. Used by both the Chat page and in-call/huddle UIs.
- **1:1 messaging:** Available in two contexts—**(1) during a 1:1 video call** (in-call chat panel) and **(2) on the Chat page** (conversation view). Same conversation, same `conversation_id`; messages are unified.
- **Group messaging:** Available in two contexts—**(1) during a group huddle** (in-huddle chat) and **(2) on the Chat page** (group conversation list and group chat window). Same thread (e.g. tied to `huddle_id` or group room); CCS delivers and persists for both.
- Message persistence
- Message search
- Encryption (end-to-end if P2P)
- Typing indicators
- Read receipts
- Message reactions

**Data Model:**
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  user_id UUID NOT NULL REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  sender_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  encrypted BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_created 
  ON messages(conversation_id, created_at DESC);
```

### 2.9 Connection Service (P2P Management)

**Responsibilities:**
- Manage friend requests / connection requests
- Accept/decline connections
- List connections
- Remove connections

**Data Model:**
```sql
CREATE TABLE user_connections (
  id UUID PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES users(id),
  receiver_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, blocked
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(requester_id, receiver_id)
);
```

### 2.10 Social Service (Requests & Lists)

**Responsibilities:**
- Manage pending connection requests
- Block/unblock users
- List suggestions
- Social graph analysis

### 2.11 AI Agent Service

**See Section 7 for detailed design**

### 2.12 Analytics Service

**Responsibilities:**
- Event tracking
- User metrics
- Performance monitoring
- Funnel analysis
- Cohort analysis

**Tech Stack:**
- Segment/Mixpanel for event tracking
- DataDog for infrastructure monitoring
- Elasticsearch for log aggregation
- Apache Superset for dashboarding

---

## 3. Data Models & Database Design

### 3.1 Supabase PostgreSQL Schema

**Core Tables:**

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url VARCHAR(500),
  bio TEXT,
  location POINT, -- Geographic coordinates (lat, lng)
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  auth_provider VARCHAR(50), -- 'linkedin', 'github'
  auth_provider_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP -- For soft deletes
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_location ON users USING GIST(location);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- User Interests
CREATE TABLE user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interest VARCHAR(100) NOT NULL,
  proficiency_level VARCHAR(20), -- 'beginner', 'intermediate', 'expert'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, interest)
);

CREATE INDEX idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX idx_user_interests_interest ON user_interests(interest);

-- User Skills
CREATE TABLE user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill VARCHAR(100) NOT NULL,
  endorsements INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, skill)
);

-- User Preferences
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  preferred_interests TEXT[], -- Array of interests
  min_age INT DEFAULT 18,
  max_age INT DEFAULT 100,
  max_distance_km INT DEFAULT 100,
  timezone VARCHAR(50),
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Connection Requests
CREATE TABLE connection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP,
  UNIQUE(requester_id, receiver_id)
);

CREATE INDEX idx_connection_requests_receiver ON connection_requests(receiver_id, status);
CREATE INDEX idx_connection_requests_created_at ON connection_requests(created_at DESC);

-- Connections
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id1 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id2 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  connected_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id1, user_id2),
  CHECK (user_id1 < user_id2) -- Ensure consistent ordering
);

CREATE INDEX idx_connections_user1 ON connections(user_id1);
CREATE INDEX idx_connections_user2 ON connections(user_id2);

-- Huddles
CREATE TABLE huddles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  max_participants INT DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  recording_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Huddle Participants
CREATE TABLE huddle_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  huddle_id UUID NOT NULL REFERENCES huddles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  left_at TIMESTAMP,
  duration_seconds INT,
  is_host BOOLEAN DEFAULT false,
  UNIQUE(huddle_id, user_id)
);

CREATE INDEX idx_huddle_participants_huddle_id ON huddle_participants(huddle_id);
CREATE INDEX idx_huddle_participants_user_id ON huddle_participants(user_id);

-- Huddle Messages
CREATE TABLE huddle_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  huddle_id UUID NOT NULL REFERENCES huddles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_huddle_messages_huddle_id ON huddle_messages(huddle_id, created_at DESC);

-- Direct Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Direct Messages
CREATE TABLE direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  content_type VARCHAR(20) DEFAULT 'text', -- text, image, video
  is_encrypted BOOLEAN DEFAULT true,
  encryption_key_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_direct_messages_conversation ON direct_messages(conversation_id, created_at DESC);

-- Media
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  media_type VARCHAR(20), -- 'image', 'video'
  file_size INT,
  duration_seconds INT,
  is_moderated BOOLEAN DEFAULT false,
  moderation_status VARCHAR(20), -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_media_user_id ON media(user_id);

-- Blocked Users
CREATE TABLE blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- User Reports
CREATE TABLE user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id),
  reported_user_id UUID NOT NULL REFERENCES users(id),
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, investigating, resolved
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activity Log
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id, created_at DESC);
```

### 3.2 Database Optimization Strategy

**Read Replicas:**
- Primary DB: Write operations
- Read Replica 1: User searches, analytics queries
- Read Replica 2: Connection/matching queries

**Partitioning:**
```sql
-- Partition messages by date for horizontal scaling
CREATE TABLE direct_messages_2026_01 PARTITION OF direct_messages
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

**Full-Text Search:**
```sql
-- Create GIN index for full-text search
CREATE TABLE user_search_index AS
SELECT id, to_tsvector('english', COALESCE(first_name, '') || ' ' || 
       COALESCE(last_name, '') || ' ' || COALESCE(bio, '')) as search_vector
FROM users;

CREATE INDEX idx_user_search ON user_search_index USING GIN(search_vector);
```

---

## 4. Authentication & Authorization

### 4.1 OAuth 2.0 / OpenID Connect Flow

**Architecture:**

```
User Client
    ↓
┌─────────────────────┐
│ 1. User clicks      │
│    "Login with      │
│    LinkedIn/GitHub" │
└─────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 2. Redirect to OAuth Provider       │
│    (LinkedIn/GitHub)                │
└─────────────────────────────────────┘
    ↓
┌──────────────────────────────────────┐
│ 3. User authenticates with provider  │
│    grants permission                 │
└──────────────────────────────────────┘
    ↓
┌──────────────────────────────────────┐
│ 4. Provider redirects to Rendly      │
│    with authorization code           │
└──────────────────────────────────────┘
    ↓
┌────────────────────────────────────────────┐
│ 5. Auth Service exchanges code for tokens  │
│    (Backend-to-Backend, server-to-server)  │
└────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 6. Create JWT tokens & sessions     │
│    (access_token, refresh_token)    │
└─────────────────────────────────────┘
    ↓
┌──────────────────────────────────────┐
│ 7. Return tokens to client           │
│    + Set secure HTTP-only cookies    │
└──────────────────────────────────────┘
```

### 4.2 JWT Token Structure

**Access Token (Short-lived, 15 minutes):**
```json
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "username": "username",
  "roles": ["user"],
  "permissions": ["create:huddle", "send:message"],
  "iat": 1234567890,
  "exp": 1234568890,
  "iss": "rendly.io",
  "aud": "rendly-api"
}
```

**Refresh Token (Long-lived, 30 days):**
```json
{
  "sub": "user_uuid",
  "token_type": "refresh",
  "iat": 1234567890,
  "exp": 1234567890,
  "jti": "unique_token_id"
}
```

### 4.3 Session Management

**Redis Session Storage:**
```
Key: session:{session_id}
Value: {
  user_id: UUID,
  email: string,
  username: string,
  access_token_hash: string,
  refresh_token_hash: string,
  device_fingerprint: string,
  ip_address: string,
  user_agent: string,
  created_at: timestamp,
  expires_at: timestamp,
  last_activity: timestamp
}
TTL: 30 days (matched to refresh token expiry)
```

### 4.4 Role-Based Access Control (RBAC)

**Role Hierarchy:**
```
ROLE_SUPER_ADMIN
├─ ROLE_ADMIN
│  ├─ ROLE_MODERATOR
│  │  └─ ROLE_USER
│  └─ ROLE_USER
└─ ROLE_USER
```

**Permission Matrix:**
```
ROLE_USER:
  - create:huddle
  - send:message
  - upload:media
  - view:profile
  - create:connection_request
  
ROLE_MODERATOR: (All USER permissions + below)
  - approve:media
  - review:reports
  - warn:user
  
ROLE_ADMIN: (All permissions)
```

---

## 5. Real-time Communication Systems

### 5.1 WebRTC Architecture for One-on-One Calls

**Components:**

```
┌──────────────────────────────────────────────────┐
│  Client A                    Client B            │
│  ┌──────────────┐           ┌──────────────┐    │
│  │ User A       │           │ User B       │    │
│  │ (Browser)    │           │ (Browser)    │    │
│  └──────────────┘           └──────────────┘    │
└──────────────────────────────────────────────────┘
         │                           │
         │ WebSocket (Signaling)     │
         └───────────┬───────────────┘
                     ↓
         ┌─────────────────────────┐
         │ Real-time Signaling     │
         │ Service (Socket.IO)     │
         │ (WebSocket Server)      │
         └─────────────────────────┘
                     │
         ┌───────────┴───────────────────────────┐
         │                                       │
         ↓                                       ↓
    ┌─────────────┐                    ┌─────────────┐
    │ TURN Server │                    │ STUN Server │
    │ (Twilio)    │                    │ (Google)    │
    └─────────────┘                    └─────────────┘
         │
         └─── Direct P2P Connection (Media Stream)
             UDP/DTLS
```

**Signaling Protocol (Socket.IO):**

```javascript
// Client A initiates call to Client B
socket.emit('call:initiate', {
  to: 'user_b_id',
  callType: 'video' | 'audio'
});

// Server notifies Client B
socket.on('call:incoming', {
  from: 'user_a_id',
  callType: 'video'
});

// Client B accepts
socket.emit('call:accept', {
  to: 'user_a_id'
});

// Client A: Create WebRTC offer
const offer = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);
socket.emit('webrtc:offer', {
  to: 'user_b_id',
  offer: offer
});

// Client B: Receive offer, create answer
socket.on('webrtc:offer', async (data) => {
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(data.offer)
  );
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit('webrtc:answer', {
    to: data.from,
    answer: answer
  });
});

// Exchange ICE candidates (for NAT traversal)
peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit('webrtc:ice-candidate', {
      to: target_user_id,
      candidate: event.candidate
    });
  }
};

socket.on('webrtc:ice-candidate', (data) => {
  peerConnection.addIceCandidate(
    new RTCIceCandidate(data.candidate)
  );
});
```

**Key Features:**
- Automatic connection fallback (P2P → TURN server)
- Audio/Video codec negotiation
- Bandwidth adaptation
- Screen sharing support (via RTCScreenShare API)

### 5.2 Group Huddles (Multi-Party Video Conferencing)

**Architecture:**

```
Option 1: Mesh Network (for small groups <10)
User1 ←→ User2
  ↗   ↖
User3 ← → User4

Option 2: SFU (Selective Forwarding Unit) [RECOMMENDED]
┌─────────────────────────────────────┐
│  Users: U1, U2, U3, U4, ..., Un    │
│         (all connected to SFU)      │
├─────────────────────────────────────┤
│  SFU Server                         │
│  ┌─────────────────────────────┐   │
│  │ 1. Receive streams from all │   │
│  │ 2. Decode/recompose         │   │
│  │ 3. Adapt bitrate            │   │
│  │ 4. Forward optimized streams│   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**SFU Implementation:**
- **Technology**: Janus WebRTC Gateway or Mediasoup
- **Bandwidth**: Only uplink consumed (60-500 kbps/person)
- **Latency**: <100ms end-to-end

**Selective Forwarding + Central Chat Server (CCS) in Huddles:**

Group huddles use **Selective Forwarding** for video/audio and a **Central Chat Server (CCS)** for all real-time messaging:

```
┌─────────────────────────────────────────────────────────────────┐
│  Group Huddle: SFU (Video/Audio) + CCS (Chat)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  VIDEO/AUDIO (Selective Forwarding):                             │
│  Users U1..Un ──► SFU Server ◄── Selective forwarding of        │
│  (send 1 stream each)     │        media streams (no mixing)     │
│                          │        SFU forwards to each client    │
│                          ▼                                       │
│  CHAT (Central Chat Server):                                     │
│  All huddle chat messages go through CCS                         │
│  CCS: receives message → persists → broadcasts to room           │
│  Same CCS also used for 1:1 and group chat on Chat page          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Huddle Flow (SFU + CCS):**

```
1. User A creates huddle
   └─ POST /huddles → Create huddle in DB
   
2. User B joins huddle
   └─ POST /huddles/{id}/join
   └─ WebSocket event: huddle:participant-joined
   └─ Connect to SFU (video/audio) + CCS (chat)
   
3. Video: Each user connects to SFU; SFU selectively forwards streams
   └─ SFU receives one stream per participant, forwards to others
   
4. Chat in huddle (via CCS)
   └─ Client sends to CCS (e.g. Socket.IO room or dedicated CCS service)
   └─ CCS persists to huddle_messages, broadcasts to all in huddle
   └─ Same thread visible in Huddle UI and on Chat page (group conversation)
   
5. User A leaves
   └─ WebSocket event: huddle:participant-left
   └─ SFU removes stream, notifies others; CCS remains for history
   
6. Huddle auto-closes when empty
   └─ If no participants for 5 mins: deactivate huddle
```

---

### 5.3 Central Chat Server (CCS) and Unified Real-time Messaging

All real-time chat (1:1 and group) is routed through a **Central Chat Server (CCS)** so that messaging is consistent whether the user is on a video call, in a huddle, or on the Chat page.

**CCS Responsibilities:**
- Route and persist all chat messages (1:1 and group)
- Broadcast to the correct recipients/rooms
- Typing indicators, read receipts, delivery status
- Single source of truth for conversation state (unified across in-call and Chat page)

**1:1 Real-time Chat (in both Video Call and Chat page):**

- **Same conversation** is available in two places:
  1. **During a 1:1 video call:** In-call chat panel (sidebar or overlay) so users can text while on the call.
  2. **On the Chat page:** Dedicated conversation view for that user; same `conversation_id`, same message history.
- Messages sent in-call appear on the Chat page and vice versa; CCS ensures one conversation thread, one persistence store (`messages` table keyed by `conversation_id`).

**Group Chat (in both Huddles and Chat page):**

- **Same group chat** is available in two places:
  1. **During a huddle:** In-huddle chat (e.g. HuddleChat sidebar) for real-time group messaging; traffic goes through CCS, persisted to `huddle_messages` (or equivalent group thread).
  2. **On the Chat page:** Group conversations list and group chat window; user can open the same group thread (e.g. tied to `huddle_id` or a persistent group room). History and new messages are shared; CCS delivers to all participants whether they are in the huddle UI or on the Chat page.

**Architecture Summary:**

```
                    ┌─────────────────────────┐
                    │  Central Chat Server    │
                    │  (CCS)                  │
                    │  - 1:1 conversations    │
                    │  - Group (huddle) rooms │
                    │  - Persistence + broadcast│
                    └───────────┬─────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ 1:1 Video Call│     │ Chat Page       │     │ Huddle + Chat    │
│ In-call chat  │     │ 1:1 + Group     │     │ In-huddle chat  │
│ (same conv)   │     │ conversation list│     │ + same thread   │
│               │     │ and chat window │     │ on Chat page    │
└───────────────┘     └─────────────────┘     └─────────────────┘
```

**Implementation notes:**
- CCS can be implemented as part of the existing WebSocket/Socket.IO server (with Redis Pub/Sub for multi-instance) or as a dedicated service.
- 1:1: Use `conversation_id`; clients in video call and on Chat page join the same room or subscribe to the same conversation.
- Group: Use `huddle_id` (or `group_room_id`) as the room; clients in huddle and on Chat page subscribe to that room for real-time messages and history.

---

## 6. Intent-Based Matching Engine

### 6.1 Matching Algorithm Details

**Matching Workflow:**

```
┌────────────────────────────────────────┐
│ User A requests: "Find random match"   │
└────────────────────────────────────────┘
                   ↓
┌──────────────────────────────────────────┐
│ Step 1: Feature Extraction               │
│  - Extract user A's interests (vector)   │
│  - Extract user A's location             │
│  - Extract user A's behavior profile     │
│  - Get real-time availability            │
└──────────────────────────────────────────┘
                   ↓
┌──────────────────────────────────────────┐
│ Step 2: Candidate Pool Filtering         │
│  - Users with overlapping interests      │
│  - Online status = true                  │
│  - Not blocked by user A                 │
│  - Not blocked by candidates             │
│  - Location within max_distance          │
│  - Age within preference range           │
│  - Timezone acceptable                   │
└──────────────────────────────────────────┘
                   ↓
┌──────────────────────────────────────────┐
│ Step 3: ML Score Calculation             │
│  For each candidate:                     │
│  - Content-based similarity score        │
│  - Collaborative filtering score         │
│  - Engagement prediction score           │
│  - Recent interaction recency boost      │
│  - Quality/verification boost            │
└──────────────────────────────────────────┘
                   ↓
┌──────────────────────────────────────────┐
│ Step 4: Ranking & Diversification        │
│  - Rank by composite score               │
│  - Avoid recent matches (freshness)      │
│  - Diversify intents (avoid repetition)  │
│  - Boost undermatched users              │
└──────────────────────────────────────────┘
                   ↓
┌──────────────────────────────────────────┐
│ Step 5: Real-time Verification           │
│  - Confirm candidate is still online     │
│  - Check huddle capacity                 │
│  - Verify no recent decline by candidate │
└──────────────────────────────────────────┘
                   ↓
┌──────────────────────────────────────────┐
│ Result: Top 3-5 match candidates         │
│ Return to user with scores               │
└──────────────────────────────────────────┘
```

### 6.2 Feature Engineering

**Interest Vector Embedding (Word2Vec):**
```python
# Train Word2Vec on interest descriptions
interests = [
  "Photography, Travel, Painting",
  "Gaming, Streaming, Technology",
  "Music, Composition, Production"
]

# Each interest gets a 100-dim vector
# Similar interests have similar vectors
photography_vec = [0.12, -0.45, 0.78, ...]  # 100 dims
painting_vec    = [0.15, -0.42, 0.81, ...]  # Similar to photography

# Cosine similarity between user interests
similarity = cosine_similarity(
  user_a_interest_embedding,
  user_b_interest_embedding
)  # Returns 0-1 (1 = identical)
```

**Behavioral Feature Vector:**
```python
behavior_features = {
  'avg_session_duration_mins': 45,
  'messages_per_session': 12,
  'huddle_frequency_per_week': 3,
  'response_time_seconds': 8,
  'profile_completion_pct': 85,
  'connection_accept_rate': 0.72,
  'msg_to_connection_ratio': 3.5,
  'profile_views_per_week': 50,
  'time_to_first_message_seconds': 120,
  'avg_message_length': 25,
  'emoji_usage_rate': 0.15,
  'profile_edit_frequency_days': 14
}

# Normalize to 0-1 range for each feature
normalized_behavior = normalize(behavior_features)

# Calculate L2 distance
distance = sqrt(sum((a - b)^2 for a, b in zip(user_a, user_b)))
behavior_score = 1 / (1 + distance)  # Convert to similarity score
```

### 6.3 Machine Learning Models

**Model 1: Collaborative Filtering (Matrix Factorization)**

```python
# User-Interaction Matrix
# Rows: Users, Columns: Interests
# Values: Engagement score (0-1)

U = [
  [1.0, 0.8, 0.2, 0.5],  # User A
  [0.7, 0.9, 0.3, 0.6],  # User B
  ...
]

# Matrix Factorization: U = P × Q^T
# P: User latent factors (100 dims)
# Q: Interest latent factors (100 dims)

# Reconstruct missing values
predicted_engagement = P @ Q.T

# Higher predicted engagement = better match
```

**Model 2: Neural Recommendation Network (Deep Learning)**

```python
import tensorflow as tf

class MatchingNetwork(tf.keras.Model):
    def __init__(self):
        super().__init__()
        # User encoder
        self.user_embedding = tf.keras.layers.Embedding(1_000_000_000, 128)
        self.user_dense1 = tf.keras.layers.Dense(256, activation='relu')
        self.user_dense2 = tf.keras.layers.Dense(128, activation='relu')
        
        # Interest encoder
        self.interest_embedding = tf.keras.layers.Embedding(50_000, 64)
        self.interest_dense1 = tf.keras.layers.Dense(128, activation='relu')
        
        # Matching scorer
        self.scorer = tf.keras.Sequential([
            tf.keras.layers.Dense(256, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(128, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(1, activation='sigmoid')  # Score 0-1
        ])
    
    def call(self, user_features, target_features):
        # Encode users
        user_encoded = self.user_dense2(
            self.user_dense1(self.user_embedding(user_features['id']))
        )
        
        target_encoded = self.user_dense2(
            self.user_dense1(self.user_embedding(target_features['id']))
        )
        
        # Concatenate + score
        combined = tf.concat([user_encoded, target_encoded], axis=-1)
        score = self.scorer(combined)
        
        return score

# Training: Positive pairs (matched users who engaged)
#           Negative pairs (unmatched users)
```

### 6.4 Real-time Matching Caching

**Redis Cache Structure:**
```
Key: match_cache:{user_id}:{intent_filter}
Value: {
  candidates: [
    {user_id, score, matched_at},
    ...
  ],
  generated_at: timestamp,
  expires_at: timestamp  (5 minutes)
}

Key: user_availability:{user_id}
Value: {
  online: boolean,
  in_huddle: boolean,
  in_call: boolean,
  last_seen: timestamp
}
TTL: 1 minute (auto-refresh on user action)
```

---

## 7. AI Workflow Agent

### 7.1 AI Agent Architecture

**Purpose:**
- Personalize user experience based on behavior
- Recommend new interests/users
- Predict user churn and re-engage
- Moderate content intelligently
- Optimize matching algorithm in real-time

**Components:**

```
┌─────────────────────────────────────────────┐
│         AI AGENT ORCHESTRATION              │
├─────────────────────────────────────────────┤
│                                             │
│  ┌────────────────────────────────────┐    │
│  │ 1. Data Collection Worker          │    │
│  │    (Kafka → S3 → Data Lake)        │    │
│  └────────────────────────────────────┘    │
│                     ↓                       │
│  ┌────────────────────────────────────┐    │
│  │ 2. Feature Store (Feast)           │    │
│  │    (Feature engineering + caching) │    │
│  └────────────────────────────────────┘    │
│                     ↓                       │
│  ┌────────────────────────────────────┐    │
│  │ 3. Model Inference Engine          │    │
│  │    (TensorFlow Serving)            │    │
│  │    - Matching Model                │    │
│  │    - Churn Prediction Model        │    │
│  │    - Interest Recommendation Model │    │
│  └────────────────────────────────────┘    │
│                     ↓                       │
│  ┌────────────────────────────────────┐    │
│  │ 4. Decision Engine                 │    │
│  │    (Rule-based + ML-based)         │    │
│  └────────────────────────────────────┘    │
│                     ↓                       │
│  ┌────────────────────────────────────┐    │
│  │ 5. Action Execution                │    │
│  │    (Send recommendations, alerts)  │    │
│  └────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

### 7.2 Agent Workflows

**Workflow 1: Personalized Recommendation Engine**

```
Trigger: User logs in / Views recommendations page

Steps:
1. Get user's recent interactions (past 7 days)
2. Fetch user's stored embeddings from feature store
3. Query matching model: "Top 5 users for user_id?"
4. Query interest model: "What interests should user explore?"
5. Combine results with diversity constraints
6. Store recommendations in cache (expire: 1 hour)
7. Return JSON response to frontend

Output: [
  {user_id, score, common_interests},
  ...
]
```

**Workflow 2: Churn Prediction & Re-engagement**

```
Trigger: Batch job runs nightly

Steps:
1. Identify users inactive for 7+ days
2. Extract features: {last_login, session_count, msg_count, ...}
3. Run churn prediction model
   → Output: churn_probability (0-1)
4. If churn_probability > 0.7:
   a) Generate personalized message
   b) Select best time to send notification
   c) Queue notification for next day
   d) Track re-engagement conversion
5. Log metrics to analytics system

Output: Sent 50,000 re-engagement notifications
        Expected recovery: 8-12% of at-risk users
```

**Workflow 3: Content Moderation**

```
Trigger: User uploads image/video or sends message

Steps:
1. Extract media/text
2. Run content moderation model
   - Image: Google Vision API / AWS Rekognition
   - Text: OpenAI Moderation API
3. Get moderation score
4. If score > threshold:
   a) Flag content as pending review
   b) Notify admin dashboard
   c) Queue for human review
   d) Temporarily hide from others
5. If approved: Make visible
   If rejected: Delete + notify user

Output: 99.5% accuracy in inappropriate content detection
```

### 7.3 LLM-Powered Features (Optional, Enterprise)

**Use Cases:**
- **AI-powered Chat Assistant**: Help users discover matches
- **Auto-generated Huddle Summaries**: Summarize group conversations
- **Smart Profile Review**: AI suggests profile improvements
- **Intelligent Notifications**: Personalized notification copy

**Implementation (LangChain + GPT-4):**

```python
from langchain.agents import initialize_agent, load_tools
from langchain.llms import OpenAI

llm = OpenAI(temperature=0.7, model="gpt-4")
tools = load_tools(["serpapi"], llm=llm)

agent = initialize_agent(
    tools,
    llm,
    agent="zero-shot-react-description",
    verbose=True
)

# Example: Generate re-engagement message
user_data = {
    "username": "sarah_photography",
    "interests": ["Photography", "Travel"],
    "last_active": "7 days ago",
    "matches_this_month": 3
}

prompt = f"""
You are Rendly's AI assistant. Generate a warm, personalized 
re-engagement message for this user:

{user_data}

The message should:
- Mention 1-2 of their interests
- Highlight new features
- Be 2-3 sentences max
- Include emoji (1-2)

Message:
"""

response = agent.run(prompt)
# Output: "Hey Sarah! 👋 We've had amazing Photography & Travel matches lately. 
#          Check out your new recommendations! 📸✈️"
```

---

## 8. Scalability & Load Balancing

### 8.1 Horizontal Scaling Strategy

**Auto-scaling Configuration (Kubernetes):**

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: matching-engine-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: matching-engine
  minReplicas: 50
  maxReplicas: 500
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "1000"
```

**Service Scaling (1 Billion Users):**

```
┌──────────────────────────────────────────────────┐
│  Concurrent Users Projection                     │
├──────────────────────────────────────────────────┤
│  1 Billion total users                           │
│  Peak concurrent: ~500 million (50% of users)    │
│                                                  │
│  Service Replicas (at peak):                     │
│  - Auth Service: 200 replicas                    │
│  - Matching Engine: 500 replicas                 │
│  - Real-time Signaling: 1000 replicas            │
│  - Chat Service: 300 replicas                    │
│  - Media Service: 150 replicas                   │
│  - User Service: 250 replicas                    │
│                                                  │
│  Database:                                       │
│  - Primary: 50TB SSD                             │
│  - Read Replicas: 10 instances                   │
│  - Elasticsearch cluster: 50+ nodes              │
│  - Redis cluster: 100+ nodes (sharded)           │
└──────────────────────────────────────────────────┘
```

### 8.2 Load Balancing Architecture

**Multi-tier Load Balancing:**

```
┌──────────────────────────────────────────────┐
│ Global Load Balancer (Anycast DNS)           │
│ Route users to nearest geographic region     │
└──────────────────────────────────────────────┘
              ↓↓↓↓↓↓
    ┌─────────┴──────────┬──────────────┐
    ↓                    ↓              ↓
┌─────────┐         ┌─────────┐    ┌─────────┐
│ US East │         │ EU      │    │ Asia    │
│ Region  │         │ Region  │    │ Pacific │
└─────────┘         └─────────┘    └─────────┘
    ↓                    ↓              ↓
┌─────────────────────────────────────────────┐
│ Regional Load Balancer (L4)                 │
│ Distributes across multiple AZs             │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ API Gateway / Service Mesh (Istio)          │
│ - Circuit breaking                          │
│ - Retries + Timeouts                        │
│ - Request routing                           │
│ - Metrics collection                        │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ Kubernetes Cluster                          │
│ - Multiple nodes per AZ                     │
│ - Pod auto-scaling                          │
└─────────────────────────────────────────────┘
```

---

## 9. Security Architecture

### 9.1 Zero-Trust Security Model

**Principles:**
1. Never trust, always verify
2. Assume breach (defense in depth)
3. Encrypt everything (in transit & at rest)
4. Least privilege access

**Implementation:**

```
┌──────────────────────────────────┐
│ 1. Network Security              │
├──────────────────────────────────┤
│ - DDoS Protection (CloudFlare)   │
│ - WAF (Web Application Firewall) │
│ - VPC with private subnets       │
│ - No public IPs on databases     │
│ - Bastion hosts for DB access    │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ 2. Identity & Access             │
├──────────────────────────────────┤
│ - OIDC/OAuth 2.0                 │
│ - MFA enforcement                │
│ - SAML for enterprise SSO        │
│ - Service-to-service mTLS        │
│ - API key rotation               │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ 3. Data Protection               │
├──────────────────────────────────┤
│ - TLS 1.3 for all communication  │
│ - E2E encryption for messages    │
│ - AES-256 encryption at rest     │
│ - Key Management (AWS KMS)       │
│ - Tokenized payment (no card)    │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│ 4. Monitoring & Incident Response│
├──────────────────────────────────┤
│ - SIEM (Splunk/ELK Stack)        │
│ - Anomaly detection              │
│ - Incident response playbooks    │
│ - Penetration testing (quarterly) │
└──────────────────────────────────┘
```

### 9.2 End-to-End Encryption for Messages

**Signal Protocol Implementation:**

```
User A                              User B
   │                                   │
   │ 1. Generate X3DH key exchange    │
   ├─────────────────────────────────→│
   │                                   │
   │ 2. Derive shared secret (KDF)    │
   │←─────────────────────────────────┤
   │                                   │
   │ 3. Ratchet forward (Double Ratchet) │
   │    [Ephemeral key per message]   │
   │                                   │
   │ 4. Encrypt message with AES-256  │
   │ "Hello" → [ENCRYPTED BLOB]       │
   ├─────────────────────────────────→│
   │                                   │
   │ 5. Decrypt on receiving end      │
   │ [ENCRYPTED BLOB] → "Hello"       │
   │←─────────────────────────────────┤
   │                                   │

# Even if server/DB is compromised:
# - Messages cannot be decrypted (keys not on server)
# - Server only sees encrypted data
# - Perfect forward secrecy (old messages stay safe)
```

### 9.3 API Security

**Rate Limiting & DDoS Protection:**

```
Tier 1 (Unauthenticated):
  - 100 requests/hour per IP
  - Captcha after limit

Tier 2 (Authenticated User):
  - 10,000 requests/hour
  - Burst: 100 requests/second

Tier 3 (Premium/API Partner):
  - 1,000,000 requests/hour
  - Custom limits

Tool: Redis + Lua scripts for atomic rate limit checks
```

**JWT Validation:**

```javascript
// Every request must include valid JWT
function validateJWT(token) {
  // 1. Check signature (RS256 with public key)
  // 2. Verify expiration (exp claim)
  // 3. Check issuer (iss == "rendly.io")
  // 4. Verify audience (aud == "rendly-api")
  // 5. Check token blacklist (revoked tokens)
  // 6. Extract user ID & permissions
  
  return { valid: true, userId, permissions };
}

// Attach to request context
req.user = { id, email, permissions };
```

### 9.4 Data Privacy (GDPR/CCPA Compliance)

**Privacy by Design:**

```
1. Data Minimization
   - Only collect necessary data
   - Auto-delete data after retention period
   
2. Right to Access
   - User can download their data (JSON export)
   - API: GET /users/:id/export
   
3. Right to Be Forgotten
   - User can request deletion
   - Soft delete (7-day grace period)
   - Then permanent hard delete
   
4. Consent Management
   - Explicit opt-in for marketing
   - Cookie consent banner
   - Stored in consent_log table
   
5. Data Residency
   - EU users → EU data centers
   - US users → US data centers
```

---

## 10. UI/UX Design Principles

### 10.1 Design System Architecture

**Component Hierarchy:**

```
┌─────────────────────────────────────┐
│ Design Tokens (Colors, Typography) │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ Atomic Components                   │
│ (Button, Input, Card)               │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ Composed Components                 │
│ (Modal, Sidebar, Header)            │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ Screen/Page Components              │
│ (Dashboard, Profile, Chat)          │
└─────────────────────────────────────┘
```

### 10.2 Key Screens/Features

**1. Authentication Flow**
- LinkedIn/GitHub OAuth buttons
- Permission request (minimal)
- Magic link fallback

**2. Profile Setup**
- Avatar upload
- Bio/interests selection
- Skill tags
- Privacy settings

**3. Matching Dashboard**
- Card-based matching UI (swipe/click)
- Match score visualization
- Quick stats (connection rate, avg response time)
- Intent tags highlighting

**4. Real-time Chat**
- Message list with timestamps
- Typing indicators
- Message reactions
- Image/media preview
- Search messages

**5. Huddle Interface**
- Participant grid (video tiles)
- Screen sharing button
- Mute/unmute controls
- Chat sidebar
- Recording indicator
- End call button

**6. Connection Management**
- Pending requests list
- Accepted connections (friends)
- Suggestion cards
- Block/report options

### 10.3 Mobile-First Design

**Responsive Breakpoints:**
```css
Mobile: 320px - 768px    [Primary]
Tablet: 768px - 1024px
Desktop: 1024px+

/* Stack components vertically on mobile */
/* Single column layout */
/* Touch-friendly buttons (44x44px minimum) */
/* Simplified navigation (hamburger menu) */
```

### 10.4 Accessibility Standards

- **WCAG 2.1 Level AA** compliance
- Color contrast ratio ≥ 4.5:1
- Keyboard navigation support
- Screen reader friendly (ARIA labels)
- Focus management

---

## 11. DevOps & Deployment

### 11.1 CI/CD Pipeline

**Pipeline Stages:**

```
┌────────────┐
│ Git Commit │
└────────────┘
      ↓
┌────────────────────────────┐
│ Lint + Unit Tests          │
│ (Code quality, coverage)   │
└────────────────────────────┘
      ↓
┌────────────────────────────┐
│ Build Docker Image         │
│ (Multi-stage build)        │
└────────────────────────────┘
      ↓
┌────────────────────────────┐
│ Push to ECR                │
│ (AWS Elastic Container Reg)│
└────────────────────────────┘
      ↓
┌────────────────────────────┐
│ Deploy to Staging          │
│ (Run integration tests)    │
└────────────────────────────┘
      ↓
┌────────────────────────────┐
│ Manual Approval            │
│ (QA sign-off)              │
└────────────────────────────┘
      ↓
┌────────────────────────────┐
│ Canary Deployment (10%)    │
│ (Monitor metrics)          │
└────────────────────────────┘
      ↓
┌────────────────────────────┐
│ Progressive Rollout (100%) │
│ (Blue-green deployment)    │
└────────────────────────────┘
```

### 11.2 Containerization (Docker)

**Multi-stage Dockerfile (Example: Node.js Service):**

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /build
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Runtime
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /build/node_modules ./node_modules
COPY . .
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD node healthcheck.js
CMD ["node", "index.js"]
```

### 11.3 Kubernetes Deployment

**Helm Chart Structure:**

```
rendly-helm-chart/
├── Chart.yaml
├── values.yaml
├── values-prod.yaml
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── hpa.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── ingress.yaml
│   └── networkpolicy.yaml
```

**Deployment Configuration:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rendly-matching-service
spec:
  replicas: 100  # Base replicas
  selector:
    matchLabels:
      app: matching-service
  template:
    metadata:
      labels:
        app: matching-service
    spec:
      containers:
      - name: matching-service
        image: ecr.aws/rendly/matching-service:v1.2.0
        ports:
        - containerPort: 8080
        env:
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: rendly-secrets
              key: redis-url
        resources:
          requests:
            cpu: "500m"
            memory: "512Mi"
          limits:
            cpu: "2000m"
            memory: "2Gi"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - matching-service
              topologyKey: kubernetes.io/hostname
```

### 11.4 Multi-Region Deployment

**Active-Active Architecture:**

```
┌──────────────────────┐
│ US-East Region       │
│ - K8s Cluster 1      │
│ - RDS Replica        │
│ - Redis Cluster      │
└──────────────────────┘
         ↕
   Global LoadBalancer
   (Route53 / CloudFlare)
         ↕
┌──────────────────────┐
│ EU-West Region       │
│ - K8s Cluster 2      │
│ - RDS Replica        │
│ - Redis Cluster      │
└──────────────────────┘
         ↕
┌──────────────────────┐
│ APAC Region          │
│ - K8s Cluster 3      │
│ - RDS Replica        │
│ - Redis Cluster      │
└──────────────────────┘

Benefits:
- Low latency (user routed to nearest region)
- High availability (region failure = failover)
- Data residency compliance (GDPR, etc)
- Cross-region replication (< 1 second lag)
```

---

## 12. Performance Optimization

### 12.1 Caching Strategy (3-Tier)

**Tier 1: CDN (CloudFlare)**
- Static assets (JS, CSS, images)
- TTL: 1 month
- Geo-distribution: 200+ edge locations

**Tier 2: Application Cache (Redis)**
```
Cache Layer 1 (Most Frequently Accessed):
  - User profiles: ttl=1 hour
  - Interest embeddings: ttl=6 hours
  - Match scores: ttl=5 minutes
  - User availability status: ttl=1 minute

Cache Layer 2 (Less Frequent):
  - User search results: ttl=10 minutes
  - Huddle participant lists: ttl=30 seconds
  - Connection requests: ttl=5 minutes
```

**Tier 3: Database Query Cache (Query Result Cache)**
```
SELECT * FROM users WHERE status='active'
Cache Key: query:users:active:limit_10
TTL: 10 minutes
Invalidate on: User creation, status update
```

### 12.2 Database Query Optimization

**Query Optimization Techniques:**

```sql
-- 1. Use Indexes
CREATE INDEX idx_users_status_created 
  ON users(status, created_at DESC);

-- 2. Materialized Views for Complex Queries
CREATE MATERIALIZED VIEW user_match_stats AS
SELECT 
  u.id,
  COUNT(DISTINCT hp.user_id) as total_huddles,
  AVG(hp.duration_seconds) as avg_session_duration,
  COUNT(DISTINCT c.id) as total_connections
FROM users u
LEFT JOIN huddle_participants hp ON u.id = hp.user_id
LEFT JOIN connections c ON u.id = c.user_id1 OR u.id = c.user_id2
GROUP BY u.id;

CREATE INDEX idx_match_stats_total_huddles 
  ON user_match_stats(total_huddles DESC);

-- 3. Batch Operations (reduce round trips)
-- Instead of: INSERT INTO logs VALUES (...); (1000 times)
INSERT INTO logs VALUES 
  (...),
  (...),
  (...);  -- All in single query

-- 4. Query Planning
EXPLAIN ANALYZE SELECT * FROM users WHERE email = $1;
-- Ensure it uses index (not full table scan)

-- 5. Connection Pooling
-- PgBouncer config: 100 connections per app instance
-- Reduces connection overhead by 90%
```

### 12.3 Real-time Data Optimization

**WebSocket Message Optimization:**

```javascript
// Instead of sending full user object (1.5KB)
// Send only updated fields (150 bytes)
{
  type: 'user:status-changed',
  user_id: 'uuid',
  status: 'online',
  timestamp: 1234567890
}

// Batch multiple messages (if possible)
[
  {type: 'user:online', user_id: 'u1'},
  {type: 'user:online', user_id: 'u2'},
  {type: 'message:sent', msg_id: 'm1'}
]
```

### 12.4 Video Streaming Optimization

**Adaptive Bitrate Streaming:**

```
User's Bandwidth → 5Mbps
                    ↓
          Adaptive Bitrate Engine
          (DASH/HLS protocol)
                    ↓
┌─────────────────────────────────┐
│ Available Bitrates:             │
│ - 500kbps (low quality, mobile) │
│ - 1Mbps (medium, good wifi)     │
│ - 2.5Mbps (high, strong wifi)   │
│ - 5Mbps (max, desktop/fiber)    │
└─────────────────────────────────┘
                    ↓
            Detect network change
            (Drop video quality)
                    ↓
            Smooth transition
            (Users don't notice)
```

---

## 13. Monitoring & Observability

### 13.1 Metrics Collection

**Key Metrics (via Prometheus/DataDog):**

```
# System Metrics
- CPU utilization (target: 70%)
- Memory usage (target: 75%)
- Disk I/O latency (p99: <10ms)
- Network throughput (per node)

# Application Metrics
- Request latency (p50, p95, p99)
- Error rate (5xx, 4xx)
- Throughput (requests/sec)
- Queue depth (message processing)

# Business Metrics
- Daily Active Users (DAU)
- Match success rate
- Connection accept rate
- Huddle duration (average)
- Message volume
- User retention (7-day, 30-day)
```

### 13.2 Logging Architecture

**Centralized Log Aggregation (ELK Stack):**

```
Application Logs
      ↓
┌──────────────────────┐
│ Filebeat (collector) │
└──────────────────────┘
      ↓
┌──────────────────────┐
│ Kafka (buffer)       │
└──────────────────────┘
      ↓
┌──────────────────────┐
│ Elasticsearch        │
│ (indexed search)     │
└──────────────────────┘
      ↓
┌──────────────────────┐
│ Kibana (dashboard)   │
└──────────────────────┘

Query Example:
GET /logs/_search
{
  "query": {
    "match": {
      "error_message": "Connection refused"
    }
  },
  "size": 100
}
```

### 13.3 Distributed Tracing (Jaeger)

```
User Request (Trace ID: abc123)
      ↓
┌─────────────────────────────────────┐
│ API Gateway                         │
│ (span_id: 1, duration: 5ms)        │
└─────────────────────────────────────┘
      ↓ (propagate trace_id + parent_span_id)
┌─────────────────────────────────────┐
│ Auth Service                        │
│ (span_id: 2, duration: 10ms)       │
└─────────────────────────────────────┘
      ↓
┌─────────────────────────────────────┐
│ User Service                        │
│ (span_id: 3, duration: 50ms)       │
│  └─ Query DB (span_id: 4, 40ms)   │
│  └─ Redis lookup (span_id: 5, 5ms)│
└─────────────────────────────────────┘
      ↓
Total Request Duration: 65ms

Jaeger visualizes this as timeline:
    0     10    20    30    40    50    60
    |-----|-----|-----|-----|-----|-----| 
    [API]
         [Auth]
              [User Service]
               [DB ]
               [ Redis ]
```

### 13.4 Alerting Rules

**Critical Alerts (PagerDuty):**

```
Alert: Database Replication Lag > 5 seconds
  → Page on-call DBA immediately

Alert: Error Rate > 1%
  → Page SRE team

Alert: Matching Engine P99 latency > 500ms
  → Create incident (auto-rollback if needed)

Alert: Concurrent WebSocket connections > 90% capacity
  → Page infrastructure team

Alert: Redis memory usage > 85%
  → Page ops team to scale cluster
```

---

## Implementation Roadmap

### Phase 1 (Months 1-3): MVP
- Core auth (OAuth)
- User profiles
- One-on-one video calls (WebRTC)
- Basic matching (random)
- Real-time chat
- Deploy on single region

### Phase 2 (Months 4-6): Core Features
- Huddles (group video)
- Intent-based matching (initial ML model)
- Media uploads + CDN
- Connection requests
- Multi-region deployment

### Phase 3 (Months 7-9): AI & Scale
- AI recommendation engine
- Churn prediction + re-engagement
- Content moderation (ML-powered)
- Performance optimization
- Scale to 100M users

### Phase 4 (Months 10-12): Enterprise
- AI workflow agents
- Advanced analytics
- Enterprise SSO (SAML)
- Scale to 1B users
- Full compliance (GDPR, CCPA)

---

## Conclusion

This document provides a complete blueprint for building **Rendly**, a globally-scalable, intent-based social matching platform. The architecture is designed to handle **1 billion concurrent users** with enterprise-grade security, performance, and reliability.

**Key Architectural Decisions:**
1. **Microservices** for independent scalability
2. **Supabase PostgreSQL** for strong ACID guarantees
3. **Redis** for real-time caching & sessions
4. **WebRTC + Signaling** for P2P video
5. **ML-based matching** for intent discovery
6. **AI agents** for personalization
7. **Multi-region active-active** for global coverage
8. **Zero-trust security** with E2E encryption
9. **Kubernetes** for container orchestration
10. **Comprehensive observability** for reliability

This foundation enables rapid iteration while maintaining the scalability, security, and performance required for a world-class communication platform.
