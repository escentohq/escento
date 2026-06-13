# Data Model and Database Access

## Feature Summary
Escento is built around a small marketplace-style schema: users choose one role, musicians publish one public profile, creators publish many gigs, and both profiles and gigs share free-form instrument and genre tags. This feature is the foundation for every route that reads or mutates data.

## Product Intent
- Keep the MVP intentionally simple: direct discovery, structured listings, and email contact.
- Support two user roles only: `MUSICIAN` and `CREATOR`.
- Allow anonymous browsing while protecting all writes behind authenticated server actions.
- Reuse `Instrument` and `Genre` across both sides of the marketplace so filters work consistently.

## Routes and Code That Depend on This
- All pages that import `db` from `src/lib/db.ts`.
- NextAuth adapter in `src/auth.ts`.
- Profile and gig server actions.
- Directory filters for `/musicians` and `/gigs`.

## Relevant Source Code

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  MUSICIAN
  CREATOR
}

enum CompensationType {
  PAID
  UNPAID
  NEGOTIABLE
}

enum ProjectType {
  FILM
  LIVE_EVENT
  PODCAST
  GAME
  YOUTUBE
  OTHER
}
```

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      UserRole?
  emailVerified DateTime?
  image     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  musicianProfile MusicianProfile?
  gigs            Gig[]

  accounts Account[]
  sessions Session[]
}
```

```prisma
model MusicianProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  displayName     String
  bio             String?
  school          String?
  location        String?
  isRemote        Boolean  @default(true)
  seekingPaid     Boolean  @default(true)
  seekingUnpaid   Boolean  @default(true)
  yearsExperience Int?
  availabilityText String?
  contactEmail    String?

  instagramUrl    String?
  youtubeUrl      String?
  spotifyUrl      String?
  soundcloudUrl   String?
  websiteUrl      String?

  user            User @relation(fields: [userId], references: [id])

  instruments     MusicianInstrument[]
  genres          MusicianGenre[]
  portfolio       PortfolioItem[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

```prisma
model Gig {
  id                  String   @id @default(cuid())
  creatorId           String
  title               String
  description         String
  projectType         ProjectType
  location            String?
  isRemote            Boolean @default(true)
  compensationType    CompensationType
  compensationDetails String?
  deadline            DateTime?
  status              String @default("OPEN")

  creator             User @relation(fields: [creatorId], references: [id])

  instruments         GigInstrument[]
  genres              GigGenre[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

```ts
// src/lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

## How It Works
The Prisma schema stores auth tables required by `@next-auth/prisma-adapter`, application users, musician profiles, gigs, and many-to-many tag join tables. `User.role` is nullable so newly authenticated users can exist before onboarding. Once role selection completes, the role becomes the branch point for navigation and authorization.

`MusicianProfile.userId` is unique, enforcing one musician profile per user. `Gig.creatorId` is not unique, allowing one creator to post many gigs. Both entities join to `Instrument` and `Genre` through explicit join models, which makes directory filters expressible with Prisma `some` conditions.

The `db` singleton prevents creating a new Prisma client on every hot reload in development. In production it avoids writing to `globalThis`, while in development it caches the client to reduce connection churn.

## Data Relationships
- `User -> MusicianProfile`: optional one-to-one.
- `User -> Gig`: one-to-many.
- `MusicianProfile -> Instrument`: many-to-many through `MusicianInstrument`.
- `MusicianProfile -> Genre`: many-to-many through `MusicianGenre`.
- `Gig -> Instrument`: many-to-many through `GigInstrument`.
- `Gig -> Genre`: many-to-many through `GigGenre`.

## Implementation Details for an LLM
When building new features, treat `prisma/schema.prisma` as the source of truth. Pages should import `db` from `@/lib/db`, not instantiate `PrismaClient` directly. Mutations should be server actions that validate the current session, validate the role, then use Prisma. Directory reads should prefer direct Prisma queries in Server Components.

The current system uses free-form tag creation: form inputs provide comma-separated names, actions ensure each instrument/genre exists, then create join rows. This is simple but can create case-sensitive duplicates such as `Guitar` and `guitar`.

## Issues and Improvements
- `Gig.status` is a plain string. Convert it to a Prisma enum such as `GigStatus { OPEN CLOSED }`.
- `Instrument.name` and `Genre.name` are not unique. Add unique constraints after normalizing existing data.
- `PortfolioItem` exists but is unused. Either implement repeatable portfolio links or remove it from MVP scope.
- Joins have no cascade behavior. Deleting musician profiles is not implemented, but if added, ensure associated join and portfolio rows are handled.
- Add indexes for filter-heavy relations once data volume grows.

