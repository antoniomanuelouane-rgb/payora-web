export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="payora-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0DF28F" />
          <stop offset="1" stopColor="#00A862" />
        </linearGradient>
      </defs>
      <path d="M8 4h14a11 11 0 0 1 0 22h-6v10H8z" fill="url(#payora-g)" />
      <path d="M16 12h6a3 3 0 0 1 0 6h-6z" fill="#050505" />
      <path d="M16 26l8-8v8z" fill="#050505" opacity="0.35" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark />
      <span className="font-display text-xl font-extrabold tracking-[0.12em] text-topbar-foreground">PAYORA</span>
    </span>
  );
}
