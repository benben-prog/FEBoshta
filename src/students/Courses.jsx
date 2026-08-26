import {
  ArrowRight,
  FolderOpen,
  Youtube,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPlaylists, fetchPlaylistVideos } from "../api/student/actions";
import PlaylistCard from "../components/PlaylistCard";
import VideoCard from "../components/VideoCard";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const Courses = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistVideos, setPlaylistVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    const result = await fetchPlaylists();
    if (result.success) setPlaylists(result.data);
    setLoading(false);
  };

  const openPlaylist = async (playlist) => {
    setSelectedPlaylist(playlist);
    const result = await fetchPlaylistVideos(playlist.id);
    if (result.success) setPlaylistVideos(result.data);
  };

  const openWatch = (video) => {
    navigate(`/student/courses/watch/${video.video_id}`);
  };

  if (loading)
    return <div className="p-8 text-center text-gray-500">جاري التحميل...</div>;

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 sm:gap-5 w-full min-h-screen"
      dir="rtl"
    >
      {/* Header */}
      <motion.header
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            المحاضرات
          </h1>
          <span className="text-gray-500 text-sm">
            مكتبة الفيديوهات التعليمية
          </span>
        </div>
      </motion.header>

      {/* Tabs */}
      <motion.div
        variants={itemVariants}
        className="flex gap-1 border-b border-gray-200 overflow-x-auto"
      >
        <button
          onClick={() => setSelectedPlaylist(null)}
          className={`shrink-0 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition ${
            !selectedPlaylist
              ? "border-red-600 text-red-600"
              : "border-transparent text-gray-500"
          }`}
        >
          قوايم التشغيل ({playlists.length})
        </button>
        {selectedPlaylist && (
          <button className="shrink-0 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 border-blue-600 text-blue-600 flex items-center gap-1">
            <ArrowRight size={12} />
            {selectedPlaylist.title}
          </button>
        )}
      </motion.div>

      {/* Playlists Grid */}
      {!selectedPlaylist && (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {playlists.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">
              <FolderOpen size={48} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm">لا توجد قوايم تشغيل</p>
            </div>
          ) : (
            playlists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onClick={() => openPlaylist(playlist)}
                canDelete={false}
              />
            ))
          )}
        </div>
      )}

      {/* Playlist Videos */}
      {selectedPlaylist && (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {playlistVideos.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">
              <Youtube size={48} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm">هذه القائمة فارغة</p>
            </div>
          ) : (
            playlistVideos.map((video) => (
              <VideoCard
                key={video.video_id}
                video={video}
                onWatch={() => openWatch(video)}
                canDelete={false}
              />
            ))
          )}
        </div>
      )}
    </motion.section>
  );
};

export default Courses;