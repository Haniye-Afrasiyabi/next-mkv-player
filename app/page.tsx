import VideoPlayer from "../components/VideoPlayer"

export default function Home() {
  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <VideoPlayer src="https://example.com/video.mkv" />
    </main>
  )
}
