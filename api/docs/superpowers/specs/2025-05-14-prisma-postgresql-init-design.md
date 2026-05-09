# Design Document: Prisma & PostgreSQL Initialization

## Overview
This document outlines the initialization of Prisma ORM and PostgreSQL database for the `cobalt` API project. This setup will provide the foundation for user authentication and session management.

## Architecture
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Language:** TypeScript

## Data Models

### UserStatus (Enum)
- `ACTIVE`
- `SUSPENDED`
- `BANNED`
- `PENDING`

### Role (Enum)
- `USER`
- `ADMIN`

### User (Model)
- `id`: String (UUID, Primary Key)
- `email`: String (Unique)
- `passwordHash`: String
- `status`: UserStatus (Default: `PENDING`)
- `role`: Role (Default: `USER`)
- `createdAt`: DateTime (Default: `now()`)
- `updatedAt`: DateTime (Auto-updated)
- `sessions`: Session[] (Relation)

### Session (Model)
- `id`: String (UUID, Primary Key)
- `userId`: String
- `user`: User (Relation)
- `refreshToken`: String (Unique)
- `deviceName`: String?
- `ipAddress`: String?
- `expiresAt`: DateTime
- `createdAt`: DateTime (Default: `now()`)

## Configuration
- `api/.env`: Will contain `DATABASE_URL`.
- `api/prisma/schema.prisma`: Will contain the Prisma schema definition.

## Implementation Steps
1. Install `prisma` and `@prisma/client`.
2. Create `prisma/schema.prisma`.
3. Configure `.env`.
4. Run `npx prisma generate`.
