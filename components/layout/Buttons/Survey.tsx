import Image from "next/image";
import Link from "next/link";

import imageUrlBuilder from "@sanity/image-url";
import { Loading } from "components/Loading";
import { Button } from "components/ui/button";

import { dataset, projectId } from "../../../sanity/env";

export default function TakeSurvey() {
  return (
    <Link href="">
      <Button className="w-[200px] rounded-none bg-transparent text-[10px] text-white outline outline-1 transition-all duration-300 hover:bg-primary md:text-[14px]">
        Take the Survey
      </Button>
    </Link>
  );
}
