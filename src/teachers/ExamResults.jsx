import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";
import {
  Search,
  X,
  ArrowRight,
  Users,
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle,
  FileText,
  Monitor,
  Clock,
  AlertCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchPaperExamResults,
  fetchOnlineExamStats,
} from "../api/teacher/actions";

const ExamResults = () => {
  const { type, examId } = useParams();
  const navigate = useNavigate();

  const [examResults, setExamResults] = useState([]);
  const [examStats, setExamStats] = useState(null);
  const [examInfo, setExamInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [examStatus, setExamStatus] = useState(null);

  useEffect(() => {
    loadResults();
  }, [type, examId]);

  const loadResults = async () => {
    setLoading(true);
    setSearchQuery("");

    try {
      if (type === "paper") {
        const result = await fetchPaperExamResults(examId);
        if (result.success) {
          const results = result.data.results || [];
          const stats = result.data.stats || {};
          setExamResults(results);
          setExamStats(stats);
          setExamInfo({
            title: stats.title || "امتحان ورقي",
            totalMark: stats.total_degree || 100,
            date: stats.exam_date,
            type: "paper",
          });

          const examDate = new Date(stats.exam_date).getTime();
          setExamStatus(examDate > Date.now() ? "upcoming" : "finished");
        }
      } else {
        const result = await fetchOnlineExamStats(examId);
        if (result.success) {
          const attempts = result.data.attempts || [];
          const stats = result.data.stats || {};
          setExamResults(attempts);
          setExamStats(stats);
          setExamInfo({
            title: stats.title || "امتحان إلكتروني",
            totalMark: stats.full_mark || 100,
            type: "online",
          });

          const now = Date.now();
          const startAt = stats.start_at
            ? new Date(stats.start_at).getTime()
            : 0;
          const endAt = stats.end_at
            ? new Date(stats.end_at).getTime()
            : Infinity;

          if (now < startAt) setExamStatus("upcoming");
          else if (now > endAt) setExamStatus("finished");
          else setExamStatus("ongoing");
        }
      }
    } catch (error) {
      console.error("Error loading results:", error);
    } finally {
      setLoading(false);
    }
  };

  const toNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const filteredResults = examResults.filter(
    (student) =>
      searchQuery.trim() === "" ||
      student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.barcode?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalMark =
    examInfo?.totalMark ||
    examStats?.total_degree ||
    examStats?.full_mark ||
    100;

  const passedStudents = examResults.filter((student) => {
    const score = toNumber(student.degree || student.score);
    const percentage =
      student.percentage ||
      (totalMark ? Math.round((score / totalMark) * 100) : 0);
    return percentage >= 50;
  });

  const failedStudents = examResults.filter((student) => {
    const score = toNumber(student.degree || student.score);
    const percentage =
      student.percentage ||
      (totalMark ? Math.round((score / totalMark) * 100) : 0);
    return percentage < 50;
  });

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
      <button
        onClick={() => navigate("/teacher/degrees")}
        className="flex items-center gap-1 text-[#009966] text-xs sm:text-sm font-bold w-fit"
      >
        <ArrowRight size={15} />
        رجوع للامتحانات
      </button>

      {/* Exam Info */}
      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold ${
              type === "paper"
                ? "bg-blue-50 text-blue-600"
                : "bg-purple-50 text-purple-600"
            }`}
          >
            {type === "paper" ? <FileText size={15} /> : <Monitor size={15} />}
            {type === "paper" ? "ورقي" : "إلكتروني"}
          </div>

          {examStatus === "upcoming" && (
            <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-600 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold">
              <Clock size={15} />
              لم يبدأ بعد
            </div>
          )}
          {examStatus === "ongoing" && (
            <div className="flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold">
              <AlertCircle size={15} />
              جاري الآن
            </div>
          )}
          {examStatus === "finished" && (
            <div className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold">
              <CheckCircle2 size={15} />
              منتهي
            </div>
          )}
        </div>
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mt-2">
          {examInfo?.title || "نتائج الامتحان"}
        </h2>
      </div>

      {/* Upcoming */}
      {examStatus === "upcoming" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg sm:rounded-xl p-6 text-center">
          <Clock size={36} className="text-yellow-500 mx-auto mb-2" />
          <h3 className="font-bold text-yellow-700 text-sm sm:text-base">
            لم يبدأ الامتحان بعد
          </h3>
          <p className="text-xs sm:text-sm text-yellow-600 mt-1">
            لا توجد نتائج متاحة
          </p>
        </div>
      )}

      {/* Ongoing */}
      {examStatus === "ongoing" && (
        <div className="bg-green-50 border border-green-200 rounded-lg sm:rounded-xl p-6 text-center">
          <AlertCircle size={36} className="text-green-500 mx-auto mb-2" />
          <h3 className="font-bold text-green-700 text-sm sm:text-base">
            الامتحان جاري الآن
          </h3>
          <p className="text-xs sm:text-sm text-green-600 mt-1">
            النتائج ستظهر بعد انتهاء الامتحان
          </p>
        </div>
      )}

      {/* Finished */}
      {examStatus === "finished" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
            <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-2.5 sm:p-4 text-center">
              <Users size={16} className="text-blue-500 mx-auto mb-1" />
              <span className="text-base sm:text-xl font-bold text-gray-900 block">
                {examResults.length}
              </span>
              <span className="text-[9px] sm:text-xs text-gray-500">
                الطلاب
              </span>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-2.5 sm:p-4 text-center">
              <TrendingUp size={16} className="text-green-500 mx-auto mb-1" />
              <span className="text-base sm:text-xl font-bold text-gray-900 block">
                {toNumber(
                  examStats?.average_degree || examStats?.average_score,
                )}
              </span>
              <span className="text-[9px] sm:text-xs text-gray-500">
                المتوسط
              </span>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-2.5 sm:p-4 text-center">
              <Award size={16} className="text-yellow-500 mx-auto mb-1" />
              <span className="text-base sm:text-xl font-bold text-gray-900 block">
                {toNumber(
                  examStats?.highest_degree || examStats?.highest_score,
                )}
              </span>
              <span className="text-[9px] sm:text-xs text-gray-500">
                الأعلى
              </span>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-2.5 sm:p-4 text-center">
              <CheckCircle2 size={16} className="text-green-500 mx-auto mb-1" />
              <span className="text-base sm:text-xl font-bold text-green-600 block">
                {passedStudents.length}
              </span>
              <span className="text-[9px] sm:text-xs text-gray-500">ناجح</span>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-2.5 sm:p-4 text-center">
              <XCircle size={16} className="text-red-500 mx-auto mb-1" />
              <span className="text-base sm:text-xl font-bold text-red-600 block">
                {failedStudents.length}
              </span>
              <span className="text-[9px] sm:text-xs text-gray-500">راسب</span>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2.5 py-2">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="بحث بالاسم أو الباركود..."
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

          {/* Mobile Cards */}
          <div className="sm:hidden">
            {filteredResults.length === 0 ? (
              <p className="text-center text-gray-400 text-xs py-6">
                لا توجد نتائج
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {filteredResults.map((student, index) => {
                  const score = toNumber(student.degree || student.score);
                  const percentage =
                    student.percentage ||
                    (totalMark ? Math.round((score / totalMark) * 100) : 0);
                  const isPassed = percentage >= 50;
                  return (
                    <div
                      key={student.id || index}
                      className="bg-white rounded-lg border border-gray-200 p-2.5"
                    >
                      <div className="flex justify-between items-center">
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-gray-900 block truncate">
                            {student.full_name}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            باركود: {student.barcode}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-bold ${isPassed ? "text-green-600" : "text-red-600"}`}
                        >
                          {percentage}%
                        </span>
                      </div>
                      <div className="mt-1.5 flex justify-between items-center">
                        <span className="text-[10px] text-gray-500">
                          الدرجة: {score}/{totalMark}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPassed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                        >
                          {isPassed ? "ناجح" : "راسب"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-150">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600">
                      الباركود
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600">
                      الاسم
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600">
                      الدرجة
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600">
                      النسبة
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600">
                      الحالة
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredResults.map((student, index) => {
                    const score = toNumber(student.degree || student.score);
                    const percentage =
                      student.percentage ||
                      (totalMark ? Math.round((score / totalMark) * 100) : 0);
                    const isPassed = percentage >= 50;
                    return (
                      <tr
                        key={student.id || index}
                        className="hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-xs">{student.barcode}</td>
                        <td className="py-3 px-4 font-medium text-xs">
                          {student.full_name}
                        </td>
                        <td className="py-3 px-4 text-xs font-bold">
                          {score}/{totalMark}
                        </td>
                        <td className="py-3 px-4 text-xs">{percentage}%</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${isPassed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                          >
                            {isPassed ? (
                              <CheckCircle2 size={11} />
                            ) : (
                              <XCircle size={11} />
                            )}
                            {isPassed ? "ناجح" : "راسب"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default ExamResults;
