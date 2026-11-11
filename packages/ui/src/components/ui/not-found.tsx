"use client";

import * as React from "react";
import { cn } from "cn";

export interface NotFoundAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
}

export interface NotFoundProps extends React.ComponentProps<"div"> {
  statusCode?: string;
  title?: string;
  description?: string;
  primaryAction?: NotFoundAction;
  initialConnected?: boolean;
}

export function NotFound({
  statusCode = "404",
  description = "The page you are looking for might have been unplugged, moved, or is temporarily disconnected from our webhook network.",
  primaryAction = {
    label: "Go Home",
    href: "/",
  },
  initialConnected = false,
  className,
  ...props
}: NotFoundProps) {
  const [isConnected, setIsConnected] = React.useState(initialConnected);
  const [sparkTick, setSparkTick] = React.useState(0);

  // Spark jitter effect when disconnected
  React.useEffect(() => {
    if (isConnected) return;
    const interval = setInterval(() => {
      setSparkTick((prev) => (prev + 1) % 4);
    }, 400);
    return () => clearInterval(interval);
  }, [isConnected]);

  return (
    <div
      className={cn(
        "relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-8 transition-all duration-700 select-none",
        isConnected
          ? "bg-[#ffffff] text-[#0a2444]"
          : "bg-[#e2e7ec] text-[#334155]",
        className
      )}
      style={{
        filter: isConnected
          ? "brightness(1) contrast(1)"
          : "brightness(0.92) contrast(0.96)",
      }}
      {...props}
    >
      {/* Dull State Ambient Overlay (subtle room-dimming, not black!) */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-700",
          isConnected
            ? "opacity-0"
            : "opacity-40 bg-radial from-transparent via-[#94a3b8]/20 to-[#64748b]/30"
        )}
      />

      {/* Decorative Soft Sky-Blue Organic Blobs (Matches User Reference Image) */}
      <div
        className={cn(
          "pointer-events-none absolute left-0 bottom-12 transition-all duration-700",
          isConnected ? "opacity-100" : "opacity-60 grayscale-[30%]"
        )}
      >
        <svg
          width="260"
          height="480"
          viewBox="0 0 260 480"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-40 120 C 40 100, 110 180, 80 280 C 50 380, 130 420, 100 480 L -40 480 Z"
            fill="#e0effe"
          />
        </svg>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute right-0 bottom-0 transition-all duration-700",
          isConnected ? "opacity-100" : "opacity-60 grayscale-[30%]"
        )}
      >
        <svg
          width="280"
          height="320"
          viewBox="0 0 280 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 60 320 C 90 220, 200 240, 220 160 C 240 80, 280 40, 280 320 Z"
            fill="#e0effe"
          />
        </svg>
      </div>

      {/* Main Content Container (Aligned exactly with reference screenshot) */}
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center text-center">
        {/* Giant Bold "404" Heading */}
        <h1
          className={cn(
            "text-[100px] sm:text-[140px] md:text-[170px] font-black leading-none tracking-tight transition-colors duration-700",
            isConnected ? "text-[#082645]" : "text-[#2b415a]"
          )}
        >
          {statusCode}
        </h1>

        {/* Descriptive Text */}
        <p
          className={cn(
            "mt-4 max-w-xl text-xs sm:text-sm leading-relaxed transition-colors duration-500",
            isConnected ? "text-[#475569]" : "text-[#58677c]"
          )}
        >
          {description}
        </p>

        {/* Action Button: "Go Home" */}
        <div className="mt-7">
          {primaryAction &&
            (primaryAction.href ? (
              <a
                href={primaryAction.href}
                className={cn(
                  "inline-flex h-11 items-center justify-center rounded-md px-9 text-sm font-semibold tracking-wide transition-all duration-300 shadow-sm active:scale-95",
                  isConnected
                    ? "bg-[#082645] text-white hover:bg-[#0f345c] hover:shadow-md"
                    : "bg-[#1c3552] text-white hover:bg-[#28496e]"
                )}
              >
                {primaryAction.label}
              </a>
            ) : (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className={cn(
                  "inline-flex h-11 items-center justify-center rounded-md px-9 text-sm font-semibold tracking-wide transition-all duration-300 shadow-sm active:scale-95",
                  isConnected
                    ? "bg-[#082645] text-white hover:bg-[#0f345c] hover:shadow-md"
                    : "bg-[#1c3552] text-white hover:bg-[#28496e]"
                )}
              >
                {primaryAction.label}
              </button>
            ))}
        </div>

        {/* Interactive Cable, Plug & Socket Illustration */}
        <div
          onClick={() => setIsConnected((prev) => !prev)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsConnected((prev) => !prev);
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={
            isConnected
              ? "Disconnect power plug"
              : "Connect power plug to light up page"
          }
          className="group relative mt-10 flex h-48 w-full max-w-4xl cursor-pointer items-center justify-center overflow-visible focus:outline-none"
        >
          {/* Subtle Hover / Click Hint Pill */}
          <div
            className={cn(
              "absolute -top-4 rounded-full px-3 py-0.5 text-[11px] font-medium transition-all duration-500",
              isConnected
                ? "bg-slate-200/80 text-slate-700 opacity-0 group-hover:opacity-100"
                : "bg-blue-100/90 text-blue-900 opacity-90 shadow-sm"
            )}
          >
            {isConnected ? "Click to unplug" : "⚡ Click plug to connect & light up page"}
          </div>

          <svg
            className="h-full w-full overflow-visible"
            viewBox="0 0 1000 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Interactive Power Socket and Plug</title>

            {/* Left Cable (Smooth bezier flowing from left edge) */}
            <path
              d={
                isConnected
                  ? "M 0 120 C 180 120, 260 165, 380 145 C 440 135, 470 110, 485 100"
                  : "M 0 120 C 180 120, 240 165, 350 145 C 380 140, 400 130, 410 125"
              }
              stroke="#64748b"
              strokeWidth="2.2"
              strokeLinecap="round"
              className="transition-all duration-700"
            />

            {/* Right Cable (Smooth bezier flowing from right edge) */}
            <path
              d={
                isConnected
                  ? "M 1000 140 C 820 140, 740 175, 620 150 C 560 135, 530 110, 515 100"
                  : "M 1000 140 C 820 140, 760 175, 650 150 C 620 140, 600 130, 590 125"
              }
              stroke="#64748b"
              strokeWidth="2.2"
              strokeLinecap="round"
              className="transition-all duration-700"
            />

            {/* Left Plug (Moves from 410 to 485 when connected) */}
            <g
              transform={
                isConnected
                  ? "translate(485, 100) rotate(0)"
                  : "translate(410, 125) rotate(-22)"
              }
              className="transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            >
              {/* Plug Handle (Cute rounded cylinder matching Image 1) */}
              <path
                d="M -24 -11 C -16 -11, -8 -13, 0 -8 L 0 8 C -8 13, -16 11, -24 11 Z"
                fill="#475569"
                stroke="#334155"
                strokeWidth="1.2"
              />
              {/* Metal Prongs */}
              <rect
                x="0"
                y="-5.5"
                width={isConnected ? "3" : "12"}
                height="3"
                rx="0.8"
                fill="#94a3b8"
                className="transition-all duration-500"
              />
              <rect
                x="0"
                y="2.5"
                width={isConnected ? "3" : "12"}
                height="3"
                rx="0.8"
                fill="#94a3b8"
                className="transition-all duration-500"
              />
            </g>

            {/* Right Socket (Moves from 590 to 515 when connected) */}
            <g
              transform={
                isConnected
                  ? "translate(486, 100) rotate(0)"
                  : "translate(590, 125) rotate(22)"
              }
              className="transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            >
              {/* Socket Receptacle Body (Matching Image 1) */}
              <path
                d="M 24 -12 C 16 -12, 8 -14, 0 -9 L 0 9 C 8 14, 16 12, 24 12 Z"
                fill="#334155"
                stroke="#1e293b"
                strokeWidth="1.2"
              />
              {/* Socket Slots */}
              <rect
                x="1"
                y="-6"
                width="2"
                height="3.5"
                rx="0.5"
                fill="#0f172a"
              />
              <rect
                x="1"
                y="2.5"
                width="2"
                height="3.5"
                rx="0.5"
                fill="#0f172a"
              />
            </g>

            {/* Connecting Sparkle Flash */}
            {isConnected && (
              <g className="transition-opacity duration-500">
                <circle
                  cx="486"
                  cy="100"
                  r="20"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  className="animate-ping opacity-70"
                />
                <circle
                  cx="486"
                  cy="100"
                  r="6"
                  fill="#60a5fa"
                  className="opacity-90"
                />
              </g>
            )}

            {/* Disconnected Electric Sparks (Vibrant Blue Lightning matching Image 1) */}
            {!isConnected && (
              <g className="transition-opacity duration-300">
                {/* Left Sparks Around Plug */}
                <path
                  d="M 405 98 L 414 104 L 408 107 L 418 114 L 410 112 L 414 118 Z"
                  fill="#0ea5e9"
                  className={cn(
                    "transition-transform duration-300",
                    sparkTick % 2 === 0 ? "scale-110 opacity-100" : "scale-85 opacity-40"
                  )}
                />
                <path
                  d="M 418 136 L 410 142 L 416 144 L 409 152 L 418 147 L 414 142 Z"
                  fill="#2563eb"
                  className={cn(
                    "transition-transform duration-300",
                    sparkTick % 2 === 1 ? "scale-110 opacity-100" : "scale-80 opacity-50"
                  )}
                />

                {/* Right Sparks Around Socket */}
                <path
                  d="M 590 98 L 581 104 L 587 107 L 577 114 L 585 112 L 581 118 Z"
                  fill="#0ea5e9"
                  className={cn(
                    "transition-transform duration-300",
                    sparkTick % 2 === 1 ? "scale-110 opacity-100" : "scale-85 opacity-40"
                  )}
                />
                <path
                  d="M 578 136 L 586 142 L 580 144 L 587 152 L 578 147 L 582 142 Z"
                  fill="#2563eb"
                  className={cn(
                    "transition-transform duration-300",
                    sparkTick % 2 === 0 ? "scale-110 opacity-100" : "scale-80 opacity-50"
                  )}
                />

                {/* Center Sparks between the gap */}
                <circle
                  cx="500"
                  cy="125"
                  r={sparkTick % 2 === 0 ? 3 : 1.5}
                  fill="#38bdf8"
                  className="opacity-80"
                />
                <circle
                  cx="480"
                  cy="115"
                  r={sparkTick % 2 === 1 ? 2.5 : 1}
                  fill="#60a5fa"
                  className="opacity-70"
                />
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
