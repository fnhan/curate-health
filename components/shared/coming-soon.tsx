import Image from "next/image";

import logo from "@/public/images/logo-large.png";
import logoText from "@/public/images/logo-text.png";

export default function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center gap-12">
      <Image src={logo} width={100} height={200} alt="logo" sizes="100px" />
      <Image
        src={logoText}
        width={650}
        height={200}
        alt="Curate Health"
        sizes="(min-width: 650px) 650px, 100vw"
      />
      <h2 className="md:text:3xl text-2xl lg:text-4xl">Coming Soon...</h2>
    </div>
  );
}
