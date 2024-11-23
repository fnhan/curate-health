import Link from "next/link";

import cn from "classnames";

import { EXAMPLE_PATH } from "../../../lib/constants";
import Container from "./container";

export default function Alert({ preview }) {
  return (
    <div
      className={cn("border-b", {
        "bg-accent-7 border-accent-7 text-white": preview,
        "bg-accent-1 border-accent-2": !preview,
      })}
    >
      <Container>
        <div className="py-2 text-center text-sm">
          {preview ? (
            <>
              This is a page preview.{" "}
              <a
                href="/api/exit-preview"
                className="hover:text-cyan underline transition-colors duration-200"
              >
                Click here
              </a>{" "}
              to exit preview mode.
            </>
          ) : (
            <>
              The source code for this blog is{" "}
              <Link
                href={`https://github.com/vercel/next.js/tree/canary/examples/${EXAMPLE_PATH}`}
                className="hover:text-success underline transition-colors duration-200"
              >
                available on GitHub
              </Link>
              .
            </>
          )}
        </div>
      </Container>
    </div>
  );
}
