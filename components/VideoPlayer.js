"use client";

import { useEffect, useRef, useState } from "react";
import shaka from "shaka-player/dist/shaka-player.compiled";

function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  // Tracks
  const [audioTracks, setAudioTracks] = useState([]);
  const [textTracks, setTextTracks] = useState([]);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

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

        // Audio Tracks
        const audio = player.getVariantTracks().filter((t) => t.audioId);
        setAudioTracks(audio);

        // Subtitle Tracks
        const subtitles = player.getTextTracks();
        setTextTracks(subtitles);
      } catch (e) {
        console.error(e);
        alert("Error loading video. Check the link or codec compatibility.");
      }

      const video = videoRef.current;
      if (video) {
        // Update currentTime
        const timeUpdate = () => setCurrentTime(video.currentTime);
        video.addEventListener("timeupdate", timeUpdate);

        // Set duration
        video.addEventListener("loadedmetadata", () =>
          setDuration(video.duration)
        );

        return () => video.removeEventListener("timeupdate", timeUpdate);
      }
    };

    init();

    return () => playerRef.current?.destroy();
  }, [src]);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Video Player */}
      <video
        ref={videoRef}
        controls={false} // میخوایم کنترل خودمون باشه
        className="w-full bg-black rounded"
      />

      {/* Timeline */}
      <input
        type="range"
        min="0"
        max={duration}
        step="0.1"
        value={currentTime}
        onChange={(e) => {
          const time = parseFloat(e.target.value);
          setCurrentTime(time);
          if (videoRef.current) videoRef.current.currentTime = time;
        }}
        className="w-full"
      />

      {/* Controls */}
      <div className="flex items-center space-x-4">
        {/* Play / Pause */}
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded"
          onClick={() => {
            if (!videoRef.current) return;
            if (videoRef.current.paused) {
              videoRef.current.play();
              setIsPlaying(true);
            } else {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          }}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>

        {/* Volume */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => {
            const vol = parseFloat(e.target.value);
            setVolume(vol);
            if (videoRef.current) videoRef.current.volume = vol;
          }}
          className="w-32"
        />

        {/* Fullscreen */}
        <button
          className="px-4 py-2 bg-gray-700 text-white rounded"
          onClick={() => {
            if (!videoRef.current) return;
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              videoRef.current.requestFullscreen();
            }
          }}
        >
          Fullscreen
        </button>
      </div>

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
