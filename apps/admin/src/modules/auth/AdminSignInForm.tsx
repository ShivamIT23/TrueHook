"use client";

import { AlertCircle, Eye, EyeOff, KeyRound, ShieldAlert } from "lucide-react";
import { useActionState, useState } from "react";
import { signInAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { AuthActionState } from "@/lib/types";
import { SocialButtons } from "./SocialButtons";
import { TrueHookLogo } from "./TrueHookLogo";

const initialState: AuthActionState = {
  success: false,
};

export function AdminSignInForm() {
  const [state, formAction, isPending] = useActionState(
    signInAction,
    initialState,
  );
  const [email, setEmail] = useState("operator@truehook.internal");
  const [password, setPassword] = useState("adminSecretPass123");
  const [showPassword, setShowPassword] = useState(false);

  const fillDefaultCredentials = () => {
    setEmail("operator@truehook.internal");
    setPassword("adminSecretPass123");
  };

  return (
    <div className="relative z-10 flex min-h-[calc(100vh-80px)] w-full flex-col items-center justify-center py-12">
      {/* Centered Auth Card */}
      <Card className="w-full max-w-115 rounded-2xl border-border bg-card/90 p-8 shadow-2xl backdrop-blur-md">
        <CardHeader className="p-0">
          <TrueHookLogo badge="ADMIN" className="mb-6" />
          <h1 className="text-center text-xl font-semibold tracking-tight text-foreground">
            Operator Console
          </h1>
          <p className="mt-1 mb-6 text-center text-sm text-muted-foreground">
            Sign in with internal credentials to manage TrueHook fleet.
          </p>
        </CardHeader>

        <CardContent className="p-0">
          {/* SSO / Identity Provider Options */}
          <SocialButtons />

          {/* Subtle Divider */}
          <Separator className="my-6 bg-border" />

          {/* Server / Form Error Alert */}
          {state.errors?._form && (
            <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{state.errors._form[0]}</span>
            </div>
          )}

          {/* Credentials Form */}
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="admin-email"
                className="text-xs font-medium text-foreground/80"
              >
                Operator Email
              </Label>
              <Input
                id="admin-email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@truehook.internal"
                className="h-10 rounded-lg border-border bg-background px-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
              />
              {state.errors?.email && (
                <p className="text-xs text-destructive mt-1">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="admin-password"
                  className="text-xs font-medium text-foreground/80"
                >
                  Password
                </Label>
                <button
                  type="button"
                  onClick={fillDefaultCredentials}
                  className="text-[11px] text-primary hover:underline font-mono"
                >
                  Fill dev credentials
                </button>
              </div>
              <div className="relative">
                <Input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-lg border-border bg-background pl-3.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                <p className="text-xs text-destructive mt-1">
                  {state.errors.password[0]}
                </p>
              )}
            </div>

            {/* Quick credentials hint box */}
            <div className="rounded-lg border border-border/60 bg-background/50 p-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <KeyRound className="h-3.5 w-3.5 text-primary" />
                <span>Default Local Operator</span>
              </div>
              <div className="mt-1.5 flex flex-col gap-0.5 font-mono text-[11px] text-muted-foreground">
                <span>
                  Email:{" "}
                  <span className="text-foreground">
                    operator@truehook.internal
                  </span>
                </span>
                <span>
                  Pass:{" "}
                  <span className="text-foreground">adminSecretPass123</span>
                </span>
              </div>
            </div>

            {/* Primary Submit Button */}
            <Button
              type="submit"
              disabled={isPending}
              className="mt-6 h-10 w-full cursor-pointer justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {isPending ? "Authenticating..." : "Sign in as Operator"}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
            <ShieldAlert className="h-3.5 w-3.5 text-primary/80" />
            <span>Internal access logged with UTC timestamps & IP audit</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
