"use client";

import { useState } from "react";
import { site } from "@/content/site";
import { trackQuoteConversion } from "@/components/GoogleAdsTracking";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Quote enquiry form.
 *
 * Posts to /api/quote. Name, phone and expected price are required; no email field.
 * Includes a honeypot field — the WordPress form was getting hit by bots and
 * Contact Form 7 has no built-in protection.
 */
export function QuoteForm({ id = "quote" }: { id?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    const name = String(data.name ?? "").trim();
    const phone = String(data.phone ?? "").trim();
    const expectedPrice = String(data.expectedPrice ?? "").trim();
    if (!name || phone.replace(/\D/g, "").length < 8 || !expectedPrice) {
      setStatus("error");
      setError(
        !name
          ? "Please enter your name."
          : phone.replace(/\D/g, "").length < 8
            ? "Please enter a valid phone number so we can call you back."
            : "Please enter your expected price.",
      );
      return;
    }

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = (await res.json().catch(() => ({}))) as {
        error?: string;
        leadId?: string;
      };
      if (!res.ok) {
        throw new Error(result.error || `Request failed (${res.status})`);
      }

      // Only count a conversion when the server issued a lead ID — honeypot
      // replies are `{ ok: true }` with no id and must not fire Ads events.
      if (result.leadId) trackQuoteConversion(result.leadId);
      setStatus("success");
      form.reset();
    } catch (caught) {
      setStatus("error");
      setError(
        caught instanceof Error
          ? caught.message
          : `Something went wrong sending your enquiry. Please call us on ${site.phone.display}.`,
      );
    }
  }

  // border-field, not border-hairline: an input border is a UI component
  // boundary and needs 3:1 against its surroundings (WCAG 1.4.11). The
  // hairline grey is 1.26:1 — fine for a decorative divider, not for this.
  const inputClass =
    "w-full rounded border border-field bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-muted focus-visible:border-brand focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand";
  const labelClass = "mb-1.5 block text-sm font-semibold text-ink-heading";

  if (status === "success") {
    return (
      <div
        id={id}
        className="scroll-mt-28 rounded-lg border border-hairline bg-surface p-8 shadow-lg"
        role="status"
        aria-live="polite"
      >
        <h2 className="heading-md mb-3">Thanks — we&apos;ve got your details</h2>
        <p className="mb-6">
          We&apos;ll call you back with a quote shortly. If you&apos;d rather not wait,
          ring us now and we&apos;ll price it on the spot.
        </p>
        <a
          href={site.phone.href}
          className="inline-flex items-center gap-2 rounded bg-brand px-6 py-3 font-bold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {site.phone.display}
        </a>
      </div>
    );
  }

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      className="scroll-mt-28 rounded-lg border border-hairline bg-surface p-6 shadow-lg sm:p-8"
    >
      <h2 className="mb-6 text-2xl font-normal uppercase tracking-wide text-ink-heading">
        Get a Free Quote
      </h2>

      <div className="grid gap-4">
        <div>
          <label htmlFor="q-name" className={labelClass}>
            Name
          </label>
          <input
            id="q-name"
            name="name"
            required
            autoComplete="name"
            placeholder="Jane Smith…"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="q-phone" className={labelClass}>
            Phone
          </label>
          <input
            id="q-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            placeholder="0423 000 000…"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="q-suburb" className={labelClass}>
            Suburb
          </label>
          <input
            id="q-suburb"
            name="suburb"
            autoComplete="address-level2"
            placeholder="Southport…"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="q-vehicle" className={labelClass}>
            Make, model and year
          </label>
          <input
            id="q-vehicle"
            name="vehicle"
            autoComplete="off"
            placeholder="Toyota Corolla 2012…"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="q-price" className={labelClass}>
            Expected price
          </label>
          <input
            id="q-price"
            name="expectedPrice"
            required
            inputMode="numeric"
            autoComplete="off"
            placeholder="$1,500…"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="q-condition" className={labelClass}>
            Condition
          </label>
          <input
            id="q-condition"
            name="condition"
            placeholder="Runs, needs work, wreck…"
            className={inputClass}
          />
        </div>

        {/*
          Honeypot — hidden from people, filled in by bots.

          The name is deliberately meaningless. It used to be `website`, which
          password managers and browser autofill will happily populate; because
          a tripped honeypot answers 200, a real customer would have seen the
          success panel while their enquiry was discarded, with no trace
          anywhere. Don't rename this to anything autofill recognises.
        */}
        <div aria-hidden="true" className="absolute -left-[9999px]">
          <label htmlFor="q-contact-ref">Leave this field empty</label>
          <input id="q-contact-ref" name="contactRef" tabIndex={-1} autoComplete="off" />
        </div>

        {error && (
          <p role="alert" className="rounded border border-brand bg-brand/5 px-4 py-3 text-sm text-brand-dark">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          data-cta="quote-submit"
          className="w-full rounded bg-brand px-6 py-3.5 font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Sending…" : "Get a Free Quote"}
        </button>

        <p className="text-center text-xs text-ink-muted">
          Free, no-obligation quote. We&apos;ll call you back — we never share your number.
        </p>
      </div>
    </form>
  );
}
