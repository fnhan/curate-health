"use client";

import { useEffect, useRef, useState } from "react";

import MuxPlayer from "@/components/ui/mux-player";

export default function HeroBgVideo({ playbackId }: { playbackId: string }) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [initTime, setInitTime] = useState<number | null>(null);
  const [isSafari, setIsSafari] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg?time=0`;

  useEffect(() => {
    const checkBrowser = () => {
      const userAgent = navigator.userAgent;
      setIsSafari(/^((?!chrome|android).)*safari/i.test(userAgent));
      setIsIOS(/iPad|iPhone|iPod/.test(userAgent));
    };

    checkBrowser();
    setInitTime(Date.now());

    const player = playerRef.current;
    if (!player) return;

    const attemptPlay = async () => {
      try {
        await player.play();
        containerRef.current?.classList.add("playing");
      } catch (error) {
        console.warn("Play attempt failed:", error);
      }
    };

    // Handle video playback and looping
    const handleLoadedMetadata = async () => {
      // Add a slightly longer delay for Safari
      const delay = isSafari || isIOS ? 300 : 100;

      try {
        // For Safari, wait a bit before first play attempt
        if (isSafari || isIOS) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        await attemptPlay();
      } catch (error) {
        console.warn("Initial autoplay failed, retrying...");
        setTimeout(attemptPlay, delay);
      }
    };

    // Handle video ending to ensure loop works
    const handleEnded = async () => {
      try {
        player.currentTime = 0;
        await player.play();
      } catch (error) {
        console.warn("Loop playback failed:", error);
      }
    };

    player.addEventListener("loadedmetadata", handleLoadedMetadata);
    player.addEventListener("ended", handleEnded);

    // Additional Safari-specific handlers
    if (isSafari) {
      player.addEventListener("canplay", attemptPlay);
      player.addEventListener("loadeddata", attemptPlay);
    }

    return () => {
      player.removeEventListener("loadedmetadata", handleLoadedMetadata);
      player.removeEventListener("ended", handleEnded);
      if (isSafari) {
        player.removeEventListener("canplay", attemptPlay);
        player.removeEventListener("loadeddata", attemptPlay);
      }
    };
  }, [isSafari]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full opacity-0 transition-opacity duration-700 ease-in-out [&.playing]:opacity-100"
    >
      <MuxPlayer
        ref={playerRef}
        poster={thumbnailUrl}
        thumbnailTime={0}
        autoPlay
        muted
        loop
        playsInline
        playbackId={playbackId}
        playerInitTime={initTime || undefined}
        className="h-full w-full object-cover"
        onError={(error) => {
          console.error("Mux Player error:", error);
          // Don't add playing class on error in Safari to keep thumbnail visible
          if (!isSafari) {
            containerRef.current?.classList.add("playing");
          }
        }}
        preferPlayback={isSafari ? "native" : "mse"}
        streamType="on-demand"
        preload="auto"
        maxResolution={isIOS ? "720p" : "1080p"}
        defaultHiddenCaptions
        primaryColor="#000000"
      />
    </div>
  );
}
