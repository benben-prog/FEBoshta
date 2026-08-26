import {
  ArrowRight,
  Phone,
  Users,
  CheckCircle2,
  XCircle,
  FileText,
  Monitor,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchStudentFullDetails } from "../api/teacher/actions";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const StudentDetails = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadDetails();
  }, [studentId]);

  const loadDetails = async () => {
    setLoading(true);
    const result = await fetchStudentFullDetails(studentId);
    if (result.success) {
      setStudentDetails(result.data);
    }
    setLoading(false);
  };

  const toNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!studentDetails) {
    return (
      <div className="flex flex-col items-center gap-3 p-10 text-center">
        <p className="text-gray-500">لا توجد بيانات</p>
        <button
          onClick={() => navigate("/teacher/students")}
          className="text-blue-600 text-sm font-bold"
        >
          رجوع
        </button>
      </div>
    );
  }

  const profile = studentDetails.profile || {};
  const stats = studentDetails.stats || {};
  const attendance = studentDetails.attendance || [];
  const payments = studentDetails.payments || [];
  const paperExams = studentDetails.paperExams || [];
  const examResults = studentDetails.examResults || [];
  const onlineExams = studentDetails.onlineExams || [];

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-5 p-3 sm:p-4 md:p-6 w-full min-h-screen bg-gray-50"
      dir="rtl"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate("/teacher/students")}
        className="flex items-center gap-1 text-blue-600 text-sm font-bold w-fit"
      >
        <ArrowRight size={16} />
        رجوع للطلاب
      </button>

      {/* Student Header */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-gray-600">
              {profile.full_name?.charAt(0) || "ط"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {profile.full_name}
            </h1>
            <div className="flex items-center gap-3 flex-wrap mt-1">
              <span className="text-xs sm:text-sm text-gray-500">
                باركود: {profile.barcode}
              </span>
              <span className="text-xs sm:text-sm text-gray-500">
                {profile.grade_name} - {profile.group_name}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        variants={itemVariants}
        className="flex gap-1 bg-white p-1 rounded-xl border border-gray-200 w-full sm:w-fit overflow-x-auto"
      >
        {[
          { id: "overview", label: "نظرة عامة" },
          { id: "attendance", label: "الحضور" },
          { id: "exams", label: "الامتحانات" },
          { id: "payments", label: "المدفوعات" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-[#009966] text-white shadow"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <span className="text-xl sm:text-2xl font-bold text-green-700 block">
                {toNumber(stats.attendance_percentage)}%
              </span>
              <span className="text-[11px] sm:text-xs text-green-600">
                نسبة الحضور
              </span>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <span className="text-xl sm:text-2xl font-bold text-blue-700 block">
                {toNumber(stats.present_days)}
              </span>
              <span className="text-[11px] sm:text-xs text-blue-600">
                أيام الحضور
              </span>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <span className="text-xl sm:text-2xl font-bold text-red-700 block">
                {toNumber(stats.absent_days)}
              </span>
              <span className="text-[11px] sm:text-xs text-red-600">
                أيام الغياب
              </span>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <span className="text-xl sm:text-2xl font-bold text-purple-700 block">
                {toNumber(stats.avg_paper_degree)}
              </span>
              <span className="text-[11px] sm:text-xs text-purple-600">
                متوسط الدرجات
              </span>
            </div>
          </div>

          {/* More Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <span className="text-xl sm:text-2xl font-bold text-emerald-700 block">
                {toNumber(stats.total_paid)} ج.م
              </span>
              <span className="text-[11px] sm:text-xs text-emerald-600">
                إجمالي المدفوع
              </span>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <span className="text-xl sm:text-2xl font-bold text-orange-700 block">
                {toNumber(stats.total_required)} ج.م
              </span>
              <span className="text-[11px] sm:text-xs text-orange-600">
                إجمالي المطلوب
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <span className="text-[10px] text-gray-500 block">الهاتف</span>
              <span className="font-bold text-xs sm:text-sm">
                {profile.phone || "-"}
              </span>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <span className="text-[10px] text-gray-500 block">ولي الأمر</span>
              <span className="font-bold text-xs sm:text-sm">
                {profile.parent_phone || "-"}
              </span>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <span className="text-[10px] text-gray-500 block">الصف</span>
              <span className="font-bold text-xs sm:text-sm">
                {profile.grade_name || "-"}
              </span>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <span className="text-[10px] text-gray-500 block">المجموعة</span>
              <span className="font-bold text-xs sm:text-sm">
                {profile.group_name || "-"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === "attendance" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
              سجل الحضور ({attendance.length})
            </h3>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full min-w-100">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">
                    التاريخ
                  </th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">
                    الحالة
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendance.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="text-center py-8 text-gray-400 text-sm"
                    >
                      لا يوجد سجل
                    </td>
                  </tr>
                ) : (
                  attendance.map((att, index) => (
                    <tr key={index}>
                      <td className="py-2.5 px-3 text-xs sm:text-sm">
                        {new Date(att.attendance_date).toLocaleDateString(
                          "ar-EG",
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`flex items-center gap-1 text-xs font-bold ${
                            att.status === "present"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {att.status === "present" ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <XCircle size={12} />
                          )}
                          {att.status === "present" ? "حضور" : "غياب"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Exams Tab */}
      {activeTab === "exams" && (
        <div className="flex flex-col gap-4">
          {/* Paper Exams */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <FileText size={16} className="text-blue-600" />
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                الامتحانات الورقية ({paperExams.length})
              </h3>
            </div>
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full min-w-100">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">
                      الامتحان
                    </th>
                    <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">
                      الدرجة
                    </th>
                    <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">
                      الحالة
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paperExams.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-8 text-gray-400 text-sm"
                      >
                        لا توجد امتحانات
                      </td>
                    </tr>
                  ) : (
                    paperExams.map((exam, index) => (
                      <tr key={index}>
                        <td className="py-2.5 px-3 text-xs sm:text-sm">
                          {exam.exam_title || exam.title || "-"}
                        </td>
                        <td className="py-2.5 px-3 text-xs sm:text-sm font-bold">
                          {exam.student_degree ?? exam.degree ?? "-"} /{" "}
                          {exam.total_degree || "-"}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-xs font-bold ${
                              exam.exam_status === "attended"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {exam.exam_status === "attended" ? "حضر" : "غائب"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Exam Results */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <FileText size={16} className="text-green-600" />
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                نتائج الامتحانات ({examResults.length})
              </h3>
            </div>
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full min-w-100">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">
                      الامتحان
                    </th>
                    <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">
                      الدرجة
                    </th>
                    <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">
                      النسبة
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {examResults.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-8 text-gray-400 text-sm"
                      >
                        لا توجد نتائج
                      </td>
                    </tr>
                  ) : (
                    examResults.map((result, index) => (
                      <tr key={index}>
                        <td className="py-2.5 px-3 text-xs sm:text-sm">
                          {result.exam_title || result.title || "-"}
                        </td>
                        <td className="py-2.5 px-3 text-xs sm:text-sm font-bold">
                          {result.degree ?? "-"} / {result.total_degree || "-"}
                        </td>
                        <td className="py-2.5 px-3 text-xs sm:text-sm font-bold">
                          {toNumber(result.percentage)}%
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Online Exams */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Monitor size={16} className="text-purple-600" />
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                الامتحانات الإلكترونية ({onlineExams.length})
              </h3>
            </div>
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full min-w-100">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">
                      الامتحان
                    </th>
                    <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">
                      الدرجة
                    </th>
                    <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">
                      النسبة
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {onlineExams.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-8 text-gray-400 text-sm"
                      >
                        لا توجد امتحانات
                      </td>
                    </tr>
                  ) : (
                    onlineExams.map((exam, index) => (
                      <tr key={index}>
                        <td className="py-2.5 px-3 text-xs sm:text-sm">
                          {exam.exam_title || exam.title || "-"}
                        </td>
                        <td className="py-2.5 px-3 text-xs sm:text-sm font-bold">
                          {exam.score ?? "-"} / {exam.full_mark || "-"}
                        </td>
                        <td className="py-2.5 px-3 text-xs sm:text-sm font-bold">
                          {toNumber(exam.percentage)}%
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === "payments" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
              المدفوعات ({payments.length})
            </h3>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full min-w-100">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">
                    التاريخ
                  </th>
                  <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">
                    المبلغ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="text-center py-8 text-gray-400 text-sm"
                    >
                      لا توجد مدفوعات
                    </td>
                  </tr>
                ) : (
                  payments.map((payment, index) => (
                    <tr key={index}>
                      <td className="py-2.5 px-3 text-xs sm:text-sm">
                        {new Date(payment.payment_date).toLocaleDateString(
                          "ar-EG",
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-xs sm:text-sm font-bold">
                        {payment.amount} ج.م
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.section>
  );
};

export default StudentDetails;
