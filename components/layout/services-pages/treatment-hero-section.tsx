import Image from "next/image";

type TreatmentHeroSectionProps = {
  hero_image: {
    asset: {
      url: string;
    };
    alt: string;
  };
};

export default function TreatmentHeroSection({
  hero_image,
}: TreatmentHeroSectionProps) {
  const { asset, alt } = hero_image;

  return (
    <Image
      width={1920}
      height={1080}
      src={asset.url}
      alt={alt}
      priority
      quality={100}
      sizes="100vw"
      className="h-[254px] w-full object-cover md:h-[364px] lg:h-[608px]"
    />
  );
}
