import {
  Play,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  Award,
  TrendingUp,
  CalendarClock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAvailableExams, fetchExamHistory } from "../api/student/actions";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const Exams = () => {
  const navigate = useNavigate();
  const [availableExams, setAvailableExams] = useState([]);
  const [historyExams, setHistoryExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [availableRes, historyRes] = await Promise.all([
        fetchAvailableExams(),
        fetchExamHistory(),
      ]);

      if (availableRes.success) {
        setAvailableExams(availableRes.data || []);
      }

      if (historyRes.success) setHistoryExams(historyRes.data || []);
    } catch (error) {
      setMessage({ type: "error", text: "حدث خطأ في تحميل البيانات" });
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalExams = historyExams.length;
    const passedExams = historyExams.filter(
      (exam) => exam.result_status === "passed",
    ).length;
    const avgScore =
      totalExams > 0
        ? Math.round(
            historyExams.reduce((sum, exam) => sum + exam.percentage, 0) /
              totalExams,
          )
        : 0;
    const bestScore =
      totalExams > 0
        ? Math.max(...historyExams.map((exam) => exam.percentage))
        : 0;

    return { totalExams, passedExams, avgScore, bestScore };
  }, [historyExams]);

  const handleStartExam = (exam) => {
    const now = Date.now();
    const startTime = new Date(exam.start_at).getTime();
    const endTime = new Date(exam.end_at).getTime();

    if (now > endTime) {
      setMessage({ type: "error", text: "عذراً، هذا الامتحان انتهى وقته" });
      loadData();
      return;
    }

    if (now < startTime) {
      setMessage({ type: "error", text: "عذراً، هذا الامتحان لم يبدأ بعد" });
      return;
    }

    navigate(`/student/exams/${exam.exam_id}`);
  };

  const getExamStatus = (exam) => {
    const now = Date.now();
    const startTime = new Date(exam.start_at).getTime();
    const endTime = new Date(exam.end_at).getTime();

    if (now > endTime) return { label: "منتهي", color: "text-red-500" };
    if (now < startTime) return { label: "قادم", color: "text-yellow-500" };
    return { label: "متاح الآن", color: "text-green-500" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-gray-500">
        <Loader2 className="animate-spin ml-2" size={20} />
        جاري التحميل...
      </div>
    );
  }

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 sm:gap-5 w-full min-h-screen"
      dir="rtl"
    >
      <motion.header variants={itemVariants}>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
          الامتحانات
        </h1>
        <span className="text-xs sm:text-sm text-gray-500">
          الامتحانات الإلكترونية المتاحة وسجل الدرجات
        </span>
      </motion.header>

      {message && (
        <div
          className={`p-3 sm:p-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <AlertCircle size={16} />
          {message.text}
        </div>
      )}

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3"
      >
        <div className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-3 sm:p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
              عدد الامتحانات
            </span>
            <FileText size={14} className="text-blue-500" />
          </div>
          <span className="text-lg sm:text-2xl font-bold text-gray-900">
            {stats.totalExams}
          </span>
        </div>

        <div className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-3 sm:p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
              الامتحانات الناجحة
            </span>
            <CheckCircle2 size={14} className="text-green-500" />
          </div>
          <span className="text-lg sm:text-2xl font-bold text-green-600">
            {stats.passedExams}
          </span>
        </div>

        <div className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-3 sm:p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
              متوسط الدرجات
            </span>
            <TrendingUp size={14} className="text-purple-500" />
          </div>
          <span className="text-lg sm:text-2xl font-bold text-gray-900">
            {stats.avgScore}%
          </span>
        </div>

        <div className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-3 sm:p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
              أفضل نتيجة
            </span>
            <Award size={14} className="text-yellow-500" />
          </div>
          <span className="text-lg sm:text-2xl font-bold text-yellow-600">
            {stats.bestScore}%
          </span>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4"
      >
        <h2 className="font-bold text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-2">
          <CalendarClock size={16} className="text-blue-500" />
          امتحانات متاحة ({availableExams.length})
        </h2>

        {availableExams.length === 0 ? (
          <p className="text-gray-400 text-xs sm:text-sm text-center py-6 sm:py-8">
            لا توجد امتحانات متاحة حالياً
          </p>
        ) : (
          <div className="flex flex-col gap-2 sm:gap-3">
            {availableExams.map((exam) => {
              const status = getExamStatus(exam);
              const canStart = status.label === "متاح الآن";
              return (
                <div
                  key={exam.exam_id}
                  className="border border-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm">
                        {exam.exam_title}
                      </span>
                      <span
                        className={`text-[10px] sm:text-xs font-medium ${status.color}`}
                      >
                        • {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 mt-1.5 text-[10px] sm:text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {exam.duration_minutes} دقيقة
                      </span>
                      <span>{exam.full_mark} درجة</span>
                      {exam.questions_count && (
                        <span>{exam.questions_count} سؤال</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartExam(exam)}
                    disabled={!canStart}
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 justify-center transition-colors shrink-0 ${
                      canStart
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Play size={13} />
                    {status.label}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4"
      >
        <h2 className="font-bold text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-2">
          <FileText size={16} className="text-green-500" />
          سجل الامتحانات ({historyExams.length})
        </h2>

        {historyExams.length === 0 ? (
          <p className="text-gray-400 text-xs sm:text-sm text-center py-6 sm:py-8">
            لا يوجد سجل امتحانات بعد
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {historyExams.map((exam) => (
              <div
                key={exam.attempt_id}
                className="border border-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3"
              >
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-xs sm:text-sm block truncate">
                    {exam.exam_title}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <CalendarClock size={11} />
                    {exam.submitted_at
                      ? new Date(exam.submitted_at).toLocaleDateString(
                          "ar-EG",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )
                      : "غير محدد"}
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <span
                    className={`font-bold text-xs sm:text-sm ${
                      exam.result_status === "passed"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {exam.score}/{exam.full_mark}
                  </span>
                  <span
                    className={`text-[10px] sm:text-xs font-medium px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 ${
                      exam.result_status === "passed"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {exam.result_status === "passed" ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <XCircle size={13} />
                    )}
                    {exam.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.section>
  );
};

export default Exams;
