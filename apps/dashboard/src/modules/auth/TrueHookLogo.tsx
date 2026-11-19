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
      {/* Light mode logo */}
      <Image
        src="/logo1.png"
        alt="TrueHook Logo"
        width={1000}
        height={400}
        className="h-10 w-auto object-contain rounded-md dark:hidden"
        priority
      />

      {/* Dark mode logo */}
      <div className="hidden dark:flex items-center gap-2">
        <Image
          src="/small-logo-white.png"
          alt="TrueHook Logo"
          width={36}
          height={36}
          className="h-8 w-8 object-contain"
          priority
        />
        <span className="text-lg font-bold tracking-tight text-foreground font-sans">
          TrueHook
        </span>
      </div>

      {badge && (
        <span className="rounded bg-destructive/20 border border-destructive/40 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-destructive uppercase">
          {badge}
        </span>
      )}
    </div>
  );
}
