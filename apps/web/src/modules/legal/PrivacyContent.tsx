import { Calendar, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LegalNav } from "./LegalNav";

export function PrivacyContent() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      {/* Header */}
      <div className="mb-8">
        <Badge
          variant="outline"
          className="border-primary/40 bg-primary/10 text-primary font-mono text-[11px] mb-3"
        >
          DATA PRIVACY
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Privacy Policy
        </h1>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <Calendar className="h-3.5 w-3.5" />
          <span>Last Updated: November 20, 2026</span>
          <span>•</span>
          <span>Version 1.2</span>
        </div>
      </div>

      {/* Nav Tabs */}
      <LegalNav />

      {/* Content */}
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm text-muted-foreground leading-relaxed">
        {/* Core Guarantee */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-xs text-foreground flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-foreground">
              Zero Payload Monetization:{" "}
            </span>
            <span>
              TrueHook processes webhook payloads solely for the purpose of
              reliable transmission and delivery inspection. We never monetize,
              sell, inspect, or feed your event payloads into machine learning
              models.
            </span>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="font-mono text-primary text-sm">01.</span>
            Overview & Scope
          </h2>
          <p>
            TrueHook Inc. (&quot;TrueHook&quot;, &quot;we&quot;, &quot;us&quot;)
            respects the privacy of developers and organizations using our
            platform. This Privacy Policy details how we handle personal
            information, API authentication tokens, and transient event payloads
            transmitted through our infrastructure.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="font-mono text-primary text-sm">02.</span>
            Information We Collect
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Account Information:</strong> When you register, we
              collect your name, email address, password hash (salted using
              bcrypt), and organization metadata.
            </li>
            <li>
              <strong>Configuration Data:</strong> Webhook destination URLs,
              subscribed event types, rate limits, and encrypted signing
              secrets.
            </li>
            <li>
              <strong>Ephemeral Event Payloads:</strong> JSON bodies published
              by your applications for dispatch to registered endpoints.
            </li>
            <li>
              <strong>Telemetry & Logs:</strong> HTTP response codes, latency in
              milliseconds, delivery timestamps, error messages, and request
              headers.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="font-mono text-primary text-sm">03.</span>
            How We Use Your Information
          </h2>
          <p>
            We process data strictly to provide, safeguard, and improve our
            services:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              To transmit and retry event deliveries to your designated
              destination endpoints.
            </li>
            <li>
              To compute cryptographic HMAC-SHA256 signatures for payload
              integrity.
            </li>
            <li>
              To render real-time delivery attempt logs in your customer
              dashboard.
            </li>
            <li>
              To monitor infrastructure health, investigate SSRF abuse, and
              mitigate malicious traffic.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="font-mono text-primary text-sm">04.</span>
            Data Security & Encryption
          </h2>
          <p>Security is engineered into every layer of our stack:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>In Transit:</strong> All API requests and outbound webhook
              dispatches enforce modern TLS 1.3 encryption.
            </li>
            <li>
              <strong>At Rest:</strong> PostgreSQL databases and JetStream
              message queues employ AES-256 encryption.
            </li>
            <li>
              <strong>Signing Secrets:</strong> Secrets are stored encrypted and
              are never exposed in public API responses or browser consoles.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="font-mono text-primary text-sm">05.</span>
            Data Retention & Purging
          </h2>
          <p>
            Delivery attempt logs and associated payload snippets are
            automatically purged after <strong>30 days</strong>. You may also
            trigger manual deletion of endpoints or applications at any time,
            which cascade-deletes associated deliveries.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="font-mono text-primary text-sm">06.</span>
            Your Rights (GDPR & CCPA)
          </h2>
          <p>
            Regardless of your geographical location, TrueHook grants you full
            rights to access, export, rectify, or permanently delete your
            account data. To request a full data export or account erasure,
            contact{" "}
            <a
              href="mailto:privacy@truehook.dev"
              className="text-primary hover:underline font-mono"
            >
              privacy@truehook.dev
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
