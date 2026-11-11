import Link from "next/link";

interface AuthFooterProps {
  actionText: string;
}

export function AuthFooter({ actionText }: AuthFooterProps) {
  return (
    <footer className="mt-8 text-center text-xs text-[#70706a]">
      By {actionText}, you agree to our{" "}
      <Link
        href="#"
        className="underline hover:text-[#9e9e96] transition-colors"
      >
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link
        href="#"
        className="underline hover:text-[#9e9e96] transition-colors"
      >
        Privacy Policies
      </Link>
    </footer>
  );
}
