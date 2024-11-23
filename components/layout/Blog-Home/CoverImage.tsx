import Image from "next/image";
import Link from "next/link";

import imageUrlBuilder from "@sanity/image-url";
import cn from "classnames";

import { dataset, projectId } from "../../../sanity/env";

interface Props {
  title: string;
  mainImage: string;
  slug: { current: string };
}

const builder = imageUrlBuilder({ projectId, dataset });

export default function CoverImage({ title, mainImage, slug }: Props) {
  const image = (
    <Image
      width={2000}
      height={1000}
      alt={`Cover Image for ${title}`}
      src={builder.image(mainImage).url()}
      className={cn("shadow-small", {
        "hover:shadow-medium max-w-[154px] transition-shadow duration-200 md:max-w-[190px] 2xl:max-w-[300px]":
          slug,
      })}
    />
  );
  return (
    <div className="sm:mx-0">
      {slug ? (
        <Link href={`/blog/${slug.current}`} aria-label={title}>
          {image}
        </Link>
      ) : (
        image
      )}
    </div>
  );
}
