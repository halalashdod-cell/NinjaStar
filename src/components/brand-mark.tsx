import Image from "next/image";

export function BrandMark({ eager = false }: { eager?: boolean }) {
  return (
    <Image
      className="brand-logo"
      src="/images/ninja-star-logo.svg"
      alt="נינג׳ה סטאר"
      width={1779}
      height={1463}
      loading={eager ? "eager" : "lazy"}
      unoptimized
    />
  );
}
