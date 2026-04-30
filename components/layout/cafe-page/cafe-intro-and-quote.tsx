import Image from "next/image";

type Intro = {
  title?: string | null;
  subheading?: string | null;
  description?: string | null;
} | null;

type Quote = {
  quoteText?: string | null;
  quoteImage?: {
    image?: string | null;
    alt?: string | null;
  } | null;
} | null;

export function CafeIntroSection({ intro }: { intro: Intro | null }) {
  if (!intro) return null;
  const title = intro.title?.trim();
  const subheading = intro.subheading?.trim();
  const description = intro.description?.trim();
  if (!title && !subheading && !description) return null;

  return (
    <section className="bg-white py-14 font-poppins text-primary md:py-20 lg:py-24">
      <div className="container flex min-h-[536px] w-full max-w-[1121px] flex-col items-center justify-center gap-16 text-center">
        {title ? (
          <h1 className="text-[36px] font-light leading-[1.1] tracking-tight sm:text-[48px] md:text-[60px] lg:text-[72px]">
            {title}
          </h1>
        ) : null}
        {title ? (
          <div className="h-14 w-px shrink-0 bg-secondary" aria-hidden />
        ) : null}
        {subheading ? (
          <p className="w-full max-w-2xl text-[22px] font-light leading-snug text-card-foreground sm:text-[28px] md:text-[34px] lg:text-[40px]">
            {subheading}
          </p>
        ) : null}
        {description ? (
          <p className="w-full max-w-2xl text-pretty text-[16px] font-light leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function CafeQuoteSection({ quote }: { quote: Quote | null }) {
  if (quote == null) return null;
  const text = quote.quoteText?.trim();
  if (!text) return null;

  const imageUrl = quote?.quoteImage?.image?.trim() ?? "";
  const imageAlt = quote?.quoteImage?.alt?.trim() ?? "";

  return (
    <section className="bg-platinum font-poppins text-primary">
      <div className="container flex min-h-[420px] w-full max-w-[832px] flex-col items-center justify-center gap-12 text-center md:min-h-[720px] md:gap-16">
        {imageUrl ? (
          <Image
            loading="lazy"
            src={imageUrl}
            alt={imageAlt}
            width={160}
            height={134}
            className="size-16 object-contain md:size-20 2xl:size-40"
          />
        ) : null}
        <blockquote className="w-full text-pretty text-lg font-light italic leading-relaxed text-card-foreground md:text-xl lg:text-2xl">
          {text}
        </blockquote>
      </div>
    </section>
  );
}
