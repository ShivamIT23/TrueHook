"use client";

import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { registerAction } from "../../actions/auth";
import { initialAuthState } from "../../lib/types";
import { AuthFooter } from "./AuthFooter";
import { SocialButtons } from "./SocialButtons";
import { TrueHookLogo } from "./TrueHookLogo";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialAuthState,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formErrorMessage =
    state.errors?._form?.[0] || (!state.success && state.message);

  return (
    <div className="relative z-10 flex min-h-[calc(100vh-80px)] w-full flex-col items-center justify-center py-12">
      {/* Centered Auth Card */}
      <Card className="w-full max-w-110 rounded-2xl border-[#262624] bg-[#181816]/90 p-8 shadow-2xl backdrop-blur-md">
        <CardHeader className="p-0">
          <TrueHookLogo className="mb-6" />
          <h1 className="text-center text-xl font-semibold tracking-tight text-[#f2f2e8]">
            Create a TrueHook account
          </h1>
          <p className="mt-1 mb-6 text-center text-sm text-[#9e9e96]">
            Get started with your webhook infrastructure.
          </p>
        </CardHeader>

        <CardContent className="p-0">
          {/* Social / SSO Logins */}
          <SocialButtons mode="register" />

          {/* Subtle Divider */}
          <Separator className="my-6 bg-[#262624]" />

          {/* Form-level Error Banner */}
          {formErrorMessage && (
            <div
              role="alert"
              className="mb-4 flex items-center gap-2 rounded-lg border border-[#ea5c47]/30 bg-[#ea5c47]/10 p-3 text-xs text-[#ea5c47]"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formErrorMessage}</span>
            </div>
          )}

          {/* Credentials Form with BFF Server Action */}
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="register-name"
                className="text-xs font-medium text-[#c4c4bc]"
              >
                Name
              </Label>
              <Input
                id="register-name"
                name="name"
                type="name"
                required
                autoComplete="name"
                placeholder="Full Name"
                aria-invalid={Boolean(state.errors?.name)}
                className="h-10 rounded-lg border-[#2b2b27] bg-[#141412] px-3.5 text-sm text-[#f2f2e8] placeholder:text-[#52524e] focus-visible:border-[#124060] focus-visible:ring-1 focus-visible:ring-[#124060] aria-invalid:border-[#ea5c47]"
              />
              {state.errors?.name && (
                <p className="text-xs text-[#ea5c47]">{state.errors.name[0]}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="register-email"
                className="text-xs font-medium text-[#c4c4bc]"
              >
                Email
              </Label>
              <Input
                id="register-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={Boolean(state.errors?.email)}
                className="h-10 rounded-lg border-[#2b2b27] bg-[#141412] px-3.5 text-sm text-[#f2f2e8] placeholder:text-[#52524e] focus-visible:border-[#124060] focus-visible:ring-1 focus-visible:ring-[#124060] aria-invalid:border-[#ea5c47]"
              />
              {state.errors?.email && (
                <p className="text-xs text-[#ea5c47]">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="register-password"
                className="text-xs font-medium text-[#c4c4bc]"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="register-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  aria-invalid={Boolean(state.errors?.password)}
                  className="h-10 rounded-lg border-[#2b2b27] bg-[#141412] pl-3.5 pr-10 text-sm text-[#f2f2e8] placeholder:text-[#52524e] focus-visible:border-[#124060] focus-visible:ring-1 focus-visible:ring-[#124060] aria-invalid:border-[#ea5c47]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#70706a] hover:text-[#f2f2e8] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {state.errors?.password ? (
                <p className="text-xs text-[#ea5c47]">
                  {state.errors.password[0]}
                </p>
              ) : (
                <p className="text-[11px] text-[#70706a]">
                  Must be at least 8 characters long
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="register-confirm-password"
                className="text-xs font-medium text-[#c4c4bc]"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  aria-invalid={Boolean(state.errors?.confirmPassword)}
                  className="h-10 rounded-lg border-[#2b2b27] bg-[#141412] pl-3.5 pr-10 text-sm text-[#f2f2e8] placeholder:text-[#52524e] focus-visible:border-[#124060] focus-visible:ring-1 focus-visible:ring-[#124060] aria-invalid:border-[#ea5c47]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#70706a] hover:text-[#f2f2e8] transition-colors"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {state.errors?.confirmPassword && (
                <p className="text-xs text-[#ea5c47]">
                  {state.errors.confirmPassword[0]}
                </p>
              )}
            </div>

            {/* Primary Submit Button */}
            <Button
              type="submit"
              disabled={isPending}
              className="mt-6 h-10 w-full cursor-pointer justify-center rounded-lg bg-[#124060] text-sm font-medium text-[#f2f2e8] shadow-sm transition-colors hover:bg-[#164e75] disabled:opacity-60"
            >
              {isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#f2f2e8]" />
                  <span>Creating account...</span>
                </span>
              ) : (
                "Sign up"
              )}
            </Button>
          </form>

          {/* Switch to Login */}
          <p className="mt-6 text-center text-xs text-[#9e9e96]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[#f2f2e8] underline transition-colors hover:text-[#c4c4bc]"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* External Footer */}
      <AuthFooter actionText="signing up" />
    </div>
  );
}
