import Link from "next/link";

import { ChevronRight } from "lucide-react";

type HoverLinkProps = {
  href: string;
  text: string;
  textColor?: string;
};

export default function HoverLinkVariation({
  href,
  text,
  textColor = "text-primary",
}: HoverLinkProps) {
  return (
    <Link className="w-full bg-platinum" href={href}>
      <div className="group block border-t py-5 text-right italic transition-all duration-300 hover:bg-secondary">
        <div className="container flex items-center justify-end gap-2 transition-all duration-300 hover:gap-20">
          <span className={`${textColor} text-lg group-hover:text-white`}>{text}</span>
          <ChevronRight className={`w-5 ${textColor} group-hover:text-white`} />
        </div>
      </div>
    </Link>
  );
}
