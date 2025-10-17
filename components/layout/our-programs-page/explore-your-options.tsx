import Image from "next/image";

import { Input } from "@/components/ui/input";
import { OUR_PROGRAMS_QUERYResult } from "@/sanity.types";

const ExploreYourOptions = ({
  program,
}: {
  program: OUR_PROGRAMS_QUERYResult;
}) => {
  if (!program) {
    return null;
  }

  const { exploreYourOptions } = program;

  return (
    <section className="bg-white py-14">
      <div className="container flex justify-center py-24 lg:justify-between">
        <div className="relative hidden flex-1 overflow-hidden lg:block xl:left-52">
          <Image
            src={exploreYourOptions?.image?.asset?.url!}
            alt=""
            fill
            objectFit="cover"
            objectPosition="100% 18%"
            className="scale-110"
          />
        </div>
        <div className="z-10 flex flex-col gap-6 text-primary">
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
