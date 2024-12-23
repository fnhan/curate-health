"use client";

import MuxPlayer from "@/components/ui/mux-player";

export default function HeroBgVideo({ playbackId }: { playbackId: string }) {
  const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg?time=0`;

  return (
    <div className="h-full w-full opacity-0 transition-opacity duration-300 ease-in-out [&.playing]:opacity-100">
      <MuxPlayer
        poster={thumbnailUrl}
        thumbnailTime={0}
        autoPlay
        muted
        loop
        playsInline
        playbackId={playbackId}
        className="h-full w-full"
        onCanPlay={(e) => {
          const target = e.target as HTMLElement;
          target.parentElement?.classList.add("playing");
        }}
      />
    </div>
  );
}
