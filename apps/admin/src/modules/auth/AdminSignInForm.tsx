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

export function AdminSignInForm() {
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
      <Card className="w-full max-w-110 rounded-2xl border-[#F3EEE3]/15 bg-[#111111]/90 p-8 shadow-2xl backdrop-blur-md">
        <CardHeader className="p-0">
          <TrueHookLogo badge="ADMIN" className="mb-6" />
          <h1 className="text-center text-xl font-semibold tracking-tight text-[#F3EEE3]">
            Welcome back
          </h1>
          <p className="mt-1 mb-6 text-center text-sm text-[#F3EEE3]/60">
            Sign in to TrueHook Admin console.
          </p>
        </CardHeader>

        <CardContent className="p-0">
          {/* Social / SSO Sign Ins */}
          <SocialButtons />

          {/* Subtle Divider */}
          <Separator className="my-6 bg-[#F3EEE3]/15" />

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="admin-email"
                className="text-xs font-medium text-[#F3EEE3]/80"
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
                className="h-10 rounded-lg border-[#F3EEE3]/15 bg-[#111111] px-3.5 text-sm text-[#F3EEE3] placeholder:text-[#F3EEE3]/40 focus-visible:border-[#D9541E] focus-visible:ring-1 focus-visible:ring-[#D9541E]"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="admin-password"
                className="text-xs font-medium text-[#F3EEE3]/80"
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
                  className="h-10 rounded-lg border-[#F3EEE3]/15 bg-[#111111] pl-3.5 pr-10 text-sm text-[#F3EEE3] placeholder:text-[#F3EEE3]/40 focus-visible:border-[#D9541E] focus-visible:ring-1 focus-visible:ring-[#D9541E]"
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
              {/* Forgot password */}
              <div className="mt-2 flex items-center gap-1.5 text-xs text-[#F3EEE3]/60">
                <Info className="h-3.5 w-3.5 text-[#F3EEE3]/60" />
                <Link
                  href="#"
                  className="transition-colors hover:text-[#F3EEE3]"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Primary Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="mt-6 h-10 w-full cursor-pointer justify-center rounded-lg bg-[#D9541E] text-sm font-medium text-[#F3EEE3] shadow-sm transition-colors hover:bg-[#D9541E]/90 disabled:opacity-60"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
