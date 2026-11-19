import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Footer, Header } from "@/components/layout";
import { SoundEffects } from "@/components/ui/sound";
import { ThemeProvider, ThemeScript } from "@/components/ui/theme-toggle";
import { Toasts } from "@/components/ui/toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrueHook — Webhook Infrastructure Platform",
  description:
    "Reliable, secure, and observable webhook delivery infrastructure for developers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <ThemeProvider>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <Toasts />
          <SoundEffects />
        </ThemeProvider>
      </body>
    </html>
  );
}
