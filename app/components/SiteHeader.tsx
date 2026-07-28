import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="Unique Cash for Cars home">
          <Image src="/images/logo.jpg" alt="Unique Cash for Cars" width={200} height={87} priority />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/sell-my-car-gold-coast/">How it works</Link>
          <Link href="/car-removal-gold-coast/">Car removal</Link>
          <Link href="/cash-for-cars/">Areas</Link>
          <Link href="/company-info-cash-for-cars-gold-coast-and-free-car-removal/">About</Link>
        </nav>
        <a className="header-call" href="tel:0423476111">
          <span>Call for a quote</span>
          <strong>0423 476 111</strong>
        </a>
      </div>
    </header>
  );
}
