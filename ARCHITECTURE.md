# MoveUp Platform - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Users (Internet)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Vercel (CDN)   │
                    │   Next.js App   │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        │                    │                    │
   ┌────▼─────┐    ┌────────▼────────┐   ┌──────▼──────┐
   │ Next.js   │    │   API Routes    │   │ Middleware  │
   │  Pages    │    │   /api/*        │   │ (Auth)      │
   └────┬─────┘    └────────┬────────┘   └──────┬──────┘
        │                   │                   │
        │    ┌──────────────┼──────────────┐   │
        │    │              │              │   │
        ▼    ▼              ▼              ▼   │
   ┌──────────────────────────────────────────┘
   │                                       
   │        Supabase (Auth + Database)    
   │                                       
   │    ┌─────────────────────────────┐   
   │    │  PostgreSQL Database        │   
   │    │  - Profiles                 │   
   │    │  - Courses                  │   
   │    │  - Lessons                  │   
   │    │  - Enrollments              │   
   │    │  - Progress                 │   
   │    │  - Orders                   │   
   │    │  - Certificates             │   
   │    └─────────────────────────────┘   
   │                                       
   │    ┌─────────────────────────────┐   
   │    │  Auth System                │   
   │    │  - JWT Tokens               │   
   │    │  - Email Confirmation       │   
   │    │  - Session Management       │   
   │    └─────────────────────────────┘   
   │                                       
   └──────────────────────────────────────
                      │
        ┌─────────────┼─────────────┐
        │             │             │
   ┌────▼──────┐ ┌───▼────┐ ┌─────▼──────┐
   │  Stripe   │ │Storage │ │ Email      │
   │ Payments  │ │(Images)│ │ (SMTP)     │
   └───────────┘ └────────┘ └────────────┘
```

## Data Flow Diagrams

### Authentication Flow

```
User                    Frontend              Middleware           Database
  │                        │                     │                    │
  │──Sign Up──────────────►│                     │                    │
  │                        │                     │                    │
  │                        │──Create User───────────────────────────►│
  │                        │                     │                    │
  │                        │◄──JWT Token + User ID──────────────────│
  │                        │                     │                    │
  │                        │──Send Email──────────────────────────────────►
  │                        │                     │                    │
  │◄──Confirm Email────────│                     │                    │
  │                        │                     │                    │
  │──Login────────────────►│                     │                    │
  │                        │──Verify Credentials──────────────────────►│
  │                        │                     │                    │
  │                        │◄──Session Token──────────────────────────│
  │                        │                     │                    │
  │◄──Set Cookie──────────│                     │                    │
  │                        │                     │                    │
  │──Access /dashboard───────────────────────────► Check Auth ───────│
  │                        │                     │   (RLS Policies)   │
  │                        │◄───Allow Access──────────────────────────│
  │                        │                     │                    │
  │◄──Dashboard Page───────│                     │                    │
```

### Payment & Enrollment Flow

```
Student              Cart Page             API Route           Stripe           Database
   │                    │                     │                  │                │
   │──Add Course────────►│                     │                  │                │
   │                    │                     │                  │                │
   │──Checkout─────────►│                     │                  │                │
   │                    │                     │                  │                │
   │                    │──Create Intent─────►│                  │                │
   │                    │                     │                  │                │
   │                    │◄──Client Secret─────│                  │                │
   │◄──Show Form────────│                     │                  │                │
   │                    │                     │                  │                │
   │──Enter Card───────►│                     │                  │                │
   │                    │──Process Payment───────────────────────►│                │
   │                    │                     │                  │                │
   │                    │◄──Success──────────────────────────────│                │
   │                    │                     │                  │                │
   │                    │──Confirm Payment───►│                  │                │
   │                    │                     │                  │                │
   │                    │                     │──Create Order────────────────────►│
   │                    │                     │                  │                │
   │                    │                     │──Create Enrollment──────────────►│
   │                    │                     │                  │                │
   │◄──Success Page─────│◄───Redirect────────│                  │                │
   │                    │                     │                  │                │
   │──View Course──────►│                     │                  │                │
   │                    │──GET Enrollments───────────────────────────────────────►│
   │◄──Course Access────│◄───User Enrolled───────────────────────────────────────│
```

### Lesson Progress & Certificate Flow

```
Student           Lesson Player        API Route          Database      Email
   │                 │                    │                  │            │
   │──Open Lesson──►│                    │                  │            │
   │                │                    │                  │            │
   │                │──Load Lesson───────────────────────────────────────►│
   │                │                    │                  │            │
   │                │◄──Video + Content──────────────────────────────────│
   │◄──Display──────│                    │                  │            │
   │                │                    │                  │            │
   │──Watch Video──►│                    │                  │            │
   │    (complete)  │                    │                  │            │
   │                │                    │                  │            │
   │──Mark Complete─────────────────────►│                  │            │
   │                │                    │                  │            │
   │                │                    │──Update Progress───────────────►│
   │                │                    │                  │            │
   │                │                    │──Calculate %─────────────────►│
   │                │                    │                  │            │
   │                │                    │──Check: 100%?────────────────►│
   │                │                    │                  │            │
   │                │                    │                  │◄──YES──────│
   │                │                    │                  │            │
   │                │                    │──Generate Cert─────────────────►│
   │                │                    │                  │            │
   │◄──Certificate─►│◄───Success────────│                  │            │
   │                │                    │                  │            │
   │──Download────►│──Generate PDF─────►│                  │            │
```

## Component Architecture

### Frontend Components Tree

```
Layout
├── Header
│   └── Navigation
├── Main Content
│   ├── Public Pages
│   │   ├── Home
│   │   ├── Courses Catalog
│   │   │   ├── CourseCard (x N)
│   │   │   └── Search/Filter
│   │   └── Course Detail
│   │       └── CourseContent
│   ├── Auth Pages
│   │   ├── Login
│   │   ├── SignUp
│   │   └── SignUpSuccess
│   ├── Protected Pages
│   │   ├── Dashboard
│   │   │   ├── Stats Cards
│   │   │   └── CoursesGrid
│   │   ├── Learn
│   │   │   ├── LessonPlayer
│   │   │   ├── LessonNav
│   │   │   └── ProgressBar
│   │   ├── Certificates
│   │   │   └── CertificateCard (x N)
│   │   └── Cart
│   │       ├── CartItem (x N)
│   │       └── Checkout
│   └── Admin Pages
│       ├── AdminDashboard
│       ├── CourseManager
│       ├── StudentManager
│       ├── OrderManager
│       └── CertificateManager
└── Footer
```

## Database Schema Relationships

```
Profiles (users)
├── id (PK)
├── email
├── role (student/instructor/admin)
└── ┌─────────────────────┐
    │ 1:N Enrollments     │
    │ 1:N Orders          │
    │ 1:N Cart Items      │
    │ 1:N Certificates    │
    └─────────────────────┘

Courses
├── id (PK)
├── title
├── instructor_id (FK → Profiles)
├── price
├── status (draft/published)
└── ┌──────────────────────┐
    │ 1:N Lessons          │
    │ 1:N Enrollments      │
    │ 1:N Cart Items       │
    │ 1:N Order Items      │
    └──────────────────────┘

Lessons
├── id (PK)
├── course_id (FK → Courses)
├── title
├── video_url
└── ┌──────────────────────┐
    │ 1:N Progress         │
    └──────────────────────┘

Enrollments
├── id (PK)
├── user_id (FK → Profiles)
├── course_id (FK → Courses)
├── enrolled_at
└── ┌──────────────────────┐
    │ References Progress  │
    │ References Certs     │
    └──────────────────────┘

Progress
├── id (PK)
├── enrollment_id (FK → Enrollments)
├── lesson_id (FK → Lessons)
├── completed (boolean)
└── completed_at

Orders
├── id (PK)
├── user_id (FK → Profiles)
├── total_amount
├── status (pending/completed)
└── ┌──────────────────────┐
    │ 1:N Order Items      │
    └──────────────────────┘

Order Items
├── id (PK)
├── order_id (FK → Orders)
├── course_id (FK → Courses)
└── price_at_purchase

Cart Items
├── id (PK)
├── user_id (FK → Profiles)
├── course_id (FK → Courses)
└── added_at

Certificates
├── id (PK)
├── user_id (FK → Profiles)
├── course_id (FK → Courses)
├── earned_at
└── valid_until
```

## API Endpoint Architecture

```
REST API Routes

POST /api/payments/create-intent
  Input: { cart_items: [...] }
  Output: { client_secret, total_amount }
  Auth: Required (student)
  Action: Create Stripe payment intent

POST /api/webhooks/stripe
  Input: Stripe webhook payload
  Output: { ok: true }
  Auth: Signature verification
  Action: Process payment events, auto-enroll

POST /api/lessons/complete
  Input: { enrollment_id, lesson_id }
  Output: { progress_percent, certificate_generated }
  Auth: Required (student)
  Action: Mark lesson complete, generate cert if needed
```

## Authentication & Authorization Architecture

```
┌─────────────────────────────────────────┐
│         Request to Protected Route       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │  Middleware Check   │
        │  JWT in cookies?    │
        └─────────┬───────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
    NO  │                   │   YES
        │                   │
    ┌───▼──┐            ┌───▼──────────┐
    │Redirect           │Verify JWT    │
    │to Login           │(expires)     │
    └──────┘            └───┬──────────┘
                            │
                    ┌───────┴──────────┐
                    │                  │
                VALID                 INVALID
                    │                  │
        ┌───────────▼──┐        ┌──────▼──┐
        │Check RLS     │        │Redirect │
        │Policies      │        │to Login  │
        │in Database   │        └─────────┘
        └───────┬──────┘
                │
        ┌───────┴──────────┐
        │                  │
    ALLOWED              DENIED
        │                  │
    ┌───▼──────┐       ┌──▼─────┐
    │Process    │       │Error   │
    │Request    │       │403/401 │
    └──────────┘       └────────┘
```

## Deployment Architecture

```
GitHub Repository
    │
    ├─ Triggers
    │   └─ Vercel Deployment
    │
    ▼
┌────────────────────┐
│  Vercel (Edge)     │
│  ├─ Next.js App    │
│  ├─ API Routes     │
│  └─ Middleware     │
└────────────────────┘
         │
    ┌────┴──────┐
    │           │
    ▼           ▼
┌─────────┐  ┌──────────────┐
│Supabase │  │Stripe        │
│├─ Auth  │  │├─ Payments   │
│├─ DB    │  │└─ Webhooks   │
│└─ RLS   │  └──────────────┘
└─────────┘
```

## Security Model

```
Authentication Layer
├── Email/Password signup
├── Email confirmation
├── JWT tokens
└── Session cookies

Authorization Layer
├── Role-based (student/instructor/admin)
├── Row Level Security
│   ├── profiles: users see own only
│   ├── enrollments: users see own only
│   ├── orders: users see own only
│   ├── certificates: users see own only
│   └── courses: users see published courses
└── API route checks

Data Protection
├── HTTPS/TLS encryption
├── Database encryption at rest
├── Secure password hashing (bcrypt)
├── Webhook signature verification (Stripe)
└── CORS restrictions
```

## Performance Considerations

```
Frontend Optimization
├── Server-side rendering (SSR)
├── Image optimization (Next.js Image)
├── Code splitting
├── Font optimization (next/font)
└── CSS minification

Database Optimization
├── Indexes on frequently queried columns
├── Partitioning for large tables
├── Connection pooling
├── Query optimization
└── Read replicas for scaling

API Optimization
├── Response caching
├── Webhook retry logic
├── Error handling and logging
└── Rate limiting ready
```

## Scalability Path

```
Current Architecture (Single Instance)
│
├─ Monitor metrics
│  ├─ Database: 1000+ req/sec
│  ├─ API: Response time > 1s
│  ├─ Storage: Approaching limits
│  └─ Users: > 100k concurrent
│
└─ Scale Up
   ├─ Database
   │  ├─ Read replicas
   │  ├─ Sharding
   │  └─ Caching layer (Redis)
   ├─ API
   │  ├─ Multiple instances
   │  ├─ Load balancing
   │  └─ CDN for static assets
   └─ Storage
      └─ S3 or similar object storage
```

---

**Document Version:** 1.0
**Last Updated:** February 2026
**Architecture Pattern:** Microservices-ready (monolith with service layers)

