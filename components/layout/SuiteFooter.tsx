import Link from "next/link";

const suiteLinks = [
  { name: "Cathedral Ledger", url: "https://cathedral-ledger.vercel.app" },
  { name: "Cape Fear Memoria", url: "https://cape-fear-memoria.vercel.app" },
  { name: "The Long Watch", url: "https://longwatch.win" },
  { name: "Council of Witnesses", url: "https://witness-ledger.vercel.app" },
  { name: "Gladius", url: "https://gladiusledger.com", current: true },
];

export default function SuiteFooter() {
  return (
    <footer className="w-full border-t border-[#2a2008] mt-16 pt-8 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs text-[#6b5a45] mb-4 tracking-wider uppercase">
          No Guidance Civic Ledger Suite
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm mb-8">
          {suiteLinks.map((link, i) => (
            <span key={link.name} className="flex items-center gap-4">
              {link.current ? (
                <span className="text-[#b8860b]">{link.name}</span>
              ) : (
                <Link
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6b5a45] hover:text-[#b8860b] transition-colors"
                >
                  {link.name}
                </Link>
              )}
              {i < suiteLinks.length - 1 && (
                <span className="text-[#2a2008]">|</span>
              )}
            </span>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-[#6b5a45]">
          <p>Built and operated by BluRing Holdings LLC — Wilmington, NC</p>
          <p>Powered by BlueTubeTV</p>
        </div>
      </div>
    </footer>
  );
}
