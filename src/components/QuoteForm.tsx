"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { site } from "@/content/site";
import {
  normalizeQuoteValue,
  quoteFieldLimits,
  quoteFieldOrder,
  quoteIdPattern,
  savedQuoteReference,
  validateQuoteFields,
  type QuoteFieldErrors,
  type QuoteFieldName,
} from "@/lib/quote-validation";
import {
  trackQuoteConversion,
  trackQuoteFormError,
  trackQuoteFormStart,
  type QuoteFormErrorCategory,
} from "@/components/GoogleAdsTracking";

type Status = "idle" | "submitting" | "success" | "saved" | "preview" | "error";
type SubmissionIdentity = Readonly<{ fingerprint: string; key: string }>;

const subscribeToClient = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

async function submissionFingerprint(
  data: Record<string, FormDataEntryValue>,
) {
  const canonical = JSON.stringify([
    normalizeQuoteValue(data.name),
    normalizeQuoteValue(data.phone),
    normalizeQuoteValue(data.suburb),
    normalizeQuoteValue(data.vehicle),
    normalizeQuoteValue(data.expectedPrice) || "Not sure",
    normalizeQuoteValue(data.condition) || "—",
  ]);
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(canonical),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

const validationCategories: Record<QuoteFieldName, QuoteFormErrorCategory> = {
  name: "validation_name",
  phone: "validation_phone",
  suburb: "validation_suburb",
  vehicle: "validation_vehicle",
  expectedPrice: "validation_expected_price",
  condition: "validation_condition",
};

function isQuoteFieldName(name: string): name is QuoteFieldName {
  return quoteFieldOrder.includes(name as QuoteFieldName);
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
  if (status === 409) {
    return "Your details changed while this enquiry was being submitted. Please submit them once more.";
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
  // SSR and the first hydration render keep native submission unavailable.
  // The explicit POST action below also prevents GET URLs if native submit()
  // bypasses the disabled button. Only the ready client sends the JSON protocol.
  const ready = useSyncExternalStore(subscribeToClient, clientReady, serverReady);
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<QuoteFieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [leadReference, setLeadReference] = useState<string | null>(null);
  const hasStartedRef = useRef(false);
  const submissionIdentityRef = useRef<SubmissionIdentity | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const firstInvalidFieldRef = useRef<QuoteFieldName | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const fieldErrorIds: Record<QuoteFieldName, string> = {
    name: `${id}-name-error`,
    phone: `${id}-phone-error`,
    suburb: `${id}-suburb-error`,
    vehicle: `${id}-vehicle-error`,
    expectedPrice: `${id}-price-error`,
    condition: `${id}-condition-error`,
  };

  useEffect(() => {
    if (status === "success" || status === "saved" || status === "preview") resultRef.current?.focus();
  }, [status]);

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
      !(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) ||
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
      !(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) ||
      !isQuoteFieldName(field.name)
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
    if (!ready || status === "submitting") return;
    trackFormStartOnce();
    setServerError(null);

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    const { errors: validationErrors } = validateQuoteFields(data);
    const firstInvalidField = quoteFieldOrder.find(
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
      const fingerprint = await submissionFingerprint(data);
      const storageKey = `ucfc:quote-submission:${id}`;
      let identity = submissionIdentityRef.current;

      if (!identity || identity.fingerprint !== fingerprint) {
        try {
          const stored = JSON.parse(
            sessionStorage.getItem(storageKey) ?? "null",
          ) as Partial<SubmissionIdentity> | null;
          identity =
            stored?.fingerprint === fingerprint &&
            typeof stored.key === "string" &&
            quoteIdPattern.test(stored.key)
              ? { fingerprint, key: stored.key.toLowerCase() }
              : null;
        } catch {
          identity = null;
        }
      }

      if (!identity) {
        identity = { fingerprint, key: crypto.randomUUID() };
      }
      submissionIdentityRef.current = identity;
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(identity));
      } catch {
        // Same-page retries still reuse the in-memory identity if storage is
        // blocked or unavailable.
      }

      const res = await fetch("/api/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": identity.key,
        },
        body: JSON.stringify(data),
      });

      const result: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const savedReference = savedQuoteReference(result);
        if (res.status === 502 && savedReference) {
          trackQuoteFormError("delivery_unavailable");
          setLeadReference(savedReference);
          setStatus("saved");
          return;
        }
        if (res.status === 409) {
          submissionIdentityRef.current = null;
          try {
            sessionStorage.removeItem(storageKey);
          } catch {
            // Nothing else to clean up.
          }
        }
        trackQuoteFormError(responseErrorCategory(res.status));
        setStatus("error");
        setServerError(responseErrorMessage(res.status));
        return;
      }

      if (result && typeof result === "object" && "code" in result && result.code === "preview_quote") {
        setLeadReference(null);
        setStatus("preview");
        return;
      }

      // Only count a conversion when the server issued a lead ID — honeypot
      // replies are `{ ok: true }` with no id and must not fire Ads events.
      const leadId = result && typeof result === "object" && "leadId" in result
        ? result.leadId : undefined;
      if (typeof leadId === "string" && quoteIdPattern.test(leadId)) {
        trackQuoteConversion(leadId);
        setLeadReference(
          leadId.slice(0, 8).toUpperCase(),
        );
      } else {
        setLeadReference(null);
      }
      submissionIdentityRef.current = null;
      try {
        sessionStorage.removeItem(storageKey);
      } catch {
        // The enquiry is already safely accepted.
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

  if (status === "success" || status === "saved" || status === "preview") {
    return (
      <div
        ref={resultRef}
        id={id}
        tabIndex={-1}
        className="scroll-mt-28 rounded-lg border border-hairline bg-surface p-8 shadow-lg"
        role="status"
        aria-live="polite"
      >
        <h2 className="heading-md mb-3">
          {status === "preview" ? "Preview checked — no enquiry sent"
            : status === "saved" ? "Your details are saved — please call us" : "Thanks — we’ve safely received your details"}
        </h2>
        <p className="mb-6">
          {status === "preview"
            ? "This preview checks the form without saving your details or sending a notification. To request a real quote, visit our live website or call us."
            : status === "saved"
            ? "Your enquiry needs our attention because the automatic notification could not be delivered. Please call and quote the reference below so we can find your details."
            : "We’ll call you back during our opening hours, 8am–5pm daily. If you’d prefer to speak with us, call the number below."}
        </p>
        {leadReference ? (
          <p className="mb-6 rounded bg-surface-alt px-4 py-3 text-sm text-ink-heading">
            Your enquiry reference is{" "}
            <strong className="font-bold">{leadReference}</strong>.
          </p>
        ) : null}
        <a
          href={site.phone.href}
          className="inline-flex items-center gap-2 rounded bg-brand px-6 py-3 font-bold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark"
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
      method="post"
      action="/api/quote"
      noValidate
      onSubmit={handleSubmit}
      onFocusCapture={handleFormStart}
      onInputCapture={handleInput}
      className="scroll-mt-28 rounded-lg border border-hairline bg-surface p-6 shadow-lg sm:p-8"
    >
      <h2 className="mb-6 text-2xl font-normal uppercase tracking-wide text-ink-heading">
        Get a Free Quote
      </h2>

      {!ready ? (
        <p className="mb-5 text-sm" role="status">
          You can call <a className="font-semibold text-brand underline" href={site.phone.href}>{site.phone.display}</a> for a quote if this form does not become available.
        </p>
      ) : null}
      <noscript>
        <p className="mb-5 text-sm">Online submission needs JavaScript. Please call {site.phone.display} for your quote.</p>
      </noscript>

      <div className="grid gap-4">
        <div>
          <label htmlFor={`${id}-name`} className={labelClass}>
            Name
          </label>
          <input
            id={`${id}-name`}
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
          <label htmlFor={`${id}-phone`} className={labelClass}>
            Phone
          </label>
          <input
            id={`${id}-phone`}
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
          <label htmlFor={`${id}-suburb`} className={labelClass}>
            Suburb
          </label>
          <input
            id={`${id}-suburb`}
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
          <label htmlFor={`${id}-vehicle`} className={labelClass}>
            Make, model and year
          </label>
          <input
            id={`${id}-vehicle`}
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
          <label htmlFor={`${id}-price`} className={labelClass}>
            Expected price{" "}
            <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <input
            id={`${id}-price`}
            name="expectedPrice"
            aria-invalid={Boolean(fieldErrors.expectedPrice)}
            aria-describedby={fieldErrors.expectedPrice ? fieldErrorIds.expectedPrice : undefined}
            inputMode="numeric"
            autoComplete="off"
            placeholder="$1,500 or leave blank…"
            className={inputClass}
          />
          {fieldErrors.expectedPrice ? (
            <p id={fieldErrorIds.expectedPrice} className="mt-1.5 text-sm font-semibold text-brand-dark">{fieldErrors.expectedPrice}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor={`${id}-condition`} className={labelClass}>
            Condition <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <textarea
            id={`${id}-condition`}
            name="condition"
            rows={3}
            aria-invalid={Boolean(fieldErrors.condition)}
            aria-describedby={`${id}-condition-help${fieldErrors.condition ? ` ${fieldErrorIds.condition}` : ""}`}
            placeholder="Runs, needs work, wreck…"
            className={inputClass}
          />
          <p id={`${id}-condition-help`} className="mt-1.5 text-sm text-ink-muted">Up to {quoteFieldLimits.condition} characters. Include damage or collection details.</p>
          {fieldErrors.condition ? (
            <p id={fieldErrorIds.condition} className="mt-1.5 text-sm font-semibold text-brand-dark">{fieldErrors.condition}</p>
          ) : null}
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
          <label htmlFor={`${id}-contact-ref`}>Leave this field empty</label>
          <input id={`${id}-contact-ref`} name="contactRef" tabIndex={-1} autoComplete="off" />
        </div>

        {serverError ? (
          <p role="alert" className="rounded border border-brand bg-brand/5 px-4 py-3 text-sm text-brand-dark">
            {serverError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!ready || status === "submitting"}
          data-cta="quote-submit"
          className="w-full rounded bg-brand px-6 py-3.5 font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
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
