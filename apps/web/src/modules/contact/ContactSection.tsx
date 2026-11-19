"use client";

import {
  CheckCircle2,
  Clock,
  HelpCircle,
  Mail,
  Send,
  Shield,
  Terminal,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CHANNELS = [
  {
    icon: Terminal,
    title: "Technical Support",
    email: "support@truehook.dev",
    description:
      "Assistance with webhook delivery failures, retry policies, or API integration.",
    sla: "< 2 hours for critical incidents",
  },
  {
    icon: Shield,
    title: "Security & Vulnerability",
    email: "security@truehook.dev",
    description:
      "Responsible vulnerability disclosure, SSRF audits, and cryptographic signing queries.",
    sla: "< 12 hours response",
  },
  {
    icon: Mail,
    title: "Enterprise & Billing",
    email: "billing@truehook.dev",
    description:
      "Volume-based enterprise pricing, invoicing, SLA agreements, and refund requests.",
    sla: "< 24 hours response",
  },
];

export function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("support");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      {/* Header */}
      <div className="max-w-2xl">
        <Badge
          variant="outline"
          className="border-primary/40 bg-primary/10 text-primary font-mono text-[11px] mb-3"
        >
          CONTACT & SUPPORT
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Talk to the TrueHook Team
        </h1>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          Need technical assistance, have custom enterprise throughput
          requirements, or want to report an issue? We are here to help.
        </p>
      </div>

      {/* Grid: Direct Channels + Form */}
      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Left: Contact Form */}
        <div className="lg:col-span-7">
          <Card className="border-border bg-card shadow-sm rounded-2xl">
            <CardHeader className="p-6 sm:p-8 border-b border-border/60">
              <CardTitle className="text-lg font-semibold text-foreground">
                Send a Message
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Direct dispatch to our engineering escalation inbox.
              </p>
            </CardHeader>

            <CardContent className="p-6 sm:p-8">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-4">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Message Dispatched
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Thank you,{" "}
                    <span className="font-semibold text-foreground">
                      {name}
                    </span>
                    . Our engineering on-call has received your message and will
                    reply to{" "}
                    <span className="font-mono text-foreground">{email}</span>{" "}
                    shortly.
                  </p>
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setMessage("");
                      setSubject("");
                    }}
                    variant="outline"
                    className="mt-6 border-border text-xs"
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="contact-name"
                        className="text-xs font-medium text-foreground"
                      >
                        Your Name
                      </Label>
                      <Input
                        id="contact-name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Rivera"
                        className="h-10 border-border bg-background text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="contact-email"
                        className="text-xs font-medium text-foreground"
                      >
                        Work Email
                      </Label>
                      <Input
                        id="contact-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@company.com"
                        className="h-10 border-border bg-background text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="contact-category"
                      className="text-xs font-medium text-foreground"
                    >
                      Inquiry Category
                    </Label>
                    <select
                      id="contact-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    >
                      <option value="support">
                        Technical Support & Troubleshooting
                      </option>
                      <option value="sales">
                        Enterprise Volume & Dedicated Clusters
                      </option>
                      <option value="billing">
                        Billing, Invoices & Refund Request
                      </option>
                      <option value="security">
                        Security & Vulnerability Disclosure
                      </option>
                      <option value="other">General Inquiries</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="contact-subject"
                      className="text-xs font-medium text-foreground"
                    >
                      Subject
                    </Label>
                    <Input
                      id="contact-subject"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Rate limit question regarding batch dispatch"
                      className="h-10 border-border bg-background text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="contact-message"
                      className="text-xs font-medium text-foreground"
                    >
                      Message Details
                    </Label>
                    <Textarea
                      id="contact-message"
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your technical inquiry, endpoint URL, or account context..."
                      className="border-border bg-background text-sm resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-10 mt-2 bg-primary text-primary-foreground font-medium text-sm gap-2 hover:bg-primary/90 cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    <span>
                      {isSubmitting ? "Sending..." : "Submit Inquiry"}
                    </span>
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Direct Channels & SLA Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Direct Channels
            </h3>
            {CHANNELS.map((ch) => {
              const Icon = ch.icon;
              return (
                <Card
                  key={ch.title}
                  className="border-border bg-card p-5 rounded-xl shadow-xs"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-foreground">
                        {ch.title}
                      </h4>
                      <a
                        href={`mailto:${ch.email}`}
                        className="font-mono text-xs text-primary hover:underline inline-block"
                      >
                        {ch.email}
                      </a>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {ch.description}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground pt-1">
                        <Clock className="h-3 w-3 text-muted-foreground/60" />
                        <span>SLA: {ch.sla}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Quick FAQ / Diagnostic Box */}
          <Card className="border-border bg-secondary2/30 p-5 rounded-xl">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <h4 className="font-semibold text-foreground">
                  Looking for quick answers?
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Before reaching out, check out our developer documentation for
                  endpoint signing guides, replay triggers, and webhook event
                  schemas.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
