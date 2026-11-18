import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-background font-sans text-foreground">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-24 px-8 sm:px-16 sm:items-start">
        <Image
          className="h-5 w-25"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left mt-8">
          <h1 className="max-w-md text-3xl font-semibold leading-10 tracking-tight text-foreground">
            To get started, edit the{" "}
            <code className="rounded bg-secondary2 px-1.5 py-0.5 font-mono text-[0.9em] border border-border">
              page.tsx
            </code>{" "}
            file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-muted-foreground">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-foreground underline hover:text-primary transition-colors"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-foreground underline hover:text-primary transition-colors"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row mt-8">
          <a
            className="group/button relative isolate inline-flex shrink-0 items-center justify-center rounded-lg bg-clip-padding text-sm font-medium whitespace-nowrap outline-none select-none focus-visible:ring-2 focus-visible:ring-ring text-primary-foreground bg-primary hover:bg-primary/90 h-10 gap-2 px-5 cursor-pointer shadow-xs transition-colors"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={0}
            data-slot="button"
            data-sound="success"
          >
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Image
                className="invert h-3.5 w-4"
                src="/vercel.svg"
                alt="Vercel logomark"
                width={16}
                height={14}
              />
              Deploy Now
            </span>
          </a>
          <a
            className="flex h-10 w-full items-center justify-center rounded-lg border border-border px-5 text-foreground transition-colors hover:bg-secondary2 md:w-auto"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
