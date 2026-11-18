"use client";

import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { signUpAction } from "../../actions/auth";
import { initialAuthState } from "../../lib/types";
import { AuthFooter } from "./AuthFooter";
import { SocialButtons } from "./SocialButtons";
import { TrueHookLogo } from "./TrueHookLogo";

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(
    signUpAction,
    initialAuthState,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formErrorMessage =
    state.errors?._form?.[0] || (!state.success && state.message);

  return (
    <div className="relative z-10 flex min-h-[calc(100vh-80px)] w-full flex-col items-center justify-center py-12">
      {/* Centered Auth Card */}
      <Card className="w-full max-w-110 rounded-2xl border-[#F3EEE3]/15 bg-[#111111]/90 p-8 shadow-2xl backdrop-blur-md">
        <CardHeader className="p-0">
          <TrueHookLogo className="mb-6" />
          <h1 className="text-center text-xl font-semibold tracking-tight text-[#F3EEE3]">
            Create a TrueHook account
          </h1>
          <p className="mt-1 mb-6 text-center text-sm text-[#F3EEE3]/60">
            Get started with your webhook infrastructure.
          </p>
        </CardHeader>

        <CardContent className="p-0">
          {/* Social / SSO Sign Up */}
          <SocialButtons mode="Sign Up" />

          {/* Subtle Divider */}
          <Separator className="my-6 bg-[#F3EEE3]/15" />

          {/* Form-level Error Banner */}
          {formErrorMessage && (
            <div
              role="alert"
              className="mb-4 flex items-center gap-2 rounded-lg border border-[#D9541E]/30 bg-[#D9541E]/10 p-3 text-xs text-[#D9541E]"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formErrorMessage}</span>
            </div>
          )}

          {/* Credentials Form with BFF Server Action */}
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="signup-name"
                className="text-xs font-medium text-[#F3EEE3]/80"
              >
                Name
              </Label>
              <Input
                id="signup-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Full Name"
                aria-invalid={Boolean(state.errors?.name)}
                className="h-10 rounded-lg border-[#F3EEE3]/15 bg-[#111111] px-3.5 text-sm text-[#F3EEE3] placeholder:text-[#F3EEE3]/40 focus-visible:border-[#D9541E] focus-visible:ring-1 focus-visible:ring-[#D9541E] aria-invalid:border-[#D9541E]"
              />
              {state.errors?.name && (
                <p className="text-xs text-[#D9541E]">{state.errors.name[0]}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="signup-email"
                className="text-xs font-medium text-[#F3EEE3]/80"
              >
                Email
              </Label>
              <Input
                id="signup-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={Boolean(state.errors?.email)}
                className="h-10 rounded-lg border-[#F3EEE3]/15 bg-[#111111] px-3.5 text-sm text-[#F3EEE3] placeholder:text-[#F3EEE3]/40 focus-visible:border-[#D9541E] focus-visible:ring-1 focus-visible:ring-[#D9541E] aria-invalid:border-[#D9541E]"
              />
              {state.errors?.email && (
                <p className="text-xs text-[#D9541E]">{state.errors.email[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="signup-password"
                className="text-xs font-medium text-[#F3EEE3]/80"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  aria-invalid={Boolean(state.errors?.password)}
                  className="h-10 rounded-lg border-[#F3EEE3]/15 bg-[#111111] pl-3.5 pr-10 text-sm text-[#F3EEE3] placeholder:text-[#F3EEE3]/40 focus-visible:border-[#D9541E] focus-visible:ring-1 focus-visible:ring-[#D9541E] aria-invalid:border-[#D9541E]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F3EEE3]/50 hover:text-[#F3EEE3] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {state.errors?.password && (
                <p className="text-xs text-[#D9541E]">
                  {state.errors.password[0]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="signup-confirm-password"
                className="text-xs font-medium text-[#F3EEE3]/80"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  aria-invalid={Boolean(state.errors?.confirmPassword)}
                  className="h-10 rounded-lg border-[#F3EEE3]/15 bg-[#111111] pl-3.5 pr-10 text-sm text-[#F3EEE3] placeholder:text-[#F3EEE3]/40 focus-visible:border-[#D9541E] focus-visible:ring-1 focus-visible:ring-[#D9541E] aria-invalid:border-[#D9541E]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F3EEE3]/50 hover:text-[#F3EEE3] transition-colors"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmed password"
                      : "Show confirmed password"
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
                <p className="text-xs text-[#D9541E]">
                  {state.errors.confirmPassword[0]}
                </p>
              )}
            </div>

            {/* Primary Submit Button */}
            <Button
              type="submit"
              disabled={isPending}
              className="mt-6 h-10 w-full cursor-pointer justify-center rounded-lg bg-[#D9541E] text-sm font-medium text-[#F3EEE3] shadow-sm transition-colors hover:bg-[#D9541E]/90 disabled:opacity-60"
            >
              {isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#F3EEE3]" />
                  <span>Creating account...</span>
                </span>
              ) : (
                "Sign up"
              )}
            </Button>
          </form>

          {/* Switch to Sign in */}
          <p className="mt-6 text-center text-xs text-[#F3EEE3]/60">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-medium text-[#F3EEE3] underline transition-colors hover:text-[#D9541E]"
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
