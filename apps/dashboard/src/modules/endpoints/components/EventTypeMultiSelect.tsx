"use client";

import {
  AlertCircle,
  Check,
  ChevronDown,
  Loader2,
  Plus,
  Radio,
  Search,
  Tag,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateEventTypeMutation } from "@/modules/event-types/hooks/useEventTypes";
import type { EventType } from "@/modules/event-types/types";

interface EventTypeMultiSelectProps {
  applicationId?: string;
  eventTypes: EventType[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}

export function EventTypeMultiSelect({
  applicationId = "",
  eventTypes = [],
  selectedIds = [],
  onChange,
  disabled = false,
}: EventTypeMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeDescription, setNewTypeDescription] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [localCreatedTypes, setLocalCreatedTypes] = useState<EventType[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const createNameInputRef = useRef<HTMLInputElement>(null);

  const createMutation = useCreateEventTypeMutation(applicationId);

  // Combine parent eventTypes with any created in this session to guarantee immediate visibility
  const combinedEventTypes = [
    ...localCreatedTypes.filter(
      (lt) => !eventTypes.some((et) => et.id === lt.id),
    ),
    ...eventTypes,
  ];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setIsCreating(false);
        setCreateError(null);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus input when view changes
  useEffect(() => {
    if (isOpen && !isCreating) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else if (isOpen && isCreating) {
      setTimeout(() => {
        createNameInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm("");
      setIsCreating(false);
      setCreateError(null);
    }
  }, [isOpen, isCreating]);

  const handleToggle = (id: string) => {
    if (disabled) return;
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(selectedIds.filter((item) => item !== id));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange([]);
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(combinedEventTypes.map((et) => et.id));
  };

  const handleStartCreate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNewTypeName(searchTerm.trim());
    setNewTypeDescription("");
    setCreateError(null);
    setIsCreating(true);
  };

  const handleCancelCreate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCreating(false);
    setCreateError(null);
  };

  const handleCreate = async () => {
    setCreateError(null);

    const name = newTypeName.trim();
    if (!name) {
      setCreateError("Event type name is required.");
      return;
    }

    // Auto-generate a valid description if empty or too short (< 10 chars is backend requirement)
    let description = newTypeDescription.trim();
    if (!description || description.length < 10) {
      description = `Webhook event type schema for ${name}`;
    }

    try {
      const created = await createMutation.mutateAsync({
        name,
        description,
      });

      if (created && created.id) {
        // 1. Immediately store in local state so the tag renders with name
        setLocalCreatedTypes((prev) => [created, ...prev]);

        // 2. Add to selected IDs
        if (!selectedIds.includes(created.id)) {
          onChange([...selectedIds, created.id]);
        }

        // 3. Reset form and return to select view
        setIsCreating(false);
        setSearchTerm("");
        setNewTypeName("");
        setNewTypeDescription("");
      }
    } catch (err: unknown) {
      const errorObj = err as {
        message?: string;
        errors?: { name?: string[]; description?: string[]; _form?: string[] };
      };
      const msg =
        errorObj?.errors?._form?.[0] ||
        errorObj?.errors?.name?.[0] ||
        errorObj?.errors?.description?.[0] ||
        errorObj?.message ||
        "Failed to create event type. Please check name and try again.";
      setCreateError(msg);
    }
  };

  const filteredEventTypes = combinedEventTypes.filter((et) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      et.name.toLowerCase().includes(q) ||
      (et.description && et.description.toLowerCase().includes(q))
    );
  });

  const selectedEventTypes = combinedEventTypes.filter((et) =>
    selectedIds.includes(et.id),
  );

  const exactMatchExists = combinedEventTypes.some(
    (et) => et.name.toLowerCase() === searchTerm.trim().toLowerCase(),
  );

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Select Box / Trigger */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          } else if (e.key === "Escape") {
            setIsOpen(false);
            setIsCreating(false);
          }
        }}
        className={`min-h-[42px] w-full rounded-xl border bg-canvas p-1.5 transition-all flex items-center justify-between gap-2 cursor-pointer shadow-xs ${
          isOpen
            ? "border-primary ring-1 ring-primary"
            : "border-input hover:border-primary/50"
        } ${disabled ? "opacity-60 cursor-not-allowed bg-secondary/30" : ""}`}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {selectedEventTypes.length === 0 ? (
            <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground select-none">
              <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>Select event types (no events sent if empty)</span>
            </div>
          ) : (
            selectedEventTypes.map((et) => (
              <span
                key={et.id}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary shadow-2xs animate-in fade-in-50"
              >
                <span>{et.name}</span>
                <button
                  type="button"
                  onClick={(e) => handleRemove(e, et.id)}
                  disabled={disabled}
                  aria-label={`Remove ${et.name}`}
                  className="rounded p-0.5 hover:bg-primary/20 text-primary transition-colors cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Right action indicators */}
        <div className="flex items-center gap-1 shrink-0 px-1 text-muted-foreground">
          {selectedIds.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClearAll}
              className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Clear all selected"
              aria-label="Clear all selected"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-primary" : "text-muted-foreground"
            }`}
          />
        </div>
      </div>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full rounded-xl border border-border bg-popover shadow-xl animate-in fade-in-50 zoom-in-98 overflow-hidden">
          {isCreating ? (
            /* Inline Create Event Type Form - NOTE: Uses div, NOT form, to prevent parent form submission */
            <div
              onClick={(e) => e.stopPropagation()}
              className="p-3.5 space-y-3 bg-canvas"
            >
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5 text-primary" />
                  <span>Create New Event Type</span>
                </span>
                <button
                  type="button"
                  onClick={handleCancelCreate}
                  className="text-[11px] text-muted-foreground hover:text-foreground font-medium"
                >
                  Back to list
                </button>
              </div>

              {createError && (
                <div className="flex items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/10 p-2 text-[11px] text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div className="space-y-1">
                <Label
                  htmlFor="inline-event-type-name"
                  className="text-[11px] font-semibold text-foreground"
                >
                  Event Type Identifier <span className="text-destructive">*</span>
                </Label>
                <Input
                  ref={createNameInputRef}
                  id="inline-event-type-name"
                  type="text"
                  placeholder="e.g. order.created, user.signup"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCreate();
                    }
                  }}
                  disabled={createMutation.isPending}
                  className="h-8 text-xs font-mono bg-canvas"
                />
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="inline-event-type-desc"
                  className="text-[11px] font-semibold text-foreground"
                >
                  Description{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="inline-event-type-desc"
                  type="text"
                  placeholder="e.g. Dispatched whenever a user creates an order"
                  value={newTypeDescription}
                  onChange={(e) => setNewTypeDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCreate();
                    }
                  }}
                  disabled={createMutation.isPending}
                  className="h-8 text-xs bg-canvas"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancelCreate}
                  disabled={createMutation.isPending}
                  className="h-7 text-xs bg-canvas"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreate}
                  disabled={createMutation.isPending || !newTypeName.trim()}
                  className="h-7 gap-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3" />
                      <span>Create & Select</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Options & Search View */
            <>
              {/* Search Box */}
              <div className="p-2 border-b border-border bg-secondary/20">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search event types..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchTerm.trim() && !exactMatchExists) {
                        e.preventDefault();
                        e.stopPropagation();
                        setNewTypeName(searchTerm.trim());
                        setNewTypeDescription("");
                        setIsCreating(true);
                      }
                    }}
                    className="w-full rounded-lg border border-input bg-canvas py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Quick Select Actions */}
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-secondary/10 text-[11px]">
                <span className="text-muted-foreground">
                  {selectedIds.length} of {combinedEventTypes.length} selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-primary hover:underline font-medium"
                  >
                    Select all
                  </button>
                  <span className="text-muted-foreground">•</span>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-muted-foreground hover:text-foreground font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Options List */}
              <div className="max-h-48 overflow-y-auto p-1.5 space-y-1">
                {filteredEventTypes.length === 0 ? (
                  <div className="p-3 text-center text-xs text-muted-foreground">
                    No event types found matching &quot;{searchTerm}&quot;
                  </div>
                ) : (
                  filteredEventTypes.map((et) => {
                    const isSelected = selectedIds.includes(et.id);
                    return (
                      <div
                        key={et.id}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleToggle(et.id)}
                        className={`flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-secondary/60 text-foreground"
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input bg-canvas"
                          }`}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3 stroke-[2.5]" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{et.name}</span>
                          </div>
                          {et.description && (
                            <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">
                              {et.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Create Option in Dropdown Footer */}
              {Boolean(applicationId) && (
                <div className="p-1.5 border-t border-border bg-secondary/15">
                  <button
                    type="button"
                    onClick={handleStartCreate}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-primary/30 bg-primary/5 py-1.5 px-3 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>
                      {searchTerm.trim() && !exactMatchExists
                        ? `Create "${searchTerm.trim()}"`
                        : "Create new event type"}
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
