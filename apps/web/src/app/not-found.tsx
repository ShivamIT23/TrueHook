import { NotFound } from "@/components/ui/not-found";

export default function NotFoundPage() {
  return (
    <NotFound
      statusCode="404"
      description="The page you are looking for might have been unplugged, moved, or is temporarily disconnected from our webhook network."
      primaryAction={{
        label: "Go Home",
        href: "/",
      }}
    />
  );
}
