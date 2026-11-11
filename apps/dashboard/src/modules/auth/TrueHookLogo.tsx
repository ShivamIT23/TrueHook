import Image from "next/image";

export function TrueHookLogo({
  badge,
  className = "",
  theme: _theme,
}: {
  badge?: string;
  className?: string;
  theme?: "light" | "dark";
}) {
  return (
    <div className={`flex items-center justify-center gap-2.5 ${className}`}>
      <Image
        src="/logo1.png"
        alt="TrueHook Logo"
        width={1000}
        height={400}
        className="h-11 w-auto object-contain rounded-md"
        priority
      />
      {badge && (
        <span className="rounded bg-destructive/20 border border-destructive/40 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-destructive uppercase">
          {badge}
        </span>
      )}
    </div>
  );
}
