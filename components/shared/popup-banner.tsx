"use client";

import { useState } from "react";

import { PortableText } from "@portabletext/react";
import { XCircleIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="flex size-[300px] max-w-none flex-col items-center justify-center rounded-full border-none bg-secondary text-center sm:size-[520px] sm:rounded-full">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="prose-invert text-balance text-foreground">
            <PortableText value={content!} />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="absolute right-12 top-12 sm:right-24 sm:top-24">
          <AlertDialogCancel
            onClick={handleClose}
            className="h-fit w-fit border-none bg-transparent p-0 hover:bg-transparent hover:opacity-80"
          >
            <XCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
