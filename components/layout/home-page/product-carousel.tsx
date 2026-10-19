"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

import { SanityImage } from "@/components/shared/sanity-image";

export function ProductCarousel({
  products,
}: {
  products: Array<{
    title: string | null;
    description: string | null;
    slug: string | null;
    image: string | null;
    imageSource?: unknown;
    altText: string | null;
  }>;
}) {
  const router = useRouter();
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
        className="container relative mx-auto mb-12 p-3"
      >
        <CarouselContent>
          {products?.map((product, idx: number) => (
            <CarouselItem
              key={idx}
              className="cursor-pointer border-b-2 border-transparent transition-all duration-300 hover:border-secondary md:basis-1/2 lg:basis-1/3"
              onClick={() => router.push(`/products/${product.slug}`)}
            >
              <Card className="flex h-full w-full flex-col rounded-none border-none shadow-none">
                {/*
                  A definite height and a `fill` image, so a photograph cannot
                  push past its box onto the title below. It used to be an
                  ordinary <Image> at 350x350 in a box that was only 256px tall
                  at 2xl: `object-contain` decides how the file sits inside the
                  element, and does nothing to stop the element itself
                  overflowing, so four of the five images ran 23 to 45px over
                  the heading. Frank, 2026-10-18.

                  `fill` is absolutely positioned to the box, so whatever the
                  source ratio, the picture is scaled to fit inside it and the
                  row below never moves. The box is sized at every breakpoint
                  rather than only at 2xl, which also lines the five images up
                  with each other instead of leaving the row ragged.
                */}
                <CardContent className="relative mb-4 h-56 w-full p-0 md:h-64 2xl:h-72">
                  <SanityImage
                    fill
                    source={product.imageSource}
                    src={product.image ?? ""}
                    alt={product.altText ?? ""}
                    /*
                      Read off the rendered box at each breakpoint, not
                      guessed: 287 at 375, 552 at 640, 325 at 768, 422 at
                      1400 and 427 beyond, where the container stops
                      growing. Each value here sits just above its widest
                      measurement, because a hint that is too small makes
                      the browser take a candidate narrower than the space
                      it paints and the photograph renders soft.

                      The old hint named 1536px, which is not a breakpoint
                      on this project: `2xl` is 1400 in tailwind.config.js.
                    */
                    sizes="(min-width: 1400px) 440px, (min-width: 1024px) 33vw, (min-width: 768px) 45vw, 88vw"
                    quality={75}
                    className="object-contain"
                  />
                </CardContent>
                <CardHeader className="mx-auto w-2/3 p-0">
                  <CardTitle className="mb-3 p-0 text-center text-base font-light md:text-2xl">
                    {product.title}
                  </CardTitle>
                  <CardDescription className="text-pretty pb-4 text-center text-sm">
                    {product.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-8 ml-2 size-14 border-none bg-transparent text-black hover:bg-transparent hover:text-black/50" />
        <CarouselNext className="-right-8 mr-2 size-14 border-none bg-transparent text-black hover:bg-transparent hover:text-black/50" />
      </Carousel>

      <div className="relative h-1 w-full rounded-full bg-muted">
        <div>
          <div
            className={`absolute h-1 bg-secondary`}
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
