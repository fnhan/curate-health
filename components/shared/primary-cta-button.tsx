import { Button } from "components/ui/button";

import { externalLinkProps } from "@/lib/links";
import { cn } from "@/lib/utils";
import { PRIMARY_CTA_BUTTON_QUERYResult } from "@/sanity.types";

export default function PrimaryCTAButton({
  primaryCTAButton,
  size = "default",
  variant = "default",
}: {
  primaryCTAButton: PRIMARY_CTA_BUTTON_QUERYResult;
  size?: "xl" | "lg" | "default" | "sm";
  variant?: "default" | "secondary" | "ghost" | "link";
}) {
  if (!primaryCTAButton) return null;

  const { ctaButton } = primaryCTAButton;

  return (
    <a href={ctaButton?.ctaLink!} {...externalLinkProps(ctaButton?.ctaLink!)}>
      <Button
        variant={variant}
        size={size}
        className={cn(
          `rounded-none border border-white bg-card text-xl font-normal text-card-foreground transition-all duration-300 hover:bg-transparent hover:text-card-foreground hover:text-white`,
          size === "default" && "h-10 px-4 py-2 text-sm sm:text-base"
        )}
      >
        {ctaButton?.ctaText}
      </Button>
    </a>
  );
}
