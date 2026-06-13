# Pilot Test Checklist

This checklist is meant for pilot users, founders, and internal QA to test every functional surface in the current Escento app before a broader pilot. It follows the current codebase behavior, not older product docs where they drift.

Use one row per test attempt. Mark the checkbox only after the tester confirms the expected result. If anything is unclear, broken, slow, confusing, ugly, or surprising, record:

- Tester name
- Browser and device
- Account used
- Route
- Steps taken
- Expected result
- Actual result
- Screenshot or screen recording
- Console error, if visible

## Test Accounts And Setup

Create or identify these accounts before running the full pass.

| Account | Purpose | Notes |
|---|---|---|
| Fresh visitor | Signed-out first visit | Use incognito/private window. |
| New un-onboarded account | Tests `/onboarding/role` redirect | Sign up but do not choose a role yet. |
| Musician A | Owns a complete musician profile | Used for profile, messaging, report, account tests. |
| Musician B | Another musician | Used to test musician-to-musician connection requests. |
| Creator A | Owns open and filled gigs | Used for create/edit/manage gig tests. |
| Creator B | Another creator | Used to test permissions and connection requests. |
| Admin account | Admin-only pages | Must satisfy the app's admin access config. |
| Nonexistent email | Forgot-password edge case | Use an address that should not exist in Supabase. |

Recommended browsers and devices:

- Desktop Chrome
- Desktop Safari
- Mobile Safari
- Mobile Chrome
- At least one narrow viewport around 375px wide
- At least one tablet viewport around 768px wide

## Global Expectations

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Open the app homepage in a clean browser session. | Page loads without a console error or blank screen. | Homepage renders with bright off-white background and visible nav. |
| [ ] | Reload the homepage. | Reload behavior. | Page reloads cleanly without losing layout or showing a permanent loading state. |
| [ ] | Use browser Back and Forward after navigating a few pages. | Navigation state. | Pages restore correctly and filters/forms do not corrupt the app shell. |
| [ ] | Scroll every long page from top to bottom. | Scrolling, animation, sticky nav. | Scrolling is smooth enough, content appears, nav remains usable, no blank bands. |
| [ ] | Resize desktop browser from wide to narrow. | Responsive layout. | No horizontal page scroll, text overlap, clipped buttons, or broken cards. |
| [ ] | Test with keyboard only: Tab through the homepage nav and buttons. | Focus states. | Visible blue focus outline appears on each interactive element. |
| [ ] | Press Enter on focused links/buttons. | Keyboard activation. | Focused links/buttons activate normally. |
| [ ] | Use Shift+Tab through a form. | Reverse keyboard navigation. | Focus order remains logical. |
| [ ] | Use browser zoom at 125 percent and 150 percent. | Text and layout resilience. | Text remains readable and controls remain reachable. |
| [ ] | Open app with slow network throttling. | Loading states. | Route skeleton/loading UI appears where routes are slow, then content replaces it. |
| [ ] | Visit an invalid route such as `/this-route-does-not-exist`. | 404 page. | Branded "Lost in the mix." 404 page appears with a button back home. |
| [ ] | Open footer links from any page. | Footer navigation. | Musicians, gigs, privacy, terms, and compliance links navigate correctly. |
| [ ] | Verify colors across pages. | Theme consistency. | New surfaces are bright stage-light style, not dark zinc/violet. |
| [ ] | Verify icons across pages. | Icon style. | Icons are consistent lucide-style icons. |
| [ ] | Test on a phone-sized screen. | Nav layout. | Header does not overflow; public links are reachable in the secondary nav row or account menu. |
| [ ] | Leave app idle for several minutes, then click a protected link. | Session refresh behavior. | Signed-in users remain signed in or are cleanly redirected to sign in. |

## Public Homepage

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Open `/` signed out. | Hero content. | Homepage loads with hero headline, supporting copy, primary and secondary CTAs. |
| [ ] | Scroll through the whole homepage. | All sections. | Each section appears and animations do not stutter badly or hide content. |
| [ ] | Click the Escento wordmark in nav. | Home link. | Browser navigates to `/`. |
| [ ] | Click "Browse Musicians" from homepage. | Auth gating. | Signed-out user is redirected to `/signin?callbackUrl=...` if current code requires auth. |
| [ ] | Click "Browse Gigs" from homepage. | Auth gating. | Signed-out user is redirected to sign in if current code requires auth. |
| [ ] | Click "Sign in" from nav. | Auth navigation. | `/signin` loads. |
| [ ] | Click "Sign up" from nav. | Auth navigation. | `/signup` loads. |
| [ ] | Click "Help" from signed-out nav. | Public support page. | `/help` loads. |
| [ ] | Use each homepage CTA near top, middle, and bottom. | CTA routes. | Every CTA navigates to the correct target and no button is dead. |
| [ ] | Hover homepage cards/links on desktop. | Hover states. | Hover states are visible but do not shift layout unexpectedly. |
| [ ] | Open homepage with reduced motion enabled in OS/browser if possible. | Motion reduction. | Content remains visible and major motion is reduced. |
| [ ] | Test homepage on mobile. | Hero and CTA fit. | Hero text and buttons fit the viewport; no text overlaps floating visuals. |
| [ ] | Test homepage on tablet. | Grid transitions. | Sections stack or grid cleanly without awkward gaps. |

## Authentication: Sign Up

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Open `/signup` signed out. | Page load. | Sign-up form loads with name, email, password, confirm password, terms checkbox, and links to policies. |
| [ ] | Submit the empty sign-up form. | Required validation. | Inline errors appear for email, password, confirm mismatch if applicable, and terms acceptance. |
| [ ] | Type `not-an-email` in email and submit. | Email validation. | Error says to enter a valid email address. |
| [ ] | Type a password shorter than 8 characters. | Password validation. | Error says to use at least 8 characters. |
| [ ] | Type a password with no number, such as `abcdefgh`. | Password validation. | Error says to use at least one letter and one number. |
| [ ] | Type a password with no letter, such as `12345678`. | Password validation. | Error says to use at least one letter and one number. |
| [ ] | Type valid password but different confirm password. | Confirm password validation. | Error says passwords need to match. |
| [ ] | Leave terms unchecked and otherwise valid fields. | Terms validation. | Error says to agree to terms, privacy policy, and compliance policy. |
| [ ] | Click Terms link from sign-up form. | Legal link. | `/terms` opens and can be returned from. |
| [ ] | Click Privacy link from sign-up form. | Legal link. | `/privacy` opens and can be returned from. |
| [ ] | Click Compliance link from sign-up form. | Legal link. | `/compliance` opens and can be returned from. |
| [ ] | Sign up with a new valid email and password. | Account creation. | Either redirects if Supabase creates a session, or shows "Check your email..." message if confirmation is required. |
| [ ] | Sign up with an already registered email. | Duplicate account handling. | Email field shows "An account already exists for this email. Sign in instead." or equivalent. |
| [ ] | Test sign-up while already signed in. | Redirect. | `/signup` redirects to `/account`. |
| [ ] | Use browser password manager/autofill. | Form compatibility. | Autofilled values can be submitted normally. |
| [ ] | Tab through sign-up form. | Accessibility. | Tab order follows visual order and focus is visible. |

## Authentication: Sign In

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Open `/signin` signed out. | Page load. | Sign-in form and Google sign-in button load. |
| [ ] | Submit empty form. | Required validation. | Email and password errors appear inline. |
| [ ] | Enter invalid email format. | Email validation. | Error says to enter a valid email address. |
| [ ] | Enter valid email with wrong password. | Auth failure copy. | Form shows "That email or password isn't right." or generic retry message without raw Supabase text. |
| [ ] | Enter non-existent email with any password. | Auth failure privacy. | Same generic login failure behavior; app does not reveal account existence. |
| [ ] | Sign in with a valid account. | Login success. | Redirects to callback URL if present, otherwise normal signed-in destination. |
| [ ] | Open `/signin?callbackUrl=/gigs/create`, then sign in as creator. | Callback handling. | Redirects to `/gigs/create` after successful sign-in. |
| [ ] | Open `/signin?callbackUrl=/profile/create`, then sign in as musician. | Callback handling. | Redirects to `/profile/create` or `/profile/edit` depending profile state. |
| [ ] | Open `/signin?callbackUrl=https://example.com`, then sign in. | Unsafe callback protection. | App should not redirect to external site. Record if it does. |
| [ ] | Click "Forgot password" from sign-in. | Link. | `/forgot-password` loads. |
| [ ] | Click Google sign-in. | OAuth. | Redirects to Google OAuth and returns through `/auth/callback` if configured. |
| [ ] | Cancel Google OAuth. | OAuth failure path. | User returns to sign-in with a clear auth error state or remains signed out. |
| [ ] | Visit `/signin` while already signed in. | Redirect. | Redirects to `/account`. |

## Authentication: Forgot Password And Reset

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Open `/forgot-password`. | Page load. | Reset request form loads. |
| [ ] | Submit empty reset form. | Required validation. | Error says to enter your email address. |
| [ ] | Submit malformed email. | Email validation. | Error says to enter a valid email address. |
| [ ] | Submit a nonexistent email. | Privacy-preserving behavior. | Success message says if an account exists, a reset link will be sent. |
| [ ] | Submit a real account email. | Reset delivery. | Same success message appears; email should receive reset link if email provider is configured. |
| [ ] | Click reset link from email. | Callback route. | App opens `/auth/callback` then routes to `/account/update-password`. |
| [ ] | Open `/account/update-password` signed out without reset session. | Auth guard. | Redirects to sign-in or requires valid session. |
| [ ] | Submit empty update password form. | Required validation. | Password field error appears. |
| [ ] | Submit short password. | Password validation. | Error says to use at least 8 characters. |
| [ ] | Submit password without number or letter. | Password validation. | Error says to use at least one letter and one number. |
| [ ] | Submit mismatched confirmation. | Confirm validation. | Error says passwords need to match. |
| [ ] | Submit valid matching new password. | Password update. | Redirects to `/account`; new password works on next sign-in. |

## Auth Callback And Onboarding Redirects

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Sign up or OAuth into an account with no role. | Onboarding redirect. | App sends user to `/onboarding/role`. |
| [ ] | Visit `/` as signed-in user with no role. | Guard. | Redirects to `/onboarding/role`. |
| [ ] | Visit `/onboarding/role` signed out. | Guard. | Redirects to `/signin?callbackUrl=/onboarding/role`. |
| [ ] | Visit `/onboarding/role` after role already chosen. | Guard. | Redirects to `/`. |
| [ ] | Click "I'm a Musician" on role page. | Role choice. | Role is saved and user redirects to `/profile/create`. |
| [ ] | Click "I'm a Creator" on role page. | Role choice. | Role is saved and user redirects to `/gigs/manage`. |
| [ ] | Double-click a role choice quickly. | Pending/duplicate handling. | Only one role is saved; no duplicate error or broken state. |
| [ ] | Try browser back after choosing role. | Guard. | Role page redirects away because role is set. |

## Navigation And Account Menu

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Sign in and open the account avatar/menu. | Dropdown. | Menu opens with account name/email/role and links. |
| [ ] | Click Messages from menu. | Navigation. | `/messages` opens. |
| [ ] | Click Account Settings from menu. | Navigation. | `/account` opens. |
| [ ] | Click Help from menu. | Navigation. | `/help` opens. |
| [ ] | As musician with no profile, open menu. | Role-specific link. | Menu offers Create Profile. |
| [ ] | As musician with profile, open menu. | Role-specific link. | Menu offers Edit Profile. |
| [ ] | As creator, open menu. | Role-specific links. | Menu offers Manage Gigs and Post a Gig. |
| [ ] | Trigger unread messages in another account, then refresh menu. | Badge. | Avatar/menu shows unread count capped at `9+` if needed. |
| [ ] | Click outside the menu. | Dropdown closing. | Menu closes. |
| [ ] | Press Escape while menu is open. | Keyboard closing. | Menu closes and focus returns logically. |
| [ ] | Sign out from menu. | Sign-out action. | User redirects to `/` and signed-out nav appears. |

## Legal And Static Pages

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Open `/privacy`. | Static page. | Page loads readable privacy content. |
| [ ] | Open `/terms`. | Static page. | Page loads readable terms content. |
| [ ] | Open `/compliance`. | Static page. | Page loads readable compliance content. |
| [ ] | Scroll each legal page. | Layout. | Text remains readable and no footer/header overlap occurs. |
| [ ] | Open legal pages on mobile. | Responsive text. | Content fits viewport without horizontal scrolling. |

## Help And Support

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Open `/help` signed out. | Page load. | Support form appears. |
| [ ] | Submit empty support form. | Validation. | Email, subject, and message errors appear. |
| [ ] | Submit invalid email. | Validation. | Error says to enter a valid email address. |
| [ ] | Submit only email. | Required validation. | Subject and message errors appear. |
| [ ] | Submit valid name, email, subject, and message. | Support email behavior. | Success message appears if email service works, otherwise delivery failure message appears. |
| [ ] | Submit same support request twice quickly. | Duplicate/rate limit. | Second request is blocked with "Please wait..." message. |
| [ ] | Submit more than 3 support requests within 15 minutes from same account/email. | Rate limit. | Further requests are blocked temporarily. |
| [ ] | Submit support form signed in. | User association. | Form works and should include user context internally. |
| [ ] | Test long subject over 160 characters. | Truncation/validation feel. | Form does not break; subject is limited/truncated. |
| [ ] | Test long message over 4000 characters. | Truncation/validation feel. | Form does not break; message is limited/truncated. |

## Musician Directory

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Open `/musicians` signed out. | Current auth behavior. | Current code redirects to sign-in because route uses `requireUser`. Record if product expectation differs. |
| [ ] | Open `/musicians` signed in with role. | Page load. | Directory loads with search, advanced search, cards or empty state. |
| [ ] | Submit empty search. | Baseline results. | Page remains on `/musicians` and shows default result set or empty state. |
| [ ] | Search by musician name. | Keyword search. | Matching profiles appear. |
| [ ] | Search by bio keyword. | Keyword search. | Profiles with matching bio content appear. |
| [ ] | Search by school. | Keyword search. | Profiles with matching school appear. |
| [ ] | Search by city/location. | Keyword search. | Profiles with matching location metadata appear. |
| [ ] | Search with punctuation such as `%`, `,`, `()`. | Safe search. | App does not crash; search sanitizes or returns results/empty state. |
| [ ] | Open Advanced search. | Toggle. | Advanced panel opens and `aria-expanded` state changes. |
| [ ] | Close Advanced search. | Toggle. | Advanced panel closes without losing typed keyword unless submitted. |
| [ ] | Add an instrument filter from suggestions. | Tag filter. | Selected tag appears as a pill and hidden value is submitted. |
| [ ] | Add a custom instrument not in suggestions. | Custom tag filter. | "Search for/Add" fallback adds the custom tag pill. |
| [ ] | Remove an instrument pill with X. | Tag removal. | Pill disappears and search submits without that tag. |
| [ ] | Add a genre filter. | Tag filter. | Selected genre appears as a pill and filters results. |
| [ ] | Use Location autocomplete. | Suggestions. | Suggestions appear after typing; selecting one fills hidden lat/lng values. |
| [ ] | Select radius without location. | Edge behavior. | App does not crash; results behave predictably. |
| [ ] | Select location plus 5 mile radius. | Distance filter. | Results within radius show first with distance text when available. |
| [ ] | Select Remote only. | Remote filter. | Only remote-friendly profiles appear. |
| [ ] | Select In-person only. | Remote filter. | Remote-only profiles are excluded. |
| [ ] | Combine keyword, instrument, genre, location, radius, and remote. | Combined filtering. | Result list reflects all selected filters or shows "No one matches yet." |
| [ ] | Click Clear after applying filters. | Clear link. | URL resets to `/musicians` and filters clear. |
| [ ] | Click a musician card. | Detail navigation. | `/musicians/[id]` opens. |
| [ ] | Test directory with no matching filters. | Empty state. | Empty state appears with Clear filters CTA. |
| [ ] | Test card tag overflow. | Tag display. | First tags show and `+N more` appears when relevant. |
| [ ] | Test on mobile. | Filter/card layout. | Search controls stack, card text wraps, no horizontal overflow. |

## Musician Detail Page

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Open a valid musician detail page. | Page load. | Profile details, tags, work preferences, links, contact panel, and report/connect controls appear as applicable. |
| [ ] | Open an invalid musician ID URL. | 404. | Branded not-found UI appears. |
| [ ] | Click Back to musicians. | Navigation. | Returns to `/musicians`. |
| [ ] | Verify profile image if set. | Avatar. | Uploaded avatar appears; fallback initials appear if no image. |
| [ ] | Verify display name, school, location, bio. | Data display. | Data matches the profile form. |
| [ ] | Verify instruments and genres. | Tag display. | Tags match saved profile. |
| [ ] | Verify remote/in-person and compensation preferences. | Work preferences. | Preferences match saved profile. |
| [ ] | Click portfolio/social links. | External links. | Valid links open correctly and safely. |
| [ ] | Open profile signed out and click Connect. | Auth prompt. | Connect button routes to sign-in with callback URL. |
| [ ] | Open own musician profile. | Self messaging state. | Connect button does not invite user to message themself. |
| [ ] | Open another profile signed in and click Connect. | Connection request. | Button shows pending state after sending. |
| [ ] | Click Connect twice quickly. | Duplicate prevention. | Only one pending request exists; UI stays stable. |
| [ ] | Visit profile after outgoing request already exists. | Relationship state. | Shows Pending rather than Connect. |
| [ ] | Have recipient accept request, then revisit profile. | Connected state. | Button becomes Message and links to conversation. |
| [ ] | Block the profile owner, then revisit profile. | Block state. | UI shows "You blocked this user." and no connect action. |
| [ ] | Have profile owner block tester, then revisit profile. | Blocked-by-other state. | UI shows messaging unavailable. |
| [ ] | Click Report. | Report modal. | Modal opens, body scroll locks, reported target label is visible. |
| [ ] | Submit empty report. | Report validation. | Browser/app validation prevents or shows a failure; no success on empty required fields. |
| [ ] | Submit valid report subject and description. | Report submission. | Success message appears and modal closes after a short delay. |
| [ ] | Close report modal with X. | Modal close. | Modal closes and page scroll works again. |
| [ ] | Close report modal by clicking backdrop. | Modal close. | Modal closes unless submission is pending. |
| [ ] | Open detail page on mobile. | Layout. | Main content and aside stack cleanly. |

## Musician Profile Create And Edit

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Visit `/profile/create` signed out. | Auth guard. | Redirects to sign-in with callback. |
| [ ] | Visit `/profile/create` as creator. | Role guard. | Redirects to `/`. |
| [ ] | Visit `/profile/create` as musician with existing profile. | Existing profile guard. | Redirects to `/profile/edit`. |
| [ ] | Visit `/profile/edit` as musician without profile. | Missing profile guard. | Redirects to `/profile/create`. |
| [ ] | Submit empty create profile form. | Validation. | Display name error appears; form does not create profile. |
| [ ] | Enter display name over 80 characters. | Validation. | Error says to keep display name under 80 characters. |
| [ ] | Enter bio over 1200 characters. | Validation. | Error says to keep bio under 1,200 characters. |
| [ ] | Enter years experience as `abc`. | Validation. | Error says to use a whole number. |
| [ ] | Enter years experience as `-1`. | Validation. | Error says experience cannot be negative. |
| [ ] | Enter invalid URL such as `instagram.com/test`. | URL validation. | Error says to use full `http://` or `https://` URL. |
| [ ] | Enter valid URLs for YouTube, SoundCloud, Spotify, Website, Instagram. | URL save. | Profile saves and links display on detail page. |
| [ ] | Type in location field and select an autocomplete suggestion. | Location selection. | Location value persists after save and appears on profile. |
| [ ] | Leave location blank but keep Remote-friendly on. | Remote behavior. | Form can save because remote work is available. |
| [ ] | Turn Remote-friendly off and leave location blank. | Location validation. | Form should require a location or show appropriate validation. |
| [ ] | Toggle Remote-friendly on/off. | Checkbox. | State changes visually and persists after save. |
| [ ] | Toggle Open to paid and Open to unpaid. | Checkbox persistence. | Saved preferences display on profile. |
| [ ] | Add instrument from suggestions. | Tag selection. | Instrument pill appears and persists after save. |
| [ ] | Add custom instrument. | Custom tag creation. | Custom tag saves and appears in directory/detail. |
| [ ] | Remove an instrument pill. | Tag removal. | Removed tag does not appear after save. |
| [ ] | Add genre from suggestions. | Tag selection. | Genre pill appears and persists after save. |
| [ ] | Add custom genre. | Custom tag creation. | Custom genre saves and appears in directory/detail. |
| [ ] | Fill minimum valid profile: display name plus defaults. | Create success. | Redirects to `/musicians/[profileId]`. |
| [ ] | Edit existing profile display name. | Update success. | Redirects to detail page and new name appears. |
| [ ] | Edit profile and click Cancel. | Cancel behavior. | Navigates to configured cancel route without saving unsaved changes. |
| [ ] | Submit invalid edit after changing many fields. | Value preservation. | User-entered values remain after validation errors. |
| [ ] | Test create/edit form on mobile. | Responsive form. | Fields stack, buttons fit, errors remain near fields. |

## Gig Directory

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Open `/gigs` signed out. | Current auth behavior. | Current code redirects to sign-in because route uses `requireUser`. Record if product expectation differs. |
| [ ] | Open `/gigs` signed in with role. | Page load. | Directory loads with search, advanced search, cards or empty state. |
| [ ] | Search by gig title. | Keyword search. | Matching gigs appear. |
| [ ] | Search by description keyword. | Keyword search. | Matching gigs appear. |
| [ ] | Search by compensation detail. | Keyword search. | Matching gigs appear if detail matches. |
| [ ] | Search by creator name. | Keyword search. | Matching gigs appear if creator name is available. |
| [ ] | Open Advanced search. | Toggle. | Advanced panel opens. |
| [ ] | Filter by project type Film. | Project type filter. | Only film gigs appear. |
| [ ] | Filter by each project type: Live event, Podcast, Game, YouTube, Other. | Project type options. | Each option filters without crash. |
| [ ] | Filter by instrument. | Tag filter. | Only matching gigs appear. |
| [ ] | Filter by genre. | Tag filter. | Only matching gigs appear. |
| [ ] | Use location autocomplete plus radius. | Location filtering. | Gigs within radius appear with distance text when available. |
| [ ] | Select Remote only. | Remote filter. | Only remote-option gigs appear. |
| [ ] | Select In-person only. | Remote filter. | Remote gigs without location are excluded. |
| [ ] | Combine all filters. | Combined filter. | Results reflect all filters or show no-match empty state. |
| [ ] | Click Clear. | Clear filters. | URL resets to `/gigs` and filters clear. |
| [ ] | Open a gig card. | Detail navigation. | `/gigs/[id]` opens. |
| [ ] | Confirm closed gigs are hidden from directory. | Visibility. | Filled/closed gigs do not appear in `/gigs` open listing. |
| [ ] | Test no results. | Empty state. | "No gigs match yet." empty state appears with Clear filters. |
| [ ] | Test on mobile. | Responsive layout. | Search controls and cards fit without horizontal overflow. |

## Gig Detail Page

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Open a valid open gig. | Page load. | Gig title, description, project type, compensation, tags, location/deadline, creator/contact panel render. |
| [ ] | Open a valid filled/closed gig by direct URL. | Reachability. | Page still loads even though gig is not in directory. |
| [ ] | Open invalid gig ID. | 404. | Branded not-found UI appears. |
| [ ] | Click Back to gigs. | Navigation. | Returns to `/gigs`. |
| [ ] | Verify project type label. | Display mapping. | Enum displays as friendly label. |
| [ ] | Verify compensation label. | Display mapping. | Paid, Unpaid + Credit, or Open to talk displays correctly. |
| [ ] | Verify Open status. | Status badge. | Open gig uses blue/status styling. |
| [ ] | Verify Filled status. | Status badge. | Closed gig displays as Filled, not Closed. |
| [ ] | Verify tags. | Data display. | Instruments and genres match gig form. |
| [ ] | Verify deadline. | Date display. | Deadline displays correctly or is absent if blank. |
| [ ] | Verify remote/location display. | Logistics. | Remote and/or location information matches saved gig. |
| [ ] | Signed-out user clicks Connect/contact on gig if visible. | Auth prompt. | Redirects to sign-in with callback. |
| [ ] | Signed-in user contacts gig owner. | Connection request. | Request is sent and UI changes to Pending. |
| [ ] | Creator views own gig. | Self state. | App does not allow creator to message themself. |
| [ ] | Click Report. | Report modal. | Report modal opens for gig target. |
| [ ] | Submit valid gig report. | Report submission. | Success message appears and admin report count should update. |
| [ ] | Open detail on mobile. | Layout. | Detail and aside stack cleanly. |

## Gig Create, Edit, And Manage

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Visit `/gigs/create` signed out. | Auth guard. | Redirects to sign-in with callback. |
| [ ] | Visit `/gigs/create` as musician. | Role guard. | Redirects to `/`. |
| [ ] | Visit `/gigs/create` as creator. | Page load. | Gig creation form loads. |
| [ ] | Submit empty gig form. | Validation. | Title, description, project type, and compensation type errors appear. |
| [ ] | Enter title over 120 characters. | Validation. | Error says to keep title under 120 characters. |
| [ ] | Enter description over 2400 characters. | Validation. | Error says to keep description under 2,400 characters. |
| [ ] | Leave project type unselected. | Validation. | Error says to choose a project type. |
| [ ] | Leave compensation type unselected. | Validation. | Error says to choose a compensation type. |
| [ ] | Enter invalid date manually if browser allows it. | Date validation. | Error says to use a valid date. |
| [ ] | Select location suggestion. | Location selection. | Location persists and displays on gig detail. |
| [ ] | Leave location blank with Remote option on. | Remote behavior. | Form can save. |
| [ ] | Turn Remote option off and leave location blank. | Location validation. | Form should require location or show appropriate validation. |
| [ ] | Add instruments needed from suggestions. | Tag selection. | Tags save and display on detail/directory. |
| [ ] | Add custom instrument needed. | Custom tag creation. | Custom tag saves. |
| [ ] | Add genres preferred. | Tag selection. | Genres save and display. |
| [ ] | Add compensation details. | Optional text. | Details display on gig detail. |
| [ ] | Create valid gig. | Success path. | Redirects to `/gigs/[id]`; gig appears in `/gigs` if open. |
| [ ] | Visit `/gigs/manage` as creator. | Manage page. | Creator's gigs list appears or empty state appears. |
| [ ] | Visit `/gigs/manage` as musician. | Role guard. | Redirects to `/`. |
| [ ] | Manage page empty state for new creator. | Empty state. | Shows "No gigs posted yet." and Post a Gig CTA. |
| [ ] | Click Edit on managed gig. | Edit navigation. | `/gigs/[id]/edit` loads with existing values. |
| [ ] | Edit title/description/type/compensation/tags/location. | Update success. | Redirects to gig detail and changes display. |
| [ ] | Edit status to Filled from edit page. | Status update. | Gig detail displays Filled and gig leaves open directory. |
| [ ] | Edit status back to Open from edit page. | Reopen. | Gig returns to open directory. |
| [ ] | Click Mark Filled from manage page. | Quick status action. | Gig status changes to Filled and page refreshes. |
| [ ] | Click Reopen from manage page. | Quick status action. | Gig status changes to Open and page refreshes. |
| [ ] | Click Delete on manage page. | Confirm dialog. | Confirm dialog opens, focus is managed, cancel and confirm are visible. |
| [ ] | Cancel delete. | Non-destructive cancel. | Dialog closes and gig remains. |
| [ ] | Confirm delete. | Destructive action. | Gig disappears from manage page and direct URL no longer loads normally. |
| [ ] | Try editing another creator's gig by URL. | Ownership guard. | Redirects to `/gigs/manage`; no edit access. |
| [ ] | Try manage actions twice quickly. | Idempotence. | App does not duplicate or break; final status is sensible. |
| [ ] | Test create/edit/manage on mobile. | Responsive layout. | Forms and manage cards fit viewport. |

## Messaging And Connection Requests

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Visit `/messages` signed out. | Auth guard. | Redirects to sign-in. |
| [ ] | Visit `/messages` as signed-in user with role. | Page load. | Conversations page loads or setup/empty state appears. |
| [ ] | Visit `/messages/requests`. | Requests page. | Incoming and outgoing request columns appear. |
| [ ] | Visit `/messages/blocked`. | Blocked page. | Blocked users list or empty state appears. |
| [ ] | Send connection request from Musician A to Musician B profile. | Request send. | Sender sees Pending; recipient sees incoming request. |
| [ ] | Send connection request from Musician A to Creator A via profile/gig owner contact if available. | Cross-role request. | Request appears for recipient. |
| [ ] | Try sending request to self. | Self guard. | No self-connect action is offered or service rejects it. |
| [ ] | Try sending duplicate pending request. | Duplicate prevention. | UI stays Pending and no duplicate request card appears. |
| [ ] | Recipient opens `/messages/requests`. | Incoming list. | Request card shows requester avatar/name/role and intro/no-intro message. |
| [ ] | Recipient clicks Reject. | Reject action. | Request leaves pending incoming list; sender outgoing status becomes rejected. |
| [ ] | Sender cancels pending outgoing request. | Cancel action. | Request is cancelled and no longer pending. |
| [ ] | Recipient clicks Accept. | Accept action. | App opens `/messages/[conversationId]` and conversation is created. |
| [ ] | After accept, both users open `/messages`. | Conversation list. | Conversation appears for both with other participant and last message state. |
| [ ] | Open conversation with no messages. | Empty thread. | "Start the conversation." empty state appears. |
| [ ] | Send an empty message. | Validation. | Error says "Add a message." |
| [ ] | Send a normal message. | Send action. | Message appears immediately on sender side and after refresh for receiver. |
| [ ] | Send a multiline message using Shift+Enter. | Compose behavior. | Newline is inserted, not sent. |
| [ ] | Press Enter without Shift in message box. | Send shortcut. | Message sends. |
| [ ] | Type more than 2000 characters if possible. | Max length. | Textarea max length prevents more than 2000 characters or service rejects. |
| [ ] | Receiver opens conversation. | Read state. | Unread badge/count clears after opening or refresh. |
| [ ] | Send messages back and forth. | Thread ordering. | Messages appear oldest to newest; own messages right, received left. |
| [ ] | Hide a conversation. | Hide action. | User returns to `/messages`; hidden conversation disappears for that user. |
| [ ] | Try hiding support conversation if present. | Protected support convo. | App should block hiding support conversation. |
| [ ] | Block another user from conversation/detail controls if available. | Block action. | Messaging between users becomes unavailable. |
| [ ] | Open `/messages/blocked` after blocking. | Blocked list. | Blocked user appears. |
| [ ] | Unblock user. | Unblock action. | User disappears from blocked list and messaging can resume if relationship allows. |
| [ ] | Have blocked user attempt to message. | Block enforcement. | Message send is blocked or conversation shows messaging unavailable. |
| [ ] | Open invalid `/messages/not-a-real-id`. | Not found. | Conversation not-found UI appears with link back to messages. |
| [ ] | Try opening another user's conversation URL. | Authorization. | Not found or forbidden behavior prevents access. |
| [ ] | Test messaging on mobile. | Thread layout. | Message list and composer fit, send button remains usable. |

## Account Settings

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Visit `/account` signed out. | Auth guard. | Redirects to sign-in. |
| [ ] | Visit `/account` signed in. | Page load. | Account page shows email/name/profile picture/update password/delete sections. |
| [ ] | Submit empty display name. | Validation. | Error says to add a display name. |
| [ ] | Submit name over 80 characters. | Validation. | Error says name must be 80 characters or fewer. |
| [ ] | Submit valid display name. | Update success. | Success banner says name updated; nav/menu reflects new name after refresh. |
| [ ] | Upload no profile picture. | Validation. | Error says to choose a profile picture. |
| [ ] | Upload `.gif` or unsupported file type. | File type validation. | Error says to use JPG, PNG, or WebP. |
| [ ] | Upload image over 2 MB. | Size validation. | Error says to keep image under 2 MB. |
| [ ] | Upload valid JPG. | Upload success. | Success message appears and avatar updates. |
| [ ] | Upload valid PNG. | Upload success. | Success message appears and avatar updates. |
| [ ] | Upload valid WebP. | Upload success. | Success message appears and avatar updates. |
| [ ] | Update profile picture for musician account. | Public profile sync. | Musician directory/detail image updates after refresh. |
| [ ] | Click Update Password. | Navigation. | `/account/update-password` opens. |
| [ ] | Click Delete Account. | Confirm dialog. | Destructive confirm dialog opens. |
| [ ] | Cancel account deletion. | Safety. | Dialog closes and account remains usable. |
| [ ] | Confirm account deletion on a disposable account. | Deletion. | User is signed out and redirected to `/signin`; app data is removed. |
| [ ] | Try signing in after deletion. | Deletion completeness. | Deleted account cannot access previous data. |
| [ ] | Test account page on mobile. | Responsive layout. | Forms and danger zone fit and remain readable. |

## Reports And Moderation Reports

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Open report modal on musician profile signed out. | Auth behavior. | If submission requires auth, app should prompt or fail cleanly without crashing. |
| [ ] | Open report modal on musician profile signed in. | Modal. | Modal opens with target label. |
| [ ] | Submit report with subject under 3 characters. | Server validation. | Error message appears; report not accepted. |
| [ ] | Submit report with description under 10 characters. | Server validation. | Error message appears; report not accepted. |
| [ ] | Submit report with valid subject/description. | Success. | Success message appears. |
| [ ] | Open report modal on gig signed in. | Modal. | Modal opens with gig target label. |
| [ ] | Submit gig report with evidence links. | Optional evidence. | Report succeeds and evidence is included internally. |
| [ ] | Submit evidence over 2000 characters. | Validation/limit. | App should prevent or reject oversized evidence. |
| [ ] | Open admin reports page after reports submitted. | Admin review. | New reports appear with target information. |

## Admin Access And Dashboard

Admin tests should only be run by internal staff with a disposable or safe staging dataset.

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Visit `/admin` as signed-out user. | Access control. | In production, 404 or hidden access; in development, admin unavailable state may show. |
| [ ] | Visit `/admin` as non-admin signed-in user. | Access control. | Access denied/404/admin unavailable; no admin data exposed. |
| [ ] | Visit `/admin` as admin. | Dashboard. | Admin overview loads with profile/gig summaries. |
| [ ] | Open `/admin/users`. | Users list. | User accounts display with moderation metadata actions. |
| [ ] | Open `/admin/musicians`. | Musician moderation list. | Musician profiles display. |
| [ ] | Open `/admin/creators`. | Creator moderation list. | Creator rows display. |
| [ ] | Open `/admin/gigs`. | Gig moderation list. | Gig rows display. |
| [ ] | Open `/admin/reports`. | Reports list. | Submitted reports display or empty state appears. |
| [ ] | Open `/admin/taxonomy`. | Taxonomy. | Instruments and genres lists appear with add/delete controls. |
| [ ] | Open `/admin/support`. | Support console. | Search and support conversation UI appears. |
| [ ] | Hide a test user from `/admin/users`. | Admin action dialog. | Confirmation opens; after confirm, user row metadata changes and audit log is written. |
| [ ] | Restore the same user. | Admin action. | User row metadata returns to public/active state. |
| [ ] | Verify/unverify a test user. | Admin action. | Verification state toggles. |
| [ ] | Hide/restore a test musician profile. | Admin action. | Profile metadata changes. Public filtering may not yet hide it unless wired. |
| [ ] | Verify/unverify a test musician profile. | Admin action. | Verification state toggles. |
| [ ] | Clear text on a test musician profile. | Admin action. | Text fields are cleared according to admin action behavior. |
| [ ] | Click edit for musician from admin list. | Admin edit route. | `/admin/musicians/[id]/edit` loads. |
| [ ] | Save admin musician edit with valid values. | Admin edit save. | Redirects to `/admin/musicians` and changes persist. |
| [ ] | Hide/restore a test gig. | Admin action. | Gig metadata changes. |
| [ ] | Verify/unverify a test gig. | Admin action. | Verification state toggles. |
| [ ] | Clear text on a test gig. | Admin action. | Text fields are cleared according to admin action behavior. |
| [ ] | Click edit for gig from admin list. | Admin edit route. | `/admin/gigs/[id]/edit` loads. |
| [ ] | Save admin gig edit with valid values. | Admin edit save. | Redirects to `/admin/gigs` and changes persist. |
| [ ] | Add instrument term in taxonomy. | Taxonomy add. | New term appears in instrument list and user-facing tag suggestions. |
| [ ] | Add genre term in taxonomy. | Taxonomy add. | New term appears in genre list and user-facing tag suggestions. |
| [ ] | Add duplicate taxonomy term. | Duplicate handling. | App rejects duplicate or keeps only one canonical term. |
| [ ] | Delete unused taxonomy term. | Taxonomy delete. | Term disappears from list. |
| [ ] | Attempt delete taxonomy term in use. | Safety. | App should reject or fail gracefully without corrupting joined profiles/gigs. |
| [ ] | Update report status to reviewing. | Report workflow. | Report status changes and persists. |
| [ ] | Update report status to resolved. | Report workflow. | Report status changes and resolved metadata updates. |
| [ ] | Update report status to dismissed. | Report workflow. | Report status changes and persists. |
| [ ] | Search user in support console. | Support admin search. | Matching users appear. |
| [ ] | Open support conversation for user. | Support conversation. | Conversation loads or is created. |
| [ ] | Send support message as Escento. | Support messaging. | Message appears in user conversation as official support. |
| [ ] | Mark support conversation read. | Support read action. | Unread state clears. |
| [ ] | Try admin action with missing reason if reason is required in UI. | Validation. | Action is blocked or reason is captured. |
| [ ] | Test admin pages on mobile/tablet. | Internal responsive behavior. | Pages remain usable enough for emergency admin tasks. |

## Location Autocomplete

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Type one character in a location field. | Minimum query behavior. | Suggestions may wait until enough input; no error. |
| [ ] | Type a real city such as `Austin`. | Suggestions. | Suggestions appear if provider is configured. |
| [ ] | Select a suggestion. | Hidden fields. | Display name appears and lat/lng/provider/place fields are populated internally. |
| [ ] | Clear location input. | Clearing behavior. | Hidden location fields clear or form does not submit stale location. |
| [ ] | Type random gibberish. | No results behavior. | No crash; field remains usable. |
| [ ] | Test location suggestions with network blocked. | Failure behavior. | Field handles failure without crashing the form. |
| [ ] | Submit form while suggestion dropdown is open. | Interaction edge. | Form submits selected/typed state predictably. |
| [ ] | Use keyboard arrows/Enter if supported in suggestions. | Keyboard access. | Suggestions can be selected or at least field remains accessible. |

## Tag Multi-select

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Type a known tag alias. | Alias matching. | Matching canonical tag appears with alias context. |
| [ ] | Select a suggested tag. | Selection. | Pill appears below input. |
| [ ] | Select same tag twice. | Duplicate prevention. | Only one pill appears. |
| [ ] | Add a custom tag. | Custom fallback. | Pill appears with canonicalized value. |
| [ ] | Remove a selected tag. | Removal. | Pill disappears and hidden input updates. |
| [ ] | Add many tags. | Wrapping. | Pills wrap without breaking container. |
| [ ] | Blur field while dropdown is open. | Dropdown close. | Dropdown closes after short delay. |
| [ ] | Click suggestion while input would blur. | Mouse down handling. | Suggestion is selected, not lost. |

## Error, Loading, And Empty States

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Throttle network and open `/gigs`. | Loading skeleton. | Loading UI mirrors page structure. |
| [ ] | Throttle network and open `/musicians`. | Loading skeleton. | Loading UI appears. |
| [ ] | Throttle network and open `/messages`. | Loading skeleton. | Loading UI appears. |
| [ ] | Throttle network and open `/account`. | Loading skeleton. | Loading UI appears. |
| [ ] | Force empty musician filters. | Empty state. | Clear filters CTA appears. |
| [ ] | Force empty gig filters. | Empty state. | Clear filters CTA appears. |
| [ ] | Use new creator with no gigs. | Empty state. | Manage page shows empty stage and Post a Gig CTA. |
| [ ] | Use user with no conversations. | Empty state. | Messages page shows no conversations and Browse Musicians CTA. |
| [ ] | Use user with no connection requests. | Empty state. | Requests page shows no incoming/outgoing state. |
| [ ] | Use user with no blocked users. | Empty state. | Blocked Users page shows clear/no blocked users state. |
| [ ] | Temporarily test missing messaging migration in staging if possible. | Setup fallback. | Messages pages show setup unavailable empty state, not crash. |
| [ ] | Trigger route error boundary in staging if possible. | Error UI. | Error page shows branded recovery UI with Try again. |

## Permissions And Security Checks

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Signed-out user visits `/account`. | Guard. | Redirects to sign-in. |
| [ ] | Signed-out user visits `/messages`. | Guard. | Redirects to sign-in. |
| [ ] | Signed-out user visits `/profile/create`. | Guard. | Redirects to sign-in. |
| [ ] | Signed-out user visits `/gigs/create`. | Guard. | Redirects to sign-in. |
| [ ] | Musician visits `/gigs/create`. | Role guard. | Redirects to `/`. |
| [ ] | Musician visits `/gigs/manage`. | Role guard. | Redirects to `/`. |
| [ ] | Creator visits `/profile/create`. | Role guard. | Redirects to `/`. |
| [ ] | Creator visits `/profile/edit`. | Role guard. | Redirects to `/`. |
| [ ] | Non-owner creator visits another creator's `/gigs/[id]/edit`. | Ownership guard. | Redirects to manage page and cannot edit. |
| [ ] | Non-participant opens conversation URL. | Message privacy. | Not found/blocked; messages are not visible. |
| [ ] | Non-admin opens admin routes in production. | Admin privacy. | 404 or denied; no admin data is visible. |
| [ ] | User manually changes hidden form values for role/status/target IDs if comfortable using devtools. | Server trust boundary. | Server rejects unauthorized or invalid changes. |
| [ ] | User attempts external callback URL in auth routes. | Open redirect. | App does not send user to an untrusted external domain. |

## Mobile And Responsive Pass

Run these on at least 375x812, 430x932, 768x1024, and 1024x768.

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Homepage full scroll. | Mobile hero and sections. | No horizontal scroll, no overlapped text. |
| [ ] | Sign-up form. | Mobile auth form. | Inputs, checkboxes, password field, policy text fit. |
| [ ] | Sign-in form. | Mobile auth form. | Buttons and links fit. |
| [ ] | Forgot password form. | Mobile form. | Single-column layout is clean. |
| [ ] | Musician directory filters. | Mobile filter UX. | Search and advanced filters stack. |
| [ ] | Gig directory filters. | Mobile filter UX. | Project type and filters stack. |
| [ ] | Musician detail. | Mobile detail. | Aside/contact sections stack under main content. |
| [ ] | Gig detail. | Mobile detail. | Aside/contact sections stack under main content. |
| [ ] | Profile create/edit. | Mobile form. | Fieldsets stack; submit/cancel row fits. |
| [ ] | Gig create/edit. | Mobile form. | Fieldsets stack; submit/cancel row fits. |
| [ ] | Messages list. | Mobile messages. | Conversation rows fit; timestamps do not crush names. |
| [ ] | Conversation thread. | Mobile composer. | Textarea and send button are usable. |
| [ ] | Account menu. | Mobile dropdown. | Avatar button opens menu; menu fits screen. |
| [ ] | Report modal. | Mobile modal. | Modal fits viewport, scrolls internally, close button reachable. |
| [ ] | Confirm dialog. | Mobile dialog. | Confirm/cancel buttons reachable. |

## Accessibility Pass

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Navigate all primary flows with keyboard only. | Keyboard support. | No keyboard trap except intended modal/dialog focus behavior. |
| [ ] | Open and close dropdown menu with keyboard. | Menu accessibility. | Trigger, items, Escape behavior work. |
| [ ] | Open and close confirm dialog with keyboard. | Dialog accessibility. | Focus enters dialog and can return after close. |
| [ ] | Open and close report modal with keyboard. | Modal accessibility. | Focus is usable; Escape/backdrop behavior is reasonable. |
| [ ] | Inspect form labels visually. | Labels. | Every visible field has a label, not only placeholder text. |
| [ ] | Submit invalid forms. | Error announcements. | Errors appear near fields and form-level messages are visible. |
| [ ] | Use screen reader quick pass on auth form. | Screen reader labels. | Inputs announce label, required/error state where applicable. |
| [ ] | Check color contrast manually for body text and buttons. | Contrast. | Text remains readable on bright backgrounds and dark CTAs. |
| [ ] | Enable reduced motion. | Motion accessibility. | UI remains usable and major animation is reduced. |

## Data Persistence And Cross-account Checks

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Create profile, sign out, sign back in. | Persistence. | Profile still exists and Edit Profile link appears. |
| [ ] | Create gig, sign out, sign back in. | Persistence. | Gig still appears in Manage Gigs. |
| [ ] | Edit profile from one browser, view from another. | Fresh data. | Other browser sees update after refresh. |
| [ ] | Edit gig from one browser, view from another. | Fresh data. | Other browser sees update after refresh. |
| [ ] | Send connection request from one browser, view recipient in another. | Cross-account messaging. | Request appears after refresh. |
| [ ] | Accept request in recipient browser, view sender browser. | Cross-account messaging. | Conversation appears after refresh. |
| [ ] | Upload avatar, view directory in another browser. | Public avatar. | New avatar appears after refresh. |
| [ ] | Delete account, then view old profile/gigs from another account. | Deletion cleanup. | Deleted user's public artifacts are gone or inaccessible. |

## Browser Console And Network Smoke Checks

| Done | What to do | What to check | Expected result |
|---|---|---|---|
| [ ] | Open DevTools Console on homepage and navigate major routes. | Runtime errors. | No red console errors. |
| [ ] | Submit each major form once while watching Network tab. | Request health. | No unexpected 500s; redirects and action responses are expected. |
| [ ] | Test failed validation while watching Network tab. | Validation behavior. | User-correctable errors return cleanly; no raw stack traces. |
| [ ] | Test upload profile picture while watching Network tab. | Storage behavior. | Upload request succeeds or shows user-friendly failure. |
| [ ] | Test location autocomplete while watching Network tab. | Provider behavior. | Suggestion requests do not spam excessively and failures are handled. |

## Pilot Feedback Prompts

Ask every pilot tester these after they finish their assigned scenarios.

| Done | Question | What to listen for | Expected outcome |
|---|---|---|---|
| [ ] | What did you try first without being told? | Natural user intent. | Learn whether homepage/nav makes the next step obvious. |
| [ ] | Where did you hesitate? | Confusing copy or IA. | Record exact screen and words. |
| [ ] | Did any button or link surprise you? | Mismatched expectations. | Record route and expected destination. |
| [ ] | Did you understand musician vs creator roles? | Onboarding clarity. | Identify if role lock-in needs clearer warning. |
| [ ] | Was creating a profile/gig too long? | Form friction. | Identify fields that feel unnecessary or unclear. |
| [ ] | Did filters return what you expected? | Search relevance. | Identify taxonomy/search gaps. |
| [ ] | Did messaging feel trustworthy? | Connection model. | Identify if request/accept mental model is clear. |
| [ ] | Did anything feel broken even if it technically worked? | UX polish. | Capture subjective friction. |
| [ ] | Would you use this again for a real collaboration? | Product signal. | Capture why or why not. |

## Final Pilot Exit Criteria

Before opening the pilot more broadly, verify:

- [ ] No P0 bugs: users cannot sign up, sign in, onboard, create profile, create gig, or message.
- [ ] No P1 data privacy bugs: users can see/edit someone else's protected data.
- [ ] No broken critical redirects.
- [ ] No unhandled production crashes in normal flows.
- [ ] Password reset behavior is privacy-preserving for nonexistent emails.
- [ ] Account deletion is tested only on disposable accounts and behaves as expected.
- [ ] Profile and gig creation both work on mobile.
- [ ] Messaging request, accept, reject, cancel, send, hide, block, and unblock are tested.
- [ ] Report submission and admin report review are tested.
- [ ] Admin routes are inaccessible to non-admins.
- [ ] Legal pages and support form are reachable.
- [ ] The team has triaged every pilot issue into must-fix, should-fix, later, or won't-fix.
