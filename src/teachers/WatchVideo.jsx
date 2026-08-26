import { Youtube } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchVideoById, fetchCourses } from "../api/teacher/actions";
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
      // ✅ جيب الفيديو المحدد بـ getVideoById
      const videoResult = await fetchVideoById(videoId);

      if (videoResult.success) {
        const video = videoResult.data;
        setCurrentVideo(video);

        // ✅ جيب الفيديوهات المرتبطة (نفس الصف) بـ fetchCourses
        if (video) {
          const coursesResult = await fetchCourses();
          if (coursesResult.success) {
            const allVideos = coursesResult.data.videos || [];
            const related = allVideos.filter(
              (v) => v.id !== video.id && v.grade_id === video.grade_id,
            );
            setRelatedVideos(related);
          }
        }
      } else {
        setCurrentVideo(null);
      }
    } catch (error) {
      console.error("Error loading video:", error);
      setCurrentVideo(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#009966] border-t-transparent rounded-full animate-spin"></div>
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
        dir="rtl"
      >
        <Youtube size={56} className="text-gray-300" />
        <p className="text-gray-500 text-sm">الفيديو غير موجود</p>
        <button
          onClick={() => navigate("/teacher/courses")}
          className="px-5 py-2 bg-[#009966] text-white rounded-full text-sm font-bold"
        >
          رجوع
        </button>
      </motion.div>
    );
  }

  return (
    <VideoPlayer
      video={currentVideo}
      onBack={() => navigate("/teacher/courses")}
      relatedVideos={relatedVideos}
      onRelatedClick={(video) => navigate(`/teacher/courses/watch/${video.id}`)}
    />
  );
};

export default WatchVideo;
