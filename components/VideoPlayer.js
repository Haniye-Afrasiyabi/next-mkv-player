"use client";

import { useEffect, useRef, useState } from "react";
import shaka from "shaka-player/dist/shaka-player.compiled";
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/solid";

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
        const timeUpdate = () => setCurrentTime(video.currentTime);
        video.addEventListener("timeupdate", timeUpdate);
        video.addEventListener("loadedmetadata", () =>
          setDuration(video.duration)
        );

        return () => video.removeEventListener("timeupdate", timeUpdate);
      }
    };

    init();

    return () => playerRef.current?.destroy();
  }, [src]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) videoRef.current.volume = vol;
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Video */}
      <video
        ref={videoRef}
        controls={false}
        className="w-full bg-black rounded"
      />

      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-gray-300 rounded">
        <div
          className="absolute top-0 left-0 h-2 bg-purple-600 rounded"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        ></div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center space-x-4">
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="p-2 bg-purple-600 text-white rounded"
        >
          {isPlaying ? (
            <PauseIcon className="w-5 h-5" />
          ) : (
            <PlayIcon className="w-5 h-5" />
          )}
        </button>

        {/* Volume */}
        <div className="flex items-center space-x-2 w-32">
          <SpeakerWaveIcon className="w-5 h-5 text-gray-700" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full accent-purple-600"
          />
        </div>

        {/* Fullscreen */}
        <button
          onClick={handleFullscreen}
          className="p-2 bg-gray-700 text-white rounded"
        >
          <ArrowsPointingOutIcon className="w-5 h-5" />
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
