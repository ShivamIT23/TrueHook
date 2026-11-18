"use client";

import {
  type ComponentProps,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";
import {
  CheckIcon,
  CircleAlertIcon,
  InfoIcon,
  Loader2Icon,
  TriangleAlertIcon,
} from "lucide-react";
import { cn } from "../../lib/utils";

const EVENT = "kobra:toast";
const DISMISS = "kobra:toast-dismiss";
const LIFETIME = 2800;
const DETAIL_LIFETIME = 4500;
const ACTION_LIFETIME = 6000;

export type ToastSide = "top" | "bottom";
export type ToastAlign = "start" | "center" | "end" | "left" | "right";
export type ToastPosition = `${ToastSide}-${ToastAlign}`;

export type ToastState = "pending" | "success" | "error" | "warning" | "info";
export type ToastAction = { label: string; run: () => void };
export type ToastInput = {
  id?: string;
  message: string;
  description?: string;
  state?: ToastState;
  action?: ToastAction;
  lifetime?: number;
};
export type Note = ToastInput & { id: string };

let nextId = 0;

export function toast(input: string | ToastInput) {
  const detail = typeof input === "string" ? { message: input } : input;
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(EVENT, {
      detail: { ...detail, id: detail.id ?? `toast-${++nextId}` },
    }),
  );
}

export function dismissToast(id: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(DISMISS, { detail: id }));
}

function dismissDelay(
  state: ToastState | undefined,
  hasAction: boolean,
  lifetime?: number,
  hasDetail = false,
): number | null {
  if (state === "pending") return null;
  if (lifetime !== undefined) return lifetime;
  return hasAction ? ACTION_LIFETIME : hasDetail ? DETAIL_LIFETIME : LIFETIME;
}

function ToastGlyph({ state }: { state: ToastState }) {
  switch (state) {
    case "pending":
      return (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center">
          <Loader2Icon
            className="h-4 w-4 animate-spin text-muted-foreground"
            aria-hidden="true"
            stroke="#111111a6"
          />
        </span>
      );
    case "success":
      return (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2D6A4F]/15 text-[#2D6A4F]">
          <CheckIcon className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" stroke="#2D6A4F" />
        </span>
      );
    case "error":
      return (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D9541E]/15 text-[#D9541E]">
          <CircleAlertIcon className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" stroke="#D9541E" />
        </span>
      );
    case "warning":
      return (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center text-warning bg-[#C38B22]/15 text-[#C38B22]">
          <TriangleAlertIcon className="h-4 w-4 stroke-[2.2]" aria-hidden="true" stroke="#C38B22" />
        </span>
      );
    case "info":
      return (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[#124060] bg-[#124060]/15">
          <InfoIcon className="h-4 w-4 stroke-[2.2]" aria-hidden="true" stroke="#124060" />
        </span>
      );
    default:
      return null;
  }
}

function ToastPill({
  state,
  message,
  description,
  action,
  onAction,
  onDismiss,
  behind,
}: {
  state?: ToastState;
  message: string;
  description?: string;
  action?: ToastAction;
  onAction: () => void;
  onDismiss: () => void;
  behind: boolean;
}) {
  const hasDescription = Boolean(description);

  return (
    <motion.div
      data-slot="toast"
      data-state={state}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.5, bottom: 0.2 }}
      onDragEnd={(_, info) => {
        if (info.offset.y < -30 || Math.abs(info.velocity.y) > 300) {
          onDismiss();
        }
      }}
      className={cn(
        "toast-pill relative flex items-center shadow-lg border backdrop-blur-md transition-all select-none",
        behind
          ? "pointer-events-none opacity-80"
          : "pointer-events-auto cursor-grab active:cursor-grabbing",
        hasDescription
          ? "rounded-2xl p-4 flex-col items-start gap-1.5 w-auto min-w-[320px] max-w-md"
          : "rounded-full px-4 py-2 gap-2.5 max-w-lg",
      )}
      style={{
        backgroundColor: "var(--card)",
        color: "var(--card-foreground)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-center gap-2.5 w-full">
        {state && (
          <div className="flex shrink-0 items-center">
            <ToastGlyph state={state} />
          </div>
        )}

        <div className="flex flex-1 flex-col overflow-hidden justify-center min-w-0">
          <span
            className={cn(
              "truncate text-foreground",
              hasDescription
                ? "text-sm font-semibold leading-tight"
                : "text-sm font-medium",
            )}
          >
            {message}
          </span>
          {hasDescription && (
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed truncate">
              {description}
            </p>
          )}
        </div>

        {action && (
          <button
            type="button"
            onClick={onAction}
            className="shrink-0 h-6.5 rounded-full bg-foreground text-background hover:opacity-90 px-3 text-xs font-semibold cursor-pointer transition-opacity"
          >
            {action.label}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function ToastStack({
  cards,
}: {
  cards: { id: string; render: (behind: boolean) => ReactNode }[];
}) {
  return (
    <div
      data-slot="toasts"
      aria-live="polite"
      className="toast-container fixed inset-x-0 top-5 z-[9999] pointer-events-none flex flex-col items-center justify-start gap-2 px-4"
      style={{
        position: "fixed",
        top: "1.25rem",
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <AnimatePresence mode="popLayout">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: -16,
              scale: 0.95,
              transition: { duration: 0.15 },
            }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className="flex items-center justify-center pointer-events-auto"
          >
            {card.render(index > 0)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function subscribeVisibility(onChange: () => void) {
  if (typeof document === "undefined") return () => {};
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

function useDocumentHidden() {
  return useSyncExternalStore(
    subscribeVisibility,
    () => (typeof document !== "undefined" ? document.hidden : false),
    () => false,
  );
}

export function Toasts({
  position = "top-center",
  className,
}: {
  position?: ToastPosition;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const hidden = useDocumentHidden();
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    setMounted(true);
  }, []);

  const removeNote = useCallback((id: string) => {
    const existing = timeoutsRef.current.get(id);
    if (existing) {
      clearTimeout(existing);
      timeoutsRef.current.delete(id);
    }
    setNotes((current) => current.filter((note) => note.id !== id));
  }, []);

  useEffect(() => {
    const onToast = (event: Event) => {
      const note = (event as CustomEvent<Note>).detail;

      setNotes((current) => {
        const index = current.findIndex((item) => item.id === note.id);
        return index === -1
          ? [note, ...current]
          : current.map((item, at) => (at === index ? note : item));
      });

      const delay = dismissDelay(
        note.state,
        note.action !== undefined,
        note.lifetime,
        Boolean(note.description),
      );

      if (delay !== null) {
        const existing = timeoutsRef.current.get(note.id);
        if (existing) clearTimeout(existing);

        const timer = setTimeout(() => {
          removeNote(note.id);
        }, delay);
        timeoutsRef.current.set(note.id, timer);
      }
    };

    const onDismiss = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      removeNote(id);
    };

    window.addEventListener(EVENT, onToast);
    window.addEventListener(DISMISS, onDismiss);

    const timeouts = timeoutsRef.current;
    return () => {
      window.removeEventListener(EVENT, onToast);
      window.removeEventListener(DISMISS, onDismiss);
      for (const timer of timeouts.values()) {
        clearTimeout(timer);
      }
      timeouts.clear();
    };
  }, [removeNote]);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <ToastStack
      cards={notes.map((note) => {
        const drop = () => removeNote(note.id);
        const act = () => {
          note.action?.run();
          drop();
        };

        return {
          id: note.id,
          render: (behind) => (
            <ToastPill
              state={note.state}
              message={note.message}
              description={note.description}
              action={note.action}
              onAction={act}
              onDismiss={drop}
              behind={behind}
            />
          ),
        };
      })}
    />,
    document.body,
  );
}
