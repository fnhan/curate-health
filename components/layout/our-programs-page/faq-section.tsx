import { PortableText } from "@portabletext/react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { OUR_PROGRAMS_QUERYResult } from "@/sanity.types";

const SubHeading = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h2
      className={cn(
        "text-2xl md:text-3xl md:font-light 2xl:text-4xl",
        className
      )}
    >
      {children}
    </h2>
  );
};

const FaqSection = ({ program }: { program: OUR_PROGRAMS_QUERYResult }) => {
  if (!program) {
    return null;
  }

  const { faq } = program;

  return (
    <section className="bg-white py-16 text-primary md:py-44">
      <div className="container mx-auto space-y-12 md:pb-12 2xl:px-12">
        <SubHeading>Frequently Asked Questions</SubHeading>
        <Accordion type="multiple">
          {faq?.map((faqItem, index) => {
            return (
              <AccordionItem
                value={`item-${index}`}
                className="border-b-2 border-b-gray-500"
                key={faqItem.title}
              >
                <AccordionTrigger className="py-6">
                  <h4 className="text-left text-lg font-light italic xl:text-2xl">
                    {faqItem.title}
                  </h4>
                </AccordionTrigger>
                <AccordionContent className="leading-7hh prose max-w-none pb-12 font-light">
                  <PortableText value={faqItem.description!} />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </section>
  );
};

export default FaqSection;
