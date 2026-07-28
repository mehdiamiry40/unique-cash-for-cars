import type { Metadata } from "next";
import { ArticlePage } from "../components/ArticlePage";

export const metadata: Metadata = {
  title: "Understanding Lower-Emission Vehicle Choices",
  description: "A practical introduction to electric, plug-in hybrid, hybrid and efficient petrol vehicle choices.",
  alternates: { canonical: "/5-best-luxury-eco-friendly-cars-in-australia-2020/" },
};

export default function LowerEmissionGuide() {
  return (
    <ArticlePage
      title="Understanding lower-emission vehicle choices."
      intro="Vehicle technology changes quickly. Compare how you drive, where you can charge and the full ownership cost before choosing a replacement car."
    >
      <h2>Battery electric vehicles</h2>
      <p>
        Electric vehicles can reduce tailpipe emissions and routine servicing,
        but suitability depends on charging access, range needs and purchase cost.
      </p>
      <h2>Plug-in hybrids</h2>
      <p>
        A plug-in hybrid can handle shorter trips on battery power while keeping
        an engine for longer journeys. Benefits depend on regular charging.
      </p>
      <h2>Conventional hybrids</h2>
      <p>
        Hybrids recover energy while driving and do not require external
        charging, which can make them practical for mixed urban use.
      </p>
      <h2>Efficient petrol vehicles</h2>
      <p>
        A smaller, efficient vehicle may still be a sensible choice when upfront
        budget, remote travel or charging access limits other options.
      </p>
    </ArticlePage>
  );
}
