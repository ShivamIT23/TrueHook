import * as React from "react"
import { cn } from "../../lib/utils"
import { CheckIcon, Loader2Icon } from "lucide-react"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

function StatusBadge({
  state,
  className,
}: {
  state: "done" | "loading"
  className?: string
}) {
  if (state === "loading") {
    return (
      <Spinner
        data-slot="status-spinner"
        className={cn("size-4 animate-spin text-muted-foreground", className)}
      />
    )
  }

  return (
    <span
      data-slot="status-badge"
      className={cn(
        "flex size-4 shrink-0 items-center justify-center text-success",
        className
      )}
    >
      <CheckIcon className="size-4 stroke-[2.5]" aria-hidden="true" />
    </span>
  )
}

export { Spinner, StatusBadge }
