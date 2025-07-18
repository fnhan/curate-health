"use client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/pillars-carousel";
import { cn } from "@/lib/utils";
import { PortableText } from "@portabletext/react";

const SubHeading = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
        <h2 className={cn("text-2xl md:font-light md:text-3xl 2xl:text-4xl", className)}>
            {children}
        </h2>
    );
};
const PillarsSection = ({ pillars }: { pillars: any[] }) => {
    return (
        <Carousel className="w-full max-w-md">
            <CarouselContent>
                {pillars.map((pillar) => (
                    <CarouselItem key={pillar.title}>
                        <div className="p-1">
                            <SubHeading className="text-center px-6 md:px-0 md:text-left">
                                {pillar.title}
                            </SubHeading>
                            <p className="mt-6 lg:mt-12">
                                <PortableText value={pillar.description!} />
                            </p>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    );
};

export default PillarsSection;