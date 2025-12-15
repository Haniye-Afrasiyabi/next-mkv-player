"use client";

import { useEffect, useRef } from "react";
import shaka from "shaka-player/dist/shaka-player.compiled";

function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    shaka.polyfill.installAll();

    if (!shaka.Player.isBrowserSupported()) {
      alert("Browser not supported");
      return;
    }

    const player = new shaka.Player(videoRef.current);
    playerRef.current = player;

    player.load(src).catch(console.error);

    return () => player.destroy();
  }, [src]);

  return <video ref={videoRef} controls className="w-full bg-black rounded" />;
}

export default VideoPlayer;
