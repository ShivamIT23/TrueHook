import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { SoundEffects } from "@/components/ui/sound";
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
  title: "TrueHook Admin | Operator Console",
  description:
    "Internal administration console for TrueHook platform operators",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`min-h-full flex flex-col ${inter.className}`}>
        {children}
        <Toasts />
        <SoundEffects />
      </body>
    </html>
  );
}
