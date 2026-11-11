import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Radio,
  Send,
  ShieldCheck,
  Webhook,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { AuthUser } from "@/lib/types";
import type { Application } from "@/modules/applications/types";

export interface DashboardOverviewProps {
  user?: AuthUser | null;
  application?: Application | null;
}

export function DashboardOverview({
  user: _user,
  application,
}: DashboardOverviewProps) {
  return (
    <div className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pb-32">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Dashboard Overview
              </h1>
              {application && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {application.name}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {application?.description ||
                "Monitor webhook delivery pipelines, inspect attempts, and configure endpoints."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button className="h-9 cursor-pointer border border-primary bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              <Webhook className="h-3.5 w-3.5" />
              <span>Add Endpoint</span>
            </Button>
          </div>
        </div>

        {/* Metric Cards Grid in Custom Theme Tokens */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-xl border border-border bg-canvas p-5 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between p-0">
              <span className="text-xs font-medium text-muted-foreground">
                Active Endpoints
              </span>
              <Radio className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="mt-3 p-0">
              <div className="text-2xl font-bold text-foreground">0</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Ready for registration
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border bg-canvas p-5 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between p-0">
              <span className="text-xs font-medium text-muted-foreground">
                Events Streamed
              </span>
              <Send className="h-4 w-4 text-brass" />
            </CardHeader>
            <CardContent className="mt-3 p-0">
              <div className="text-2xl font-bold text-foreground">0</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Published this month
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border bg-canvas p-5 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between p-0">
              <span className="text-xs font-medium text-muted-foreground">
                Delivery Success
              </span>
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="mt-3 p-0">
              <div className="text-2xl font-bold text-foreground">100%</div>
              <p className="mt-1 text-xs text-muted-foreground">
                At-least-once reliability
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border bg-canvas p-5 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between p-0">
              <span className="text-xs font-medium text-muted-foreground">
                HMAC Signing
              </span>
              <ShieldCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="mt-3 p-0">
              <div className="text-2xl font-bold text-foreground">SHA-256</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Payload tamper verification
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start Guide Card */}
        <div className="mt-8 rounded-xl border border-border bg-secondary/50 p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brass">
            <Activity className="h-4 w-4" />
            <span>Getting Started with TrueHook</span>
          </div>
          <h2 className="mt-2 text-base font-semibold text-foreground">
            Configure your first webhook destination
          </h2>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            TrueHook handles fanout, retry scheduling with exponential backoff,
            and signature verification. Register an HTTPS endpoint to begin
            receiving webhook deliveries.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button className="h-8 cursor-pointer border border-primary bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              <span>Register Endpoint</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              className="h-8 cursor-pointer border-border bg-canvas px-3 text-xs text-foreground transition-colors hover:bg-secondary"
            >
              <span>View API Documentation</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
