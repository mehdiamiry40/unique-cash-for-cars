"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import {
  trackQuoteConversion,
  trackQuoteFormError,
  trackQuoteFormStart,
  type QuoteFormErrorCategory,
} from "@/components/GoogleAdsTracking";

type Status = "idle" | "submitting" | "success" | "error";
type RequiredFieldName = "name" | "phone" | "suburb" | "vehicle";
type FieldErrors = Partial<Record<RequiredFieldName, string>>;

const requiredFieldOrder: RequiredFieldName[] = [
  "name",
  "phone",
  "suburb",
  "vehicle",
];

const validationCategories: Record<RequiredFieldName, QuoteFormErrorCategory> = {
  name: "validation_name",
  phone: "validation_phone",
  suburb: "validation_suburb",
  vehicle: "validation_vehicle",
};

function isRequiredFieldName(name: string): name is RequiredFieldName {
  return requiredFieldOrder.includes(name as RequiredFieldName);
}

function responseErrorCategory(status: number): QuoteFormErrorCategory {
  if (status === 429) return "rate_limited";
  if (status === 502 || status === 503) return "delivery_unavailable";
  return "request_rejected";
}

function responseErrorMessage(status: number) {
  if (status === 429) {
    return `Please wait a moment before trying again, or call ${site.name} on ${site.phone.display}.`;
  }
  if (status === 502 || status === 503) {
    return `${site.name} couldn’t deliver your quote request right now. Please try again shortly or call ${site.phone.display}.`;
  }
  return `${site.name} couldn’t submit your quote request. Please try again or call ${site.phone.display}.`;
}

/**
 * Quote enquiry form.
 *
 * Posts to /api/quote. Name, phone, suburb and vehicle are required; no email field.
 * Includes a honeypot field — the WordPress form was getting hit by bots and
 * Contact Form 7 has no built-in protection.
 */
export function QuoteForm({ id = "quote" }: { id?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [leadReference, setLeadReference] = useState<string | null>(null);
  const hasStartedRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const firstInvalidFieldRef = useRef<RequiredFieldName | null>(null);

  const fieldErrorIds: Record<RequiredFieldName, string> = {
    name: `${id}-name-error`,
    phone: `${id}-phone-error`,
    suburb: `${id}-suburb-error`,
    vehicle: `${id}-vehicle-error`,
  };

  useEffect(() => {
    const fieldName = firstInvalidFieldRef.current;
    if (!fieldName) return;

    firstInvalidFieldRef.current = null;
    const field = formRef.current?.elements.namedItem(fieldName);
    if (field instanceof HTMLElement) field.focus();
  }, [fieldErrors]);

  function trackFormStartOnce() {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    trackQuoteFormStart();
  }

  function handleFormStart(event: React.SyntheticEvent<HTMLFormElement>) {
    const field = event.target;
    if (
      !(field instanceof HTMLInputElement) ||
      field.name === "contactRef"
    ) {
      return;
    }

    trackFormStartOnce();
  }

  function handleInput(event: React.FormEvent<HTMLFormElement>) {
    handleFormStart(event);

    const field = event.target;
    if (
      !(field instanceof HTMLInputElement) ||
      !isRequiredFieldName(field.name)
    ) {
      return;
    }

    const fieldName = field.name;
    setFieldErrors((currentErrors) => {
      if (!currentErrors[fieldName]) return currentErrors;

      const nextErrors = { ...currentErrors };
      delete nextErrors[fieldName];
      return nextErrors;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    trackFormStartOnce();
    setServerError(null);

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    const name = String(data.name ?? "").trim();
    const phone = String(data.phone ?? "").trim();
    const suburb = String(data.suburb ?? "").trim();
    const vehicle = String(data.vehicle ?? "").trim();
    const validationErrors: FieldErrors = {};

    if (!name) validationErrors.name = "Please enter your name.";
    if (phone.replace(/\D/g, "").length < 8) {
      validationErrors.phone =
        "Please enter a valid phone number so we can call you back.";
    }
    if (!suburb) {
      validationErrors.suburb =
        "Please enter the suburb where the vehicle is located.";
    }
    if (!vehicle) {
      validationErrors.vehicle = "Please enter the vehicle’s make, model and year.";
    }

    const firstInvalidField = requiredFieldOrder.find(
      (fieldName) => validationErrors[fieldName],
    );
    if (firstInvalidField) {
      firstInvalidFieldRef.current = firstInvalidField;
      trackQuoteFormError(validationCategories[firstInvalidField]);
      setFieldErrors(validationErrors);
      setStatus("error");
      return;
    }

    setFieldErrors({});
    setStatus("submitting");

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = (await res.json().catch(() => ({}))) as { leadId?: string };
      if (!res.ok) {
        trackQuoteFormError(responseErrorCategory(res.status));
        setStatus("error");
        setServerError(responseErrorMessage(res.status));
        return;
      }

      // Only count a conversion when the server issued a lead ID — honeypot
      // replies are `{ ok: true }` with no id and must not fire Ads events.
      if (result.leadId) {
        trackQuoteConversion(result.leadId);
        setLeadReference(
          result.leadId.split("-", 1)[0].slice(0, 8).toUpperCase(),
        );
      } else {
        setLeadReference(null);
      }
      setStatus("success");
      form.reset();
    } catch {
      trackQuoteFormError("network_error");
      setStatus("error");
      setServerError(
        `${site.name} couldn’t connect to the quote service. Please check your connection, try again, or call ${site.phone.display}.`,
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
        {leadReference ? (
          <p className="mb-6 rounded bg-surface-alt px-4 py-3 text-sm text-ink-heading">
            Your enquiry reference is{" "}
            <strong className="font-bold">{leadReference}</strong>.
          </p>
        ) : null}
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
      ref={formRef}
      id={id}
      noValidate
      onSubmit={handleSubmit}
      onFocusCapture={handleFormStart}
      onInputCapture={handleInput}
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
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? fieldErrorIds.name : undefined}
            autoComplete="name"
            placeholder="Jane Smith…"
            className={inputClass}
          />
          {fieldErrors.name ? (
            <p
              id={fieldErrorIds.name}
              className="mt-1.5 text-sm font-semibold text-brand-dark"
            >
              {fieldErrors.name}
            </p>
          ) : null}
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
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? fieldErrorIds.phone : undefined}
            autoComplete="tel"
            inputMode="tel"
            placeholder="0423 000 000…"
            className={inputClass}
          />
          {fieldErrors.phone ? (
            <p
              id={fieldErrorIds.phone}
              className="mt-1.5 text-sm font-semibold text-brand-dark"
            >
              {fieldErrors.phone}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="q-suburb" className={labelClass}>
            Suburb
          </label>
          <input
            id="q-suburb"
            name="suburb"
            required
            aria-invalid={Boolean(fieldErrors.suburb)}
            aria-describedby={
              fieldErrors.suburb ? fieldErrorIds.suburb : undefined
            }
            autoComplete="address-level2"
            placeholder="Southport…"
            className={inputClass}
          />
          {fieldErrors.suburb ? (
            <p
              id={fieldErrorIds.suburb}
              className="mt-1.5 text-sm font-semibold text-brand-dark"
            >
              {fieldErrors.suburb}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="q-vehicle" className={labelClass}>
            Make, model and year
          </label>
          <input
            id="q-vehicle"
            name="vehicle"
            required
            aria-invalid={Boolean(fieldErrors.vehicle)}
            aria-describedby={
              fieldErrors.vehicle ? fieldErrorIds.vehicle : undefined
            }
            autoComplete="off"
            placeholder="Toyota Corolla 2012…"
            className={inputClass}
          />
          {fieldErrors.vehicle ? (
            <p
              id={fieldErrorIds.vehicle}
              className="mt-1.5 text-sm font-semibold text-brand-dark"
            >
              {fieldErrors.vehicle}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="q-price" className={labelClass}>
            Expected price{" "}
            <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <input
            id="q-price"
            name="expectedPrice"
            inputMode="numeric"
            autoComplete="off"
            placeholder="$1,500 or leave blank…"
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

        {serverError ? (
          <p role="alert" className="rounded border border-brand bg-brand/5 px-4 py-3 text-sm text-brand-dark">
            {serverError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={status === "submitting"}
          data-cta="quote-submit"
          className="w-full rounded bg-brand px-6 py-3.5 font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Sending…" : "Get a Free Quote"}
        </button>

        <p className="text-center text-xs text-ink-muted">
          Free, no-obligation quote. Our form-delivery provider processes your
          details, and we may share them with a towing operator to arrange
          collection. Read our{" "}
          <Link
            href="/privacy-policy"
            className="font-semibold text-brand underline underline-offset-2 hover:text-brand-dark"
          >
            privacy policy
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
