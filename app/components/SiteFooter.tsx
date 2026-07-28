import Image from "next/image";
import Link from "next/link";
import { suburbs } from "../data/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Image src="/images/logo.jpg" alt="Unique Cash for Cars" width={180} height={78} />
          <p>
            A simple way to sell old, damaged and unwanted vehicles across the
            Gold Coast service area.
          </p>
          <a href="tel:0423476111">0423 476 111</a>
        </div>
        <div>
          <h2>Services</h2>
          <Link href="/sell-my-car-gold-coast/">Sell my car</Link>
          <Link href="/car-removal-gold-coast/">Car removal</Link>
          <Link href="/unwanted-car-buyer/">Unwanted car buyer</Link>
          <Link href="/contact-us/">Request a quote</Link>
        </div>
        <div>
          <h2>Popular areas</h2>
          {suburbs.slice(0, 6).map((suburb) => (
            <Link key={suburb.slug} href={`/cash-for-cars/#${suburb.slug}`}>{suburb.name}</Link>
          ))}
        </div>
        <div>
          <h2>Information</h2>
          <Link href="/company-info-cash-for-cars-gold-coast-and-free-car-removal/">About us</Link>
          <Link href="/cash-for-cars/">All service areas</Link>
          <Link href="/privacy-policy/">Privacy policy</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Unique Cash for Cars.</span>
        <span>Serving Gold Coast, Queensland.</span>
      </div>
      <div className="mobile-call-bar">
        <a href="tel:0423476111">Call 0423 476 111</a>
        <a href="sms:0423476111">Text for a quote</a>
      </div>
    </footer>
  );
}
