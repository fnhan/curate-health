import Link from "next/link";
import { useEffect, useState } from "react";

import { PortableText, PortableTextReactComponents } from "@portabletext/react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Button } from "components/ui/button";
import { SanityDocument } from "next-sanity";
import preview from "next-sanity/preview";

import { getClient } from "../../sanity/lib/client";
import { POPUP_CONTENT_QUERY } from "../../sanity/lib/queries";
import { token } from "../../sanity/lib/token";

type PageProps = {
  isVisible: boolean;
  content: any;
};

const setCookie = (name, value, days) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name) => {
  const cookieArr = document.cookie.split(";");
  for (let i = 0; i < cookieArr.length; i++) {
    const cookiePair = cookieArr[i].split("=");
    if (name === cookiePair[0].trim()) {
      return decodeURIComponent(cookiePair[1]);
    }
  }
  return null;
};

export default function PopupBanner(props) {
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  useEffect(() => {
    const bannerDismissed = getCookie("bannerDismissed");
    if (props.props.isActive && !bannerDismissed) {
      setIsBannerVisible(true);
    }
  }, [props.props.isActive]);

  const closeBanner = () => {
    setIsBannerVisible(false);
    // Set cookie for 7 days when banner is dismissed
    setCookie("bannerDismissed", "true", 7);
  };

  if (!isBannerVisible) return null;

  const components: Partial<PortableTextReactComponents> = {
    block: {
      // Ex. 1: customizing common block types

      h1: ({ children }) => <h1 className="text-8xl">{children}</h1>,
      h2: ({ children }) => <h3 className="text-6xl">{children}</h3>,
      h3: ({ children }) => <h3 className="text-4xl">{children}</h3>,
      h4: ({ children }) => <h4 className="text-2xl">{children}</h4>,
      normal: ({ children }) => <p className="text-2xl">{children}</p>,
      a: ({ children }) => (
        <a className="text-lg no-underline transition-all hover:underline">
          {children}
        </a>
      ),
      blockquote: ({ children }) => (
        <blockquote className="">{children}</blockquote>
      ),

      // Ex. 2: rendering custom styles
      customHeading: ({ children }) => (
        <h2 className="text-lg text-primary text-purple-700">{children}</h2>
      ),
    },
    list: {
      // Ex. 1: customizing common list types
      bullet: ({ children }) => (
        <ul className="mt-xl list-inside list-disc">{children}</ul>
      ),
      number: ({ children }) => (
        <ol className="mt-lg list-inside list-decimal">{children}</ol>
      ),

      // Ex. 2: rendering custom lists
      checkmarks: ({ children }) => (
        <ol className="m-auto text-lg">{children}</ol>
      ),
    },
    marks: {
      link: ({ value, children }) => {
        const target = (value?.href || "").startsWith("http")
          ? "_blank"
          : undefined;
        return (
          <a
            className="not-italic underline transition-all hover:italic"
            href={value?.href}
            target={target}
            // @ts-ignore
            rel={target === "_blank" && "noindex nofollow"}
          >
            {children}
          </a>
        );
      },
    },
  };

  return (
    <div className="clear fixed top-0 z-50">
      <div
        className="flex h-screen w-screen animate-appear items-center justify-center bg-black bg-opacity-40"
        onClick={closeBanner}
      >
        <div className="flex h-[48rem] w-[48rem] items-center justify-center rounded-full bg-[#878E76]">
          <div className="">
            <div className="px-4 py-2 text-center leading-loose">
              <PortableText
                components={components}
                value={props.props.content}
              />
              <button
                onClick={closeBanner}
                className="rounded pt-10 text-center text-white"
              >
                <Cross2Icon className="flex h-10 w-10 items-center" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
