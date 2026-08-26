import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";
import {
  FileText,
  Monitor,
  CalendarDays,
  Award,
  TrendingUp,
  Target,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  fetchStudentStats,
  fetchPaperExams,
  fetchExamHistory,
} from "../api/student/actions";

const Degrees = () => {
  const [stats, setStats] = useState(null);
  const [paperExams, setPaperExams] = useState([]);
  const [onlineExams, setOnlineExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [statsRes, paperRes, onlineRes] = await Promise.all([
      fetchStudentStats(),
      fetchPaperExams(),
      fetchExamHistory(),
    ]);
    if (statsRes.success) setStats(statsRes.data);
    if (paperRes.success) setPaperExams(paperRes.data);
    if (onlineRes.success) setOnlineExams(onlineRes.data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const allExams = [
    ...paperExams.map((exam) => ({ ...exam, examType: "paper" })),
    ...onlineExams.map((exam) => ({ ...exam, examType: "online" })),
  ];

  const filteredExams = allExams.filter((exam) => {
    if (activeTab === "paper") return exam.examType === "paper";
    if (activeTab === "online") return exam.examType === "online";
    return true;
  });

  const getPercentage = (exam) => {
    const total =
      exam.examType === "paper" ? exam.total_degree : exam.full_mark;
    const score = exam.examType === "paper" ? exam.student_degree : exam.score;
    return total > 0 ? Math.round((Number(score) / Number(total)) * 100) : 0;
  };

  const highestScore =
    allExams.length > 0 ? Math.max(...allExams.map(getPercentage)) : 0;
  const avgScore = Math.round(
    stats?.avg_paper_degree || stats?.avg_online_score || 0,
  );

  const getGrade = (percentage) => {
    if (percentage >= 85)
      return {
        label: "ممتاز",
        text: "text-green-700",
        bg: "bg-green-100",
        bar: "#16a34a",
      };
    if (percentage >= 75)
      return {
        label: "جيد جداً",
        text: "text-blue-700",
        bg: "bg-blue-100",
        bar: "#3b82f6",
      };
    if (percentage >= 65)
      return {
        label: "جيد",
        text: "text-purple-700",
        bg: "bg-purple-100",
        bar: "#9224EB",
      };
    if (percentage >= 50)
      return {
        label: "مقبول",
        text: "text-orange-700",
        bg: "bg-orange-100",
        bar: "#f59e0b",
      };
    return {
      label: "راسب",
      text: "text-red-700",
      bg: "bg-red-100",
      bar: "#dc2626",
    };
  };

  const performanceData = allExams.map((exam, idx) => ({
    name: `اختبار ${idx + 1}`,
    percentage: getPercentage(exam),
  }));

  return (
    <section className="flex flex-col gap-4 w-full min-h-screen" dir="rtl">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          الدرجات والتقييمات
        </h1>
        <span className="text-gray-500 text-sm">متابعة درجاتي</span>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Target className="text-blue-600" size={24} />
          </div>
          <div>
            <span className="font-bold text-3xl block text-gray-900">
              {avgScore}
            </span>
            <span className="text-sm text-gray-500">متوسط الدرجات</span>
          </div>
        </div>
        <div className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center shrink-0">
            <TrendingUp className="text-green-600" size={24} />
          </div>
          <div>
            <span className="font-bold text-3xl block text-gray-900">
              {highestScore}%
            </span>
            <span className="text-sm text-gray-500">أعلى درجة</span>
          </div>
        </div>
        <div className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
            <Award className="text-purple-600" size={24} />
          </div>
          <div>
            <span
              className={`font-bold text-xl block ${getGrade(avgScore).text}`}
            >
              {getGrade(avgScore).label}
            </span>
            <span className="text-sm text-gray-500">التقدير العام</span>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      {performanceData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-base mb-4">تطور الأداء</h2>
          <div className="h-55">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ fontSize: "13px", borderRadius: "10px" }}
                />
                <Area
                  type="monotone"
                  dataKey="percentage"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#colorScore)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 bg-white rounded-t-xl px-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === "all"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          الكل ({allExams.length})
        </button>
        <button
          onClick={() => setActiveTab("paper")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === "paper"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          ورقي ({paperExams.length})
        </button>
        <button
          onClick={() => setActiveTab("online")}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === "online"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          إلكتروني ({onlineExams.length})
        </button>
      </div>

      {/* Exam Cards */}
      <div className="flex flex-col gap-2.5">
        {filteredExams.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <FileText size={44} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">لا توجد امتحانات</p>
          </div>
        ) : (
          filteredExams.map((exam, idx) => {
            const percentage = getPercentage(exam);
            const grade = getGrade(percentage);
            const date =
              exam.examType === "paper" ? exam.exam_date : exam.submitted_at;
            const total =
              exam.examType === "paper" ? exam.total_degree : exam.full_mark;
            const score =
              exam.examType === "paper" ? exam.student_degree : exam.score;

            return (
              <motion.div
                variants={pageVariants}
                initial="hidden"
                animate="show"
                key={idx}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition"
              >
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                        exam.examType === "paper"
                          ? "bg-orange-50"
                          : "bg-purple-50"
                      }`}
                    >
                      {exam.examType === "paper" ? (
                        <FileText className="text-orange-600" size={20} />
                      ) : (
                        <Monitor className="text-purple-600" size={20} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-sm block truncate">
                        {exam.examType === "paper"
                          ? exam.title
                          : exam.exam_title}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <CalendarDays size={13} />
                        {new Date(date).toLocaleDateString("ar-EG", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-center">
                      <span className="font-bold text-lg text-gray-900 block">
                        {score}/{total}
                      </span>
                      <span className="text-[11px] text-gray-500">الدرجة</span>
                    </div>
                    <div className="text-center">
                      <span
                        className="font-bold text-lg block"
                        style={{ color: grade.bar }}
                      >
                        {percentage}%
                      </span>
                      <span className="text-[11px] text-gray-500">النسبة</span>
                    </div>
                    <span
                      className={`text-sm font-bold px-4 py-2 rounded-full ${grade.bg} ${grade.text} whitespace-nowrap`}
                    >
                      {grade.label}
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden"
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${percentage}%`, background: grade.bar }}
                  />
                </motion.div>
              </motion.div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default Degrees;
