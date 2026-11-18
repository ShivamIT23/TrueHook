"use client";

import {
  AlertCircle,
  Calendar,
  Check,
  Copy,
  KeyRound,
  Loader2,
  Mail,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { updateUserAction } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import type { AuthActionState, AuthUser } from "@/lib/types";

export interface MyAccountManagerProps {
  user: AuthUser | null;
}

const initialUpdateState: AuthActionState = {
  success: false,
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function MyAccountManager({ user }: MyAccountManagerProps) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(user);
  const [copiedId, setCopiedId] = useState(false);

  const [state, formAction, isPending] = useActionState(
    updateUserAction,
    initialUpdateState,
  );

  useEffect(() => {
    if (state.success) {
      toast({
        message: state.message || "Profile updated successfully.",
        state: "success",
      });
      if (state.user) {
        setCurrentUser(state.user);
      }
    } else if (state.message && !state.success) {
      toast({
        message: state.message,
        state: "error",
      });
    }
  }, [state.success, state.message, state.user]);

  const handleCopyId = () => {
    if (!currentUser?.id) return;
    navigator.clipboard.writeText(currentUser.id);
    setCopiedId(true);
    toast({
      message: "Account ID copied to clipboard",
      state: "success",
    });
    setTimeout(() => setCopiedId(false), 2000);
  };

  const displayName =
    currentUser?.name || currentUser?.email?.split("@")[0] || "User";
  const displayEmail = currentUser?.email || "";
  const firstLetter = (displayName[0] || "U").toUpperCase();

  const formErrorMessage =
    state.errors?._form?.[0] || (!state.success && state.message);

  return (
    <div className="relative isolate min-h-[calc(100vh-5rem)] overflow-y-auto">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 pb-32">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <User className="h-4 w-4" />
            <span>Account Profile</span>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            My Account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your personal profile, credentials, and account settings.
          </p>
        </div>

        {/* Profile Summary Card */}
        <Card className="mb-8 rounded-xl border border-border bg-canvas p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {currentUser?.logo_url ? (
                // biome-ignore lint/performance/noImgElement: external user avatar URL
                <img
                  src={currentUser.logo_url}
                  alt={displayName}
                  className="h-16 w-16 rounded-full border-2 border-border object-cover shrink-0 shadow-xs"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-foreground text-xl font-bold text-background shadow-xs select-none">
                  {firstLetter}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground truncate">
                    {displayName}
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {displayEmail}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Member since {formatDate(currentUser?.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Account ID Pill */}
            <div className="rounded-lg border border-border bg-secondary2 p-3 sm:text-right">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground block">
                Account ID
              </span>
              <div className="mt-1 flex items-center gap-1.5 sm:justify-end">
                <span className="font-mono text-xs text-foreground truncate max-w-36">
                  {currentUser?.id || "N/A"}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  title="Copy Account ID"
                >
                  {copiedId ? (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Settings Form */}
        <Card className="rounded-xl border border-border bg-canvas p-6 shadow-xs">
          <CardHeader className="p-0 mb-6">
            <h2 className="text-base font-semibold text-foreground">
              Personal Information
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update your display name, contact email address, and avatar image.
            </p>
          </CardHeader>

          {formErrorMessage && (
            <div
              role="alert"
              className="mb-6 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formErrorMessage}</span>
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="acc-name"
                  className="text-xs font-medium text-foreground"
                >
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="acc-name"
                    name="name"
                    type="text"
                    defaultValue={currentUser?.name || ""}
                    placeholder="Jane Doe"
                    disabled={isPending}
                    className="pl-9 h-9 text-xs bg-canvas border-border text-foreground focus-visible:ring-ring"
                  />
                </div>
                {state.errors?.name && (
                  <p className="text-[11px] text-destructive">
                    {state.errors.name[0]}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="acc-email"
                  className="text-xs font-medium text-foreground"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="acc-email"
                    name="email"
                    type="email"
                    defaultValue={currentUser?.email || ""}
                    placeholder="jane@example.com"
                    disabled={isPending}
                    className="pl-9 h-9 text-xs bg-canvas border-border text-foreground focus-visible:ring-ring"
                  />
                </div>
                {state.errors?.email && (
                  <p className="text-[11px] text-destructive">
                    {state.errors.email[0]}
                  </p>
                )}
              </div>
            </div>

            {/* Avatar URL */}
            <div className="space-y-1.5">
              <Label
                htmlFor="acc-logo"
                className="text-xs font-medium text-foreground"
              >
                Avatar Image URL (Optional)
              </Label>
              <Input
                id="acc-logo"
                name="logo_url"
                type="url"
                defaultValue={currentUser?.logo_url || ""}
                placeholder="https://example.com/avatar.png"
                disabled={isPending}
                className="h-9 text-xs bg-canvas border-border text-foreground focus-visible:ring-ring"
              />
              <p className="text-[11px] text-muted-foreground">
                Enter a publicly accessible HTTPS image URL for your profile
                picture.
              </p>
              {state.errors?.logo_url && (
                <p className="text-[11px] text-destructive">
                  {state.errors.logo_url[0]}
                </p>
              )}
            </div>

            <div className="border-t border-border pt-5">
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Change Password
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Leave blank if you do not want to change your password.
              </p>

              <div className="space-y-1.5 max-w-sm">
                <Label
                  htmlFor="acc-password"
                  className="text-xs font-medium text-foreground"
                >
                  New Password
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="acc-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    disabled={isPending}
                    className="pl-9 h-9 text-xs bg-canvas border-border text-foreground focus-visible:ring-ring"
                  />
                </div>
                {state.errors?.password && (
                  <p className="text-[11px] text-destructive">
                    {state.errors.password[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <Button
                type="submit"
                disabled={isPending}
                className="h-9 px-4 text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
