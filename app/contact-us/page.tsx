import type { Metadata } from "next";
import { LeadForm } from "../components/LeadForm";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "Contact Unique Cash for Cars",
  description:
    "Call or text Unique Cash for Cars on 0423 476 111 for a free Gold Coast vehicle quote and collection availability.",
  alternates: { canonical: "/contact-us/" },
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="inner-hero">
          <div className="container">
            <p className="eyebrow light">Request a quote</p>
            <h1>Tell us about your vehicle.</h1>
            <p>
              The year, make, model, condition and pickup suburb are enough to
              start. Call for the fastest response or send a pre-filled text.
            </p>
          </div>
        </section>
        <section className="content-section">
          <div className="container contact-panel">
            <div>
              <p className="eyebrow">Call or text</p>
              <h2>Speak directly with our team.</h2>
              <a className="contact-number" href="tel:0423476111">0423 476 111</a>
              <p>
                We service the Gold Coast, Queensland. Collection availability
                depends on your suburb, vehicle access and the day’s route.
              </p>
              <p>
                Please do not send licence numbers or sensitive identity
                documents through the website form.
              </p>
            </div>
            <div className="sticky-quote">
              <h2>Start your quote</h2>
              <p>Submitting prepares a text message for you to review and send.</p>
              <LeadForm />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
