import Link from "next/link";

import ComingSoon from "@/components/shared/coming-soon";
import NewsletterSection from "@/components/shared/newsletter-section";

export default function LoginPage() {
  return (
    <div className="container flex flex-1 flex-col items-center justify-center">
      <ComingSoon />
      <NewsletterSection isComingSoon={true} />
      <p className="mt-4 text-center">
        If you are an admin of this site,{" "}
        <Link className="underline" href="/login">
          click here
        </Link>{" "}
        to login
      </p>
    </div>
  );
}
