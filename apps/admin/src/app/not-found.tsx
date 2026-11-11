import { NotFound } from "@/components/ui/not-found";

export default function NotFoundPage() {
  return (
    <NotFound
      statusCode="404"
      description="The operator route or administrative view you requested is not connected."
      primaryAction={{
        label: "Go Home",
        href: "/",
      }}
    />
  );
}
