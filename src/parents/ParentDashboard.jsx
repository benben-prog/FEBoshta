import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // ✅ تعديل: useParams بدل useSearchParams
import { fetchParentDashboard } from "../api/parent/actions";
import {
  CalendarCheck2,
  Wallet,
  FileCheck2,
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Area,
  YAxis,
  XAxis,
  CartesianGrid,
  AreaChart,
} from "recharts";

const COLORS = ["#16a34a", "#dc2626"];

const ParentDashboard = () => {
  const { token } = useParams(); // ✅ تعديل: بقرأ من الـ path

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const loadData = async () => {
      if (!token) {
        setError("الرابط غير صالح - التوكن مطلوب");
        setLoading(false);
        return;
      }

      try {
        const res = await fetchParentDashboard(token);
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.error || "حدث خطأ في تحميل البيانات");
        }
      } catch (err) {
        setError(err.message || "حدث خطأ في تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172B] flex items-center justify-center text-white text-xl">
        جاري التحميل...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F172B] flex flex-col items-center justify-center text-white text-xl gap-4">
        <XCircle className="w-16 h-16 text-red-500" />
        <span>خطأ: {error}</span>
      </div>
    );
  }

  const {
    student,
    attendance,
    attendanceHistory = [],
    payments,
    paymentHistory = [],
    paperExams = [],
    onlineExams = [],
    assignments = [],
    groupInfo,
    overallStats,
  } = data;

  const pieData = [
    { name: "حضور", value: parseInt(attendance?.present_days) || 0 },
    { name: "غياب", value: parseInt(attendance?.absent_days) || 0 },
  ].filter((item) => item.value > 0);

  const attendanceData = [...attendanceHistory]
    .slice(0, 10)
    .reverse()
    .map((record) => ({
      date: new Date(record.attendance_date).toLocaleDateString("ar-EG", {
        day: "numeric",
        month: "short",
      }),
      status: record.status === "present" ? 1 : 0,
    }));

  const tabs = [
    { id: "overview", label: "نظرة عامة" },
    { id: "attendance", label: "الحضور" },
    { id: "payments", label: "المدفوعات" },
    { id: "exams", label: "الامتحانات" },
    { id: "assignments", label: "الواجبات" },
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-[#0F172B] p-3 sm:p-4"
      dir="rtl"
    >
      <motion.div
        variants={itemVariants}
        className="max-w-4xl mx-auto flex flex-col gap-3 sm:gap-4"
      >
        {/* Header */}
        <div className="relative bg-linear-to-l from-[#003322] to-[#009966] rounded-2xl p-4 sm:p-5 text-white overflow-hidden">
          <div className="relative z-10 flex flex-col gap-2">
            <span className="text-sm opacity-80">بوابة ولي الأمر</span>
            <span className="text-2xl sm:text-3xl font-bold truncate">
              {student?.full_name}
            </span>
            <div className="flex flex-wrap gap-1.5 text-sm">
              <span className="bg-white/20 px-2.5 py-1 rounded-full">
                {student?.grade_name}
              </span>
              {groupInfo?.group_name && (
                <span className="bg-white/20 px-2.5 py-1 rounded-full">
                  {groupInfo.group_name}
                </span>
              )}
              {groupInfo?.room && (
                <span className="bg-white/20 px-2.5 py-1 rounded-full">
                  قاعة {groupInfo.room}
                </span>
              )}
            </div>
          </div>
          <div className="relative z-10 flex gap-2 mt-3">
            <div className="flex-1 flex flex-col items-center bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <span className="text-xl sm:text-2xl font-bold">
                {attendance?.attendance_percentage || 0}%
              </span>
              <span className="text-xs">نسبة الحضور</span>
            </div>
            <div className="flex-1 flex flex-col items-center bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <span className="text-xl sm:text-2xl font-bold">
                {overallStats?.avg_paper_score || 0}
              </span>
              <span className="text-xs">متوسط الدرجات</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="bg-white rounded-xl p-3.5 flex items-center gap-2.5">
            <CalendarCheck2 className="text-green-600 w-6 h-6 shrink-0" />
            <div className="min-w-0">
              <span className="text-base font-bold block">
                حضور: {attendance?.present_days || 0}
              </span>
              <span className="text-xs text-gray-500 block">
                غياب: {attendance?.absent_days || 0}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3.5 flex items-center gap-2.5">
            <Wallet className="text-orange-600 w-6 h-6 shrink-0" />
            <div className="min-w-0">
              <span className="text-base font-bold text-green-600 block">
                مدفوع: {payments?.total_paid || 0}
              </span>
              <span className="text-xs text-gray-500 block">
                متبقي: {payments?.remaining || 0}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3.5 flex items-center gap-2.5">
            <FileCheck2 className="text-purple-600 w-6 h-6 shrink-0" />
            <div className="min-w-0">
              <span className="text-base font-bold block">
                امتحانات: {paperExams.length + onlineExams.length}
              </span>
              <span className="text-xs text-gray-500 block truncate">
                ورقي: {paperExams.length} | إلكتروني: {onlineExams.length}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3.5 flex items-center gap-2.5">
            <Users className="text-blue-600 w-6 h-6 shrink-0" />
            <div className="min-w-0">
              <span className="text-base font-bold block">
                {groupInfo?.students_count || 0}
              </span>
              <span className="text-xs text-gray-500 block">عدد الطلاب</span>
            </div>
          </div>
        </div>

        {/* Group Info */}
        {groupInfo && (
          <div className="bg-white rounded-xl p-4">
            <h3 className="text-base font-bold text-gray-900 mb-2.5 flex items-center gap-2">
              <Users className="text-green-600 w-5 h-5" />
              معلومات المجموعة
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-lg p-2.5">
                <span className="text-xs text-gray-500 block">المجموعة</span>
                <span className="font-bold text-sm truncate block">
                  {groupInfo.group_name}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <span className="text-xs text-gray-500 block">المواعيد</span>
                <span className="font-bold text-sm block">
                  {groupInfo.start_time} - {groupInfo.end_time}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <span className="text-xs text-gray-500 block">الأيام</span>
                <span className="font-bold text-sm truncate block">
                  {groupInfo.days}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <span className="text-xs text-gray-500 block">القاعة</span>
                <span className="font-bold text-sm block">
                  {groupInfo.room}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-[#009966] text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-xl p-4">
              <span className="text-base font-bold block mb-3">
                نسبة الحضور
              </span>
              <div className="w-full h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attendanceData}>
                    <defs>
                      <linearGradient
                        id="colorParent"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#009966"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#009966"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 11 }} width={30} />
                    <Tooltip
                      contentStyle={{ fontSize: "13px", borderRadius: "8px" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="status"
                      stroke="#009966"
                      strokeWidth={2}
                      fill="url(#colorParent)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4">
              <span className="text-base font-bold block mb-2 text-center">
                توزيع الحضور
              </span>
              {pieData.length > 0 ? (
                <>
                  <div className="w-full h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            fontSize: "13px",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-3 flex-wrap mt-2">
                    {pieData.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 text-sm"
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: COLORS[idx] }}
                        />
                        <span>
                          {item.name}: <b>{item.value}</b>
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-center text-gray-400 text-sm py-8">
                  لا توجد بيانات
                </p>
              )}
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === "attendance" && (
          <div className="bg-white rounded-xl p-4">
            <h3 className="text-base font-bold mb-3">سجل الحضور</h3>
            <div className="max-h-96 overflow-y-auto">
              <div className="flex flex-col gap-2">
                {attendanceHistory.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">
                    لا توجد بيانات حضور
                  </p>
                ) : (
                  attendanceHistory.map((record, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                    >
                      <span className="text-sm text-gray-600">
                        {new Date(record.attendance_date).toLocaleDateString(
                          "ar-EG",
                        )}
                      </span>
                      {record.status === "present" ? (
                        <span className="flex items-center gap-1.5 text-green-600 text-sm font-bold">
                          <CheckCircle2 size={15} /> حاضر
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-red-600 text-sm font-bold">
                          <XCircle size={15} /> غائب
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div className="bg-white rounded-xl p-4">
            <h3 className="text-base font-bold mb-3">سجل المدفوعات</h3>
            <div className="flex flex-col gap-2">
              {paymentHistory.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">
                  لا توجد مدفوعات
                </p>
              ) : (
                paymentHistory.map((payment, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                  >
                    <div>
                      <span className="font-bold text-sm block">
                        {payment.amount} ج.م
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(payment.payment_date).toLocaleDateString(
                          "ar-EG",
                        )}
                      </span>
                    </div>
                    <span className="text-sm text-green-600 font-bold">
                      مدفوع
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Exams Tab */}
        {activeTab === "exams" && (
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-xl p-4">
              <h3 className="text-base font-bold mb-3">
                الامتحانات الورقية ({paperExams.length})
              </h3>
              {paperExams.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">
                  لا توجد امتحانات
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {paperExams.map((exam, idx) => (
                    <div key={idx} className="bg-blue-50 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm">{exam.title}</span>
                        <span
                          className={`font-bold text-sm ${exam.percentage >= 50 ? "text-green-600" : "text-red-600"}`}
                        >
                          {exam.student_degree}/{exam.total_degree}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(exam.exam_date).toLocaleDateString("ar-EG")} |{" "}
                        {exam.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-4">
              <h3 className="text-base font-bold mb-3">
                الامتحانات الإلكترونية ({onlineExams.length})
              </h3>
              {onlineExams.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">
                  لا توجد امتحانات
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {onlineExams.map((exam, idx) => (
                    <div key={idx} className="bg-purple-50 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm">{exam.title}</span>
                        <span
                          className={`font-bold text-sm ${exam.percentage >= 50 ? "text-green-600" : "text-red-600"}`}
                        >
                          {exam.score}/{exam.full_mark}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(exam.submitted_at).toLocaleDateString(
                          "ar-EG",
                        )}{" "}
                        | {exam.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === "assignments" && (
          <div className="bg-white rounded-xl p-4">
            <h3 className="text-base font-bold mb-3">
              الواجبات ({assignments.length})
            </h3>
            {assignments.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">
                لا توجد واجبات
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {assignments.map((assignment, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">
                        {assignment.title}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          assignment.status === "graded"
                            ? "bg-green-100 text-green-700"
                            : assignment.status === "submitted"
                              ? "bg-blue-100 text-blue-700"
                              : assignment.status === "overdue"
                                ? "bg-red-100 text-red-700"
                                : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {assignment.status === "graded"
                          ? "مصحح"
                          : assignment.status === "submitted"
                            ? "مسلم"
                            : assignment.status === "overdue"
                              ? "متأخر"
                              : "قيد الانتظار"}
                      </span>
                    </div>
                    {assignment.score != null && (
                      <span className="text-xs text-gray-500">
                        الدرجة: {assignment.score}/{assignment.full_mark}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ParentDashboard;
