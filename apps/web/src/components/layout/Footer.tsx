import { ArrowUpRight, ShieldCheck, Terminal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-background text-foreground transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src="/logo1.png"
                alt="TrueHook Logo"
                width={120}
                height={32}
                className="h-8 w-auto object-contain dark:hidden"
              />
              <div className="hidden dark:flex items-center gap-2">
                <Image
                  src="/small-logo-white.png"
                  alt="TrueHook Logo"
                  width={32}
                  height={32}
                  className="h-7 w-7 object-contain"
                />
                <span className="text-lg font-bold tracking-tight text-foreground font-sans">
                  TrueHook
                </span>
              </div>
            </Link>

            <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
              Developer-first webhook delivery infrastructure. Guaranteed
              at-least-once delivery, durable retries with jitter, HMAC-SHA256
              signatures, and real-time observability.
            </p>

            {/* Operational Status Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary2/40 px-3 py-1 text-xs font-mono text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Systems Operational • 99.99% Uptime</span>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/#features"
                  className="transition-colors hover:text-foreground"
                >
                  Features & Pipeline
                </Link>
              </li>
              <li>
                <a
                  href="http://localhost:3001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                >
                  <span>Customer Dashboard</span>
                  <ArrowUpRight className="h-3 w-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="http://localhost:8080/healthz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-foreground font-mono text-xs"
                >
                  <Terminal className="h-3 w-3 text-primary" />
                  <span>API Healthcheck</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/about"
                  className="transition-colors hover:text-foreground"
                >
                  About TrueHook
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-foreground"
                >
                  Contact & Support
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/ShivamIT23/TrueHook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                >
                  <svg
                    className="h-3.5 w-3.5 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <span>GitHub Repository</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Legal & Policy
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/terms"
                  className="transition-colors hover:text-foreground"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="transition-colors hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/refund"
                  className="transition-colors hover:text-foreground"
                >
                  Refund Policy
                </Link>
              </li>
              <li className="pt-2">
                <div className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  <span>SSRF & HMAC Protected</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="mt-12 border-t border-border/60 pt-6 flex flex-col items-center justify-between gap-4 sm:flex-row text-xs text-muted-foreground">
          <p>© {currentYear} TrueHook Inc. All rights reserved.</p>
          <p className="font-mono text-[11px]">
            Designed for engineers • Reliable outbound webhooks
          </p>
        </div>
      </div>
    </footer>
  );
}
