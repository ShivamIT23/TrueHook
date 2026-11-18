import * as React from "react";
import { cn } from "cn";

export interface XButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Custom width in pixels, CSS unit, or percentage */
  width?: string | number;
  /** Custom height in pixels, CSS unit, or percentage */
  height?: string | number;
  /** Main color: text color normally, and background color on hover */
  mainColor?: string;
  /** Main color alias (supports lowercase prop name) */
  maincolor?: string;
  /** Secondary color: text color on hover */
  secondaryColor?: string;
  /** Secondary color alias (supports lowercase prop name) */
  secondarycolor?: string;
  /** Rotate effect target on hover: "icon" (default), "button" (rotates button itself), "both", or "none" */
  rotateEffect?: "icon" | "button" | "both" | "none";
  /** Shorthand to rotate the entire button 180 degrees on hover */
  rotateSelf?: boolean;
  /** Border style: "subtle" (default), "solid", or "none" */
  borderStyle?: "subtle" | "solid" | "none";
}

export const XButton = React.forwardRef<HTMLButtonElement, XButtonProps>(
  (
    {
      className,
      style,
      width,
      height,
      mainColor,
      maincolor,
      secondaryColor,
      secondarycolor,
      rotateEffect = "icon",
      rotateSelf = false,
      borderStyle = "subtle",
      onMouseEnter,
      onMouseLeave,
      children,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const resolvedMain = mainColor || maincolor || "#D9541E";
    const resolvedSecondary = secondaryColor || secondarycolor || "#F3EEE3";

    const shouldRotateIcon =
      rotateEffect === "icon" || rotateEffect === "both";
    const shouldRotateSelf =
      rotateSelf || rotateEffect === "button" || rotateEffect === "both";

    const customStyle: React.CSSProperties = {
      ...style,
      ...(width !== undefined
        ? { width: typeof width === "number" ? `${width}px` : width }
        : {}),
      ...(height !== undefined
        ? { height: typeof height === "number" ? `${height}px` : height }
        : {}),
      color: isHovered ? resolvedSecondary : resolvedMain,
      backgroundColor: isHovered ? resolvedMain : "transparent",
      borderColor:
        borderStyle === "none"
          ? "transparent"
          : borderStyle === "solid"
          ? resolvedMain
          : isHovered
          ? resolvedMain
          : "var(--border, rgba(17, 17, 17, 0.15))",
      transform:
        shouldRotateSelf && isHovered ? "rotate(180deg)" : undefined,
      "--xbtn-main": resolvedMain,
      "--xbtn-sec": resolvedSecondary,
    } as React.CSSProperties;

    return (
      <button
        ref={ref}
        type="button"
        style={customStyle}
        onMouseEnter={(e) => {
          setIsHovered(true);
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          setIsHovered(false);
          onMouseLeave?.(e);
        }}
        className={cn(
          "xbutton-root group/xbtn inline-flex items-center justify-center gap-1.5 font-medium text-xs whitespace-nowrap outline-none select-none cursor-pointer transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
          width && height ? "p-0" : "px-3 py-1.5",
          borderStyle === "none" ? "border-0" : "border",
          shouldRotateIcon &&
            "[&_svg]:transition-transform [&_svg]:duration-300 [&_svg]:shrink-0 hover:[&_svg]:rotate-180 group-hover/xbtn:[&_svg]:rotate-180",
          shouldRotateSelf &&
            "transition-transform duration-300 hover:rotate-180",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

XButton.displayName = "XButton";
