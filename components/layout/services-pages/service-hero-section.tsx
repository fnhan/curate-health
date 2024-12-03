import Image from "next/image";

type ServiceHeroSectionProps = {
  hero_image: {
    asset: {
      url: string;
    };
    alt: string;
  };
};

export default async function ServiceHeroSection({
  hero_image,
}: ServiceHeroSectionProps) {
  
  const { asset, alt } = hero_image;

  return (
    <Image
      width={1080}
      height={1440}
      src={asset.url}
      alt={alt}
      className="h-[400px] w-full object-cover md:h-[550px]"
    />
  );
}
