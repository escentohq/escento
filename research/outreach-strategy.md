# Outreach Strategy — Distribution for the Escento Pilot

**Spike for [#11](https://github.com/escentohq/escento/issues/11).** Written 2026-08-13.
**Question asked:** are "parasitic links" a viable distribution channel, and is SEO worth sprint time before the pilot?

---

## TL;DR — the decision

**Do Plan A. Start Plan B in the background. Do not do Plan C.**

| | Plan | Verdict |
|---|---|---|
| **A** | Direct campus outreach — music dept, ensembles, film school, student orgs | ✅ **Do this.** All pilot signups come from here. |
| **B** | Legitimate borrowed authority — real directory listings, campus paper, org pages | 🟡 **Do in parallel, low effort only.** Costs ~2h/week, pays off after the pilot. |
| **C** | Parasitic SEO — paid placements on high-authority domains to borrow ranking power | ❌ **No-go.** Wrong timeline, wrong risk, builds someone else's asset. |

The honest prior in the issue — that direct outreach beats any SEO play for the first 10–20 users — **holds, and the timeline math is what settles it, not the risk.** Even if parasitic SEO were perfectly safe and free, it could not produce a signup inside the pilot window.

---

## Why SEO of any kind is the wrong tool right now

This is the load-bearing argument. Everything else is secondary.

**Pilot target: 10–20 real users** (`docs/prd.md:629`).

**New-domain reality in 2026:**

- New domains sit in a suppressed-ranking period of **3–6 months** — not a penalty, just Google lacking signal to place the site.
- **6–12 months minimum** before meaningful organic traffic for a new site.
- Low-competition long-tail terms are the fast case at **1–3 months.**

Best case, a flawless SEO program returns its first trickle of traffic around the time the pilot should already be over. And 10–20 users is a number you can hit by **talking to two ensemble directors.** SEO is a compounding channel; you don't need compounding, you need twenty people.

**Recommendation: zero sprint time on SEO before the pilot.** Revisit after product-market signal, when the growth question changes from "get 20 users" to "get 2,000."

One exception, in Plan B: a handful of directory listings are ~30 minutes of work total and start aging immediately. Do those, not because they convert now, but because they're free and domain age is the one SEO input you cannot buy later.

---

## What "parasitic links" actually means, and where the line is

The term covers two very different things, and the issue was right to split them.

### Legitimate borrowed authority ✅

Publishing genuinely useful content on a platform that happens to have authority — a real writeup in the campus paper, an honest directory listing, a substantive Reddit answer.

Google explicitly carves this out. Per the [spam policies doc](https://developers.google.com/search/docs/essentials/spam-policies) (last updated 2026-05-15), acceptable third-party content includes wire services, user-generated content platforms, editorial columns, syndicated news, properly-tagged affiliate links, and merchant-sourced coupons. Advertorial and native advertising are also fine **when the purpose is to reach that publication's readers** rather than to farm the host's ranking signals.

The test is intent and audience: *would you still place this if it passed no link equity at all?* If yes, it's marketing. If no, it's the other thing.

### Site reputation abuse ❌

Google's definition: *"a tactic where third-party content is published on a host site mainly because of that host's already-established ranking signals."* Canonical examples — casino content on a medical site, sponsored reviews on an educational domain, coupon sections parked on news publishers.

Timeline:

- **March 2024** — introduced as a spam category alongside expired-domain and scaled-content abuse.
- **November 2024** — the important update. Google closed the obvious loophole: the violation stands **regardless of first-party involvement or oversight.** You cannot launder a placement by having the host's editor "review" it. Google distinguishes genuine first-party production (staff, or freelancers working for staff) from white-label/turnkey services that redistribute content to manipulate rankings.
- **Since** — enforcement via manual action, with the domain owner notified in Search Console and able to file a reconsideration request.

⚠️ **Conflicting sources on algorithmic enforcement.** Some 2026 write-ups claim algorithmic enforcement shipped with the August 2025 spam update; others, citing Glenn Gabe and Marie Haynes, say it remains manual-only 18 months in. **I could not resolve this from Google's own documentation** — the official page describes manual actions and does not confirm an algorithmic version. Treat the algorithmic claim as unverified. It does not change our recommendation either way, since we're not doing this.

### Q3 from the issue: where does the risk actually land?

**Mostly on the host, but that's not the reason to avoid it.**

- The manual action hits the **host domain** — the site publishing the content. That's the party with real exposure.
- Both sides can be penalized in some cases, but the linked-to site is not the primary target.
- Your real exposure as the buyer is **wasted spend and a disappearing asset**: the placement evaporates the moment the host is flagged or cleans house, and you have no control over either.
- **The structural problem: parasite pages build the host's domain authority, not yours.** You rent traffic and hand over the equity. For a company whose whole asset is its own domain, that is backwards.

So the answer to "is it risky for us?" is: less legally risky than it sounds, and more strategically pointless than it sounds. We're declining it on the second ground more than the first.

---

## Channel list, ranked by effort-to-signup

Effort = hours to first signup, not hours total. Ranked best-first.

| # | Channel | Effort | Expected pilot signups | Go / No-go |
|---|---|---|---|---|
| 1 | Direct email + in-person: music dept, ensemble directors, film/RTF faculty | Low | **High** — the whole pilot | ✅ Go |
| 2 | Class & department listservs (via faculty intro) | Low | High | ✅ Go |
| 3 | Student orgs — music frats, film clubs, campus radio | Medium | High | ✅ Go |
| 4 | Campus Discord / GroupMe servers | Low | Medium | ✅ Go — respect each server's rules |
| 5 | Campus org platform profile + event listings | Low | Medium | ✅ Go |
| 6 | Flyers in music & film buildings (QR → `/`) | Low | Medium | ✅ Go |
| 7 | Campus newspaper — **earned** writeup (pitch as a story) | Medium | Medium | ✅ Go |
| 8 | Arts/music-education directory listings | Low | ~0 now | 🟡 Go, for domain age only |
| 9 | Reddit — campus sub + musician subs | Medium | Low | 🟡 Conditional, see below |
| 10 | Campus newspaper — **paid** display ad | Medium + $ | Low | 🟡 Only if a rate card is cheap |
| 11 | Medium / LinkedIn / Substack posts | Medium | ~0 | ❌ No-go pre-pilot |
| 12 | Paid sponsored posts on high-DA sites for ranking | High + $$ | 0 | ❌ **No-go, permanently** |

**On Reddit (#9):** legal, but low-yield and easy to get wrong. A study of 49 subreddits founders commonly pitch in found **61% either ban self-promotion outright or restrict it to a 9:1 participation ratio** — 19 of 49 ban it flat, with permanent bans handed out. The platform-wide norm is the 90/10 rule. Moderators check history; an account whose every comment mentions one product gets flagged. **Only worth it if someone on the team is already a genuine participant in the target sub.** Do not create an account to promote — that's the failure mode that burns the name.

---

## Plan A — Direct campus outreach ✅ **RECOMMENDED**

The pilot channel. Everything else is secondary to this.

**Assumption to confirm: the pilot campus is UT Austin.** Inferred from the team, not stated in `docs/prd.md` — the PRD says only "university communities" (`:33`). If it's a different campus, the steps hold but the specific names change.

**Why it wins:** targets exactly the two sides of the marketplace, needs no domain authority, produces users this week, and the conversation itself is product research. A cold-start marketplace needs *matched* supply and demand, not traffic — twenty randoms from search are worse than six musicians and six filmmakers who know each other.

### Steps

1. **Fix the seeding order first.** A two-sided marketplace that opens empty churns its first visitors. Recruit **musicians first** (profiles are the inventory), get ~10 real profiles live, *then* bring creators in to browse something real. Do not run both sides simultaneously.
2. **Build the target list** — one spreadsheet, three tabs:
   - *Faculty/staff*: ensemble directors (orchestra, jazz, choir, marching), music-business faculty, RTF/film production faculty, media center staff.
   - *Orgs*: music fraternities and sororities, a cappella groups, film/production clubs, campus radio, game-dev and podcast clubs.
   - *Individuals*: students already posting "looking for a composer / need a drummer" in campus Discords.
3. **Write two emails**, not one — the musician pitch ("get discovered for paid and unpaid work") and the creator pitch ("find a composer in a day, not three weeks"). Short. One ask: forward to your students / post in your channel.
4. **Ask faculty for a forward, not a signup.** One ensemble director forwarding to a 60-person list beats fifty cold emails, and it arrives with implicit endorsement.
5. **Go in person for the top 5.** Office hours after rehearsal. Conversion on a face-to-face ask is not comparable to email.
6. **Onboard the first ten by hand.** Walk them through signup on your laptop. Watch where they stall — that's free usability data, and it feeds #8 (onboarding wizard) directly.
7. **Instrument it.** Ask every signup how they heard about it, one field or one question. Without this you cannot tell which of these steps worked.

**Cost:** $0. **Turnaround:** signups within days.
**Blocker to watch:** the pilot depends on `/` showing real inventory ([#5](https://github.com/escentohq/escento/issues/5)) and on onboarding not bleeding users ([#8](https://github.com/escentohq/escento/issues/8)). Do not run outreach at scale until those land — you get one first impression per person.

---

## Plan B — Legitimate borrowed authority 🟡 **PARALLEL, LOW EFFORT**

Real placements on platforms that happen to carry authority. Compliant by construction, because each one is worth doing even with `nofollow` on every link.

**Budget: ~2 hours/week, capped.** It does not produce pilot users. It produces a footprint that ages.

### Steps

1. **Claim the profiles** (~30 min total): campus org platform profile, Google Business Profile if there's any physical/local angle, and the obvious startup directories. Consistent name, description, and URL across all.
2. **List in 3–5 genuine arts/music-education directories.** Only ones a student might actually browse. If you wouldn't submit it without the link, skip it.
3. **Pitch the campus paper as a story, not an ad.** "Two students built a tool to fix how campus film projects find composers" is a real story for a student publication. Earned coverage, free, and a legitimate `.edu`-adjacent mention. This is the single highest-value item in Plan B.
4. **Participate honestly where the team already participates.** If someone is a real member of a music or campus subreddit, answer questions in it and mention the product when it's genuinely the answer. 90/10, disclosed. If nobody is already a member, skip — do not manufacture presence.
5. **Publish nothing "for SEO."** No Medium posts, no LinkedIn articles, no guest posts targeting keywords. Pre-pilot, these are pure time sinks with no audience attached.

**Cost:** $0–low. **Turnaround:** weeks to months, no pilot impact.

---

## Plan C — Parasitic SEO ❌ **NO-GO**

Paying for placements on high-authority third-party domains to borrow their ranking power.

Rejected on four independent grounds, any one of which is sufficient:

1. **Timeline.** Cannot produce a signup within the pilot window. Fatal on its own.
2. **Policy.** Placements bought to exploit a host's ranking signals are site reputation abuse by definition, and the November 2024 update removed the "but the editor approved it" defense.
3. **Asset ownership.** Builds the host's domain authority, not Escento's. Rented traffic, transferred equity.
4. **Fragility.** The asset vanishes when the host is flagged or cleans up. Zero control, spend not recoverable.

### What we will not do — explicitly

- ❌ Buy sponsored posts on news, `.edu`, or high-DA domains for ranking purposes
- ❌ Use white-label or turnkey "parasite placement" services
- ❌ Publish content on third-party domains whose only purpose is to rank
- ❌ Buy links, exchange links, or use PBNs
- ❌ Create Reddit or forum accounts for the purpose of promotion, or post without disclosing affiliation
- ❌ Post identical promotional content across multiple subreddits or communities

The distinguishing question for any future placement: **would we still want this if every link on it were `nofollow`?** Yes → it's marketing, do it. No → it's site reputation abuse, decline it.

---

## Answers to the issue's five questions

1. **Which placements are realistic?** Campus-proximate ones — department listservs, ensemble directors, student orgs, campus radio, the student paper, campus Discords. See the ranked table.
2. **Which are legitimate vs. abuse?** Everything in Plans A and B is legitimate; all of it is worth doing with links stripped. Only Plan C — paid placements bought for ranking power — crosses into site reputation abuse.
3. **What's the exposure if we get it wrong?** The manual action lands primarily on the **host** domain, not ours. Our real loss is wasted spend and an asset that disappears without warning. The strategic cost — building the host's authority instead of our own — is larger than the penalty risk.
4. **Cost and turnaround?** Plan A: $0, days. Plan B: $0–low, weeks-to-months, no pilot impact. Plan C: meaningful $$, and it does not arrive in time regardless.
5. **Does SEO matter on this timeline?** **No.** New domains face 3–6 months of suppressed ranking and 6–12 months to meaningful traffic. The pilot needs 20 people. Direct outreach is strictly better, and it is not close.

---

## Open items

- [ ] **Confirm the pilot campus.** UT Austin is assumed, not documented. `docs/prd.md:33` says only "university communities."
- [ ] **Get the campus paper's rate card** before deciding on #10 in the table. Not gathered here — student-media ad rates aren't published online and need a direct email to the ad department.
- [ ] **Confirm the pilot start date.** The "SEO is too slow" conclusion is robust across any plausible date, but the Plan B cadence should be sized against a real calendar.
- [ ] **Decide who owns the outreach spreadsheet.** This doc is a plan, not an assignment.

---

## Sources

**Google policy (primary):**
- [Spam Policies for Google Web Search](https://developers.google.com/search/docs/essentials/spam-policies) — site reputation abuse definition, carve-outs, enforcement. Last updated 2026-05-15.
- [Updating our site reputation abuse policy](https://developers.google.com/search/blog/2024/11/site-reputation-abuse) — November 2024, first-party oversight.
- [March 2024 core update and new spam policies](https://developers.google.com/search/blog/2024/03/core-update-spam-policies) — original introduction.
- [Google Search Spam Updates](https://developers.google.com/search/docs/appearance/spam-updates)

**Policy commentary:**
- [Google site reputation abuse policy now includes first-party involvement or oversight](https://searchengineland.com/google-site-reputation-abuse-policy-now-includes-first-party-involvement-or-oversight-of-content-448432) — Search Engine Land
- [Google Updates Their Spam Policy Documentation](https://www.searchenginejournal.com/google-updates-their-spam-policy-documentation/528201/) — Search Engine Journal
- [Google Site Reputation Abuse: 18 Months In](https://www.capconvert.com/learn/blog/google-site-reputation-abuse-18-months) — source for the manual-only-so-far claim
- [7 Google Spam Updates Later: Where SEO Stands in 2026](https://www.stanventures.com/news/7-google-spam-updates-later-where-seo-stands-in-2026-7573/) — source for the contested algorithmic-enforcement claim

**Where penalties land:**
- [Parasite SEO: Everything You Need to Know](https://susodigital.com/thoughts/parasite-seo-explained/) — SUSO Digital
- [Parasite SEO Crackdown: Which Bought Links Are Risky in 2026](https://saaslinks.net/blog/parasite-seo-site-reputation-abuse) — Saaslinks

**Timeline:**
- [How Long Does SEO Take in 2026 — Ahrefs & Semrush data](https://factoryjet.com/blog/how-long-does-seo-take-2026-month-by-month-timeline)
- [Google Sandbox in SEO: What It Is & How to Escape It (2026)](https://www.adomantra.com/blog/what-is-google-sandbox-in-seo-does-it-impact-new-websites)

**Reddit:**
- [We Checked the Self-Promotion Rules of 49 Subreddits Founders Pitch In. 61% Ban It.](https://oneup.today/blogs/reddit-selfpromo-rules-study-2026)
- [The complete guide to Reddit self-promotion rules in 2026](https://redship.io/blog/reddit-self-promotion-rules)

**Campus:**
- [UT Austin Student Involvement](https://www.utexas.edu/campus-life/student-involvement)
- [Find a Student Organization — Dean of Students](https://deanofstudents.utexas.edu/sa/findastudentorg.php)

**Note on source quality:** Google's own documentation is the only authoritative source here. The SEO-industry write-ups are secondary, occasionally contradict each other (see the algorithmic-enforcement note above), and several are content marketing for link-selling services. They were used for timeline estimates and enforcement observations, not for policy interpretation.
