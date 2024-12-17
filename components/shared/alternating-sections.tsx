import Image from "next/image";

import { PortableText } from "@portabletext/react";

interface Section {
  sectionTitle: string | null;
  sectionParagraph: any | null;
  sectionImage: {
    image: string | null;
    alt: string | null;
  } | null;
}

interface AlternatingSectionsProps {
  sections: Section[] | null;
}

export const AlternatingSections = ({ sections }: AlternatingSectionsProps) => {
  if (!sections || sections.length === 0) return null;

  return (
    <section className="relative isolate bg-white py-28 text-primary">
      <div className="flex flex-col gap-20 md:gap-28">
        {sections.map((section, index) => (
          <div
            key={section.sectionTitle}
            className="flex flex-col gap-16 md:container md:grid md:grid-cols-2 md:gap-16"
          >
            <div className={`relative ${index % 2 === 1 ? "md:order-2" : ""}`}>
              <div
                className={`absolute -top-7 h-[387px] bg-secondary md:h-[487px] ${
                  index % 2 === 0
                    ? "left-0 w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)]"
                    : "right-0 w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)]"
                }`}
              />
              <Image
                loading="lazy"
                src={section.sectionImage?.image || ""}
                alt={section.sectionImage?.alt || ""}
                width={704}
                height={556}
                className={`relative z-10 h-[360px] w-full object-cover md:h-[556px] ${
                  index % 2 === 0
                    ? "pr-4 sm:pr-8 md:pr-0"
                    : "pl-4 sm:pl-8 md:pl-0"
                }`}
              />
            </div>
            <div className="container flex flex-col gap-4 md:max-w-none md:px-0">
              <h2 className="text-balance text-2xl font-light">
                {section.sectionTitle}
              </h2>
              <div className="prose max-w-[80ch]">
                <PortableText value={section.sectionParagraph!} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
