import type { Metadata } from "next";
import { AboutContent } from "@/modules/about/AboutContent";

export const metadata: Metadata = {
  title: "About Us — TrueHook",
  description:
    "Learn why we built TrueHook, our architecture principles, and our commitment to dependable webhook delivery.",
};

export default function AboutPage() {
  return <AboutContent />;
}
