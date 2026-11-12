"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { useToast } from "components/ui/use-toast";
import { Loader2 } from "lucide-react";

import { ConfirmationOverlay } from "@/components/shared/confirmation-overlay";

export default function NewsletterSection({
  isComingSoon = false,
  isLayout = false,
}: {
  isComingSoon?: boolean;
  isLayout?: boolean;
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pathname = usePathname();

  // Don't render on login page
  if (pathname === "/login") {
    return null;
  }

  // Don't render layout version on coming soon page
  if (isLayout && pathname === "/coming-soon") {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.target);
    const email = formData.get("email");

    try {
      const response = await fetch("/api/newsletter-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        /*
          Systeme.io is double opt-in, so at this point the confirmation
          email has been sent and the person is not subscribed yet. Saying
          "you are now signed up" and leaving it there is how somebody never
          clicks the link and quietly never hears from us. The exclamation
          marks went at the same time, per the content rules.

          Over the whole page rather than in the corner, at Frank's request
          on 2026-10-18, because this is the one message that costs a
          subscriber when it is missed. The failure notice stays a toast.
        */
        setConfirmOpen(true);
        setEmail("");
      } else {
        toast({
          variant: "destructive",
          title: "That did not go through",
          description: "Please check the address and try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "That did not go through",
        description: "Please check the address and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ConfirmationOverlay
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Check your inbox"
        description="We have sent you an email with a link to confirm your subscription. You will not be subscribed until you click it."
      />
      {/*
        CONTRAST, 2026-11-12. White on the sage is 3.4 to 1, which passes only
        for large text (24px and up needs 3 to 1) and fails everything smaller,
        where 4.5 to 1 is the bar. A restaurant grader flagged it and the
        measurement agreed. Frank asked that the fix stay on the brand palette,
        so no colour is new: the band keeps its sage, the heading is 24px at
        every width so white on sage passes, and the field and the button take
        white and the dark green, which pass at about 14 to 1.
      */}
      <section className={`${!isComingSoon ? "bg-secondary" : ""}`}>
        <div className="container flex flex-col items-center gap-3 py-4 md:flex-row md:gap-16 md:py-8 2xl:justify-between 2xl:py-9">
          <h2 className="text-2xl italic">Sign up to our newsletter</h2>
          <form
            className="mx-auto flex max-w-sm flex-grow items-center justify-center md:mx-0 md:max-w-none 2xl:max-w-lg"
            onSubmit={handleSubmit}
          >
            <Input
              type="email"
              name="email"
              placeholder="Email"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-none border-white bg-white text-primary placeholder:text-primary/70"
              required
            />
            <Button
              type="submit"
              className="rounded-none border border-primary bg-primary font-normal text-white hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
          </form>
        </div>
      </section>
    </>
  );
}
