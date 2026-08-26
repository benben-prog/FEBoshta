import { PlayCircle, FolderOpen, Search, X, ArrowRight } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCourses, fetchPlaylistDetails } from "../api/teacher/actions";
import PlaylistCard from "../components/PlaylistCard";
import VideoCard from "../components/VideoCard";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const Courses = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("videos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistVideos, setPlaylistVideos] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchCourses();
      if (result.success) {
        setVideos(result.data.videos || []);
        setPlaylists(result.data.playlists || []);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const allGrades = useMemo(() => {
    const gradesSet = new Set();
    videos.forEach((v) => {
      if (v.grade_name) gradesSet.add(v.grade_name);
    });
    playlists.forEach((p) => {
      if (p.grade_name) gradesSet.add(p.grade_name);
    });
    return Array.from(gradesSet).sort();
  }, [videos, playlists]);

  const filterByGrade = (items, grade) => {
    if (grade === "all") return items;
    return items.filter((item) => item.grade_name === grade);
  };

  const filterBySearch = (items) => {
    if (searchQuery.trim() === "") return items;
    return items.filter(
      (item) =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.grade_name?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  };

  const filteredVideos = filterBySearch(filterByGrade(videos, selectedGrade));
  const filteredPlaylists = filterBySearch(
    filterByGrade(playlists, selectedGrade),
  );

  const handlePlaylistClick = async (playlist) => {
    setSelectedPlaylist(playlist);
    setActiveTab("playlistVideos");
    const result = await fetchPlaylistDetails(playlist.id);
    if (result.success) {
      setPlaylistVideos(result.data.videos || []);
    }
  };

  const openWatch = (video) => {
    navigate(`/teacher/courses/watch/${video.id}`);
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

        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent focus:outline-none text-xs sm:text-sm w-32 sm:w-48"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-gray-400 shrink-0"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-xs sm:text-sm text-gray-600"
          >
            <option value="all">كل الصفوف</option>
            {allGrades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>
      </motion.header>

      {/* Tabs */}
      <motion.div
        variants={itemVariants}
        className="flex gap-1 border-b border-gray-200 overflow-x-auto"
      >
        <button
          onClick={() => {
            setActiveTab("videos");
            setSelectedPlaylist(null);
          }}
          className={`shrink-0 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === "videos"
              ? "border-red-600 text-red-600"
              : "border-transparent text-gray-500"
          }`}
        >
          الفيديوهات ({filteredVideos.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("playlists");
            setSelectedPlaylist(null);
          }}
          className={`shrink-0 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition ${
            activeTab === "playlists"
              ? "border-red-600 text-red-600"
              : "border-transparent text-gray-500"
          }`}
        >
          قوايم التشغيل ({filteredPlaylists.length})
        </button>
        {selectedPlaylist && (
          <button className="shrink-0 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 border-blue-600 text-blue-600 flex items-center gap-1">
            <ArrowRight size={12} />
            {selectedPlaylist.title}
          </button>
        )}
      </motion.div>

      {/* Videos Grid */}
      {activeTab === "videos" && (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredVideos.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">
              <PlayCircle size={48} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm">لا توجد فيديوهات</p>
            </div>
          ) : (
            filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onWatch={() => openWatch(video)}
                canDelete={false}
              />
            ))
          )}
        </div>
      )}

      {/* Playlists Grid */}
      {activeTab === "playlists" && (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredPlaylists.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">
              <FolderOpen size={48} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm">لا توجد قوايم تشغيل</p>
            </div>
          ) : (
            filteredPlaylists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onClick={() => handlePlaylistClick(playlist)}
                canDelete={false}
              />
            ))
          )}
        </div>
      )}

      {/* Playlist Videos */}
      {activeTab === "playlistVideos" && selectedPlaylist && (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {playlistVideos.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">
              <p className="text-sm">هذه القائمة فارغة</p>
            </div>
          ) : (
            playlistVideos.map((video) => (
              <VideoCard
                key={video.id}
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
