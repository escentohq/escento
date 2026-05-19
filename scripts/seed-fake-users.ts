import { createUser, updateUser } from "@/lib/api/users";
import { createProfile, updateProfile } from "@/lib/api/profiles";
import { createGig } from "@/lib/api/gigs";
import { ensureInstruments, ensureGenres } from "@/lib/api/tags";

const FAKE_MUSICIANS = [
  {
    name: "Sofia Reyes",
    email: "demo-sofia@motivo.demo",
    displayName: "Sofia Reyes",
    bio: "Violinist & composer. Classical meets modern.",
    instruments: ["Violin", "Piano"],
    genres: ["Classical", "Contemporary"],
    location: "Los Angeles, CA",
    instagramUrl: "https://instagram.com/sofiareyes",
    contactEmail: "sofia@motivo.demo",
  },
  {
    name: "Marcus Webb",
    email: "demo-marcus@motivo.demo",
    displayName: "Marcus Webb",
    bio: "Drummer with 10+ years in indie & alternative.",
    instruments: ["Drums", "Percussion"],
    genres: ["Indie Rock", "Alternative"],
    location: "Brooklyn, NY",
    instagramUrl: "https://instagram.com/marcuswebb",
    contactEmail: "marcus@motivo.demo",
  },
  {
    name: "Aria Kim",
    email: "demo-aria@motivo.demo",
    displayName: "Aria Kim",
    bio: "Session vocalist. R&B, Soul, Jazz.",
    instruments: ["Vocals"],
    genres: ["R&B", "Soul", "Jazz"],
    location: "Nashville, TN",
    instagramUrl: "https://instagram.com/ariakim",
    contactEmail: "aria@motivo.demo",
  },
  {
    name: "James Chen",
    email: "demo-james@motivo.demo",
    displayName: "James Chen",
    bio: "Electric guitarist. Rock, Funk, Pop.",
    instruments: ["Guitar"],
    genres: ["Rock", "Funk", "Pop"],
    location: "Austin, TX",
    instagramUrl: "https://instagram.com/jameschen",
    contactEmail: "james@motivo.demo",
  },
  {
    name: "Luna Santos",
    email: "demo-luna-artist@motivo.demo",
    displayName: "Luna Santos",
    bio: "Cellist & orchestral arranger.",
    instruments: ["Cello", "Violin"],
    genres: ["Classical", "Contemporary", "Cinematic"],
    location: "San Francisco, CA",
    instagramUrl: "https://instagram.com/lunasantos",
    contactEmail: "luna@motivo.demo",
  },
  {
    name: "David Okafor",
    email: "demo-david@motivo.demo",
    displayName: "David Okafor",
    bio: "Bass player & producer. Hip-hop & electronic.",
    instruments: ["Bass", "Synth"],
    genres: ["Hip-Hop", "Electronic", "R&B"],
    location: "Atlanta, GA",
    instagramUrl: "https://instagram.com/davidokafor",
    contactEmail: "david@motivo.demo",
  },
];

const FAKE_CREATORS = [
  {
    name: "Luna Productions",
    email: "demo-luna@motivo.demo",
  },
  {
    name: "Echo Records",
    email: "demo-echo@motivo.demo",
  },
  {
    name: "Neon Visuals",
    email: "demo-neon@motivo.demo",
  },
];

const FAKE_GIGS = [
  {
    creatorEmail: "demo-luna@motivo.demo",
    title: "Music Video Production",
    description:
      "Looking for live musicians for indie music video shoot. 2-day shoot in LA.",
    projectType: "Music Video",
    location: "Los Angeles, CA",
    instruments: ["Violin", "Drums"],
    genres: ["Indie Rock", "Contemporary"],
    compensationDetails: "Paid - $500-1000",
  },
  {
    creatorEmail: "demo-echo@motivo.demo",
    title: "Studio Session Recording",
    description:
      "Seeking talented vocalist for EP recording. 5 tracks, professional studio.",
    projectType: "Recording",
    location: "Nashville, TN",
    instruments: ["Vocals"],
    genres: ["R&B", "Soul"],
    compensationDetails: "Paid - $2000-3000",
  },
  {
    creatorEmail: "demo-neon@motivo.demo",
    title: "Live Event Performance",
    description:
      "Corporate event needs live jazz band for 2-hour performance.",
    projectType: "Live Event",
    location: "New York, NY",
    instruments: ["Piano", "Drums", "Vocals"],
    genres: ["Jazz"],
    compensationDetails: "Paid - $1500",
  },
  {
    creatorEmail: "demo-luna@motivo.demo",
    title: "Commercial Jingle Recording",
    description:
      "Need guitarist and bassist for upbeat commercial jingle. 3 hours studio time.",
    projectType: "Advertising",
    location: "Los Angeles, CA",
    instruments: ["Guitar", "Bass"],
    genres: ["Pop", "Funk"],
    compensationDetails: "Paid - $800-1200",
  },
  {
    creatorEmail: "demo-echo@motivo.demo",
    title: "Film Score Composition & Recording",
    description:
      "Indie film looking for cellist and violinist for orchestral soundtrack.",
    projectType: "Film",
    location: "San Francisco, CA",
    instruments: ["Cello", "Violin"],
    genres: ["Classical", "Cinematic"],
    compensationDetails: "Paid - $3000-5000",
  },
];

async function seedFakeUsers() {
  console.log("🌱 Seeding fake users...");

  try {
    // Create fake musicians
    console.log("\n📍 Creating fake musicians...");
    for (const musician of FAKE_MUSICIANS) {
      const user = await createUser({
        email: musician.email,
        name: musician.name,
        image: null,
        supabaseUserId: null,
        isFake: true,
      });

      // Set role
      await updateUser(user.id, { role: "MUSICIAN" });

      // Create profile with instruments & genres
      await createProfile(
        user.id,
        {
          displayName: musician.displayName,
          bio: musician.bio,
          school: null,
          location: musician.location,
          isRemote: false,
          seekingPaid: true,
          seekingUnpaid: false,
          yearsExperience: null,
          availabilityText: null,
          contactEmail: musician.contactEmail,
          instagramUrl: musician.instagramUrl,
          youtubeUrl: null,
          spotifyUrl: null,
          soundcloudUrl: null,
          websiteUrl: null,
        },
        musician.instruments,
        musician.genres,
      );

      console.log(`✅ Created musician: ${musician.name}`);
    }

    // Create fake creators
    console.log("\n📍 Creating fake creators...");
    const creatorMap = new Map<string, string>();
    for (const creator of FAKE_CREATORS) {
      const user = await createUser({
        email: creator.email,
        name: creator.name,
        image: null,
        supabaseUserId: null,
        isFake: true,
      });

      await updateUser(user.id, { role: "CREATOR" });
      creatorMap.set(creator.email, user.id);
      console.log(`✅ Created creator: ${creator.name}`);
    }

    // Create fake gigs
    console.log("\n📍 Creating fake gigs...");
    for (const gig of FAKE_GIGS) {
      const creatorId = creatorMap.get(gig.creatorEmail);
      if (!creatorId) {
        console.error(`❌ Creator not found: ${gig.creatorEmail}`);
        continue;
      }

      await createGig(
        creatorId,
        {
          title: gig.title,
          description: gig.description,
          projectType: gig.projectType,
          location: gig.location,
          isRemote: false,
          compensationType: "Paid",
          compensationDetails: gig.compensationDetails,
          deadline: null,
        },
        gig.instruments,
        gig.genres,
      );

      console.log(`✅ Created gig: ${gig.title}`);
    }

    console.log("\n✨ Fake user seeding complete!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  seedFakeUsers();
}

export { seedFakeUsers };
