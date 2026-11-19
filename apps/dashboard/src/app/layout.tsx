import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { QueryProvider } from "@/components/providers/QueryProvider";
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
  title: "TrueHook Dashboard",
  description: "A Dashboard for users to access their applications",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body
        className={`min-h-full flex relative flex-col bg-background text-foreground transition-colors duration-200 ${inter.className}`}
      >
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toasts position="top-center" />
            <SoundEffects />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
