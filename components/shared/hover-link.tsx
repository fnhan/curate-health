import Link from "next/link";

import { ChevronRight } from "lucide-react";

type HoverLinkProps = {
  href: string;
  text: string;
  textColor?: string;
};

export default function HoverLink({
  href,
  text,
  textColor = "text-white",
}: HoverLinkProps) {
  return (
    <Link className="w-full" href={href}>
      <div className="group block border-t py-5 text-right italic transition-all duration-300 hover:bg-secondary">
        <div className="container flex items-center justify-end gap-2 transition-all duration-300 hover:gap-20">
          <span className={`${textColor} group-hover:text-white`}>{text}</span>
          <ChevronRight className={`w-5 ${textColor} group-hover:text-white`} />
        </div>
      </div>
    </Link>
  );
}
