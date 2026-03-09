import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { icon: 24, text: "text-sm", gap: "gap-2", rounded: "rounded-md" },
  md: { icon: 32, text: "text-lg", gap: "gap-2.5", rounded: "rounded-lg" },
  lg: { icon: 40, text: "text-2xl", gap: "gap-3", rounded: "rounded-xl" },
} as const;

export function BrandLogo({
  size = "md",
  withText = false,
  className,
}: BrandLogoProps) {
  const config = sizeConfig[size];

  if (!withText) {
    return (
      <Link href="/">
        <Image
          src="/logo/logo.png"
          alt="GigScale"
          width={config.icon}
          height={config.icon}
          className={cn(config.rounded, className)}
        />
      </Link>
    );
  }

  return (
    <Link href="/" className={cn("inline-flex items-center", config.gap, className)}>
      <Image
        src="/logo/logo.png"
        alt="GigScale"
        width={config.icon}
        height={config.icon}
        className={config.rounded}
      />

      <span className={cn("font-semibold tracking-tight", config.text)}>
        <span className="text-primary">Gig</span>
        <span className="text-secondary">Scale</span>
      </span>
    </Link>
  );
}
