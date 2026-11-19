import { Calendar, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LegalNav } from "./LegalNav";

export function TermsContent() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      {/* Header */}
      <div className="mb-8">
        <Badge
          variant="outline"
          className="border-primary/40 bg-primary/10 text-primary font-mono text-[11px] mb-3"
        >
          LEGAL AGREEMENT
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Terms and Conditions
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
        {/* Important Alert */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-xs text-foreground flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-foreground">
              Important Technical Notice:{" "}
            </span>
            <span>
              TrueHook operates under <strong>at-least-once delivery</strong>{" "}
              semantics. Customer webhook endpoints must implement idempotent
              processing to safely handle potential duplicate transmissions.
            </span>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="font-mono text-primary text-sm">01.</span>
            Acceptance of Terms
          </h2>
          <p>
            By registering for an account, accessing, or utilizing the TrueHook
            webhook delivery platform and APIs provided by TrueHook Inc.
            (&quot;TrueHook&quot;, &quot;we&quot;, &quot;us&quot;, or
            &quot;our&quot;), you (&quot;Customer&quot;, &quot;Developer&quot;,
            or &quot;User&quot;) agree to be legally bound by these Terms and
            Conditions. If you are entering into this agreement on behalf of a
            company or organization, you represent that you have the authority
            to bind such entity.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="font-mono text-primary text-sm">02.</span>
            Service Description & Delivery Semantics
          </h2>
          <p>
            TrueHook provides developer-focused outbound webhook dispatch,
            durable retries, cryptographic signature generation, and telemetry
            logging infrastructure.
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>At-Least-Once Delivery:</strong> While TrueHook employs
              durable queuing and retry mechanisms to prevent payload loss, we
              never warrant or guarantee exactly-once delivery. Network
              anomalies or timeout race conditions may result in an endpoint
              receiving an identical event more than once.
            </li>
            <li>
              <strong>Stable Identifiers:</strong> Each event generated receives
              a globally unique, immutable Event ID. All retry attempts for that
              event maintain identical Event IDs and payloads.
            </li>
            <li>
              <strong>Retry Policies:</strong> Failed delivery attempts trigger
              retries according to our exponential backoff policy with
              randomized jitter, up to the maximum attempts configured.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="font-mono text-primary text-sm">03.</span>
            Acceptable Use Policy (AUP)
          </h2>
          <p>
            You agree not to misuse TrueHook services. Prohibited conduct
            includes, but is not limited to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              Using TrueHook to execute Server-Side Request Forgery (SSRF)
              against internal or unauthorized networks.
            </li>
            <li>
              Attempting to route requests to loopback addresses (127.0.0.0/8),
              private RFC 1918 CIDR ranges, link-local addresses, or cloud
              provider metadata endpoints (e.g. 169.254.169.254).
            </li>
            <li>
              Publishing malicious payloads, ransomware, spyware, or
              unauthenticated denial-of-service floods targeting third-party
              endpoints.
            </li>
            <li>
              Circumventing platform quotas, rate limits, or security
              restrictions.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="font-mono text-primary text-sm">04.</span>
            Account Security & API Credentials
          </h2>
          <p>
            You are responsible for maintaining the confidentiality of your API
            keys, endpoint signing secrets, and login credentials. You agree to
            notify TrueHook immediately upon discovering any unauthorized use or
            compromise of your security credentials. TrueHook will never ask for
            your signing secrets in plain text.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="font-mono text-primary text-sm">05.</span>
            Telemetry & Data Retention
          </h2>
          <p>
            To facilitate debugging, TrueHook records attempt metadata,
            including HTTP status codes, execution duration, and truncated
            response bodies. Unless otherwise specified under an Enterprise
            agreement, detailed attempt payloads are automatically purged after
            30 days.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="font-mono text-primary text-sm">06.</span>
            Subscriptions, Invoicing & Quotas
          </h2>
          <p>
            Paid subscriptions provide designated monthly event dispatch volumes
            and endpoint limits. Usage exceeding your plan tier will be billed
            according to metered overage rates or throttled pursuant to your
            account settings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="font-mono text-primary text-sm">07.</span>
            Limitation of Liability
          </h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, TRUEHOOK SHALL NOT BE LIABLE
            FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
            DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS INTERRUPTION
            ARISING FROM THE USE OF OR INABILITY TO USE THE SERVICE.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="font-mono text-primary text-sm">08.</span>
            Contact & Questions
          </h2>
          <p>
            For legal inquiries, contract amendments, or questions regarding
            these Terms, contact our legal counsel at{" "}
            <a
              href="mailto:legal@truehook.dev"
              className="text-primary hover:underline font-mono"
            >
              legal@truehook.dev
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
