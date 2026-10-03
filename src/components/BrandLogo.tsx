import Link from "next/link";
import { brand } from "@/lib/brand";

export function BrandLogo() {
  return <Link href="/" className="brand-logo" aria-label={`${brand.name} ホーム`}>
    <svg viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="40" height="40" rx="12" fill="currentColor" />
      <path d="m12 20 10-8 10 8v12H12V20Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
      <path d="M22 17v15M12 23h20" stroke="white" strokeWidth="2" />
      <circle cx="34" cy="10" r="6" fill="#E67932" stroke="white" strokeWidth="2" />
    </svg>
    <span><small>くらしを、すっきり。その一歩に。</small><strong>{brand.namePrefix}<span>{brand.nameAccent}</span></strong></span>
  </Link>;
}
