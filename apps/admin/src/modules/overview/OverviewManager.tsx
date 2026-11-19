"use client";

import {
  Check,
  CheckCircle2,
  Copy,
  Database,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminUser, SystemHealthStatus, TenantUser } from "@/lib/types";

interface OverviewManagerProps {
  initialUsers: TenantUser[];
  initialHealth: SystemHealthStatus;
  adminUser: AdminUser | null;
  error?: string;
}

export function OverviewManager({
  initialUsers,
  initialHealth,
  adminUser,
  error,
}: OverviewManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredUsers = initialUsers.filter((user) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Operator Welcome & Refresh */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Fleet Overview & System Control
            </h1>
            <Badge
              variant="outline"
              className="border-primary/40 bg-primary/10 text-primary font-mono text-[11px]"
            >
              LIVE
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Internal telemetry, cross-tenant management, and real-time database
            health.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isPending}
            className="h-9 gap-1.5 border-border bg-card text-xs font-medium text-foreground hover:bg-foreground/5 cursor-pointer"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-primary ${isPending ? "animate-spin" : ""}`}
            />
            <span>{isPending ? "Refreshing..." : "Refresh Fleet"}</span>
          </Button>
        </div>
      </div>

      {/* Global Error Banner if any */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <XCircle className="h-5 w-5 shrink-0" />
          <div className="flex-1">
            <span className="font-medium">Backend Connection Error: </span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* 4 Telemetry Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Registered Tenants */}
        <Card className="rounded-xl border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Tenants
            </span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tracking-tight text-foreground">
              {initialUsers.length}
            </span>
            <span className="text-xs text-muted-foreground">
              registered users
            </span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Queried from PostgreSQL{" "}
            <code className="text-foreground">users</code> table
          </p>
        </Card>

        {/* Metric 2: Database Status */}
        <Card className="rounded-xl border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Database Cluster
            </span>
            <Database className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            {initialHealth.dbStatus === "connected" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive shrink-0" />
            )}
            <span className="font-mono text-lg font-bold uppercase tracking-tight text-foreground">
              {initialHealth.dbStatus}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground font-mono">
            PostgreSQL 17 / pgxpool connection
          </p>
        </Card>

        {/* Metric 3: Go API Gateway */}
        <Card className="rounded-xl border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              API Gateway
            </span>
            <Server className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            {initialHealth.apiStatus === "operational" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive shrink-0" />
            )}
            <span className="font-mono text-lg font-bold uppercase tracking-tight text-foreground">
              {initialHealth.apiStatus}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Latency:{" "}
            <span className="font-mono text-foreground">
              {initialHealth.latencyMs ?? 0}ms
            </span>{" "}
            via HTTP Healthz
          </p>
        </Card>

        {/* Metric 4: Operator Role */}
        <Card className="rounded-xl border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Security Standard
            </span>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="font-mono text-lg font-bold tracking-tight text-foreground">
              HMAC-SHA256
            </span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Operator:{" "}
            <span className="font-mono text-foreground">
              {adminUser?.email || "internal"}
            </span>
          </p>
        </Card>
      </div>

      {/* Cross-Tenant Management Table */}
      <Card className="rounded-xl border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border/60 p-5 sm:flex sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              Cross-Tenant Directory
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Inspect registered customer accounts, tenant identities, and
              registration timestamps.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative mt-4 sm:mt-0 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, email, or UUID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <h3 className="text-sm font-semibold text-foreground">
                {searchQuery
                  ? "No matching tenants found"
                  : "No registered tenants yet"}
              </h3>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                {searchQuery
                  ? `No tenants match query "${searchQuery}". Try refining your search.`
                  : "Customer registrations created via apps/web or apps/dashboard will appear here in real time."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-background/50">
                  <TableRow className="border-b border-border/60 hover:bg-transparent">
                    <TableHead className="w-12 text-xs font-semibold text-muted-foreground">
                      #
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Tenant / User
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Email Address
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Account UUID
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Registration Date
                    </TableHead>
                    <TableHead className="text-right text-xs font-semibold text-muted-foreground">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, idx) => (
                    <TableRow
                      key={user.id}
                      className="border-b border-border/40 transition-colors hover:bg-foreground/[0.02]"
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-medium text-foreground text-xs">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/10 text-xs font-semibold font-mono text-foreground">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(user.id)}
                          className="group inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title="Click to copy UUID"
                        >
                          <span>{user.id}</span>
                          {copiedId === user.id ? (
                            <Check className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleString()
                          : "Unknown"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 font-mono text-[10px] uppercase"
                        >
                          ACTIVE
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
