import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getServicePage } from "@/content/services";
import { pageMeta } from "@/lib/seo";
import { ServicePageTemplate } from "@/components/ServicePageTemplate";

const SLUG = "sell-my-car-gold-coast";

const page = getServicePage(SLUG);

export const metadata: Metadata = page
  ? pageMeta({
      title: page.title,
      description: page.metaDescription,
      path: `/${SLUG}`,
    })
  : {};

export default function Page() {
  if (!page) notFound();
  return <ServicePageTemplate page={page} />;
}
