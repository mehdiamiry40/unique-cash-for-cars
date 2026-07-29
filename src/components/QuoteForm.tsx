"use client";

import { useState } from "react";
import { site } from "@/content/site";
import { trackQuoteConversion } from "@/components/GoogleAdsTracking";

const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid"] as const;

type Status = "idle" | "submitting" | "success" | "error";

/**
 * The "Get Fast Enquiry" form from the original site.
 *
 * Posts to /api/quote. Includes a honeypot field — the WordPress form was
 * getting hit by bots and Contact Form 7 has no built-in protection.
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

      trackQuoteConversion(result.leadId);
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
    "w-full rounded border border-field bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-muted focus:border-brand focus:outline-2 focus:outline-offset-0 focus:outline-brand";

  if (status === "success") {
    return (
      <div
        id={id}
        className="scroll-mt-28 rounded-lg border border-hairline bg-surface p-8 shadow-lg"
        role="status"
      >
        <h2 className="heading-md mb-3">Thanks — we&apos;ve got your details</h2>
        <p className="mb-6">
          We&apos;ll call you back with a quote shortly. If you&apos;d rather not wait,
          ring us now and we&apos;ll price it on the spot.
        </p>
        <a
          href={site.phone.href}
          className="inline-flex items-center gap-2 rounded bg-brand px-6 py-3 font-bold text-white hover:bg-brand-dark"
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
      noValidate
    >
      <h2 className="mb-6 text-2xl font-normal uppercase tracking-wide text-ink-heading">
        Get Fast Enquiry
      </h2>

      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="q-name" className="sr-only">
              Your name
            </label>
            <input
              id="q-name"
              name="name"
              required
              autoComplete="name"
              placeholder="Name*"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="q-phone" className="sr-only">
              Your phone number
            </label>
            <input
              id="q-phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              inputMode="tel"
              placeholder="Phone*"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="q-email" className="sr-only">
            Your email address
          </label>
          <input
            id="q-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="Email*"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="q-suburb" className="sr-only">
            Suburb where the car is located
          </label>
          <input
            id="q-suburb"
            name="suburb"
            autoComplete="address-level2"
            placeholder="Suburb"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="q-vehicle" className="sr-only">
            Make, model and year
          </label>
          <input
            id="q-vehicle"
            name="vehicle"
            placeholder="Make, Model, & Year"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="q-price" className="sr-only">
            Expected price
          </label>
          <input
            id="q-price"
            name="expectedPrice"
            inputMode="numeric"
            placeholder="Expected Price"
            className={inputClass}
          />
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink-heading">Fuel type</legend>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {FUEL_TYPES.map((fuel, i) => (
              <label key={fuel} className="flex items-center gap-2 text-sm font-bold">
                <input
                  type="radio"
                  name="fuel"
                  value={fuel}
                  defaultChecked={i === 0}
                  className="size-4 accent-[var(--color-brand)]"
                />
                {fuel}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="q-condition" className="sr-only">
            Car condition
          </label>
          <input
            id="q-condition"
            name="condition"
            placeholder="Car Condition"
            className={inputClass}
          />
        </div>

        {/*
          Honeypot — hidden from people, filled in by bots.

          The name is deliberately meaningless. It used to be `website`, which
          password managers and browser autofill will happily populate; because
          a tripped honeypot answers 200, a real customer would have seen the
          success panel while their enquiry went in the bin. Don't rename this
          to anything autofill recognises.
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
          className="w-full rounded bg-brand px-6 py-3.5 font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Sending…" : "Get a Free Quote"}
        </button>

        <p className="text-center text-xs text-ink-muted">
          Free, no-obligation quote. We&apos;ll never share your details.
        </p>
      </div>
    </form>
  );
}
