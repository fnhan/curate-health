import { SanityImage } from "@/components/shared/sanity-image";
import { Input } from "@/components/ui/input";
import { OUR_PROGRAMS_QUERY_RESULT } from "@/sanity.types";

const ExploreYourOptions = ({
  program,
}: {
  program: OUR_PROGRAMS_QUERY_RESULT;
}) => {
  if (!program) {
    return null;
  }

  const { exploreYourOptions } = program;

  return (
    // `relative`, so the photograph below can be pinned to the window's own
    // left edge rather than to the container's.
    <section className="relative overflow-hidden bg-white py-14">
      <div className="container flex justify-center py-24 lg:justify-between">
        {/*
          Pinned to the window's left edge, not laid out inside the container.

          It used to be a flex child offset right by `xl:left-44`, which put
          its left edge at x=221 on a 1440 window: the photograph's own white
          ground then met the page's white at a visible seam, and Frank read
          that on 2026-10-19 as the picture being cropped. Absolute to the
          section, which spans the window, so left-0 is the window's edge at
          every width and there is no seam to see.

          Half the window wide, which is what `flex-1` gave it before, so the
          framing is unchanged apart from where it starts. The form keeps its
          own half through `lg:w-1/2` below, since this is now out of flow.
        */}
        <div className="absolute inset-y-0 left-0 hidden w-1/2 overflow-hidden lg:block">
          <SanityImage
            sizes="50vw"
            source={exploreYourOptions?.image}
            src={exploreYourOptions?.image?.asset?.url!}
            alt={exploreYourOptions?.image?.alt ?? ""}
            fill
            // Centred vertically and unscaled. At 18% with a 1.1 scale the
            // plant was cropped to its leaf tips and the vase was gone
            // entirely, at every width from xl up.
            objectPosition="100% 50%"
            className="object-cover"
          />
        </div>
        {/*
          `lg:ml-auto lg:w-1/2`, because the photograph above is absolute now
          and no longer holds the left half open in the flex row.
        */}
        <div className="z-10 flex flex-col gap-6 text-primary lg:ml-auto lg:w-1/2">
          <h2 className="text-balance text-4xl font-light text-background">
            Explore Your Options
          </h2>
          <div className="max-w-[540px] space-y-4 text-pretty py-6 font-light leading-7">
            {exploreYourOptions?.contactMessage}
          </div>
          <div className="w-full">
            <form
              action="https://formspree.io/f/xrblyjbl"
              method="POST"
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Name"
                    className="w-full rounded-none border-black bg-[rgba(255,255,255,0.5)] px-4 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="Email address"
                    className="w-full rounded-none border-black bg-[rgba(255,255,255,0.5)] px-4 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  placeholder="Subject"
                  className="w-full rounded-none border-black bg-[rgba(255,255,255,0.5)] px-4 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <div className="space-y-2">
                <textarea
                  id="message"
                  name="message"
                  required
                  placeholder="Message"
                  className="flex min-h-[80px] w-full border border-black p-4 focus-visible:ring-0 focus-visible:ring-offset-0"
                  rows={4}
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-none border border-black py-2 text-sm font-light text-black focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExploreYourOptions;
