import type { ReactNode } from "react";
import { site } from "@/content/site";

/** Constrained content column, matching the ~1200px container on the old site. */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-(--container-site) px-5 sm:px-6 ${className}`}>
      {children}
    </div>
  );
}

/** Vertical rhythm section. `tone="alt"` gives the light grey band. */
export function Section({
  children,
  tone = "default",
  className = "",
  id,
}: {
  children: ReactNode;
  tone?: "default" | "alt";
  className?: string;
  id?: string;
}) {
  const tones = {
    default: "bg-surface",
    alt: "bg-surface-alt",
  } as const;

  return (
    <section id={id} className={`${tones[tone]} py-14 sm:py-16 ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}

/** Centred section heading, matching the old site's h2 treatment. */
export function SectionHeading({
  children,
  align = "center",
  as: Tag = "h2",
}: {
  children: ReactNode;
  align?: "center" | "left";
  as?: "h2" | "h3";
}) {
  return (
    <Tag
      className={`heading-lg mb-8 ${align === "center" ? "text-center" : ""}`}
    >
      {children}
    </Tag>
  );
}

export function PhoneIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.3 2.2Z" />
    </svg>
  );
}

/** The red phone CTA used throughout the site. */
export function CallButton({
  className = "",
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <a
      href={site.phone.href}
      data-cta="call"
      className={`inline-flex items-center justify-center gap-2.5 rounded bg-brand px-7 py-3.5 text-lg font-bold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${className}`}
    >
      <PhoneIcon />
      {label ?? site.phone.display}
    </a>
  );
}

/** White card with hairline border — the service-card treatment on the old site. */
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded border border-hairline bg-surface p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

/** Bulleted list with the brand-red markers used in the hero. */
export function CheckList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            aria-hidden="true"
            className="mt-2 size-1.5 shrink-0 rounded-full bg-brand"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
