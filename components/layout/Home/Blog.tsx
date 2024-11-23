import { SanityDocument } from "next-sanity";

import FeaturedPosts from "../Blog-Home/FeaturedPosts";
import HoverLink from "./HoverLink";

type PageProps = {
  posts: SanityDocument[];
};

export default function Blog(props: PageProps) {
  return (
    <section>
      <div className="2xl:py-18 container py-9 md:py-14">
        <h2 className="mb-10 md:text-xl 2xl:text-3xl">Blog</h2>
        <FeaturedPosts posts={props.posts} />
      </div>
      <HoverLink href="/blog" text="Explore More" />
    </section>
  );
}
