import type { ReactNode } from "react";
import { LeadForm } from "./LeadForm";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function InnerPage({
  eyebrow,
  title,
  intro,
  children,
  showQuote = true,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
  showQuote?: boolean;
}) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="inner-hero">
          <div className="container">
            <p className="eyebrow light">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{intro}</p>
          </div>
        </section>
        <section className="content-section">
          <div className={`container ${showQuote ? "two-column-content" : ""}`}>
            <article className="content-narrow">{children}</article>
            {showQuote && (
              <aside className="sticky-quote" aria-label="Request a vehicle quote">
                <h2>Get a free quote</h2>
                <p>Send the essentials by text and we’ll take it from there.</p>
                <LeadForm />
              </aside>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
