import Image from "next/image";

export function TrueHookLogo({
  badge = "ADMIN",
  className = "",
}: {
  badge?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center gap-2.5 ${className}`}>
      <Image
        src="/small-logo-black.png"
        alt="TrueHook Logo"
        width={32}
        height={32}
        className="h-8 w-8 object-contain rounded-md"
        priority
      />
      <span className="text-xl font-semibold tracking-tight text-[#f2f2e8]">
        TrueHook
      </span>
      {badge && (
        <span className="rounded bg-[#ea5c47]/20 border border-[#ea5c47]/40 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-[#ff8a7a] uppercase">
          {badge}
        </span>
      )}
    </div>
  );
}
