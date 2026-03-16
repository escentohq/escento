# GigForge MVP UI Map

## Purpose

This document defines the exact UI structure for the MVP so that engineering agents do not invent unnecessary pages, components, or flows.

The UI should feel:

- clean
- modern
- minimal
- student-friendly
- slightly polished, but not overdesigned

Design constraints:

- use one accent color only
- avoid visual clutter
- prioritize clear calls to action
- mobile-responsive but optimized primarily for desktop
- no fancy animations required for MVP
- use cards, badges, chips, and clean spacing
- all pages should feel consistent

---

# Global Layout

## Shared App Structure

All pages should use a shared layout with:

- top navigation bar
- centered main content container
- max width around 1100–1200px
- generous vertical spacing
- consistent padding

## Navbar

### Left side
- app name/logo text: `GigForge` or current chosen working title

### Right side
- `Browse Musicians`
- `Browse Gigs`
- `Create Profile`
- `Post a Gig`
- auth button:
  - `Sign In` if logged out
  - user avatar/menu if logged in

### Mobile behavior
- collapse links into simple menu
- auth action remains visible

---

# Page 1: Landing Page

**Route:** `/`

## Goal
Explain the product instantly and drive users into one of two actions:
- musicians create a profile
- creators browse talent or post a gig

## Layout

### Section 1: Hero
Large headline:
- "Find the right student musician for your next project."
- or equivalent concise value proposition

Subheadline:
- explain that creators can discover musicians for films, events, podcasts, games, and more

Primary CTA buttons:
- `Browse Musicians`
- `Create Musician Profile`

Optional secondary CTA:
- `Post a Gig`

Right side or below:
- visual mock card cluster showing example musician/gig cards

---

### Section 2: How It Works
Three horizontally aligned cards on desktop, stacked on mobile

#### Card 1
Title: `Create a profile`
Description: Musicians showcase instruments, genres, and portfolio links

#### Card 2
Title: `Post a project`
Description: Creators list what they need for films, performances, podcasts, and more

#### Card 3
Title: `Connect quickly`
Description: Browse, filter, and contact the right collaborator

---

### Section 3: Use Cases
Simple grid or badge list:
- Short films
- Campus performances
- Podcasts
- YouTube videos
- Indie games
- Student productions

---

### Section 4: Final CTA
Short text:
- "Built for student creators and musicians."

Buttons:
- `Get Started`
- `Browse Musicians`

---

# Page 2: Musician Directory

**Route:** `/musicians`

## Goal
Allow creators to browse and filter musicians quickly.

## Layout

### Page Header
Title: `Browse Musicians`
Subtitle: short sentence explaining discovery by instrument, genre, and availability

---

### Filter Bar
Horizontal filter container near top of page

Filters:
- search input (`Search by name, school, or keyword`)
- instrument dropdown
- genre dropdown
- remote toggle or select
- paid/unpaid preference select

Optional:
- clear filters button

Desktop:
- filters inline

Mobile:
- stacked vertically

---

### Results Section
Display musician cards in a responsive grid:
- 3 columns desktop
- 2 columns tablet
- 1 column mobile

## Musician Card Structure

### Top row
- display name
- small badge for remote/in-person

### Below
- school/location text

### Middle section
- instrument chips (top 3 max shown)
- genre chips (top 3 max shown)

### Lower section
- short bio preview (2 lines max)
- paid/unpaid badges

### Bottom
button:
- `View Profile`

### Card behavior
- hover shadow on desktop
- clickable but button should remain obvious

---

### Empty State
If no musicians match:
- message: `No musicians match these filters yet.`
- button: `Clear Filters`

---

# Page 3: Musician Profile Page

**Route:** `/musicians/[id]` or `/musicians/[slug]`

## Goal
Show everything a creator needs to decide whether to contact this musician.

## Layout

Two-column layout on desktop, single-column on mobile

---

### Left Column: Main Profile Info

#### Header Section
- display name
- school
- location
- remote/in-person badge

#### Bio Section
- full bio text

#### Instruments Section
- chip list of instruments
- optional proficiency display if included

#### Genres Section
- chip list of genres

#### Experience / Availability Section
- years of experience
- availability text
- seeking paid / unpaid badges

---

### Portfolio Section
Card or stacked list of links

Each item shows:
- title
- type badge (`Audio`, `Video`, `Link`)
- optional short description
- external link button

If no portfolio:
- show simple fallback text

---

### Right Column: Contact Card

Sticky on desktop if easy, static if not

Contents:
- card title: `Interested in working together?`
- contact email
- social links if available:
  - Instagram
  - YouTube
  - Spotify
  - SoundCloud
  - personal website

Primary CTA:
- `Contact Musician`

This should open:
- `mailto:` link for MVP
- or external link if only socials exist

---

# Page 4: Create / Edit Musician Profile

**Routes:**
- `/profile/create`
- `/profile/edit`

## Goal
Allow musician users to create or update a professional but simple profile.

## Layout

Single centered form container

### Form Header
Title:
- `Create Your Musician Profile`
or
- `Edit Your Profile`

Short helper text:
- explain that creators will use this page to discover and contact them

---

### Form Sections

## Section 1: Basic Info
Fields:
- display name
- bio (textarea)
- school
- location

---

## Section 2: Work Preferences
Fields:
- remote checkbox/toggle
- open to paid work checkbox
- open to unpaid work checkbox
- years of experience
- availability text

---

## Section 3: Instruments
- multi-select component or checkbox group
- optional proficiency input if implemented simply

---

## Section 4: Genres
- multi-select component or checkbox group

---

## Section 5: Portfolio Links
Inputs for:
- YouTube URL
- SoundCloud URL
- Spotify URL
- website URL
- Instagram URL

Optional additional repeatable portfolio items if implementation is easy

---

## Section 6: Contact
Fields:
- contact email

---

### Form Footer
Primary button:
- `Save Profile`

Secondary action:
- `Cancel`

### Validation
Show inline errors for:
- missing required fields
- invalid URLs
- invalid email

---

# Page 5: Gig Directory

**Route:** `/gigs`

## Goal
Allow musicians or creators to browse active gigs.

## Layout

### Header
Title: `Browse Gigs`
Subtitle: discover creative opportunities posted by student creators

---

### Filter Area
Simple top filter row:
- search input
- project type dropdown
- instrument dropdown
- genre dropdown
- remote toggle
- compensation type dropdown

---

### Gig Cards List
Use stacked cards or 2-column grid

## Gig Card Structure

### Top row
- gig title
- status badge (`Open`)

### Below
- project type
- location / remote
- creator school or creator name if available

### Middle
- required instruments chips
- preferred genre chips

### Lower
- short description preview (2–3 lines max)
- compensation badge

### Bottom
button:
- `View Gig`

---

### Empty State
Text:
- `No gigs match your filters yet.`

Button:
- `Clear Filters`

---

# Page 6: Gig Detail Page

**Route:** `/gigs/[id]`

## Goal
Show the full gig and allow contact with the creator.

## Layout

Two-column desktop, one-column mobile

---

### Left Column: Gig Details

#### Header
- title
- project type badge
- status badge
- remote/in-person indicator

#### Description
- full project description

#### Requirements
- instruments needed
- genres preferred
- experience expectations if added later

#### Logistics
- location
- deadline
- compensation type
- compensation details

---

### Right Column: Creator Contact Card
Contents:
- creator name if available
- contact email
- post date

Primary CTA:
- `Contact Creator`

For MVP this should open:
- `mailto:` link

---

# Page 7: Create Gig Page

**Route:** `/gigs/create`

## Goal
Allow creators to post a clear, structured gig.

## Layout

Single centered form container

### Form Header
Title:
- `Post a Gig`

Subtitle:
- explain that musicians will discover this listing in the platform

---

### Form Sections

## Section 1: Basic Project Info
Fields:
- title
- description (textarea)
- project type dropdown

---

## Section 2: Requirements
Fields:
- instruments needed (multi-select)
- genres preferred (multi-select)

---

## Section 3: Logistics
Fields:
- location
- remote checkbox/toggle
- deadline

---

## Section 4: Compensation
Fields:
- compensation type dropdown
- compensation details textarea or text input

---

## Section 5: Contact
Fields:
- contact email if not already pulled from account

---

### Form Footer
Primary button:
- `Publish Gig`

Secondary button:
- `Cancel`

Validation:
- required title
- required description
- valid email
- valid date if provided

---

# Page 8: Simple Dashboard

**Route:** `/dashboard`

## Goal
Give logged-in users a minimal home base without overbuilding.

## Musician Dashboard View
Show:
- profile completion status
- button to edit profile
- quick preview card of their profile

## Creator Dashboard View
Show:
- button to post a gig
- list of their posted gigs
- edit/view links

Keep this page simple.

---

# Reusable Components

## 1. Navbar
Used globally

## 2. MusicianCard
Used in musician directory

## 3. GigCard
Used in gig directory

## 4. FilterBar
Reusable filter wrapper

## 5. Badge / Chip
Used for:
- genres
- instruments
- compensation
- remote/in-person
- status

## 6. EmptyState
Reusable no-results component

## 7. SectionHeader
Reusable page section heading

## 8. FormField
Reusable form label + input wrapper if desired

---

# Visual Style Guidelines

## Typography
- bold headline on landing page
- clear section headings
- readable body text
- avoid giant paragraphs

## Color
- one accent color
- neutral background
- subtle borders and shadows

## Components
- rounded cards
- soft shadows
- pill badges/chips
- generous whitespace

## Interaction
- hover states on cards and buttons
- obvious clickable CTAs
- do not over-animate

---

# UX Priorities

The UI should optimize for:

1. fast browsing
2. fast profile creation
3. fast gig posting
4. easy contact
5. low friction

The UI should **not** optimize for:
- social engagement
- fancy feeds
- excessive profile customization
- internal messaging
- gamification

---

# Implementation Notes for Engineering Agent

The engineering agent should:

- build only the pages listed here
- follow the layouts closely
- avoid adding unnecessary pages or complexity
- prefer simple components over elaborate systems
- keep forms functional and validated
- make cards clean and information-dense
