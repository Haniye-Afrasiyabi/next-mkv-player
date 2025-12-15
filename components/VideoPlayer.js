"use client";

import { useEffect, useRef, useState } from "react";
import shaka from "shaka-player/dist/shaka-player.compiled";

function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [audioTracks, setAudioTracks] = useState([]);

  useEffect(() => {
    const init = async () => {
      shaka.polyfill.installAll();

      if (!shaka.Player.isBrowserSupported()) return;

      const player = new shaka.Player(videoRef.current);
      playerRef.current = player;

      try {
        await player.load(src);

        const tracks = player
          .getVariantTracks()
          .filter((track) => track.audioId);

        setAudioTracks(tracks);
      } catch (e) {
        console.error(e);
      }
    };

    init();

    return () => playerRef.current?.destroy();
  }, [src]);

  return (
    <div className="space-y-4">
      <video ref={videoRef} controls className="w-full bg-black rounded" />

      {/*  Audio Track Selector */}
      {audioTracks.length > 0 && (
        <select
          className="w-full p-2 border rounded"
          onChange={(e) =>
            playerRef.current.selectAudioLanguage(e.target.value)
          }
        >
          {audioTracks.map((track) => (
            <option
              key={track.id}
              value={track.language || track.label || "unknown"}
            >
              Audio: {track.language || track.label || "unknown"}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default VideoPlayer;
