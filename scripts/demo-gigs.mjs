// Seeds (or clears) fake demo gigs so the marketplace looks populated.
//
//   npm run demo:seed    create demo creators + gigs (idempotent)
//   npm run demo:clear   delete every demo creator; FK cascade removes their gigs
//
// Targets whatever NEXT_PUBLIC_SUPABASE_URL in .env points at, using the
// service-role key. Every demo account uses the DEMO_DOMAIN email domain,
// which is the only marker `clear` relies on.
//
// Public gig reads are cached under the `public:gigs` tag with no TTL, so new
// rows appear on a running deployment only after a gig write through the app
// or a redeploy.

import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const DEMO_DOMAIN = "demo.escento.test";

const MARKETS = {
  austin: { placeId: "launch:austin-tx", displayName: "Austin, TX", lat: 30.2672, lng: -97.7431, city: "Austin", state: "TX" },
  dallas: { placeId: "launch:dallas-tx", displayName: "Dallas, TX", lat: 32.7767, lng: -96.797, city: "Dallas", state: "TX" },
  houston: { placeId: "launch:houston-tx", displayName: "Houston, TX", lat: 29.7604, lng: -95.3698, city: "Houston", state: "TX" },
  la: { placeId: "launch:los-angeles-ca", displayName: "Los Angeles, CA", lat: 34.0549, lng: -118.2426, city: "Los Angeles", state: "CA" },
  nyc: { placeId: "launch:new-york-ny", displayName: "New York, NY", lat: 40.7128, lng: -74.006, city: "New York", state: "NY" },
  nashville: { placeId: "launch:nashville-tn", displayName: "Nashville, TN", lat: 36.1627, lng: -86.7816, city: "Nashville", state: "TN" },
  atlanta: { placeId: "launch:atlanta-ga", displayName: "Atlanta, GA", lat: 33.749, lng: -84.388, city: "Atlanta", state: "GA" },
  chicago: { placeId: "launch:chicago-il", displayName: "Chicago, IL", lat: 41.8781, lng: -87.6298, city: "Chicago", state: "IL" },
};

const CREATORS = [
  { key: "northlight", name: "Northlight Films" },
  { key: "lowtide", name: "Low Tide Podcast" },
  { key: "pixelharbor", name: "Pixel Harbor Games" },
  { key: "juniper", name: "Juniper Events" },
  { key: "mayachen", name: "Maya Chen" },
  { key: "secondact", name: "Second Act Theater" },
];

// daysAgo: when the gig was posted. deadlineIn: days from today, or null.
const GIGS = [
  {
    creator: "northlight",
    title: "Original score for a 12-minute short film",
    projectType: "FILM",
    compensation: "PAID",
    compensationDetails: "$1,200 flat for roughly 9 minutes of music, two revision rounds.",
    market: "austin",
    remote: true,
    daysAgo: 1,
    deadlineIn: 30,
    instruments: ["Piano", "Cello", "Synthesizer"],
    genres: ["Cinematic", "Ambient"],
    description:
      "We're finishing \"Salt Flats,\" a quiet drama about two sisters driving their father's ashes across West Texas. Picture is locked at 12 minutes and we need an original score that leans minimal: sparse piano, low strings, and some textural synth under the long driving shots.\n\nYou'll get a locked cut with temp music and a spotting doc. We'd like a first pass on the three main cues within two weeks of starting.\n\nWe're based in Austin and happy to meet in person, but remote works fine. Please share one or two pieces that show restraint.",
  },
  {
    creator: "lowtide",
    title: "Theme music and stingers for a weekly interview podcast",
    projectType: "PODCAST",
    compensation: "PAID",
    compensationDetails: "$450 for a 30-second theme, a 60-second extended version, and three short stingers.",
    market: null,
    remote: true,
    daysAgo: 2,
    deadlineIn: 21,
    instruments: ["Acoustic Guitar", "Bass", "Drums"],
    genres: ["Indie", "Folk"],
    description:
      "Low Tide is a weekly interview show about people who changed careers after 40. We're relaunching with a new format and want a theme that feels warm and a little hopeful, closer to an indie folk record than a news bumper.\n\nDeliverables: a 30-second open, a 60-second extended version for the trailer, and three 3 to 5 second transition stingers. Stems appreciated.\n\nFully remote. We'll own the license for the show and its promos; you keep the right to include it in your portfolio.",
  },
  {
    creator: "pixelharbor",
    title: "Composer for a cozy farming game soundtrack",
    projectType: "GAME",
    compensation: "NEGOTIABLE",
    compensationDetails: "Budget around $3,000 to $4,500 depending on scope. Revenue share bonus on launch.",
    market: "chicago",
    remote: true,
    daysAgo: 3,
    deadlineIn: 45,
    instruments: ["Ukulele", "Flute", "Marimba", "Piano"],
    genres: ["Video Game", "Acoustic"],
    description:
      "Pixel Harbor is a three-person studio making \"Moss & Meadow,\" a farming and crafting game with a hand-painted look. We need about 25 minutes of looping music: four seasonal themes, a village theme, a night theme, and a handful of short jingles for events.\n\nWe hear it as light acoustic instrumentation: ukulele, flute, mallets, soft piano. Loops need to be seamless and comfortable over long sessions.\n\nWe're in Chicago but the whole team is remote. Launch is planned for next spring on Steam and Switch.",
  },
  {
    creator: "juniper",
    title: "Jazz trio for a rooftop wedding reception",
    projectType: "LIVE_EVENT",
    compensation: "PAID",
    compensationDetails: "$1,800 for the trio, 3 hours with two breaks. Dinner provided.",
    market: "nashville",
    remote: false,
    daysAgo: 4,
    deadlineIn: 18,
    instruments: ["Upright Bass", "Piano", "Drums"],
    genres: ["Jazz", "Swing"],
    description:
      "Juniper Events is planning a 120-guest rooftop reception in downtown Nashville. The couple wants a jazz trio for cocktail hour and dinner: standards, some bossa nova, and a swing set once people start dancing.\n\nThe venue has a small house PA and a keyboard on site. Load-in is by freight elevator. We'd want to hear a live recording of your group.\n\nPlease include your rate if it differs from the posted budget.",
  },
  {
    creator: "mayachen",
    title: "Lo-fi background tracks for a study vlog channel",
    projectType: "YOUTUBE",
    compensation: "PAID",
    compensationDetails: "$75 per track, looking for 8 tracks to start.",
    market: null,
    remote: true,
    daysAgo: 5,
    deadlineIn: null,
    instruments: ["Electric Piano", "Bass", "Drum Machine"],
    genres: ["Lo-Fi", "Hip Hop"],
    description:
      "I run a study-with-me channel with about 80k subscribers. I've been using library music and want something original that's mine to use across videos.\n\nLooking for 2 to 3 minute lo-fi tracks that loop well: dusty keys, soft drums, nothing with vocals. Credit goes in every description and a pinned comment.\n\nIf it works out I'd like to make this an ongoing monthly thing.",
  },
  {
    creator: "secondact",
    title: "Pit musicians for a community production of Into the Woods",
    projectType: "LIVE_EVENT",
    compensation: "PAID",
    compensationDetails: "$600 per player for 4 rehearsals and 6 performances.",
    market: "atlanta",
    remote: false,
    daysAgo: 6,
    deadlineIn: 25,
    instruments: ["Violin", "Clarinet", "French Horn", "Piano"],
    genres: ["Musical Theater"],
    description:
      "Second Act Theater is staging Into the Woods this winter and we're filling out a reduced pit. We still need violin, clarinet (doubling flute is a plus), and horn.\n\nRehearsals are weeknight evenings starting next month. Performances run two weekends. The book is available to borrow once you're confirmed.\n\nWe're a small company in Decatur, just east of Atlanta. Parking is free.",
  },
  {
    creator: "northlight",
    title: "Session vocalist for an end-credits song",
    projectType: "FILM",
    compensation: "PAID",
    compensationDetails: "$500 for the session, plus standard performer credit.",
    market: "la",
    remote: true,
    daysAgo: 7,
    deadlineIn: 14,
    instruments: ["Vocals"],
    genres: ["Singer-Songwriter", "Americana"],
    description:
      "We have a finished instrumental and lyrics for the end-credits song of a feature documentary about rodeo families. We're looking for a vocalist with a warm, slightly worn tone. Think late-night Americana.\n\nYou can record from your own setup if you have a clean vocal chain, or join us at a studio in Burbank. Two or three takes plus a harmony pass.\n\nSend a link to something you've sung on that's close to this feel.",
  },
  {
    creator: "pixelharbor",
    title: "Chiptune remix of our theme for a game trailer",
    projectType: "GAME",
    compensation: "PAID",
    compensationDetails: "$300 for a 90-second trailer cut.",
    market: null,
    remote: true,
    daysAgo: 8,
    deadlineIn: 12,
    instruments: ["Synthesizer"],
    genres: ["Chiptune", "Electronic"],
    description:
      "For our announce trailer we want a 90-second chiptune arrangement of the main theme from \"Moss & Meadow.\" We'll provide the MIDI and a reference mix.\n\nIt should sound like it could run on original hardware, but mixed loud enough to hold up on YouTube. The cut has three hit points we'll mark for you.\n\nQuick turnaround. We're aiming to publish the trailer in about two weeks.",
  },
  {
    creator: "lowtide",
    title: "Audio editor with music background for a narrative series",
    projectType: "PODCAST",
    compensation: "NEGOTIABLE",
    compensationDetails: "Per-episode rate, open to your quote. 6 episodes.",
    market: "nyc",
    remote: true,
    daysAgo: 9,
    deadlineIn: 35,
    instruments: ["Synthesizer", "Piano"],
    genres: ["Ambient", "Experimental"],
    description:
      "We're producing a six-part narrative spin-off and need someone who can do both: edit tape and score the transitions. Most of the music would be short ambient beds under narration, 20 to 60 seconds each.\n\nYou'd work from our rough cuts in Descript or Pro Tools. We meet weekly over video. Our producer is in Brooklyn if you'd rather work in person some days.\n\nTell us your per-episode rate when you reach out.",
  },
  {
    creator: "juniper",
    title: "Solo acoustic set for a gallery opening",
    projectType: "LIVE_EVENT",
    compensation: "PAID",
    compensationDetails: "$350 for a 2-hour set.",
    market: "dallas",
    remote: false,
    daysAgo: 10,
    deadlineIn: 16,
    instruments: ["Acoustic Guitar", "Vocals"],
    genres: ["Folk", "Indie"],
    description:
      "A gallery in Deep Ellum is opening a photography show and wants live acoustic music in the background. Mostly instrumental or soft vocals, nothing that competes with conversation.\n\nAbout 80 guests, Friday evening. The space has a small PA, or bring your own if you prefer.\n\nCovers are fine as long as they fit the mood.",
  },
  {
    creator: "mayachen",
    title: "Upbeat intro music for a cooking channel relaunch",
    projectType: "YOUTUBE",
    compensation: "UNPAID",
    compensationDetails: null,
    market: null,
    remote: true,
    daysAgo: 11,
    deadlineIn: 28,
    instruments: ["Horns", "Bass", "Drums"],
    genres: ["Funk", "Soul"],
    description:
      "My second channel is a weeknight cooking show and I'm relaunching it with a new look. I'd love a 10 to 15 second funky intro with horns.\n\nI can't pay for this one, but you'll get a credit and link in every video description and a shout-out on the relaunch episode. I'm also happy to feature your music in a dedicated short.\n\nIf you're a student or building a portfolio, this could be a good fit.",
  },
  {
    creator: "secondact",
    title: "Music director for a summer youth theater camp",
    projectType: "OTHER",
    compensation: "PAID",
    compensationDetails: "$2,400 stipend for a 4-week camp, weekdays 9 to 3.",
    market: "atlanta",
    remote: false,
    daysAgo: 12,
    deadlineIn: 50,
    instruments: ["Piano", "Vocals"],
    genres: ["Musical Theater", "Pop"],
    description:
      "We run a four-week summer camp for ages 10 to 16 that ends in a full showcase. We need a music director who can teach vocal parts, accompany rehearsals on piano, and run the band at the final performance.\n\nExperience working with kids matters more than credentials. You'll work alongside our director and a choreographer.\n\nPlease send a short note about any teaching experience.",
  },
  {
    creator: "northlight",
    title: "Drummer for a live-to-picture music video shoot",
    projectType: "FILM",
    compensation: "PAID",
    compensationDetails: "$400 day rate, one shoot day.",
    market: "houston",
    remote: false,
    daysAgo: 14,
    deadlineIn: 20,
    instruments: ["Drums"],
    genres: ["Rock", "Alternative"],
    description:
      "We're shooting a performance music video for a Houston rock band whose drummer just moved away. You'd learn three songs and play them live on camera; the audio is already recorded, so this is about a convincing, energetic performance.\n\nOne long shoot day in a warehouse space. Kit provided, bring your own cymbals and snare if you like.\n\nWe'll send the tracks as soon as you're confirmed.",
  },
  {
    creator: "pixelharbor",
    title: "Foley and UI sound pack for a puzzle game",
    projectType: "GAME",
    compensation: "NEGOTIABLE",
    compensationDetails: "Roughly 60 short sounds. Open to a flat quote.",
    market: null,
    remote: true,
    daysAgo: 16,
    deadlineIn: null,
    instruments: ["Percussion", "Synthesizer"],
    genres: ["Electronic", "Ambient"],
    description:
      "Alongside our farming game we're prototyping a small puzzle title and need a cohesive set of UI sounds: clicks, slides, success chimes, failure thuds, and a few ambient beds.\n\nWe like sounds that feel tactile, wood and glass rather than bleeps. Delivered as 48k WAV with consistent loudness.\n\nSend a reel or examples of UI work if you have them.",
  },
  {
    creator: "lowtide",
    title: "String quartet arrangement of our podcast theme",
    projectType: "PODCAST",
    compensation: "PAID",
    compensationDetails: "$700 for the arrangement and a remote recording.",
    market: "austin",
    remote: true,
    daysAgo: 19,
    deadlineIn: 40,
    instruments: ["Violin", "Viola", "Cello"],
    genres: ["Classical", "Cinematic"],
    description:
      "For our 100th episode we want to surprise listeners with a string quartet version of the show theme. We'll share the original stems and a lead sheet.\n\nIdeally you can arrange it and record it, either with your own quartet or by tracking parts yourself. About 90 seconds.\n\nAustin players are a bonus since we'd love to film the session, but we'll consider remote recordings.",
  },
];

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set. Run with --env-file=.env.`);
  return value;
}

function adminClient() {
  return createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function demoEmail(key) {
  return `${key}@${DEMO_DOMAIN}`;
}

async function listDemoUsers(admin) {
  const users = [];
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    users.push(...data.users.filter((user) => user.email?.endsWith(`@${DEMO_DOMAIN}`)));
    if (data.users.length < 1000) return users;
  }
}

async function ensureCreators(admin) {
  const existing = new Map((await listDemoUsers(admin)).map((user) => [user.email, user]));
  const ids = {};

  for (const creator of CREATORS) {
    const email = demoEmail(creator.key);
    let user = existing.get(email);
    if (!user) {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password: randomBytes(24).toString("base64url"),
        email_confirm: true,
        user_metadata: { full_name: creator.name },
      });
      if (error || !data.user) throw error ?? new Error(`Could not create ${email}.`);
      user = data.user;
      console.log(`  created creator ${creator.name}`);
    }

    const { error: profileError } = await admin.from("app_user").upsert({
      id: user.id,
      email,
      name: creator.name,
      role: "CREATOR",
      is_public: true,
      moderation_status: "active",
    });
    if (profileError) throw profileError;
    ids[creator.key] = user.id;
  }

  return ids;
}

async function ensureTags(admin, table, names) {
  const unique = Array.from(new Set(names));
  const { error: upsertError } = await admin
    .from(table)
    .upsert(unique.map((name) => ({ name, is_default: false })), { onConflict: "name", ignoreDuplicates: true });
  if (upsertError) throw upsertError;

  const { data, error } = await admin.from(table).select("id, name").in("name", unique);
  if (error) throw error;
  return new Map(data.map((tag) => [tag.name, tag.id]));
}

function isoDate(daysFromNow) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

function gigRow(gig, creatorId) {
  const market = gig.market ? MARKETS[gig.market] : null;
  const createdAt = new Date(Date.now() - gig.daysAgo * 86_400_000).toISOString();

  return {
    creator_id: creatorId,
    title: gig.title,
    description: gig.description,
    project_type: gig.projectType,
    compensation_type: gig.compensation,
    compensation_details: gig.compensationDetails,
    deadline: gig.deadlineIn === null ? null : isoDate(gig.deadlineIn),
    is_remote: gig.remote,
    location: market?.displayName ?? null,
    location_display_name: market?.displayName ?? null,
    location_place_id: market?.placeId ?? null,
    provider_place_id: market?.placeId ?? null,
    location_lat: market?.lat ?? null,
    location_lng: market?.lng ?? null,
    location_city: market?.city ?? null,
    location_state: market?.state ?? null,
    location_country: market ? "US" : null,
    location_provider: market ? "launch_market" : null,
    status: "OPEN",
    is_public: true,
    moderation_status: "active",
    created_at: createdAt,
    updated_at: createdAt,
  };
}

async function seed(admin) {
  const creatorIds = await ensureCreators(admin);
  const instrumentIds = await ensureTags(admin, "instrument", GIGS.flatMap((gig) => gig.instruments));
  const genreIds = await ensureTags(admin, "genre", GIGS.flatMap((gig) => gig.genres));

  let created = 0;
  for (const gig of GIGS) {
    const creatorId = creatorIds[gig.creator];
    const { data: existing, error: existingError } = await admin
      .from("gig")
      .select("id")
      .eq("creator_id", creatorId)
      .eq("title", gig.title)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) continue;

    const { data: inserted, error } = await admin.from("gig").insert(gigRow(gig, creatorId)).select("id").single();
    if (error) throw error;

    const { error: instrumentError } = await admin
      .from("gig_instrument")
      .insert(gig.instruments.map((name) => ({ gig_id: inserted.id, instrument_id: instrumentIds.get(name) })));
    if (instrumentError) throw instrumentError;

    const { error: genreError } = await admin
      .from("gig_genre")
      .insert(gig.genres.map((name) => ({ gig_id: inserted.id, genre_id: genreIds.get(name) })));
    if (genreError) throw genreError;

    created++;
    console.log(`  created gig "${gig.title}"`);
  }

  console.log(`Done: ${created} new gigs, ${GIGS.length - created} already present.`);
}

async function clear(admin) {
  const users = await listDemoUsers(admin);
  for (const user of users) {
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
    console.log(`  deleted ${user.email}`);
  }
  console.log(`Done: removed ${users.length} demo creators and their gigs.`);
}

const mode = process.argv[2];
if (mode !== "seed" && mode !== "clear") {
  console.error("Usage: node --env-file=.env scripts/demo-gigs.mjs <seed|clear>");
  process.exit(1);
}

const admin = adminClient();
console.log(`${mode} demo gigs on ${new URL(requireEnv("NEXT_PUBLIC_SUPABASE_URL")).host}`);
await (mode === "seed" ? seed(admin) : clear(admin));
