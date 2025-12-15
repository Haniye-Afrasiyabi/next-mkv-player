"use client";

import { useEffect, useRef, useState } from "react";
import shaka from "shaka-player/dist/shaka-player.compiled";

function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  const [audioTracks, setAudioTracks] = useState([]);
  const [textTracks, setTextTracks] = useState([]);

  useEffect(() => {
    const init = async () => {
      shaka.polyfill.installAll();

      if (!shaka.Player.isBrowserSupported()) {
        alert("Browser not supported");
        return;
      }

      const player = new shaka.Player(videoRef.current);
      playerRef.current = player;

      try {
        await player.load(src);

        // گرفتن Audio Trackها
        const audio = player.getVariantTracks().filter((t) => t.audioId);
        setAudioTracks(audio);

        // گرفتن Subtitle Trackها
        const subtitles = player.getTextTracks();
        setTextTracks(subtitles);
      } catch (e) {
        console.error(e);
        alert("Error loading video. Check the link or codec compatibility.");
      }
    };

    init();

    return () => playerRef.current?.destroy();
  }, [src]);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Video Player */}
      <video ref={videoRef} controls className="w-full bg-black rounded" />

      {/* Audio Track Selector */}
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

      {/* Subtitle Track Selector */}
      {textTracks.length > 0 && (
        <select
          className="w-full p-2 border rounded"
          onChange={(e) => playerRef.current.selectTextLanguage(e.target.value)}
        >
          <option value="">No Subtitle</option>
          {textTracks.map((track) => (
            <option
              key={track.id}
              value={track.language || track.label || "unknown"}
            >
              Subtitle: {track.language || track.label || "unknown"}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default VideoPlayer;
