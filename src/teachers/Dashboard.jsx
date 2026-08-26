import React, { useEffect, useState } from "react";
import Accent from "../assets/Accent.svg";
import {
  Users,
  UserCheck,
  GraduationCap,
  Wallet,
  Search,
  X,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  CalendarCheck2,
  AlertTriangle,
  FileCheck2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  fetchDashboardStats,
  fetchAllStudents,
  fetchAttendanceOverview,
  fetchStudentDetails,
} from "../api/teacher/actions";
import getUser from "../utils/getUser";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceOverview, setAttendanceOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentStats, setStudentStats] = useState(null);
  const [studentLoading, setStudentLoading] = useState(false);

  const user = getUser();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadStudents();
  }, [page, limit]);

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
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    const result = await fetchAllStudents(page, "");
    if (result.success) {
      setStudents(result.data || []);
      setTotalStudents(result.pagination?.total || result.data.length);
      setTotalPages(result.pagination?.totalPages || 1);
    }
  };

  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    setStudentLoading(true);
    const result = await fetchStudentDetails(student.id);
    if (result.success) {
      setStudentStats(result.data.stats);
    }
    setStudentLoading(false);
  };

  const toNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const attendanceStats = stats?.attendance || {};
  const firstMonth = Array.isArray(attendanceStats)
    ? attendanceStats[0] || {}
    : attendanceStats;
  const paymentStats = stats?.payments || {};
  const gradesStats = stats?.grades || [];
  const consecutiveAbsences = attendanceOverview?.consecutiveAbsences || [];

  const attendanceData = Array.isArray(attendanceStats)
    ? attendanceStats.map((item) => ({
        month: item.month,
        attendance: toNumber(item.present_count),
        absence: toNumber(item.absent_count),
      }))
    : [];

  const pieData = [
    {
      name: "حضور",
      value: toNumber(firstMonth.present_count),
      color: "#16a34a",
    },
    {
      name: "غياب",
      value: toNumber(firstMonth.absent_count),
      color: "#dc2626",
    },
  ].filter((item) => item.value > 0);

  const filteredStudents = students.filter(
    (student) =>
      searchQuery.trim() === "" ||
      student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.barcode?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
      className="flex flex-col gap-3 sm:gap-4 w-full min-h-screen"
      dir="rtl"
    >
      {/* Hero Banner */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden text-white rounded-xl sm:rounded-2xl bg-linear-to-l from-[#003322] to-[#009966] p-3 sm:p-5 md:p-6"
      >
        <img
          className="absolute left-0 top-0 h-full w-24 sm:w-40 opacity-15"
          src={Accent}
          alt=""
        />
        <div className="relative z-10 flex flex-col gap-1.5">
          <span className="text-[10px] sm:text-sm opacity-80">
            {new Date().toLocaleDateString("ar-EG", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span className="text-lg sm:text-2xl md:text-3xl font-bold truncate">
            مرحبا {user?.full_name || "أستاذ"}
          </span>
          <span className="text-[10px] sm:text-xs opacity-80">
            نظرة شاملة على المنصة
          </span>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 gap-2 sm:gap-3"
      >
        {[
          {
            label: "عدد الصفوف",
            value: gradesStats.length || 0,
            Icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "نسبة الحضور",
            value: `${toNumber(firstMonth.attendance_percentage)}%`,
            Icon: UserCheck,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "الطلاب",
            value: totalStudents || 0,
            Icon: GraduationCap,
            color: "text-orange-600",
            bg: "bg-orange-50",
          },
          {
            label: "المدفوع",
            value: `${toNumber(paymentStats.total_paid)} ج.م`,
            Icon: Wallet,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
        ].map(({ label, value, Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3"
          >
            <div
              className={`${bg} rounded-md sm:rounded-lg p-1.5 sm:p-2.5 shrink-0`}
            >
              <Icon size={16} className={color} />
            </div>
            <div className="min-w-0">
              <span className="text-sm sm:text-lg md:text-xl font-bold text-gray-900 block truncate">
                {value}
              </span>
              <span className="text-[9px] sm:text-xs text-gray-500">
                {label}
              </span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3 sm:gap-4"
      >
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4">
          <h3 className="font-bold text-gray-900 text-xs sm:text-base mb-2 sm:mb-3">
            نسبة الحضور الشهرية
          </h3>
          <div className="w-full h-45 sm:h-62.5 md:h-70">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 8 }} />
                <YAxis tick={{ fontSize: 8 }} width={30} />
                <Tooltip
                  contentStyle={{ fontSize: "11px", borderRadius: "8px" }}
                />
                <Legend wrapperStyle={{ fontSize: "9px" }} />
                <Bar
                  dataKey="attendance"
                  name="حضور"
                  fill="#009966"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="absence"
                  name="غياب"
                  fill="#dc2626"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4">
          <h3 className="font-bold text-gray-900 text-xs sm:text-base mb-2 text-center">
            توزيع الحضور
          </h3>
          {pieData.length > 0 ? (
            <>
              <div className="w-full h-37.5 sm:h-50">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ fontSize: "11px", borderRadius: "8px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-2 flex-wrap mt-1.5">
                {pieData.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 text-[9px] sm:text-xs"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
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
            <p className="text-center text-gray-400 text-xs py-8">
              لا توجد بيانات
            </p>
          )}
        </div>
      </motion.div>

      {/* Payment Summary */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4"
      >
        <h3 className="font-bold text-gray-900 text-xs sm:text-base mb-2 sm:mb-3">
          ملخص المدفوعات
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="bg-emerald-50 rounded-lg p-2.5 sm:p-3 text-center">
            <span className="text-sm sm:text-lg font-bold text-emerald-700 block truncate">
              {toNumber(paymentStats.total_paid)} ج.م
            </span>
            <span className="text-[9px] sm:text-xs text-emerald-600">
              المدفوع
            </span>
          </div>
          <div className="bg-red-50 rounded-lg p-2.5 sm:p-3 text-center">
            <span className="text-sm sm:text-lg font-bold text-red-700 block truncate">
              {toNumber(paymentStats.total_remaining)} ج.م
            </span>
            <span className="text-[9px] sm:text-xs text-red-600">المتبقي</span>
          </div>
          <div className="bg-green-50 rounded-lg p-2.5 sm:p-3 text-center">
            <span className="text-sm sm:text-lg font-bold text-green-700 block">
              {toNumber(paymentStats.fully_paid_students)}
            </span>
            <span className="text-[9px] sm:text-xs text-green-600">
              مدفوع بالكامل
            </span>
          </div>
          <div className="bg-yellow-50 rounded-lg p-2.5 sm:p-3 text-center">
            <span className="text-sm sm:text-lg font-bold text-yellow-700 block">
              {toNumber(paymentStats.unpaid_students)}
            </span>
            <span className="text-[9px] sm:text-xs text-yellow-600">
              لم يدفع
            </span>
          </div>
        </div>
      </motion.div>

      {/* Students List */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden"
      >
        <div className="p-2.5 sm:p-4 border-b border-gray-100 flex flex-col gap-2">
          <h3 className="font-bold text-gray-900 text-xs sm:text-base">
            الطلاب ({totalStudents})
          </h3>
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
            <Search size={13} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent focus:outline-none text-xs w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-gray-400"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden">
          {filteredStudents.length === 0 ? (
            <p className="text-center text-gray-400 text-xs py-6">
              لا يوجد طلاب
            </p>
          ) : (
            <div className="flex flex-col gap-1.5 p-2">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  onClick={() => handleStudentClick(student)}
                  className="bg-gray-50 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-green-50/50 transition"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-gray-900 block truncate">
                      {student.full_name}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      باركود: {student.barcode}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {student.grade_name || "-"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full min-w-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">
                  الباركود
                </th>
                <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">
                  الاسم
                </th>
                <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">
                  الصف
                </th>
                <th className="text-right py-2.5 px-3 text-xs font-semibold text-gray-600">
                  الهاتف
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  onClick={() => handleStudentClick(student)}
                  className="cursor-pointer hover:bg-green-50/50 transition"
                >
                  <td className="py-2.5 px-3 text-xs">{student.barcode}</td>
                  <td className="py-2.5 px-3 font-medium text-xs">
                    {student.full_name}
                  </td>
                  <td className="py-2.5 px-3 text-xs">
                    {student.grade_name || "-"}
                  </td>
                  <td className="py-2.5 px-3 text-xs" dir="ltr">
                    {student.phone || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-2.5 sm:px-4 py-2.5 sm:py-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-xs text-gray-500">
                صفحة {page} من {totalPages}
              </span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(parseInt(e.target.value));
                  setPage(1);
                }}
                className="border border-gray-200 rounded-md px-1.5 py-0.5 text-[10px] sm:text-xs"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1.5 sm:p-2 border border-gray-200 rounded-md disabled:opacity-30"
              >
                <ChevronRight size={12} />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-1.5 sm:p-2 border border-gray-200 rounded-md disabled:opacity-30"
              >
                <ChevronLeft size={12} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Alerts */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={16} className="text-red-500 shrink-0" />
          <h3 className="font-bold text-gray-900 text-xs sm:text-base">
            تنبيهات الغياب ({consecutiveAbsences.length})
          </h3>
        </div>
        {consecutiveAbsences.length === 0 ? (
          <p className="text-gray-400 text-xs text-center py-4">
            لا توجد تنبيهات
          </p>
        ) : (
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
            {consecutiveAbsences.map((student, index) => (
              <div
                key={index}
                className="bg-red-50 rounded-lg p-2.5 flex items-center gap-2"
              >
                <AlertTriangle size={13} className="text-red-500 shrink-0" />
                <div className="min-w-0">
                  <span className="font-bold text-[11px] text-gray-900 block truncate">
                    {student.full_name}
                  </span>
                  <span className="text-[10px] text-red-500">
                    {student.consecutive_absences} أيام غياب
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Student Modal */}
      {selectedStudent && (
        <div
          className="fixed inset-0 z-9999 bg-black/50 flex items-center justify-center p-3"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-xs sm:max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  {selectedStudent.full_name}
                </h3>
                <span className="text-[11px] text-gray-500">
                  باركود: {selectedStudent.barcode}
                </span>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-3 sm:p-4">
              {studentLoading ? (
                <p className="text-center text-gray-400 text-xs py-5">
                  جاري التحميل...
                </p>
              ) : studentStats ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-green-50 rounded-lg p-2.5 text-center">
                    <CalendarCheck2
                      size={14}
                      className="text-green-600 mx-auto mb-1"
                    />
                    <span className="font-bold text-base text-green-700 block">
                      {toNumber(studentStats.attendance_percentage)}%
                    </span>
                    <span className="text-[9px] text-gray-500">
                      نسبة الحضور
                    </span>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                    <BarChart3
                      size={14}
                      className="text-blue-600 mx-auto mb-1"
                    />
                    <span className="font-bold text-base text-blue-700 block">
                      {toNumber(studentStats.avg_paper_degree)}
                    </span>
                    <span className="text-[9px] text-gray-500">
                      متوسط الدرجات
                    </span>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-2.5 text-center">
                    <Wallet
                      size={14}
                      className="text-orange-600 mx-auto mb-1"
                    />
                    <span className="font-bold text-base text-orange-700 block">
                      {toNumber(studentStats.total_paid)}
                    </span>
                    <span className="text-[9px] text-gray-500">المدفوع</span>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2.5 text-center">
                    <FileCheck2
                      size={14}
                      className="text-purple-600 mx-auto mb-1"
                    />
                    <span className="font-bold text-base text-purple-700 block">
                      {toNumber(studentStats.total_online_exams)}
                    </span>
                    <span className="text-[9px] text-gray-500">امتحانات</span>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-400 text-xs py-5">
                  لا توجد بيانات
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
};

export default Dashboard;
