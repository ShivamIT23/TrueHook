"use client";

import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Code2,
  HelpCircle,
  LifeBuoy,
  MessageSquare,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "What delivery guarantee does TrueHook provide?",
    answer:
      "TrueHook provides an at-least-once delivery guarantee. Because network timeouts or worker restarts can occur while an HTTP response is in flight, customer endpoints should always design webhook consumers to be idempotent by checking the unique event_id before processing actions.",
  },
  {
    question: "How do I verify the webhook payload signature?",
    answer:
      "Every outgoing HTTP delivery includes two headers: 'truehook-timestamp' (Unix epoch seconds) and 'truehook-signature'. The signature is computed as HMAC-SHA256(key=signing_secret, message='timestamp.payload'). Always compare signatures using constant-time comparison to prevent timing side-channel attacks.",
  },
  {
    question: "How does the retry backoff schedule work?",
    answer:
      "Failed deliveries (HTTP 4xx/5xx or connection timeouts) are scheduled for subsequent attempts using exponential backoff with randomized jitter. This prevents destination services from experiencing thundering-herd overload during recoveries.",
  },
  {
    question: "How does TrueHook protect against SSRF?",
    answer:
      "TrueHook validates every registered endpoint URL and re-checks destination IP addresses at socket connection time. Requests targeting loopback (127.0.0.0/8), RFC1918 private subnets (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16), link-local addresses, and cloud provider metadata (169.254.169.254) are permanently blocked.",
  },
  {
    question: "Can I manually replay a past event or failed delivery?",
    answer:
      "Yes. From the Deliveries inspection panel in your dashboard, click any delivery attempt to view raw headers and payload, and click 'Replay Delivery' to trigger an immediate new delivery attempt using the exact same event payload and event ID.",
  },
];

export function HelpSupportManager() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("integration");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast({
        message: "Please fill out both the subject and message fields.",
        state: "error",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const ticketRef = `THK-${Math.floor(100000 + Math.random() * 900000)}`;
      toast({
        message: `Support ticket submitted! Reference: ${ticketRef}`,
        state: "success",
      });
      setSubject("");
      setMessage("");
    }, 700);
  };

  return (
    <div className="relative isolate min-h-[calc(100vh-5rem)] overflow-y-auto">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 pb-32">
        {/* Page Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <HelpCircle className="h-4 w-4" />
              <span>Developer Resources</span>
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              Help & Support
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Integration guides, architecture references, frequently asked
              questions, and direct engineering support.
            </p>
          </div>

          {/* Operational Status Pill */}
          <div className="flex items-center gap-2 rounded-full border border-border bg-canvas px-3.5 py-1.5 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-semibold text-foreground">
              All Systems Operational
            </span>
          </div>
        </div>

        {/* Quick Resource Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-10">
          <Card className="rounded-xl border border-border bg-canvas p-5 shadow-xs hover:border-border/80 transition-all flex flex-col justify-between">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary2 border border-border text-primary">
                <Code2 className="h-4 w-4" />
              </div>
              <h2 className="mt-3 text-sm font-semibold text-foreground">
                Quickstart Guide
              </h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Step-by-step instructions to register endpoints, publish your
                first event, and consume webhooks.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-1 text-xs font-medium text-primary">
              <span>Read Quickstart</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </Card>

          <Card className="rounded-xl border border-border bg-canvas p-5 shadow-xs hover:border-border/80 transition-all flex flex-col justify-between">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary2 border border-border text-primary">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h2 className="mt-3 text-sm font-semibold text-foreground">
                Signature Verification
              </h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                HMAC-SHA256 signature validation examples in Go, Node.js,
                Python, and Ruby to secure your endpoints.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-1 text-xs font-medium text-primary">
              <span>View Code Samples</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </Card>

          <Card className="rounded-xl border border-border bg-canvas p-5 shadow-xs hover:border-border/80 transition-all flex flex-col justify-between">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary2 border border-border text-primary">
                <BookOpen className="h-4 w-4" />
              </div>
              <h2 className="mt-3 text-sm font-semibold text-foreground">
                API Documentation
              </h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Complete REST API reference covering endpoints, event dispatch,
                attempt logs, and query filtering.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-1 text-xs font-medium text-primary">
              <span>Explore REST API</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </Card>
        </div>

        {/* 2-Column Section: FAQs + Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Frequently Asked Questions */}
          <div className="lg:col-span-7 space-y-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <LifeBuoy className="h-4 w-4 text-primary" />
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Common questions about TrueHook delivery reliability and
                security.
              </p>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((item, index) => {
                const isOpen = expandedIndex === index;
                return (
                  <div
                    key={item.question}
                    className="rounded-xl border border-border bg-canvas shadow-xs overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFAQ(index)}
                      className="flex w-full items-center justify-between p-4 text-left font-medium text-xs text-foreground hover:bg-secondary2 transition-colors cursor-pointer"
                    >
                      <span className="pr-4">{item.question}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/50 animate-in fade-in duration-200">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Contact Support Form */}
          <div className="lg:col-span-5">
            <Card className="rounded-xl border border-border bg-canvas p-6 shadow-xs">
              <CardHeader className="p-0 mb-4">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Contact Support
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Have questions or encounter issues? Our team responds within
                  24 hours.
                </p>
              </CardHeader>

              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="ticket-category"
                    className="text-xs font-medium text-foreground"
                  >
                    Inquiry Category
                  </Label>
                  <select
                    id="ticket-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-9 rounded-md border border-border bg-canvas px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="integration">Integration Assistance</option>
                    <option value="delivery-failure">
                      Delivery & Retry Issue
                    </option>
                    <option value="billing">Account & Quotas</option>
                    <option value="feature">Feature Request</option>
                    <option value="other">Other Inquiry</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="ticket-subject"
                    className="text-xs font-medium text-foreground"
                  >
                    Subject
                  </Label>
                  <Input
                    id="ticket-subject"
                    type="text"
                    placeholder="Brief description of the issue..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="h-9 text-xs bg-canvas border-border text-foreground focus-visible:ring-ring"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="ticket-message"
                    className="text-xs font-medium text-foreground"
                  >
                    Message Details
                  </Label>
                  <Textarea
                    id="ticket-message"
                    rows={4}
                    placeholder="Provide relevant details such as event IDs, endpoint URLs, or error codes..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="text-xs bg-canvas border-border text-foreground focus-visible:ring-ring"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-9 text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
                >
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  <span>
                    {isSubmitting ? "Submitting Ticket..." : "Submit Ticket"}
                  </span>
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
