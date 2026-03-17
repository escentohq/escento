import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { setRole } from "./actions";

export default async function RoleOnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");
  if (session.user.role) redirect("/");

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1>Choose your role</h1>
      <p>This helps GigForge show the right tools for you.</p>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <form
          action={async () => {
            "use server";
            await setRole("MUSICIAN");
          }}
        >
          <button type="submit">I’m a Musician</button>
        </form>

        <form
          action={async () => {
            "use server";
            await setRole("CREATOR");
          }}
        >
          <button type="submit">I’m a Creator</button>
        </form>
      </div>
    </main>
  );
}

