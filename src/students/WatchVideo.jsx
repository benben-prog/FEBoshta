import { Youtube } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPlaylists, fetchPlaylistVideos } from "../api/student/actions";
import VideoPlayer from "../components/VideoPlayer";
import { motion } from "framer-motion";
import { pageVariants } from "../motion";

const WatchVideo = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const [currentVideo, setCurrentVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [videoId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const playlistsRes = await fetchPlaylists();
      if (playlistsRes.success) {
        for (const playlist of playlistsRes.data) {
          const videosRes = await fetchPlaylistVideos(playlist.id);
          if (videosRes.success) {
            const found = videosRes.data.find(
              (v) => v.video_id === parseInt(videoId),
            );
            if (found) {
              setCurrentVideo(found);
              setRelatedVideos(
                videosRes.data.filter((v) => v.video_id !== found.video_id),
              );
              break;
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading video:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-gray-500">
        جاري التحميل...
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center gap-3 p-8 text-center"
      >
        <Youtube size={56} className="text-gray-300" />
        <p className="text-gray-500 text-sm">الفيديو غير موجود</p>
        <button
          onClick={() => navigate("/student/courses")}
          className="px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-bold"
        >
          رجوع
        </button>
      </motion.div>
    );
  }

  return (
    <VideoPlayer
      video={currentVideo}
      onBack={() => navigate("/student/courses")}
      relatedVideos={relatedVideos}
      onRelatedClick={(video) =>
        navigate(`/student/courses/watch/${video.video_id}`)
      }
    />
  );
};

export default WatchVideo;
