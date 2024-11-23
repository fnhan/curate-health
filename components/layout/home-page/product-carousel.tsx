"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { useEffect, useState } from "react";

import imageUrlBuilder from "@sanity/image-url";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "components/ui/carousel";
import { PRODUCTS_SECTION_QUERYResult } from "sanity.types";

import { dataset, projectId } from "../../../sanity/env";

const builder = imageUrlBuilder({ projectId, dataset });

export function ProductCarousel({
  products,
}: {
  products: Array<{
    title: string | null;
    description: string | null;
    slug: string | null;
    image: string | null;
    altText: string | null;
  }>;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const inverse = 100 - (current / count) * 100 + "%";

  useEffect(() => {
    const handleResize = () => {
      if (api) {
        setCount(api.scrollSnapList().length);
      }
    };

    if (api) {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap() + 1);

      api.on("select", () => {
        setCurrent(api.selectedScrollSnap() + 1);
      });

      window.addEventListener("resize", handleResize);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [api]);

  return (
    <>
      <Carousel
        setApi={setApi}
        opts={{ align: "start" }}
        className="container relative mx-auto p-3"
      >
        <CarouselContent>
          {products?.map((product, idx: number) => (
            <CarouselItem key={idx} className="md:basis-1/2 lg:basis-1/3">
              <Link href={`/products/${product.slug}`}>
                <Card className="flex h-full w-full flex-col rounded-none border-none shadow-none transition ease-in-out hover:hover:-translate-y-3">
                  <CardContent className="mb-4 flex items-center justify-center p-0 2xl:h-64">
                    <Link href={`/products/${product.slug}`}>
                      <Image
                        src={builder
                          .image(product.image!)
                          .quality(80)
                          .size(200, 200)
                          .auto("format")
                          .url()}
                        width={200}
                        height={200}
                        alt={product.altText ?? ""}
                        className="mx-auto object-contain"
                      />
                    </Link>
                  </CardContent>
                  <CardHeader className="mx-auto w-2/3 p-0">
                    <CardTitle className="mb-3 p-0 text-center text-base font-light md:text-2xl">
                      <Link href={`/products/${product.slug}`}>
                        {product.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="text-pretty pb-4 text-center text-sm">
                      <Link href={`/products/${product.slug}`}>
                        {product.description}
                      </Link>
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-8 ml-2 border-none bg-transparent text-black hover:bg-secondary" />
        <CarouselNext className="-right-8 mr-2 border-none bg-transparent text-black hover:bg-secondary" />
      </Carousel>

      <div className="relative h-1 w-full rounded-full bg-muted">
        <div>
          <div
            className={`} absolute h-1 bg-secondary`}
            style={{
              width: 100 / count + "%",
              right: inverse,
              transition: "all 0.5s ease-out",
            }}
          ></div>
        </div>
      </div>
    </>
  );
}
