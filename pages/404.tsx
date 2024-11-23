import Link from "next/link";

import { SanityDocument } from "@sanity/client";
import Layout from "components/layout/layout";
import { Button } from "components/ui/button";
import { HomeIcon } from "lucide-react";

import { getClient } from "../sanity/lib/client";
import { HOME_PAGE_QUERY } from "../sanity/lib/queries";
import { token } from "../sanity/lib/token";

type PageProps = {
  meta: SanityDocument;
  navigation: SanityDocument[];
  footer: SanityDocument[];
  draftMode: boolean;
  token: string;
};

export default function Custom404(props: PageProps) {
  return (
    <Layout
      title={props.meta?.title || "Home"}
      navigation={props.navigation}
      footer={props.footer}
      description={props.meta?.description || "Description"}
    >
      <div className="container mx-auto flex flex-1 flex-col-reverse items-center justify-center gap-8 bg-accent-foreground py-12 text-center text-foreground">
        <Button asChild className="flex items-center gap-2 rounded-none">
          <Link href="/">
            <HomeIcon size={16} />
            <span className="">Return to home page</span>
          </Link>
        </Button>
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-balance">
          Oops! The page you are looking for can't be found.
        </p>
      </div>
    </Layout>
  );
}

export const getStaticProps = async ({ draftMode = false }) => {
  const client = getClient(draftMode ? token : undefined);
  const allData = await client.fetch(HOME_PAGE_QUERY);

  return {
    props: {
      ...allData,
      draftMode,

      token: draftMode ? token : "",
    },
  };
};
