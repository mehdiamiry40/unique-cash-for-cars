import type { Metadata } from "next";
import { InnerPage } from "../components/InnerPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy information for Unique Cash for Cars website enquiries.",
  alternates: { canonical: "/privacy-policy/" },
};

export default function PrivacyPage() {
  return (
    <InnerPage
      eyebrow="Privacy"
      title="Privacy policy."
      intro="This page explains the limited information used when you contact Unique Cash for Cars through this website."
      showQuote={false}
    >
      <h2>Information you provide</h2>
      <p>
        When you request a quote, you may provide your name, phone number,
        pickup suburb and vehicle details. The website prepares this information
        as a text message on your device; it is not stored in a website database.
      </p>

      <h2>How it is used</h2>
      <p>
        Information you send is used to respond to your enquiry, assess the
        vehicle, arrange collection and complete an agreed transaction.
      </p>

      <h2>Sharing and retention</h2>
      <p>
        Information may be shared with people involved in quoting, scheduling,
        collecting or processing the vehicle where necessary to provide the
        service. Records may be retained where required for business, legal or
        transaction purposes.
      </p>

      <h2>Your choices</h2>
      <p>
        Do not send sensitive identity documents through the website. If you
        want to ask about personal information connected with an enquiry, call
        <a href="tel:0423476111"> 0423 476 111</a>.
      </p>
    </InnerPage>
  );
}
