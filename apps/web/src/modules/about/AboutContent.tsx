import {
  Activity,
  CheckCircle,
  Database,
  Lock,
  RefreshCw,
  Shield,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const PILLARS = [
  {
    icon: RefreshCw,
    title: "At-Least-Once Delivery",
    description:
      "Every outbound event is persisted in durable PostgreSQL and processed via NATS JetStream. We never drop payloads silently, and every retry uses the same immutable event ID.",
  },
  {
    icon: Zap,
    title: "Durable Jitter & Backoff",
    description:
      "Naive retries cause thundering herds. TrueHook calculates exponential backoff with full jitter to protect your customers' endpoints from cascade crashes.",
  },
  {
    icon: Lock,
    title: "HMAC-SHA256 Signatures",
    description:
      "Every HTTP request carries a timestamped HMAC-SHA256 signature in the TrueHook-Signature header, preventing man-in-the-middle and replay attacks.",
  },
  {
    icon: Shield,
    title: "SSRF & Network Shield",
    description:
      "Strict destination validation blocks attempts to target private subnets, loopback addresses (127.0.0.1), link-local ranges, or cloud metadata endpoints.",
  },
  {
    icon: Activity,
    title: "Deep Attempt Telemetry",
    description:
      "Inspect the exact HTTP status code, request duration in milliseconds, filtered headers, and response payload for every single delivery attempt.",
  },
  {
    icon: Database,
    title: "Built on Battle-Tested Tech",
    description:
      "Engineered in Go, PostgreSQL, and NATS JetStream without unnecessary distributed abstractions. High performance, zero bloat.",
  },
];

export function AboutContent() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      {/* Hero Section */}
      <div className="max-w-3xl">
        <Badge
          variant="outline"
          className="border-primary/40 bg-primary/10 text-primary font-mono text-[11px] mb-3"
        >
          ABOUT TRUEHOOK
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          We built the webhook engine we wished we had.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          Webhooks are the backbone of modern interconnected APIs, yet building
          reliable delivery infrastructure is deceptive. Between worker crashes,
          network timeouts, endpoint rate limits, and security vulnerabilities,
          homegrown queues quickly become a maintenance nightmare.
        </p>
      </div>

      {/* Origin Story / Mission */}
      <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 space-y-4 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-xl font-semibold text-foreground">
            Our Mission: Zero Webhook Drops
          </h2>
          <p>
            TrueHook was founded on a singular premise: outbound webhook
            delivery should be as reliable, secure, and observable as sending
            emails through transactional providers.
          </p>
          <p>
            Developers shouldn’t have to cobble together bespoke Celery queues,
            Redis lists, or cron jobs that silently fail when customer endpoints
            go down. When you publish an event with TrueHook, you receive
            immediate durability, transparent attempt logs, automatic retry
            backoffs, and instant replay capabilities.
          </p>
          <p>
            We take security seriously. Every outgoing HTTP request passes
            through real-time DNS revalidation to mitigate SSRF, and payloads
            are cryptographically signed using constant-time comparison to
            protect customer systems.
          </p>
        </div>

        <div className="lg:col-span-5">
          <Card className="border-border bg-secondary2/30 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider font-mono">
              Core Principles
            </h3>
            <ul className="space-y-3 text-xs text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">
                    Reliability First:
                  </strong>{" "}
                  Deliveries are durable, persistent, and verifiable.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Zero Obfuscation:</strong>{" "}
                  Full visibility into attempt duration, HTTP headers, and error
                  codes.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">
                    Rigorous Security:
                  </strong>{" "}
                  SSRF protection and constant-time signature verification are
                  non-negotiable.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">
                    Engineer-to-Engineer:
                  </strong>{" "}
                  High contrast, clean typography, fast micro-interactions, no
                  fluff.
                </span>
              </li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Architectural Pillars Grid */}
      <div className="mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Engineered for Developer Confidence
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Built from the ground up to solve the real-world pitfalls of webhook
            delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Card
                key={pillar.title}
                className="border-border bg-card p-6 rounded-xl shadow-xs hover:border-primary/40 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-20 rounded-2xl border border-border bg-card p-8 sm:p-12 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Ready to eliminate webhook delivery headaches?
        </h2>
        <p className="mt-2 max-w-xl mx-auto text-sm text-muted-foreground">
          Sign up to get your application credentials, register endpoints, and
          stream events with complete peace of mind.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href="http://localhost:3001/signup"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Create Developer Account
          </a>
          <Link
            href="/contact"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-5 text-sm font-medium text-foreground hover:bg-secondary2 transition-colors"
          >
            Talk to an Engineer
          </Link>
        </div>
      </div>
    </div>
  );
}
