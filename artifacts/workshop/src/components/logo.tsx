import brandMark from "@assets/Brand_Mark_V20260402A_1775156884285.png";

export function Logo({ className = "", variant = "default" }: { className?: string; variant?: "default" | "white" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={brandMark} alt="IQmeetEQ brand mark" className="h-9 w-auto rounded-sm flex-shrink-0" />
      <span className={`font-serif font-bold text-xl tracking-tight ${variant === "white" ? "text-white" : "text-primary"}`}>
        IQ<span className={variant === "white" ? "text-[#C8963E]" : "text-accent"}>meet</span>EQ
      </span>
    </div>
  );
}
