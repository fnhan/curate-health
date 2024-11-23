import { PortableText } from "@portabletext/react";
import Layout from "components/layout/layout";

import { getClient } from "../../sanity/lib/client";
import {
  FOOTER_QUERY,
  NAVIGATION_QUERY,
  PRIVACY_QUERY,
} from "../../sanity/lib/queries";
import { token } from "../../sanity/lib/token";

export default function privacy({ navigation, footer, privacy }) {
  return (
    <Layout
      navigation={navigation}
      footer={footer}
      title={"Privacy"}
      description={"Default description for privacy"}
    >
      <section className="bg-white py-10 md:py-20">
        <div className="container text-black">
          <h1 className="font-denton mb-6 text-xl font-bold">
            {privacy.title}
          </h1>
          <div className="flex flex-col gap-4">
            <PortableText value={privacy.content} />
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getStaticProps = async ({ preview = false }) => {
  const client = getClient(preview ? token : undefined);
  const navigation = await client.fetch(NAVIGATION_QUERY);
  const footer = await client.fetch(FOOTER_QUERY);
  const privacy = await client.fetch(PRIVACY_QUERY);

  return {
    props: {
      navigation,
      footer,
      privacy,
      draftMode: preview,
      token: preview ? token : "",
    },
  };
};
