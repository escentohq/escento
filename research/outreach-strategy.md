# Outreach Strategy — Distribution for the Escento Pilot

**Research for [#11](https://github.com/escentohq/escento/issues/11).** Written 2026-08-13.
**Scope:** UT Austin only. The 12 metros in `src/lib/launch-markets.ts:12-25` are phase 2 — same playbook, repeated per city, after the campus pilot proves out.

---

## Two different things get called "parasitic links"

This matters, because they have opposite verdicts.

| | What it is | Verdict |
|---|---|---|
| **Group link distribution** | Posting links into FB groups, campus Discords, GroupMe, subreddits to drive **direct signups**. No search engine involved. | ✅ **Fastest channel we have.** Plan A. |
| **Parasitic SEO** | Publishing on a high-authority domain to borrow its **Google ranking**. | ❌ **No-go.** Plan D. |

The issue was originally written about the second. The research below covers both, but the first is the one that matters for the pilot.

---

## TL;DR — the decision

| | Plan | Verdict | Time to first signup |
|---|---|---|---|
| **A** | **Group distribution** — campus Discords, GroupMe, FB groups | ✅ **Start here** | Days |
| **B** | Direct outreach — ensemble directors, faculty, student orgs | ✅ Run in parallel | ~1 week |
| **C** | Legitimate borrowed authority — directory listings, campus paper | 🟡 Background, ~2h/week | Months |
| **D** | Parasitic SEO — paid placements for ranking power | ❌ Never | Never |

**One thing to build first.** There is currently **zero attribution in the codebase** — no `utm_*` handling, no ref codes, no signup-source field. Post into eight groups today and you cannot tell which one produced a signup, so you can't drop the six that don't work. Signups cannot be attributed retroactively. See [Measurement](#measurement--the-one-thing-to-build-first).

---

## Plan A — Group distribution ✅ **PRIMARY**

The fastest path to a pilot signup. Faster than faculty email, because there's no gatekeeper and no reply-lag — you post, people click.

### Channels, ranked by signups per hour of effort

| Code | Channel | Notes |
|---|---|---|
| `rtf` | RTF / film-school GroupMe + Discord | Highest intent — the people who need composers |
| `mus` | Butler School of Music group chats | Supply side. **Seed here first** |
| `fbm` | FB: "UT Austin Musicians", Austin musician groups | Admin approval queue; 1–3 day lag |
| `fbc` | FB: UT class-year groups (Class of '27, '28) | High volume, low intent — broad net |
| `fbf` | FB: Austin film/production groups | Mixed student/professional |
| `hl` | HornsLink org pages + event listings | Slow, free, legitimate |
| `dsc` | General UT Discord servers | Auto-flags shortened links — full URLs only |
| `red` | r/UTAustin | 90/10 rule, see below |
| `frat` | Music frat/sorority chats (SAI, Mu Phi Epsilon) | Warm — needs an intro |
| `ens` | Ensemble listservs (orchestra, jazz, choir, a cappella) | Via director. Highest conversion, slowest to arrange |

### Seeding order matters more than channel choice

A two-sided marketplace that opens empty churns its first visitors. **Recruit musicians first** (`mus`, `frat`, `ens`) — profiles are the inventory. Get ~10 real profiles live, *then* work the creator channels (`rtf`, `fbf`) so they arrive to something real. Do not run both sides at once.

### Per-channel rules — these genuinely differ

**Facebook groups.** Most have an admin approval queue and a pinned self-promo rule. Read the pinned post first. Some allow promo only on a specific weekday. The common failure is posting into the queue and being silently rejected — follow up if it hasn't appeared in 48h.

**Discord.** Shortened links (`bit.ly` et al) are auto-flagged as spam by most moderation bots and are a fast route to a ban. **Post the full URL.** Most servers have a dedicated `#self-promo` or `#projects` channel; wrong-channel posting is the top removal cause.

**GroupMe.** No real moderation, so nothing stops a bad post — but the social cost is highest here, because everyone in a class GroupMe knows each other by name. Highest-stakes channel, not the easiest.

**Reddit.** Platform norm is 90/10 — nine value posts per promo post. A study of 49 subreddits founders commonly pitch in found **61% either ban self-promotion outright or restrict it to that ratio**; 19 of 49 ban it flat, with permanent bans. Only post if someone on the team is *already* a genuine participant in r/UTAustin. Do not create an account to promote.

**Listservs / ensembles.** Ask the director to forward rather than to sign up. One forward to a 60-person ensemble list beats fifty cold emails and carries implicit endorsement.

### The posting pattern

1. **DM the admin/mod first.** Two minutes. Converts a ban risk into an endorsement.
2. **Post as yourself** — name, student, you built it.
3. **Full URL, never a shortener.** Shorteners are a spam signal in every one of these channels.
4. **Lead with the offer, not curiosity-bait.** *"Looking for 10 musicians to try this — I'll set your profile up myself"* beats *"you won't believe what I found,"* and doesn't cost you the room.
5. **One post per channel, written for that channel.** Identical copy pasted across five groups is the most recognizable spam pattern there is.
6. **Answer every reply.** A thread with the founder responding converts far better than the post itself.

### Why not the manipulative version

Short bait copy that misrepresents the destination gets more clicks. It's still the wrong call here, for two reasons that have nothing to do with squeamishness:

**It burns the exact people you need.** A campus is a dense social graph of ~200 relevant people who all know each other. Cold spam works at scale because the audience is infinite and anonymous; yours is neither. One bad drop in the RTF GroupMe and the film school has an opinion about Escento before anyone opens it. One first impression per person, no retries.

**Manipulated signups are negative value for a marketplace.** Someone who clicks bait, lands on a gig board they didn't want, makes an account and never returns leaves you with inventory that *looks* real and isn't. Creators browse, see ghost profiles, leave. A hollow signup is worse than no signup — it's a lie to the other side of the market.

**Cost:** $0. **Turnaround:** days.

---

## Plan B — Direct outreach ✅ **PARALLEL**

Slower than Plan A but higher conversion per contact, and it produces the warm intros that make Plan A's `ens` and `frat` channels work.

1. **Build the list** — one sheet, three tabs: *faculty/staff* (ensemble directors, music-business faculty, RTF production faculty, media center staff); *orgs* (music frats, a cappella, film/production clubs, campus radio, game-dev and podcast clubs); *individuals* (students already posting "need a composer" in campus Discords).
2. **Two emails, not one** — musician pitch ("get discovered for paid and unpaid work") and creator pitch ("find a composer in a day, not three weeks"). Short. One ask: forward this.
3. **Ask for a forward, not a signup.**
4. **Go in person for the top 5.** Office hours after rehearsal. Face-to-face conversion isn't comparable to email.
5. **Onboard the first ten by hand.** Walk them through signup on your laptop. Where they stall is free usability data, and it feeds #8 directly.

**Cost:** $0. **Turnaround:** ~1 week.

---

## Plan C — Legitimate borrowed authority 🟡 **BACKGROUND**

Real placements on platforms that happen to carry authority. Compliant by construction — each is worth doing even with `nofollow` on every link. **Cap at ~2h/week.** Produces no pilot users; produces a footprint that ages.

1. **Claim the profiles** (~30 min): HornsLink, startup directories, Google Business Profile if there's a local angle. Consistent name/description/URL.
2. **3–5 genuine arts/music-education directories.** Only ones a student might actually browse.
3. **Pitch the campus paper as a story, not an ad.** "Two students built a tool to fix how campus film projects find composers" is a real story for a student publication. Free, earned, and the highest-value item here.
4. **Participate honestly where the team already participates.** 90/10, disclosed. If nobody's already a member, skip.
5. **Publish nothing "for SEO."** No Medium posts, no LinkedIn articles, no guest posts targeting keywords.

---

## Plan D — Parasitic SEO ❌ **NO-GO**

Paying for placements on high-authority third-party domains to borrow ranking power. Rejected on four independent grounds, any one sufficient:

**1. Timeline — fatal on its own.** New domains sit in a suppressed-ranking period of **3–6 months**, and need **6–12 months** for meaningful organic traffic. Low-competition long-tail is the fast case at 1–3 months. The pilot needs 20 users, a number you can hit by talking to two ensemble directors. Even a perfectly safe, free SEO program returns its first trickle around the time the pilot should be over.

**2. Policy.** Google's [spam policies](https://developers.google.com/search/docs/essentials/spam-policies) (last updated 2026-05-15) define site reputation abuse as *"a tactic where third-party content is published on a host site mainly because of that host's already-established ranking signals."* Introduced March 2024; the **November 2024 update** closed the obvious loophole — the violation stands *regardless of first-party involvement or oversight*, so you can't launder a placement by having the host's editor review it.

⚠️ Sources conflict on whether enforcement is algorithmic yet. Some 2026 write-ups claim it shipped with the August 2025 spam update; others, citing Glenn Gabe and Marie Haynes, say it's still manual-only. **Google's own docs describe manual actions and don't confirm an algorithmic version.** Treat the algorithmic claim as unverified — it doesn't change the recommendation.

**3. Asset ownership.** Parasite pages build the **host's** domain authority, not yours. You rent traffic and hand over the equity.

**4. Fragility.** The manual action lands primarily on the **host**, not on you — so the direct penalty risk is smaller than it sounds. Your real exposure is wasted spend and an asset that vanishes the moment the host is flagged or cleans house. Zero control.

### The test for any future placement

**Would we still want this if every link on it were `nofollow`?**
Yes → it's marketing, do it. No → it's site reputation abuse, decline it.

---

## What we will not do

- ❌ Post without disclosing we built it
- ❌ Create accounts for the purpose of promoting
- ❌ Cross-post identical copy across groups
- ❌ Use link shorteners, or preview text that misrepresents the destination
- ❌ Buy sponsored posts on news/`.edu`/high-DA domains for ranking purposes
- ❌ Use white-label or turnkey "parasite placement" services
- ❌ Buy links, exchange links, or use PBNs

---

## Measurement — the one thing to build first

**Nothing exists today.** No `utm_*` handling, no ref codes, no signup-source column, no custom events — only `@vercel/analytics` page views (`src/app/layout.tsx:4-5`). The live `app_user` table does have `created_at`, so signup cohorts by date are already possible, but *by channel* is not.

Without this, Plan A is unmeasurable: you post into eight groups, twelve people sign up, and you have no idea which four channels to keep. **Signups cannot be attributed retroactively** — every post made before this ships is signal permanently lost.

What it needs, roughly:

- Capture `?utm_source` / `?r=` on any entry page, first-touch wins, stored in a cookie that survives the Google OAuth round-trip
- Write it onto the `app_user` row at signup, for both email and Google paths
- A short `escento.com/j/rtf` form, because a long UTM string reads as spam in a Discord message
- Read results with SQL in the Supabase dashboard — no BI tool needed at this scale

Proportionate estimate: ~150 lines, one migration, no new dependencies. **Not filed as a ticket yet** — pending your read of this doc.

**Rule once it's live:** a channel gets three posts before you judge it. Zero signups after three → drop it and write down that you did.

---

## Open items

- [ ] **File the attribution ticket** (or decide to post without measurement — a real option, just an expensive one)
- [ ] **Assign the `?r=` codes** from the Plan A table
- [ ] **Confirm the pilot start date** — the "SEO is too slow" conclusion holds regardless, but Plan C's cadence should be sized against a real calendar
- [ ] **Decide who owns the outreach sheet** — this doc is a plan, not an assignment
- [ ] **Campus paper rate card** — not published online; needs a direct email to the ad department

---

## Sources

**Google policy (primary):**
- [Spam Policies for Google Web Search](https://developers.google.com/search/docs/essentials/spam-policies) — definition, carve-outs, enforcement. Updated 2026-05-15
- [Updating our site reputation abuse policy](https://developers.google.com/search/blog/2024/11/site-reputation-abuse) — Nov 2024, first-party oversight
- [March 2024 core update and new spam policies](https://developers.google.com/search/blog/2024/03/core-update-spam-policies)

**Policy commentary:**
- [Site reputation abuse policy now includes first-party involvement or oversight](https://searchengineland.com/google-site-reputation-abuse-policy-now-includes-first-party-involvement-or-oversight-of-content-448432) — Search Engine Land
- [Google Site Reputation Abuse: 18 Months In](https://www.capconvert.com/learn/blog/google-site-reputation-abuse-18-months) — manual-only claim
- [7 Google Spam Updates Later](https://www.stanventures.com/news/7-google-spam-updates-later-where-seo-stands-in-2026-7573/) — contested algorithmic claim

**Where penalties land:**
- [Parasite SEO: Everything You Need to Know](https://susodigital.com/thoughts/parasite-seo-explained/) — SUSO Digital
- [Which Bought Links Are Risky in 2026](https://saaslinks.net/blog/parasite-seo-site-reputation-abuse) — Saaslinks

**Timeline:**
- [How Long Does SEO Take in 2026 — Ahrefs & Semrush data](https://factoryjet.com/blog/how-long-does-seo-take-2026-month-by-month-timeline)
- [Google Sandbox in SEO (2026)](https://www.adomantra.com/blog/what-is-google-sandbox-in-seo-does-it-impact-new-websites)

**Reddit:**
- [We Checked the Self-Promotion Rules of 49 Subreddits Founders Pitch In. 61% Ban It.](https://oneup.today/blogs/reddit-selfpromo-rules-study-2026)
- [Complete guide to Reddit self-promotion rules in 2026](https://redship.io/blog/reddit-self-promotion-rules)

**Campus:**
- [UT Austin Student Involvement](https://www.utexas.edu/campus-life/student-involvement)
- [Find a Student Organization — Dean of Students](https://deanofstudents.utexas.edu/sa/findastudentorg.php)

**Source quality note:** Google's own documentation is the only authoritative source here. The SEO-industry write-ups are secondary, contradict each other in places (see the algorithmic-enforcement flag), and several are content marketing for link-selling services. Used for timeline estimates and enforcement observations, not policy interpretation.
