import Link from "next/link";

function TwitterIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.627l-5.1-6.65-5.856 6.65H2.882l7.73-8.835L1.24 2.25h6.814l4.618 6.1 5.32-6.1zM17.55 19.5h1.828L6.281 4.15H4.28l13.27 15.35z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="2.75"
        y="2.75"
        width="18.5"
        height="18.5"
        rx="4"
        ry="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="12"
        cy="12"
        r="3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[#E2E8F0] bg-white py-8 md:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:gap-12">
          {/* Left: Logo + Copyright */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-black tracking-tight text-[#0F172A]">
              Escento
            </span>
            <span className="text-xs font-medium text-[#94A3B8]">
              &copy; {new Date().getFullYear()}
            </span>
          </div>

          {/* Center: Navigation + Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-[#475569]">
            {/* Main nav */}
            <Link
              href="/musicians"
              className="transition-colors hover:text-[#0055FF]"
            >
              Musicians
            </Link>
            <Link
              href="/gigs"
              className="transition-colors hover:text-[#0055FF]"
            >
              Gigs
            </Link>

            {/* Separator */}
            <div className="h-5 w-px bg-[#E2E8F0]" />

            {/* Legal nav */}
            <Link
              href="/privacy"
              className="text-xs text-[#94A3B8] transition-colors hover:text-[#0055FF]"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-[#94A3B8] transition-colors hover:text-[#0055FF]"
            >
              Terms
            </Link>
            <Link
              href="/compliance"
              className="text-xs text-[#94A3B8] transition-colors hover:text-[#0055FF]"
            >
              Compliance
            </Link>
          </div>

          {/* Right: Social Media Links */}
          <div className="flex items-center gap-5">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#94A3B8] transition-colors hover:text-[#0055FF]"
              aria-label="Twitter"
            >
              <TwitterIcon />
            </a>
            <a
              href="https://www.linkedin.com/company/escento"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#94A3B8] transition-colors hover:text-[#0055FF]"
              aria-label="LinkedIn"
            >
              <LinkedInIcon />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#94A3B8] transition-colors hover:text-[#0055FF]"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#94A3B8] transition-colors hover:text-[#0055FF]"
              aria-label="Facebook"
            >
              <FacebookIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
