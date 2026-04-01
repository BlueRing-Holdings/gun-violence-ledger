import Link from "next/link";

function GladiusWordmark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Gladius"
    >
      <g transform="translate(4, 2) scale(0.5)">
        <path d="M20 8 L23 52 L20 72 L17 52 Z" fill="currentColor" opacity="0.95" />
        <rect x="8" y="22" width="24" height="2.5" rx="1" fill="currentColor" opacity="0.85" />
        <rect x="18" y="8" width="4" height="14" rx="1" fill="currentColor" opacity="0.7" />
        <circle cx="20" cy="6" r="3.5" fill="currentColor" opacity="0.8" />
      </g>
      <text
        x="52" y="30"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="22"
        fontWeight="normal"
        letterSpacing="6"
        fill="currentColor"
        opacity="0.95"
      >GLADIUS</text>
      <line x1="52" y1="36" x2="258" y2="36" stroke="currentColor" strokeWidth="0.75" opacity="0.3" />
      <text
        x="52" y="46"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="8"
        letterSpacing="2.5"
        fill="currentColor"
        opacity="0.45"
      >A RECORD OF FIREARM DEATHS WORLDWIDE</text>
    </svg>
  );
}

export default function Header() {
  return (
    <header className="w-full px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="https://cathedral-ledger.vercel.app" target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/no-guidance-logo.svg"
            alt="No Guidance"
            className="h-8 opacity-70 hover:opacity-100 transition-opacity"
          />
        </Link>
        <span className="text-[#2a2008] select-none">|</span>
        <Link href="/" style={{ color: "#b8860b" }}>
          <GladiusWordmark className="h-8 hover:opacity-80 transition-opacity" />
        </Link>
      </div>
      <nav className="hidden sm:flex gap-6 text-sm text-[#6b5a45]">
        <Link href="/" className="hover:text-[#b8860b] transition-colors">
          Home
        </Link>
        <Link href="/world" className="hover:text-[#b8860b] transition-colors">
          World
        </Link>
        <Link href="/united-states" className="hover:text-[#b8860b] transition-colors">
          United States
        </Link>
        <Link href="/conflicts" className="hover:text-[#b8860b] transition-colors">
          Conflicts
        </Link>
        <Link href="/cost" className="hover:text-[#b8860b] transition-colors">
          Cost
        </Link>
        <Link href="/policy" className="hover:text-[#b8860b] transition-colors">
          Policy
        </Link>
        <Link href="/verify" className="hover:text-[#b8860b] transition-colors">
          Verify
        </Link>
      </nav>
    </header>
  );
}
