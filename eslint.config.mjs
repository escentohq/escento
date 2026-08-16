import nextVitals from "eslint-config-next/core-web-vitals";

/**
 * The AGENTS.md architecture rules that regress silently, encoded as checks.
 * Prose in a doc does not fail a build; these do.
 */

/**
 * Rule #1: product data access is concentrated in the service layer.
 *
 * Auth and account plumbing is the documented exception — it talks to
 * `auth.*`, not to product tables.
 */
const SUPABASE_AUTH_PLUMBING = [
  "src/lib/api/**",
  "src/lib/auth-guards.ts",
  "src/lib/auth/**",
  "src/lib/supabase/**",
  "src/lib/account-deletion.ts",
  "src/lib/user-deletion.ts",
  "src/lib/support-identity.ts",
  "src/app/auth/callback/route.ts",
  "src/app/signin/actions.ts",
  "src/app/signup/actions.ts",
  "src/app/forgot-password/actions.ts",
  "src/app/account/actions.ts",
  "src/app/account/update-password/actions.ts",
  "src/app/onboarding/role/actions.ts",
  "middleware.ts",
];

/**
 * Pre-existing product-data calls made outside `src/lib/api/`. Grandfathered so
 * the rule can be turned on today rather than blocked on a refactor — but the
 * list is the backlog, and nothing new gets added to it.
 */
const SUPABASE_LEGACY_EXCEPTIONS = [
  "src/app/admin/actions.ts",
  // Bracketed dynamic segments are glob character classes, so these are matched by shape.
  "src/app/admin/*/*/edit/actions.ts",
  "src/lib/report-email.ts",
];

const eslintConfig = [
  ...nextVitals,
  {
    ignores: [".next/**", ".vercel/**", "node_modules/**", "public/fonts/**"],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@supabase/*", "@/lib/supabase", "@/lib/supabase/*"],
              message:
                "Product data access goes through src/lib/api/ (AGENTS.md rule #1). If this really is auth or account plumbing, add the file to SUPABASE_AUTH_PLUMBING in eslint.config.mjs.",
            },
            {
              group: ["three", "three/*", "@react-three/*"],
              message:
                "The 3D layer was removed and its dependencies uninstalled. Re-introducing it needs approval (AGENTS.md, Things to ask about before doing).",
            },
            {
              group: ["framer-motion", "gsap", "gsap/*", "lenis", "lenis/*"],
              message:
                "The animation and smooth-scroll layers were removed. Routine entrance/scroll motion is prohibited during the overhaul; re-introducing a library needs approval.",
            },
          ],
        },
      ],
    },
  },
  {
    // The service layer, auth guards, and middleware are the documented callers.
    files: [...SUPABASE_AUTH_PLUMBING, ...SUPABASE_LEGACY_EXCEPTIONS],
    rules: { "no-restricted-imports": "off" },
  },
  {
    /**
     * Issue #6: the auth guards must not be able to see the active view.
     *
     * The view is a cookie the user controls. If a guard could read it,
     * every `requireRole` call in the app would be bypassable by editing that
     * cookie. Keeping the two in separate modules makes that property something
     * a linter can check instead of something a reviewer has to notice.
     *
     * This block must come **after** the SUPABASE_AUTH_PLUMBING override above,
     * which turns `no-restricted-imports` off for this file entirely. Flat config
     * takes the last matching definition, and the Supabase patterns are
     * deliberately absent here so that exemption survives.
     */
    files: ["src/lib/auth-guards.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/active-view"],
              message:
                "The active view is a presentation preference. Authorizing on it would make every guard bypassable by editing a cookie (issue #6).",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
