export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="rounded-sm"
      >
        <rect width="32" height="32" fill="#1A2744" />
        <path
          d="M8 24C8 15.1634 15.1634 8 24 8"
          stroke="#C8963E"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-serif font-bold text-primary text-xl tracking-tight">
        IQ<span className="text-accent">meet</span>EQ
      </span>
    </div>
  );
}
