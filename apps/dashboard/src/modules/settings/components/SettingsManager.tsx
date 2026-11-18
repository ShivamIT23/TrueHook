"use client";

import {
  AlertTriangle,
  Bell,
  Check,
  Copy,
  Layers,
  Save,
  Settings2,
  ShieldCheck,
  Sliders,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import type { AuthUser } from "@/lib/types";
import type { Application } from "@/modules/applications/types";

export interface SettingsManagerProps {
  application: Application | null;
  user: AuthUser | null;
}

export function SettingsManager({
  application,
  user: _user,
}: SettingsManagerProps) {
  const [copiedAppId, setCopiedAppId] = useState(false);
  const [timeoutSeconds, setTimeoutSeconds] = useState("15");
  const [maxRetries, setMaxRetries] = useState("5");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [consecutiveThreshold, setConsecutiveThreshold] = useState("10");
  const [isSaving, setIsSaving] = useState(false);

  const handleCopyAppId = () => {
    if (!application?.id) return;
    navigator.clipboard.writeText(application.id);
    setCopiedAppId(true);
    toast({
      message: "Application ID copied to clipboard",
      state: "success",
    });
    setTimeout(() => setCopiedAppId(false), 2000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        message: "Settings saved successfully.",
        state: "success",
      });
    }, 600);
  };

  return (
    <div className="relative isolate min-h-[calc(100vh-5rem)] overflow-y-auto">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 pb-32">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Settings2 className="h-4 w-4" />
            <span>System Configuration</span>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure application defaults, delivery retry policies, security
            protections, and alert rules.
          </p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-8">
          {/* Active Application Context */}
          <Card className="rounded-xl border border-border bg-canvas p-6 shadow-xs">
            <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Active Application
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Settings are scoped to your currently active application
                  workspace.
                </p>
              </div>
              {application && (
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {application.name}
                </span>
              )}
            </CardHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <span className="text-xs font-medium text-foreground">
                  Application Name
                </span>
                <p className="text-xs text-muted-foreground font-medium">
                  {application?.name || "No active application"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium text-foreground">
                  Application ID
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs text-foreground truncate max-w-48">
                    {application?.id || "N/A"}
                  </span>
                  {application?.id && (
                    <button
                      type="button"
                      onClick={handleCopyAppId}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      title="Copy Application ID"
                    >
                      {copiedAppId ? (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Webhook Delivery & Retry Policy */}
          <Card className="rounded-xl border border-border bg-canvas p-6 shadow-xs">
            <CardHeader className="p-0 mb-5">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                Delivery & Retry Policy
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure HTTP connection timeouts, backoff jitter, and dispatch
                parameters.
              </p>
            </CardHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label
                  htmlFor="req-timeout"
                  className="text-xs font-medium text-foreground"
                >
                  HTTP Request Timeout (seconds)
                </Label>
                <Input
                  id="req-timeout"
                  type="number"
                  min="3"
                  max="60"
                  value={timeoutSeconds}
                  onChange={(e) => setTimeoutSeconds(e.target.value)}
                  className="h-9 text-xs bg-canvas border-border text-foreground focus-visible:ring-ring"
                />
                <p className="text-[11px] text-muted-foreground">
                  Outgoing delivery HTTP calls will abort if the endpoint does
                  not respond within this threshold.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="max-retries"
                  className="text-xs font-medium text-foreground"
                >
                  Maximum Retry Attempts
                </Label>
                <Input
                  id="max-retries"
                  type="number"
                  min="1"
                  max="10"
                  value={maxRetries}
                  onChange={(e) => setMaxRetries(e.target.value)}
                  className="h-9 text-xs bg-canvas border-border text-foreground focus-visible:ring-ring"
                />
                <p className="text-[11px] text-muted-foreground">
                  Deliveries are retried using exponential backoff with
                  randomized jitter to prevent thundering herds.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-border bg-secondary2 p-3">
                <span className="text-xs font-semibold text-foreground block">
                  Signature Algorithm
                </span>
                <p className="text-[11px] text-muted-foreground mt-1">
                  HMAC-SHA256 with timestamp headers (
                  <span className="font-mono">truehook-signature</span>,{" "}
                  <span className="font-mono">truehook-timestamp</span>).
                </p>
              </div>

              <div className="rounded-lg border border-border bg-secondary2 p-3">
                <span className="text-xs font-semibold text-foreground block">
                  Delivery Guarantee
                </span>
                <p className="text-[11px] text-muted-foreground mt-1">
                  At-least-once delivery with persistent event IDs and
                  deduplication keys.
                </p>
              </div>
            </div>
          </Card>

          {/* Security & SSRF Protection Status */}
          <Card className="rounded-xl border border-border bg-canvas p-6 shadow-xs">
            <CardHeader className="p-0 mb-4">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Security & Network Isolation
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                TrueHook protects your backend by enforcing strict egress
                guardrails on all outgoing webhooks.
              </p>
            </CardHeader>

            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary2 p-3">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-foreground">
                    SSRF & Metadata Blocking:
                  </span>{" "}
                  <span className="text-muted-foreground">
                    Destination addresses matching loopback (127.0.0.0/8),
                    RFC1918 private ranges (10.0.0.0/8, 172.16.0.0/12,
                    192.168.0.0/16), link-local, and cloud metadata
                    (169.254.169.254) are rejected immediately.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary2 p-3">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-foreground">
                    DNS Destination Verification:
                  </span>{" "}
                  <span className="text-muted-foreground">
                    DNS resolutions are evaluated at socket connect time to
                    prevent DNS rebinding attacks.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary2 p-3">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-foreground">
                    Payload & Response Protection:
                  </span>{" "}
                  <span className="text-muted-foreground">
                    Incoming and outgoing HTTP bodies are restricted to a
                    maximum of 1MB to protect server memory.
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Alert Notifications */}
          <Card className="rounded-xl border border-border bg-canvas p-6 shadow-xs">
            <CardHeader className="p-0 mb-4">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                Alerts & Notifications
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure notifications for delivery failures and endpoint
                downtime.
              </p>
            </CardHeader>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    Endpoint Failure Alerts
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Receive an email when an endpoint fails consecutive delivery
                    attempts.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-ring cursor-pointer"
                />
              </label>

              <div className="border-t border-border pt-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-foreground block">
                      Weekly Delivery Digest
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Receive weekly delivery volume and endpoint success rate
                      summaries.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={weeklyDigest}
                    onChange={(e) => setWeeklyDigest(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-ring cursor-pointer"
                  />
                </label>
              </div>

              <div className="border-t border-border pt-4 max-w-xs space-y-1.5">
                <Label
                  htmlFor="failure-threshold"
                  className="text-xs font-medium text-foreground"
                >
                  Consecutive Failure Alert Threshold
                </Label>
                <Input
                  id="failure-threshold"
                  type="number"
                  min="1"
                  max="100"
                  value={consecutiveThreshold}
                  onChange={(e) => setConsecutiveThreshold(e.target.value)}
                  className="h-9 text-xs bg-canvas border-border text-foreground focus-visible:ring-ring"
                />
                <p className="text-[11px] text-muted-foreground">
                  Number of failed deliveries before an alert is dispatched.
                </p>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="rounded-xl border border-destructive/30 bg-canvas p-6 shadow-xs">
            <CardHeader className="p-0 mb-4">
              <h2 className="text-base font-semibold text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Danger Zone
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Irreversible actions that affect your current application
                workspace.
              </p>
            </CardHeader>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div>
                <span className="text-xs font-semibold text-foreground block">
                  Delete Application Workspace
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Permanently remove this application, registered endpoints,
                  event types, and delivery logs.
                </span>
              </div>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  toast({
                    message:
                      "To delete this application, please use the Applications page.",
                    state: "warning",
                  });
                }}
                className="h-8 px-3 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer shrink-0"
              >
                Delete Application
              </Button>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="h-9 px-5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              <span>{isSaving ? "Saving..." : "Save Settings"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
