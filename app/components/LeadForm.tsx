"use client";

import { FormEvent, useState } from "react";

export function LeadForm({ compact = false }: { compact?: boolean }) {
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = [
      "Hi Unique Cash for Cars, I would like a quote.",
      `Name: ${data.get("name")}`,
      `Phone: ${data.get("phone")}`,
      `Suburb: ${data.get("suburb")}`,
      `Vehicle: ${data.get("vehicle")}`,
      `Condition: ${data.get("condition")}`,
    ].join("\n");
    setSent(true);
    window.location.href = `sms:0423476111?&body=${encodeURIComponent(message)}`;
  }

  return (
    <form className={`lead-form ${compact ? "compact-form" : ""}`} onSubmit={submit}>
      <div className="field-row">
        <label>
          <span>Name</span>
          <input name="name" autoComplete="name" required placeholder="Your name" />
        </label>
        <label>
          <span>Phone</span>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            placeholder="04xx xxx xxx"
          />
        </label>
      </div>
      <label>
        <span>Pickup suburb</span>
        <input name="suburb" autoComplete="address-level2" required placeholder="e.g. Southport" />
      </label>
      <label>
        <span>Vehicle</span>
        <input name="vehicle" required placeholder="Year, make and model" />
      </label>
      <label>
        <span>Condition</span>
        <select name="condition" required defaultValue="">
          <option value="" disabled>Select condition</option>
          <option>Running</option>
          <option>Not running</option>
          <option>Accident damaged</option>
          <option>Old or unwanted</option>
          <option>Scrap vehicle</option>
          <option>Other</option>
        </select>
      </label>
      <button className="button button-primary form-button" type="submit">
        Start my quote
      </button>
      <p className="form-note" role="status">
        {sent
          ? "Your text message is ready to send."
          : "Submitting opens a pre-filled text message. No obligation."}
      </p>
    </form>
  );
}
