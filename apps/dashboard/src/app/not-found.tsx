import { NotFound } from "@/components/ui/not-found";

export default function NotFoundPage() {
  return (
    <NotFound
      statusCode="404"
      description="The dashboard resource or endpoint stream you are looking for has been disconnected."
      primaryAction={{
        label: "Go Home",
        href: "/",
      }}
    />
  );
}
