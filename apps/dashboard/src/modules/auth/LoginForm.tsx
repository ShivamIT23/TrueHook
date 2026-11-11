"use client";

import { AlertCircle, Eye, EyeOff, Info, Loader2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { loginAction } from "../../actions/auth";
import { initialAuthState } from "../../lib/types";
import { AuthFooter } from "./AuthFooter";
import { SocialButtons } from "./SocialButtons";
import { TrueHookLogo } from "./TrueHookLogo";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialAuthState,
  );
  const [showPassword, setShowPassword] = useState(false);

  const formErrorMessage =
    state.errors?._form?.[0] || (!state.success && state.message);

  return (
    <div className="relative z-10 flex min-h-[calc(100vh-80px)] w-full flex-col items-center justify-center py-12">
      {/* Centered Auth Card */}
      <Card className="w-full max-w-110 rounded-2xl border-[#262624] bg-[#181816]/90 p-8 shadow-2xl backdrop-blur-md">
        <CardHeader className="p-0">
          <TrueHookLogo className="mb-6" />
          <h1 className="text-center text-xl font-semibold tracking-tight text-[#f2f2e8]">
            Welcome back
          </h1>
          <p className="mt-1 mb-6 text-center text-sm text-[#9e9e96]">
            Sign in to your TrueHook customer dashboard.
          </p>
        </CardHeader>

        <CardContent className="p-0">
          {/* Social / SSO Logins */}
          <SocialButtons mode="login" />

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
                htmlFor="email"
                className="text-xs font-medium text-[#c4c4bc]"
              >
                Email
              </Label>
              <Input
                id="email"
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
                htmlFor="password"
                className="text-xs font-medium text-[#c4c4bc]"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
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
              {state.errors?.password && (
                <p className="text-xs text-[#ea5c47]">
                  {state.errors.password[0]}
                </p>
              )}
              {/* Forgot password */}
              <div className="mt-2 flex items-center gap-1.5 text-xs text-[#9e9e96]">
                <Info className="h-3.5 w-3.5 text-[#9e9e96]" />
                <Link
                  href="#"
                  className="transition-colors hover:text-[#f2f2e8]"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Primary Submit Button using strict 5-color accent #124060 */}
            <Button
              type="submit"
              disabled={isPending}
              className="mt-6 h-10 w-full cursor-pointer justify-center rounded-lg bg-[#124060] text-sm font-medium text-[#f2f2e8] shadow-sm transition-colors hover:bg-[#164e75] disabled:opacity-60"
            >
              {isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#f2f2e8]" />
                  <span>Signing in...</span>
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* Switch to Register */}
          <p className="mt-6 text-center text-xs text-[#9e9e96]">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-[#f2f2e8] underline transition-colors hover:text-[#c4c4bc]"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* External Footer */}
      <AuthFooter actionText="signing in" />
    </div>
  );
}
