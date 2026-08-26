import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";
import {
  Search,
  X,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  UserX,
} from "lucide-react";
import React, { useEffect, useState } from "react";
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
  fetchAttendanceOverview,
  searchStudentByBarcode,
  fetchStudentDetails,
} from "../api/teacher/actions";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [studentAttendance, setStudentAttendance] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const result = await fetchAttendanceOverview();
    if (result.success) {
      setAttendanceData(result.data);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError("ادخل باركود الطالب");
      return;
    }

    const result = await searchStudentByBarcode(searchQuery);
    if (result.success && result.data) {
      setSearchResult(result.data);
      setSearchError(null);

      const details = await fetchStudentDetails(result.data.id);
      if (details.success) {
        setStudentAttendance(details.data);
        setShowStudentModal(true);
      }
    } else {
      setSearchResult(null);
      setSearchError("لا يوجد طالب بهذا الباركود");
    }
  };

  const closeModal = () => {
    setShowStudentModal(false);
    setSearchResult(null);
    setStudentAttendance(null);
  };

  const toNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const overallAttendance = attendanceData?.overall || [];

  const firstMonth = overallAttendance[0] || {};

  const chartData = overallAttendance.map((item) => ({
    month: item.month,
    attendance: toNumber(item.present_count),
    absence: toNumber(item.absent_count),
  }));

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

  const COLORS = pieData.map((item) => item.color);

  const consecutiveAbsences = attendanceData?.consecutiveAbsences || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
    >
      {/* Header */}
      <motion.header
        variants={itemVariants}
        className="w-full flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center"
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900">الحضور والغياب</h1>
          <span className="text-gray-500">متابعة حضور الطلاب</span>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 w-full lg:w-96">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن طالب بالباركود..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="bg-transparent focus:outline-none text-sm w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={handleSearch}
            className="text-blue-600 text-sm font-bold whitespace-nowrap"
          >
            بحث
          </button>
        </div>
      </motion.header>

      {/* Search Error */}
      {searchError && (
        <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm flex items-center gap-2">
          <AlertTriangle size={16} />
          {searchError}
        </div>
      )}

      {/* Quick Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        <div className="bg-white p-5 border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] flex items-center gap-4">
          <div className="bg-blue-50 rounded-xl p-3">
            <CalendarCheck className="text-blue-500" size={24} />
          </div>
          <div>
            <span className="text-2xl font-bold text-gray-900 block">
              {toNumber(firstMonth.total_days)}
            </span>
            <span className="text-sm text-gray-500">إجمالي الأيام</span>
          </div>
        </div>

        <div className="bg-white p-5 border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] flex items-center gap-4">
          <div className="bg-green-50 rounded-xl p-3">
            <UserCheck className="text-green-500" size={24} />
          </div>
          <div>
            <span className="text-2xl font-bold text-gray-900 block">
              {toNumber(firstMonth.present_count)}
            </span>
            <span className="text-sm text-gray-500">عدد الحضور</span>
          </div>
        </div>

        <div className="bg-white p-5 border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] flex items-center gap-4">
          <div className="bg-red-50 rounded-xl p-3">
            <UserX className="text-red-500" size={24} />
          </div>
          <div>
            <span className="text-2xl font-bold text-gray-900 block">
              {toNumber(firstMonth.absent_count)}
            </span>
            <span className="text-sm text-gray-500">عدد الغياب</span>
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            التطور الشهري للحضور
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <YAxis
                  tickMargin={20}
                  width={35}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="attendance"
                  name="حضور"
                  fill="#16a34a"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="absence"
                  name="غياب"
                  fill="#dc2626"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">توزيع الحضور</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 flex-wrap mt-4">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-700">
                      {item.name}:{" "}
                      <span className="font-bold">{item.value}</span>
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

      {/* Consecutive Absences Alerts */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl p-5 border border-gray-200"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              تنبيهات الغياب المتتالي
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              طلاب لديهم 3 أيام غياب متتالية أو أكثر
            </p>
          </div>
          <AlertTriangle size={24} className="text-red-500" />
        </div>

        {consecutiveAbsences.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {consecutiveAbsences.map((item, index) => (
              <div
                key={index}
                className="bg-red-50 border border-red-100 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle size={16} className="text-red-500" />
                  <div>
                    <span className="font-bold text-sm text-gray-900 block">
                      {item.full_name}
                    </span>
                    <span className="text-xs text-red-500">
                      {item.consecutive_absences} أيام غياب متتالية
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">لا توجد تنبيهات غياب</p>
        )}
      </motion.div>

      {/* Student Modal */}
      {showStudentModal && searchResult && (
        <div
          className="fixed inset-0 z-9999 bg-black/60 flex items-center justify-center p-3"
          dir="rtl"
        >
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="shrink-0 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-lg text-gray-900">
                  {searchResult.full_name}
                </h2>
                <span className="text-sm text-gray-500">
                  {searchResult.grade_name} - {searchResult.group_name}
                </span>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {studentAttendance?.stats ? (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <CheckCircle2
                      size={24}
                      className="text-green-500 mx-auto mb-2"
                    />
                    <span className="text-2xl font-bold text-green-700 block">
                      {studentAttendance.stats.present_days || 0}
                    </span>
                    <span className="text-sm text-green-600">أيام الحضور</span>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 text-center">
                    <XCircle size={24} className="text-red-500 mx-auto mb-2" />
                    <span className="text-2xl font-bold text-red-700 block">
                      {studentAttendance.stats.absent_days || 0}
                    </span>
                    <span className="text-sm text-red-600">أيام الغياب</span>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <TrendingUp
                      size={24}
                      className="text-blue-500 mx-auto mb-2"
                    />
                    <span className="text-2xl font-bold text-blue-700 block">
                      {studentAttendance.stats.attendance_percentage || 0}%
                    </span>
                    <span className="text-sm text-blue-600">نسبة الحضور</span>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-400 py-12">
                  لا توجد بيانات حضور
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
};

export default Attendance;
