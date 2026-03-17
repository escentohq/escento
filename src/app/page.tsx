import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user?.id && !session.user.role) {
    redirect("/onboarding/role");
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>GigForge</h1>
      <p>Foundation setup. Auth + role selection is enabled.</p>

      {!session?.user ? (
        <a href="/api/auth/signin">Sign in</a>
      ) : (
        <>
          <p style={{ marginTop: 12 }}>
            Signed in as <strong>{session.user.email}</strong>
          </p>
          <p>
            Role: <strong>{session.user.role}</strong>
          </p>
          <a href="/api/auth/signout">Sign out</a>
        </>
      )}
    </main>
  );
}

