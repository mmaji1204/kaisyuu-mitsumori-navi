import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/brand";

export function BrandLogo() {
  return <Link href="/" className="brand-logo" aria-label={`${brand.name} ホーム`}>
    <Image
      src="/brand/fuyouhin-kaishu-navi-logo.svg"
      width={376}
      height={80}
      alt={brand.name}
      unoptimized
    />
  </Link>;
}
