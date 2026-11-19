import { Calendar, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LegalNav } from "./LegalNav";

export function RefundContent() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      {/* Header */}
      <div className="mb-8">
        <Badge
          variant="outline"
          className="border-primary/40 bg-primary/10 text-primary font-mono text-[11px] mb-3"
        >
          BILLING & GUARANTEE
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Refund & Cancellation Policy
        </h1>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <Calendar className="h-3.5 w-3.5" />
          <span>Last Updated: November 20, 2026</span>
          <span>•</span>
          <span>Version 1.1</span>
        </div>
      </div>

      {/* Nav Tabs */}
      <LegalNav />

      {/* Content */}
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm text-muted-foreground leading-relaxed">
        {/* Highlight Guarantee */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-xs text-foreground flex items-start gap-3">
          <DollarSign className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-foreground">
              14-Day Money-Back Guarantee:{" "}
            </span>
            <span>
              If you upgrade to any paid TrueHook plan and find that our
              platform does not satisfy your technical requirements, contact us
              within 14 days for a full, hassle-free refund.
            </span>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="font-mono text-primary text-sm">01.</span>
            Transparent Developer Billing
          </h2>
          <p>
            At TrueHook, we aim for straightforward, predictable pricing without
            predatory lock-ins. We provide a generous free development tier so
            teams can thoroughly evaluate our webhook infrastructure, HMAC
            signatures, and retry policies before committing financial
            resources.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="font-mono text-primary text-sm">02.</span>
            14-Day Satisfaction Window
          </h2>
          <p>For initial monthly or annual paid subscriptions:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              You may request a <strong>100% full refund</strong> within 14
              calendar days of your initial subscription purchase.
            </li>
            <li>Refunds cover the base platform subscription fee.</li>
            <li>
              No arbitrary justification required; simply let us know how we can
              improve.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="font-mono text-primary text-sm">03.</span>
            SLA Service Credits for Platform Downtime
          </h2>
          <p>
            TrueHook maintains a 99.95% monthly uptime service level objective
            (SLO). If our core webhook dispatch engine experiences unplanned
            downtime exceeding these thresholds:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>99.0% – 99.95% Uptime:</strong> 10% credit applied to your
              next monthly billing cycle.
            </li>
            <li>
              <strong>95.0% – 99.0% Uptime:</strong> 25% credit applied to your
              next monthly billing cycle.
            </li>
            <li>
              <strong>&lt; 95.0% Uptime:</strong> 50% credit applied to your
              next monthly billing cycle.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="font-mono text-primary text-sm">04.</span>
            Subscription Cancellation
          </h2>
          <p>
            You can cancel your paid subscription at any time directly through
            the Customer Dashboard under Settings. Upon cancellation:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              Your account remains on your paid tier until the conclusion of the
              active billing period.
            </li>
            <li>
              You will not be billed again unless you manually re-subscribe.
            </li>
            <li>There are zero cancellation fees or account penalties.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="font-mono text-primary text-sm">05.</span>
            How to Submit a Refund Request
          </h2>
          <p>
            To initiate a refund under our 14-day guarantee or SLA credit
            policy, email our billing team:
          </p>
          <div className="rounded-xl border border-border bg-secondary2/30 p-4 font-mono text-xs space-y-1 text-foreground">
            <p>To: billing@truehook.dev</p>
            <p>Subject: Refund Request - [Your Organization Name]</p>
            <p>Include: Account UUID and Invoice Number</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Refunds are reviewed by an engineer and processed within 3–5
            business days directly back to the original card or payment
            instrument.
          </p>
        </section>
      </div>
    </div>
  );
}
