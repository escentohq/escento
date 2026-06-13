Escento MVP

## Product Requirements Document (PRD)

---

# 1. Product Overview

Escento is a platform that connects **student musicians** with **student creators** who need collaborators for creative projects.

Examples of projects include:

- Short films
- Live performances
- YouTube videos
- Podcasts
- Indie games
- Events

Creators can:

- Post gigs
- Browse musicians
- Contact musicians

Musicians can:

- Create profiles
- List instruments and genres
- Add portfolio links
- Display availability

The MVP focuses specifically on **university communities**.

---

# 2. Problem Statement

Student creators frequently need musicians or audio collaborators for projects.

Examples include:

- Film students needing composers
- YouTubers needing intro music
- Podcasters needing sound design
- Event organizers needing performers

Currently these collaborations are discovered through:

- Word of mouth
- Social media posts
- Random outreach
- Discord servers

These methods are inefficient.

Meanwhile, musicians struggle to discover opportunities to:

- Perform
- Compose
- Collaborate
- Build portfolios

CampusGig solves this by creating a **central discovery platform**.

---

# 3. Target Users

## Student Musicians

Examples:

- Guitarists
- Drummers
- Vocalists
- Composers
- Producers
- Instrumentalists

Goals:

- Find gigs
- Collaborate on projects
- Build experience

---

## Student Creators

Examples:

- Film students
- YouTubers
- Podcasters
- Game developers
- Event organizers

Goals:

- Find musicians quickly
- Hire collaborators
- Complete projects faster

---

# 4. User Personas

## Persona 1 — Film Student

**Name:** Alex

Needs a composer for a short film.

Pain points:

- Doesn’t know musicians personally
- Unsure where to find collaborators
- Project deadlines

Goal:

Find a composer quickly.

---

## Persona 2 — Musician

**Name:** Maya

Guitarist looking for opportunities.

Pain points:

- Few networking channels
- Relies on word of mouth

Goal:

Find gigs and collaborations.

---

# 5. Core User Flows

## Flow A — Musician Creates Profile

1. User signs up  
2. Selects role **Musician**  
3. Completes musician profile  
4. Profile becomes visible in directory  

---

## Flow B — Creator Posts Gig

1. User signs up  
2. Selects role **Creator**  
3. Creates gig listing  
4. Gig appears on platform  

---

## Flow C — Creator Finds Musician

1. Creator visits musician directory  
2. Applies filters  
3. Opens musician profile  
4. Clicks contact link  

---

# 6. Core MVP Features

## Authentication

Users can:

- Sign up
- Log in
- Log out

User roles:

- `Musician`
- `Creator`

Authentication provider:

- NextAuth **or** Clerk

---

## Musician Profiles

Fields include:

- Display name
- Bio
- School
- Location
- Instruments
- Genres
- Portfolio links
- Experience
- Availability
- Contact email

---

## Musician Directory

Creators can browse musicians.

Directory features:

- Search
- Filters

Filters include:

- Instrument
- Genre
- Remote / in-person
- Paid / unpaid preference

---

## Gig Posting

Creators can create gigs.

Gig fields:

- Title
- Description
- Project type
- Location
- Remote option
- Compensation
- Deadline
- Instruments needed
- Genres preferred

---

## Gig Viewing

Users can view gig listings.

Gig page displays:

- Description
- Requirements
- Compensation
- Contact creator

---

## Portfolio Links

Musicians can include:

- YouTube
- SoundCloud
- Spotify
- Website links

File uploads are **excluded** from MVP.

---

## Contact

Contact methods include:

- Email
- External links

There is **no internal messaging system** in the MVP.

---

# 7. Features Excluded From MVP

The following features are explicitly excluded:

- Internal messaging
- Payment processing
- Rating systems
- Recommendation algorithms
- Mobile applications
- Notifications
- Social feeds

These may be added later.

---

# 8. System Architecture

## Frontend

- Next.js (App Router)
- TypeScript
- TailwindCSS

---

## Backend

- Next.js API routes or Server Actions

---

## Database

- PostgreSQL

---

## ORM

- Prisma

---

## Authentication

- NextAuth or Clerk

---

## Hosting

- Vercel

---

# 9. Database Schema Overview

## User

Fields:

- `id`
- `email`
- `name`
- `role` (`MUSICIAN` or `CREATOR`)
- `createdAt`
- `updatedAt`

---

## MusicianProfile

Fields:

- `id`
- `userId`
- `displayName`
- `bio`
- `school`
- `location`
- `isRemote`
- `seekingPaid`
- `seekingUnpaid`
- `yearsExperience`
- `availabilityText`
- `contactEmail`
- `instagramUrl`
- `youtubeUrl`
- `spotifyUrl`
- `soundcloudUrl`
- `websiteUrl`
- `createdAt`
- `updatedAt`

---

## Instrument

Fields:

- `id`
- `name`
- `category`

---

## Genre

Fields:

- `id`
- `name`

---

## MusicianInstrument

Fields:

- `id`
- `musicianProfileId`
- `instrumentId`
- `proficiency`

---

## MusicianGenre

Fields:

- `id`
- `musicianProfileId`
- `genreId`

---

## PortfolioItem

Fields:

- `id`
- `musicianProfileId`
- `title`
- `type`
- `url`
- `description`

---

## Gig

Fields:

- `id`
- `creatorId`
- `title`
- `description`
- `projectType`
- `location`
- `isRemote`
- `compensationType`
- `compensationDetails`
- `deadline`
- `status`
- `createdAt`
- `updatedAt`

---

## GigInstrument

Fields:

- `id`
- `gigId`
- `instrumentId`

---

## GigGenre

Fields:

- `id`
- `gigId`
- `genreId`

---

# 10. Matching Logic (MVP)

Matching is implemented using simple scoring.

Scoring rules:

- `+5` for matching instrument  
- `+3` for matching genre  
- `+2` for remote compatibility  
- `+2` for compensation compatibility  

Results are sorted by score.

---

# 11. Page Specifications

## Landing Page

Components:

- Hero section
- Product description
- Call-to-action buttons

---

## Musician Directory

Displays musician cards.

Card information:

- Display name
- School
- Instruments
- Genres
- Remote / in-person
- Profile link

Filters:

- Instrument
- Genre
- Remote
- Compensation

---

## Musician Profile Page

Displays:

- Bio
- Instruments
- Genres
- Portfolio links
- Availability
- Contact button

---

## Create Profile Page

Form fields:

- Display name
- Bio
- School
- Instruments
- Genres
- Portfolio links
- Availability

---

## Gig Creation Page

Fields:

- Title
- Description
- Project type
- Instruments required
- Genres preferred
- Compensation
- Location
- Remote option

---

# 12. API Endpoints

```
POST /api/profile
PATCH /api/profile
GET /api/musicians
GET /api/musicians/{id}
POST /api/gigs
GET /api/gigs
GET /api/gigs/{id}
```

---

# 13. UI Design Guidelines

Design principles:

- Simple layout
- One accent color
- Clear call-to-action buttons
- Responsive design
- Minimal clutter

Cards should prioritize **useful information immediately**.

---

# 14. Edge Cases

Handle cases including:

- Musician with no portfolio
- Gig without compensation
- Empty search results
- Duplicate profile creation
- Invalid URLs

---

# 15. Deployment

Deployment platform: **Vercel**

Steps:

1. Connect GitHub repository
2. Configure environment variables
3. Run database migrations
4. Deploy application

---

# 16. MVP Success Metrics

Initial metrics include:

- Number of musician profiles
- Number of gigs posted
- Number of profile views
- Number of contact clicks

Initial success target:

**10–20 real users testing the platform.**

---

# 17. Future Roadmap

Potential future features:

- Internal messaging
- Algorithmic recommendations
- Payment escrow
- User ratings
- Mobile applications
- Portfolio uploads

---

# Engineering Notes

The goal is a **minimal functional MVP**.

Engineering priorities:

1. Simple architecture
2. Stable core flows
3. Minimal complexity
4. Fast deployment

Avoid unnecessary abstractions.
