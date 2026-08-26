import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";
import {
  Users,
  UserCheck,
  Wallet,
  TrendingDown,
  AlertTriangle,
  GraduationCap,
  Search,
  X,
  ChevronRight,
  ChevronLeft,
  Phone,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import {
  fetchDashboardStats,
  fetchAttendanceOverview,
  fetchAllStudents,
  fetchStudentDetails,
} from "../api/teacher/actions";

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [attendanceOverview, setAttendanceOverview] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadStudents();
  }, [page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, attendanceRes] = await Promise.all([
        fetchDashboardStats(),
        fetchAttendanceOverview(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (attendanceRes.success) setAttendanceOverview(attendanceRes.data);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    const result = await fetchAllStudents(
      page,
      searchQuery,
      selectedGrade === "all" ? "" : selectedGrade,
    );
    if (result.success) {
      setStudents(result.data || []);
      setTotalStudents(result.pagination?.total || result.data.length);
      setTotalPages(result.pagination?.totalPages || 1);
    }
  };

  const toNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    setDetailsLoading(true);
    const result = await fetchStudentDetails(student.id);
    if (result.success) {
      setStudentDetails(result.data);
    }
    setDetailsLoading(false);
  };

  const closeDetails = () => {
    setSelectedStudent(null);
    setStudentDetails(null);
  };

  const attendanceStats = stats?.attendance || [];
  const paymentStats = stats?.payments || {};
  const subscriptionStats = stats?.subscriptions || {};
  const gradesStats = stats?.grades || [];
  const consecutiveAbsences = attendanceOverview?.consecutiveAbsences || [];

  const attendanceData = Array.isArray(attendanceStats)
    ? attendanceStats.map((item) => ({
        month: item.month,
        attendance: toNumber(item.present_count),
        absence: toNumber(item.absent_count),
        percentage: toNumber(item.attendance_percentage),
      }))
    : [];

  const firstMonth = attendanceData[0] || {};

  const pieData = [
    { name: "حضور", value: toNumber(firstMonth.attendance), color: "#16a34a" },
    { name: "غياب", value: toNumber(firstMonth.absence), color: "#dc2626" },
  ].filter((item) => item.value > 0);

  const quickStats = [
    {
      label: "إجمالي الطلاب",
      value: toNumber(subscriptionStats.total_students) || totalStudents || 0,
      Icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "نسبة الحضور",
      value: `${toNumber(firstMonth.percentage)}%`,
      Icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "المدفوع",
      value: `${toNumber(paymentStats.total_paid)} ج.م`,
      Icon: Wallet,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "المتبقي",
      value: `${toNumber(paymentStats.total_remaining)} ج.م`,
      Icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  const allGrades = gradesStats.map((g) => g.name);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#009966] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-5 w-full min-h-screen"
      dir="rtl"
    >
      {/* Header */}
      <motion.header
        variants={itemVariants}
        className="w-full flex flex-col gap-3"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          التقارير والإحصائيات
        </h1>
        <span className="text-sm sm:text-base text-gray-500">
          نظرة شاملة على أداء المنصة
        </span>
      </motion.header>

      {/* Quick Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {quickStats.map(({ label, value, Icon, color, bgColor }) => (
          <div
            key={label}
            className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-3 sm:p-4 flex items-center gap-2 sm:gap-3"
          >
            <div className={`${bgColor} rounded-xl p-2 sm:p-3 shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div className="min-w-0">
              <span className="text-base sm:text-xl font-bold text-gray-900 block truncate">
                {value}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500">
                {label}
              </span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 mb-4">الحضور الشهري</h3>
          <div className="w-full h-62.5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={35} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="attendance"
                  name="حضور"
                  fill="#16a34a"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="absence"
                  name="غياب"
                  fill="#dc2626"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 mb-4">توزيع الحضور</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-3 flex-wrap mt-2">
                {pieData.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 text-xs sm:text-sm"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>
                      {item.name}: <b>{item.value}</b>
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-400 py-12">لا توجد بيانات</p>
          )}
        </div>
      </motion.div>

      {/* Payment Summary */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl border border-gray-200 p-4"
      >
        <h3 className="font-bold text-gray-900 mb-3">ملخص المدفوعات</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <div className="bg-emerald-50 rounded-xl p-3 text-center">
            <span className="text-base sm:text-xl font-bold text-emerald-700 block">
              {toNumber(paymentStats.total_paid)} ج.م
            </span>
            <span className="text-[10px] sm:text-xs text-emerald-600">
              المدفوع
            </span>
          </div>
          <div className="bg-red-50 rounded-xl p-3 text-center">
            <span className="text-base sm:text-xl font-bold text-red-700 block">
              {toNumber(paymentStats.total_remaining)} ج.م
            </span>
            <span className="text-[10px] sm:text-xs text-red-600">المتبقي</span>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <span className="text-base sm:text-xl font-bold text-green-700 block">
              {toNumber(paymentStats.fully_paid_students)}
            </span>
            <span className="text-[10px] sm:text-xs text-green-600">
              مدفوع بالكامل
            </span>
          </div>
          <div className="bg-yellow-50 rounded-xl p-3 text-center">
            <span className="text-base sm:text-xl font-bold text-yellow-700 block">
              {toNumber(paymentStats.unpaid_students)}
            </span>
            <span className="text-[10px] sm:text-xs text-yellow-600">
              لم يدفع
            </span>
          </div>
        </div>
      </motion.div>

      {/* Students Table */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
      >
        <div className="p-3 sm:p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center">
          <h3 className="font-bold text-gray-900">الطلاب ({totalStudents})</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
              <Search size={13} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="بحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setPage(1);
                    loadStudents();
                  }
                }}
                className="bg-transparent focus:outline-none text-xs sm:text-sm w-full min-w-0"
              />
            </div>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setPage(1);
              }}
              className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 sm:py-2 text-xs sm:text-sm"
            >
              <option value="all">كل الصفوف</option>
              {allGrades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-125">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right py-2.5 px-2 sm:px-4 text-[11px] sm:text-sm font-semibold text-gray-600">
                  الباركود
                </th>
                <th className="text-right py-2.5 px-2 sm:px-4 text-[11px] sm:text-sm font-semibold text-gray-600">
                  الاسم
                </th>
                <th className="text-right py-2.5 px-2 sm:px-4 text-[11px] sm:text-sm font-semibold text-gray-600 hidden sm:table-cell">
                  الصف
                </th>
                <th className="text-right py-2.5 px-2 sm:px-4 text-[11px] sm:text-sm font-semibold text-gray-600 hidden md:table-cell">
                  المجموعة
                </th>
                <th className="text-right py-2.5 px-2 sm:px-4 text-[11px] sm:text-sm font-semibold text-gray-600 hidden lg:table-cell">
                  الهاتف
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-10 text-gray-400 text-sm"
                  >
                    لا يوجد طلاب
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr
                    key={student.id}
                    onClick={() => handleStudentClick(student)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-2 sm:px-4 text-[11px] sm:text-sm">
                      {student.barcode}
                    </td>
                    <td className="py-2.5 px-2 sm:px-4 font-medium text-[11px] sm:text-sm">
                      {student.full_name}
                    </td>
                    <td className="py-2.5 px-2 sm:px-4 text-[11px] sm:text-sm hidden sm:table-cell">
                      {student.grade_name || "-"}
                    </td>
                    <td className="py-2.5 px-2 sm:px-4 text-[11px] sm:text-sm hidden md:table-cell">
                      {student.group_name || "-"}
                    </td>
                    <td className="py-2.5 px-2 sm:px-4 text-[11px] sm:text-sm hidden lg:table-cell">
                      {student.phone || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-3 sm:px-4 py-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <span className="text-[11px] sm:text-sm text-gray-500">
              صفحة {page} من {totalPages}
            </span>
            <div className="flex gap-1.5 sm:gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1.5 sm:p-2 border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50"
              >
                <ChevronRight size={14} />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-1.5 sm:p-2 border border-gray-200 rounded-lg disabled:opacity-30 hover:bg-gray-50"
              >
                <ChevronLeft size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Consecutive Absences */}
      {consecutiveAbsences.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-red-500" />
            <h3 className="font-bold text-gray-900">
              تنبيهات الغياب ({consecutiveAbsences.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {consecutiveAbsences.map((student, index) => (
              <div
                key={index}
                className="bg-red-50 border border-red-100 rounded-xl p-3"
              >
                <span className="font-bold text-xs sm:text-sm block">
                  {student.full_name}
                </span>
                <span className="text-[10px] sm:text-xs text-red-500">
                  {student.consecutive_absences} أيام غياب
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div
          className="fixed inset-0 z-9999 bg-black/60 flex items-center justify-center p-3"
          dir="rtl"
          onClick={closeDetails}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <GraduationCap size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-sm sm:text-lg text-gray-900">
                    {selectedStudent.full_name}
                  </h2>
                  <span className="text-[10px] sm:text-xs text-gray-500">
                    باركود: {selectedStudent.barcode}
                  </span>
                </div>
              </div>
              <button
                onClick={closeDetails}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {detailsLoading ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  جاري تحميل التفاصيل...
                </div>
              ) : studentDetails ? (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                      <Phone size={16} className="text-blue-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-gray-500 block">
                          الهاتف
                        </span>
                        <span className="font-bold text-xs sm:text-sm truncate">
                          {selectedStudent.phone || "-"}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                      <GraduationCap
                        size={16}
                        className="text-green-500 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] text-gray-500 block">
                          الصف
                        </span>
                        <span className="font-bold text-xs sm:text-sm truncate">
                          {selectedStudent.grade_name || "-"}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                      <Users size={16} className="text-purple-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-gray-500 block">
                          المجموعة
                        </span>
                        <span className="font-bold text-xs sm:text-sm truncate">
                          {selectedStudent.group_name || "-"}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                      <Phone size={16} className="text-orange-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-gray-500 block">
                          ولي الأمر
                        </span>
                        <span className="font-bold text-xs sm:text-sm truncate">
                          {selectedStudent.parent_phone || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                    <div className="bg-green-50 rounded-xl p-3 text-center">
                      <span className="text-base sm:text-xl font-bold text-green-700 block">
                        {toNumber(studentDetails.stats?.attendance_percentage)}%
                      </span>
                      <span className="text-[10px] sm:text-xs text-green-600">
                        نسبة الحضور
                      </span>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                      <span className="text-base sm:text-xl font-bold text-blue-700 block">
                        {toNumber(studentDetails.stats?.present_days)}
                      </span>
                      <span className="text-[10px] sm:text-xs text-blue-600">
                        أيام الحضور
                      </span>
                    </div>
                    <div className="bg-red-50 rounded-xl p-3 text-center">
                      <span className="text-base sm:text-xl font-bold text-red-700 block">
                        {toNumber(studentDetails.stats?.absent_days)}
                      </span>
                      <span className="text-[10px] sm:text-xs text-red-600">
                        أيام الغياب
                      </span>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3 text-center">
                      <span className="text-base sm:text-xl font-bold text-purple-700 block">
                        {toNumber(studentDetails.stats?.avg_paper_degree)}
                      </span>
                      <span className="text-[10px] sm:text-xs text-purple-600">
                        متوسط الدرجات
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="bg-emerald-50 rounded-xl p-3 text-center">
                      <span className="text-base sm:text-xl font-bold text-emerald-700 block">
                        {toNumber(studentDetails.stats?.total_paid)} ج.م
                      </span>
                      <span className="text-[10px] sm:text-xs text-emerald-600">
                        إجمالي المدفوع
                      </span>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-3 text-center">
                      <span className="text-base sm:text-xl font-bold text-orange-700 block">
                        {toNumber(studentDetails.stats?.total_required)} ج.م
                      </span>
                      <span className="text-[10px] sm:text-xs text-orange-600">
                        إجمالي المطلوب
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 text-sm">
                  لا توجد بيانات
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
};

export default Reports;
