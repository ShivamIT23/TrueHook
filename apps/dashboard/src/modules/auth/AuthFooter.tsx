import Link from "next/link";

interface AuthFooterProps {
  actionText: string;
}

export function AuthFooter({ actionText }: AuthFooterProps) {
  return (
    <footer className="mt-8 text-center text-xs text-[#F3EEE3]/50">
      By {actionText}, you agree to our{" "}
      <Link
        href="#"
        className="underline hover:text-[#F3EEE3]/80 transition-colors"
      >
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link
        href="#"
        className="underline hover:text-[#F3EEE3]/80 transition-colors"
      >
        Privacy Policies
      </Link>
    </footer>
  );
}
