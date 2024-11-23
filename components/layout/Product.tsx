import Image from "next/image";

import { PortableText, PortableTextReactComponents } from "@portabletext/react";
import imageUrlBuilder from "@sanity/image-url";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "components/ui/accordion";
import { Console } from "console";
import { SanityDocument } from "next-sanity";

import { dataset, projectId } from "../../sanity/env";

const builder = imageUrlBuilder({ projectId, dataset });

const components: Partial<PortableTextReactComponents> = {
  list: {
    // Ex. 1: customizing common list types
    bullet: ({ children }) => (
      <ul className="mt-xl list-inside list-disc">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mt-lg list-inside list-decimal">{children}</ol>
    ),

    // Ex. 2: rendering custom lists
    checkmarks: ({ children }) => (
      <ol className="m-auto text-lg">{children}</ol>
    ),
  },
};

function PortableTextAccordion(content) {
  return (
    <Accordion type="single" collapsible defaultValue="item-0">
      {content.map((obj, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <div className="text-xl font-light leading-loose text-[#283619]">
            <AccordionTrigger>{obj.title}</AccordionTrigger>
          </div>
          <AccordionContent>
            <div className="text-xl font-light leading-loose text-[#283619]">
              <PortableText components={components} value={obj.description} />
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default function Product({ product }: { product: SanityDocument }) {
  // Temporary
  if (!product) {
    return <div>Loading or no post found...</div>;
  }

  const { title, image, description, banner, indepthblockinfo, accordioninfo } =
    product;

  return (
    <div className="w-full bg-white pb-60 lg:pb-0">
      {banner ? (
        <Image
          loading="lazy"
          width={2080}
          height={1440}
          src={builder
            .image(banner)

            .quality(100)
            .url()}
          alt={banner.alt}
          style={{ imageRendering: "crisp-edges" }}
          className="max-h-[280px] w-full object-cover object-center md:max-h-[625px]"
        />
      ) : null}

      <div className="poppins text-black md:container sm:w-full">
        <div className="flex max-h-[4000px] min-h-screen flex-col-reverse sm:justify-center md:flex-row lg:justify-between">
          <div className="1 px-8 pt-28 sm:w-full md:w-1/2">
            {title ? (
              <h1 className="mb-8 text-5xl font-light text-[#283619]">
                {title}
              </h1>
            ) : null}
            {description ? (
              <p className="poppins text-left text-xl font-normal leading-loose text-[#0B0014]">
                {description}
              </p>
            ) : null}
            {accordioninfo ? (
              <div>{PortableTextAccordion(accordioninfo)}</div>
            ) : null}
          </div>

          <div className="flex flex-col items-center p-8 pt-28 sm:w-full md:w-1/2">
            {image ? (
              <Image
                className="float-center w-100 m-0 mb-5 rounded-lg"
                src={builder.image(image).quality(80).url()}
                width={1300}
                height={1300}
                alt={image.alt || ""}
              />
            ) : null}
            {title ? (
              <h1 className="poppins mb-8 text-4xl font-light italic text-[#0B0014]">
                {title}
              </h1>
            ) : null}
            {description ? (
              <p className="poppins text-center text-xl font-normal leading-loose text-[#0B0014]">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
