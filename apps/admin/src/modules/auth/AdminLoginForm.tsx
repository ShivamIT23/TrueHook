"use client";

import { Eye, EyeOff, Info } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SocialButtons } from "./SocialButtons";
import { TrueHookLogo } from "./TrueHookLogo";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Submit handler placeholder
  };

  return (
    <div className="relative z-10 flex min-h-[calc(100vh-80px)] w-full flex-col items-center justify-center py-12">
      {/* Centered Auth Card */}
      <Card className="w-full max-w-110 rounded-2xl border-[#262624] bg-[#181816]/90 p-8 shadow-2xl backdrop-blur-md">
        <CardHeader className="p-0">
          <TrueHookLogo badge="ADMIN" className="mb-6" />
          <h1 className="text-center text-xl font-semibold tracking-tight text-[#f2f2e8]">
            Welcome back
          </h1>
          <p className="mt-1 mb-6 text-center text-sm text-[#9e9e96]">
            Sign in to TrueHook Admin console.
          </p>
        </CardHeader>

        <CardContent className="p-0">
          {/* Social / SSO Logins */}
          <SocialButtons />

          {/* Subtle Divider */}
          <Separator className="my-6 bg-[#262624]" />

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="admin-email"
                className="text-xs font-medium text-[#c4c4bc]"
              >
                Email
              </Label>
              <Input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@truehook.internal"
                className="h-10 rounded-lg border-[#2b2b27] bg-[#141412] px-3.5 text-sm text-[#f2f2e8] placeholder:text-[#52524e] focus-visible:border-[#124060] focus-visible:ring-1 focus-visible:ring-[#124060]"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="admin-password"
                className="text-xs font-medium text-[#c4c4bc]"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-lg border-[#2b2b27] bg-[#141412] pl-3.5 pr-10 text-sm text-[#f2f2e8] placeholder:text-[#52524e] focus-visible:border-[#124060] focus-visible:ring-1 focus-visible:ring-[#124060]"
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

            {/* Primary Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="mt-6 h-10 w-full cursor-pointer justify-center rounded-lg bg-[#155eef] text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#124fca] disabled:opacity-60"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Security Notice */}
          <p className="mt-6 text-center text-xs text-[#70706a]">
            Internal operator console. Access is restricted and audited.
          </p>
        </CardContent>
      </Card>

      {/* External Footer */}
      <footer className="mt-8 text-center text-xs text-[#70706a]">
        By signing in, you agree to our{" "}
        <Link
          href="#"
          className="underline hover:text-[#9e9e96] transition-colors"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="#"
          className="underline hover:text-[#9e9e96] transition-colors"
        >
          Privacy Policies
        </Link>
      </footer>
    </div>
  );
}
