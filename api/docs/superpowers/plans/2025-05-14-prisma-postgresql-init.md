# Prisma & PostgreSQL Initialization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize Prisma ORM and define the initial database schema for users and sessions.

**Architecture:** We use Prisma as the ORM to interact with a PostgreSQL database. The schema defines enums for user status and roles, and models for users and sessions.

**Tech Stack:** Prisma, PostgreSQL, pnpm

---

### Task 1: Install Prisma Dependencies

**Files:**
- Modify: `api/package.json`

- [ ] **Step 1: Install Prisma CLI and Client**

Run: `cd api && pnpm add -D prisma && pnpm add @prisma/client` in `api/`.
Expected: `package.json` updated with `prisma` and `@prisma/client`.

- [ ] **Step 2: Commit**

```bash
git add api/package.json api/pnpm-lock.yaml
git commit -m "chore: install prisma and @prisma/client"
```

---

### Task 2: Create Prisma Schema

**Files:**
- Create: `api/prisma/schema.prisma`

- [ ] **Step 1: Write the Prisma schema**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  BANNED
  PENDING
}

enum Role {
  USER
  ADMIN
}

model User {
  id            String     @id @default(uuid())
  email         String     @unique
  passwordHash  String
  status        UserStatus @default(PENDING)
  role          Role       @default(USER)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  sessions      Session[]
}

model Session {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  refreshToken String   @unique
  deviceName   String?
  ipAddress    String?
  expiresAt    DateTime
  createdAt    DateTime @default(now())
}
```

- [ ] **Step 2: Commit**

```bash
git add api/prisma/schema.prisma
git commit -m "feat: define initial prisma schema"
```

---

### Task 3: Configure Environment Variables

**Files:**
- Create/Modify: `api/.env`

- [ ] **Step 1: Add DATABASE_URL to .env**

Add the following line to `api/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cybercygan?schema=public"
```

- [ ] **Step 2: Commit**

```bash
git add api/.env
git commit -m "chore: configure DATABASE_URL in .env"
```

---

### Task 4: Verify Prisma Generation

**Files:**
- Modify: `api/node_modules/.prisma/client` (Generated)

- [ ] **Step 1: Run prisma generate**

Run: `cd api && npx prisma generate`
Expected: "Generated Prisma Client to ... in ..."

- [ ] **Step 2: Commit**

```bash
# No code changes to commit, but verify success.
```

---

### Task 5: Final Commit

- [ ] **Step 1: Final check and commit if needed**

```bash
git add api/prisma/schema.prisma api/.env
git commit -m "feat: initialize prisma and user models"
```
