# Cloud Expense Tracker - Architecture

## Overview

Cloud Expense Tracker is a SaaS application for managing cloud infrastructure costs. It follows a modern full-stack architecture with clear separation of concerns.

## High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                    CLIENT                        │
│  React 19 + TypeScript + Vite + Tailwind CSS    │
│  React Query (Server State) + React Router       │
└─────────────────┬───────────────────────────────┘
                  │ REST API (JSON)
┌─────────────────▼───────────────────────────────┐
│                   SERVER                         │
│  Express.js + TypeScript                         │
│  ┌───────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Controllers│  │ Services │  │   Middleware  │ │
│  │ (HTTP)     │→ │ (Logic)  │  │ (Auth,Valid) │ │
│  └───────────┘  └────┬─────┘  └──────────────┘ │
│                      │                           │
│  ┌───────────────────▼────────────────────────┐ │
│  │              Prisma ORM                     │ │
│  └───────────────────┬────────────────────────┘ │
└──────────────────────┼──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│               PostgreSQL Database                │
│  Users | Expenses | Categories | Budgets | ...  │
└─────────────────────────────────────────────────┘
```

## Design Patterns

### 1. Layered Architecture (Backend)

- **Controller Layer**: Handles HTTP requests/responses. No business logic.
- **Service Layer**: Contains business logic and data orchestration. Reusable from controllers, CLI, or jobs.
- **Data Layer**: Prisma ORM handles database queries and migrations.
- **Middleware**: Cross-cutting concerns (auth, validation, rate limiting, errors).

### 2. Component Architecture (Frontend)

- **Pages**: Route-level components that compose the UI.
- **Components**: Reusable UI elements (atomic design).
- **Hooks**: Custom React hooks for data fetching and state.
- **API Layer**: Centralized HTTP client with interceptors.
- **Store**: React Context for global auth state.
- **Schemas**: Zod schemas for form validation.

### 3. Security Patterns

- **JWT + Refresh Token Rotation**: Short-lived access tokens with secure refresh flow.
- **Password Hashing**: bcrypt with 12 salt rounds.
- **Input Validation**: Zod schemas on both client and server.
- **Rate Limiting**: Express middleware with configurable windows.
- **CORS**: Strict origin whitelist.
- **Helmet**: HTTP security headers.
- **Non-root Docker**: Production containers run as unprivileged user.

### 4. Data Patterns

- **UUID Primary Keys**: Prevents enumeration attacks, safe for distributed systems.
- **Decimal for Money**: Avoids floating-point precision issues.
- **Cascade Deletes**: User deletion removes all associated data.
- **Indexed Queries**: Performance-optimized for dashboard queries.
- **Soft References**: Categories use SetNull on delete (expense remains).

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| ORM | Prisma | Type-safe, great DX, excellent migrations |
| State Mgmt | React Query | Server state caching, optimistic updates |
| Forms | React Hook Form + Zod | Performance, validation, type safety |
| Styling | Tailwind CSS | Utility-first, no runtime overhead |
| Charts | Recharts | Declarative, React-native, SVG-based |
| Auth | JWT + Refresh | Stateless, scalable, secure |
| Database | PostgreSQL | ACID, complex queries, JSON support |
| Container | Docker + Alpine | Minimal images, security |
