import Link from "next/link";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const base = typeof callbackUrl === "string" && callbackUrl.length > 0 ? callbackUrl : "/";
  const callback = encodeURIComponent(base);

  return (
    <div className="mx-auto max-w-md py-12">
      <div className="card p-8">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-50">
          Sign in to GigForge
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Choose a provider to continue. You’ll pick your role (musician or creator) after signing in.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <a
            href={`/api/auth/signin/github?callbackUrl=${callback}`}
            className="btn-primary w-full"
          >
            Sign in with GitHub
          </a>
          <a
            href={`/api/auth/signin/google?callbackUrl=${callback}`}
            className="btn-secondary w-full"
          >
            Sign in with Google
          </a>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500">
          <Link href="/" className="text-zinc-400 hover:text-zinc-200">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
