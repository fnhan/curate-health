"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { useToast } from "components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function Newsletter({
  isComingSoon = false,
}: {
  isComingSoon?: boolean;
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const pathname = usePathname();

  if (pathname === "/coming-soon") {
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
        // Handle success, e.g., show a success message
        toast({
          title: "You are now signed up!",
          description: "Thank you for subscribing to our newsletter.",
        });
        setEmail("");
      } else {
        // Handle server-side validation errors or other issues
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description:
            "There was a problem with your request. Please try again.",
        });
      }
    } catch (error) {
      // Handle network errors or other unexpected issues
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={`${!isComingSoon ? "bg-secondary" : ""}`}>
      <div className="container flex flex-col items-center gap-3 py-4 md:flex-row md:gap-16 md:py-8 2xl:justify-between 2xl:py-9">
        <h2 className="italic md:text-lg 2xl:text-2xl">
          Sign up to our newsletter
        </h2>
        <form
          className="mx-auto flex max-w-sm flex-grow items-center justify-center md:mx-0 md:max-w-none 2xl:max-w-lg"
          onSubmit={handleSubmit}
        >
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-none bg-transparent text-white placeholder:text-white"
            required
          />
          <Button
            type="submit"
            className="rounded-none border bg-transparent font-normal"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign Up
          </Button>
        </form>
      </div>
    </section>
  );
}
