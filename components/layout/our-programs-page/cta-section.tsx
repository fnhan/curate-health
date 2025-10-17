import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { OUR_PROGRAMS_QUERYResult } from "@/sanity.types";

const LargeText = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <p
      className={cn(
        "text-lg font-light md:text-2xl 2xl:text-4xl 2xl:leading-[1.5em]",
        className
      )}
    >
      {children}
    </p>
  );
};

const CtaSection = ({ program }: { program: OUR_PROGRAMS_QUERYResult }) => {
  if (!program) {
    return null;
  }

  const { ctaSection } = program;

  return (
    <section
      className={`relative min-h-screen bg-cover bg-center py-8 md:h-[calc(100vh-100px)] md:py-0`}
      style={{
        backgroundImage: `url(${ctaSection?.image?.asset?.url!})`,
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
        <div>
          <div className="flex flex-col gap-6 bg-secondary p-6 text-white md:items-center md:justify-center md:gap-12 md:p-24">
            <div className="space-y-4 md:px-4">
              <LargeText className="text-light mx-auto max-w-lg text-center text-base md:text-lg lg:text-2xl">
                Your Health, Curated with Intention
              </LargeText>
              <p className="max-w-[740px] text-pretty pt-4 text-center text-sm font-light md:text-base">
                {/* {call_to_action} */}
                Every health journey is unique — that’s why we’ve designed
                programs that range from flexible to fully comprehensive.
                Whether you’re ready for guided habits, steady maintenance, or a
                concierge-style experience, our team can help you choose the
                right fit. <br />
                Contact us today to start the conversation.
              </p>
            </div>
            <Button
              asChild
              className="mx-auto w-full max-w-xs rounded-none border border-white bg-white text-primary hover:bg-transparent hover:text-white md:w-fit"
            >
              <a href="/contact">Let’s find the right program for you</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
