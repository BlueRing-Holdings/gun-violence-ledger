export default function CathedralArch({ position }: { position: "top" | "bottom" }) {
  return (
    <div
      className={`w-full ${position === "bottom" ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="w-full h-16 sm:h-20"
        style={{ color: "#b8860b", opacity: 0.15 }}
      >
        <path
          d="M0,0 C150,80 350,120 600,120 C850,120 1050,80 1200,0 L1200,0 L0,0 Z"
          fill="currentColor"
        />
        <rect x="80" y="0" width="8" height="120" fill="currentColor" opacity="0.3" />
        <rect x="1112" y="0" width="8" height="120" fill="currentColor" opacity="0.3" />
        <rect x="200" y="0" width="5" height="90" fill="currentColor" opacity="0.2" />
        <rect x="995" y="0" width="5" height="90" fill="currentColor" opacity="0.2" />
      </svg>
    </div>
  );
}
