import {
  FileText,
  Monitor,
  ArrowRight,
  GraduationCap,
  Search,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllExams } from "../api/teacher/actions";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const Degrees = () => {
  const navigate = useNavigate();
  const [paperExams, setPaperExams] = useState([]);
  const [onlineExams, setOnlineExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("paper");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchAllExams();
      if (result.success) {
        setPaperExams(result.data.paperExams || []);
        setOnlineExams(result.data.onlineExams || []);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const getExamStatus = (exam, type) => {
    const now = new Date();

    if (type === "paper") {
      const examDate = new Date(exam.exam_date);
      if (examDate > now) {
        return { label: "لم يبدأ بعد", color: "bg-yellow-50 text-yellow-600" };
      }
      return { label: "منتهي", color: "bg-gray-50 text-gray-600" };
    }

    const startAt = new Date(exam.start_at);
    const endAt = new Date(exam.end_at);

    if (now < startAt) {
      return { label: "لم يبدأ بعد", color: "bg-yellow-50 text-yellow-600" };
    }
    if (now > endAt) {
      return { label: "منتهي", color: "bg-gray-50 text-gray-600" };
    }
    return { label: "جاري الآن", color: "bg-green-50 text-green-600" };
  };

  const filteredPaper = paperExams.filter(
    (exam) =>
      exam.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.grade_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredOnline = onlineExams.filter(
    (exam) =>
      exam.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.grade_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#009966] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <section
      className="flex flex-col gap-3 sm:gap-4 w-full min-h-screen"
      dir="rtl"
    >
      {/* Header */}
      <header className="w-full flex flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            الدرجات والتقييمات
          </h1>
          <span className="text-xs sm:text-sm text-gray-500">
            متابعة درجات الطلاب في الامتحانات
          </span>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2.5 py-2 w-full sm:w-72">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="بحث عن امتحان..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent focus:outline-none text-xs sm:text-sm w-full"
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
      </header>

      {/* Tabs */}
      <div className="flex gap-1 bg-white p-1 rounded-xl border border-gray-200 w-full overflow-x-auto">
        <button
          onClick={() => setActiveTab("paper")}
          className={`flex-1 px-3 sm:px-5 py-2 rounded-lg text-[11px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === "paper"
              ? "bg-[#009966] text-white shadow"
              : "text-gray-500"
          }`}
        >
          <FileText size={14} className="shrink-0" />
          <span>ورقي</span>
          <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">
            {filteredPaper.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("online")}
          className={`flex-1 px-3 sm:px-5 py-2 rounded-lg text-[11px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === "online"
              ? "bg-[#009966] text-white shadow"
              : "text-gray-500"
          }`}
        >
          <Monitor size={14} className="shrink-0" />
          <span>إلكتروني</span>
          <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">
            {filteredOnline.length}
          </span>
        </button>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-4">
        {activeTab === "paper" ? (
          filteredPaper.length === 0 ? (
            <p className="col-span-full text-center py-8 text-gray-400 text-sm">
              لا توجد امتحانات
            </p>
          ) : (
            filteredPaper.map((exam) => {
              const status = getExamStatus(exam, "paper");
              return (
                <div
                  key={exam.id}
                  onClick={() => navigate(`/teacher/exams/paper/${exam.id}`)}
                  className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 hover:shadow-lg transition cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="bg-blue-50 rounded-lg p-2">
                      <FileText size={18} className="text-blue-500" />
                    </div>
                    <ArrowRight size={16} className="text-gray-300" />
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-1">
                    {exam.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 mt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <GraduationCap size={11} />
                      {exam.grade_name || "-"}
                    </span>
                    <span>{exam.total_degree || "-"} درجة</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs text-gray-400">
                      {new Date(exam.exam_date).toLocaleDateString("ar-EG")}
                    </span>
                    <span
                      className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })
          )
        ) : filteredOnline.length === 0 ? (
          <p className="col-span-full text-center py-8 text-gray-400 text-sm">
            لا توجد امتحانات
          </p>
        ) : (
          filteredOnline.map((exam) => {
            const status = getExamStatus(exam, "online");
            return (
              <div
                key={exam.id}
                onClick={() => navigate(`/teacher/exams/online/${exam.id}`)}
                className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 hover:shadow-lg transition cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="bg-purple-50 rounded-lg p-2">
                    <Monitor size={18} className="text-purple-500" />
                  </div>
                  <ArrowRight size={16} className="text-gray-300" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-1">
                  {exam.title}
                </h3>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <GraduationCap size={11} />
                    {exam.grade_name || "-"}
                  </span>
                  <span>{exam.full_mark || "-"} درجة</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs text-gray-400">
                    {exam.duration_minutes || "-"} دقيقة
                  </span>
                  <span
                    className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full ${status.color}`}
                  >
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default Degrees;
