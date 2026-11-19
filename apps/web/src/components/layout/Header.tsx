"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export interface HeaderNavLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface HeaderProps {
  className?: string;
  links?: HeaderNavLink[];
  signInHref?: string;
  signUpHref?: string;
}

const DEFAULT_NAV_LINKS: HeaderNavLink[] = [
  { label: "Features", href: "/#features" },
  { label: "About", href: "/about" },
  { label: "Docs", href: "/docs" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Contact", href: "/contact" },
];

export function Header({
  className = "",
  links = DEFAULT_NAV_LINKS,
  signInHref = "http://localhost:3001/signin",
  signUpHref = "http://localhost:3001/signup",
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    if (pathname) {
      setMobileMenuOpen(false);
    }
  }, [pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }

    if (mobileMenuOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md text-foreground transition-colors duration-200 ${className}`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          {/* Light mode logo */}
          <Image
            src="/logo1.png"
            alt="TrueHook Logo"
            width={600}
            height={400}
            className="h-9 w-auto object-contain transition-transform duration-200 dark:hidden"
            priority
          />
          {/* Dark mode logo */}
          <div className="hidden dark:flex items-center gap-2">
            <Image
              src="/small-logo-white.png"
              alt="TrueHook Logo"
              width={36}
              height={36}
              className="h-8 w-8 object-contain"
              priority
            />
            <span className="text-lg font-bold tracking-tight text-foreground font-sans">
              TrueHook
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-1"
        >
          {links.map((link) => {
            const isExternal = link.external || link.href.startsWith("http");
            return isExternal ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary2 rounded-md transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary2 rounded-md transition-colors"
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href={signInHref}
            className="px-3.5 py-1.5 text-sm font-medium text-foreground hover:text-primary hover:bg-secondary2 rounded-md transition-colors"
          >
            Sign In
          </Link>
          <Link
            href={signUpHref}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors shadow-xs"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu & Theme Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-secondary2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 pt-2 pb-6 md:hidden">
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-1">
            {links.map((link) => {
              const isExternal = link.external || link.href.startsWith("http");
              return isExternal ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-secondary2 hover:text-primary transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-secondary2 hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
            <Link
              href={signInHref}
              className="block w-full rounded-md px-3 py-2.5 text-center text-base font-medium text-foreground hover:bg-secondary2 hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href={signUpHref}
              className="block w-full rounded-md bg-primary px-3 py-2.5 text-center text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
