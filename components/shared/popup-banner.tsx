"use client";

import { useState } from "react";

import { PortableText } from "@portabletext/react";
import { XIcon } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { POPUP_BANNER_QUERYResult } from "@/sanity.types";

export default function PopupBanner({
  popupBanner,
}: {
  popupBanner: POPUP_BANNER_QUERYResult;
}) {
  const [open, setOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const storedValue = localStorage.getItem("ch_popupClosed");
      const timestamp = localStorage.getItem("ch_popupClosedTime");

      if (storedValue && timestamp) {
        const dayInMs = 24 * 60 * 60 * 1000;
        const hasExpired = Date.now() - parseInt(timestamp) > dayInMs;
        return hasExpired;
      }
      return true;
    }
    return true;
  });

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem("ch_popupClosed", "true");
    localStorage.setItem("ch_popupClosedTime", Date.now().toString());
  };

  if (!popupBanner) return null;

  const { title, content } = popupBanner;

  return (
    <Dialog open={true} onOpenChange={setOpen}>
      <DialogContent className="flex size-[300px] max-w-none flex-col items-center justify-center rounded-full border-none bg-secondary text-center sm:size-[520px] sm:rounded-full [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="pb-2 text-center">{title}</DialogTitle>
          <DialogDescription>
            <div className="flex flex-col items-center justify-center gap-2 text-center text-white">
              <PortableText value={content!} />
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="absolute right-12 top-12 sm:right-24 sm:top-24">
          <DialogClose
            onClick={handleClose}
            className="h-fit w-fit border-none bg-transparent p-0 hover:bg-transparent hover:opacity-80"
          >
            <XIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
