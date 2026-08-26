import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";
import {
  Check,
  CircleCheck,
  CircleX,
  CirclePercent,
  CalendarDays,
  Clock,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  fetchStudentStats,
  fetchAttendanceHistory,
  fetchMonthlyAttendance,
} from "../api/student/actions";

const Attendance = () => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [statsRes, historyRes, monthlyRes] = await Promise.all([
      fetchStudentStats(),
      fetchAttendanceHistory(1, 100),
      fetchMonthlyAttendance(),
    ]);
    if (statsRes.success) setStats(statsRes.data);
    if (historyRes.success) setHistory(historyRes.data);
    if (monthlyRes.success) setMonthlyStats(monthlyRes.data);
    setLoading(false);
  };

  const pieData = [
    { name: "حضور", value: Number(stats?.present_days || 0) },
    { name: "غياب", value: Number(stats?.absent_days || 0) },
  ];

  const COLORS = ["#16a34a", "#dc2626"];

  const filteredHistory = history.filter((record) => {
    if (filter === "present") return record.status === "present";
    if (filter === "absent") return record.status === "absent";
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 w-full min-h-screen"
      dir="rtl"
    >
      <motion.header variants={itemVariants}>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          الحضور والغياب
        </h1>
        <span className="text-gray-500 text-sm">سجل حضوري الكامل</span>
      </motion.header>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
        <div className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2">
            <CircleCheck className="text-green-600" size={18} />
          </div>
          <span className="font-bold text-2xl block">
            {stats?.present_days || 0}
          </span>
          <span className="text-sm text-gray-500">حضور</span>
        </div>
        <div className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-2">
            <CircleX className="text-red-600" size={18} />
          </div>
          <span className="font-bold text-2xl block">
            {stats?.absent_days || 0}
          </span>
          <span className="text-sm text-gray-500">غياب</span>
        </div>
        <div className="bg-white border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl shadow-[5px_2px_0_#009966] p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-2">
            <CirclePercent className="text-purple-600" size={18} />
          </div>
          <span className="font-bold text-2xl block">
            {stats?.attendance_percentage || 0}%
          </span>
          <span className="text-sm text-gray-500">النسبة</span>
        </div>
      </motion.div>

      {/* Pie Chart */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl border border-gray-200 p-4"
      >
        <h2 className="font-bold text-base mb-2 text-center">توزيع الحضور</h2>
        <div className="h-55">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 flex-wrap text-sm">
          {pieData.map((item, idx) => (
            <span key={idx} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: COLORS[idx] }}
              />
              {item.name}: {item.value}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Monthly Stats */}
      {monthlyStats.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-bold text-base mb-3">الشهري</h2>
          <div className="flex flex-col gap-2.5">
            {monthlyStats.slice(0, 6).map((month, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-20 shrink-0">
                  {month.month}
                </span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${month.attendance_percentage}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-green-600 w-12 text-left">
                  {month.attendance_percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <motion.div
        variants={itemVariants}
        className="flex gap-2 border-b border-gray-200 pb-2 flex-wrap"
      >
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-bold transition ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-500 border border-gray-200"
          }`}
        >
          الكل ({history.length})
        </button>
        <button
          onClick={() => setFilter("present")}
          className={`px-4 py-2 rounded-full text-sm font-bold transition ${
            filter === "present"
              ? "bg-green-600 text-white"
              : "bg-white text-gray-500 border border-gray-200"
          }`}
        >
          حضور ({history.filter((h) => h.status === "present").length})
        </button>
        <button
          onClick={() => setFilter("absent")}
          className={`px-4 py-2 rounded-full text-sm font-bold transition ${
            filter === "absent"
              ? "bg-red-600 text-white"
              : "bg-white text-gray-500 border border-gray-200"
          }`}
        >
          غياب ({history.filter((h) => h.status === "absent").length})
        </button>
      </motion.div>

      {/* History List */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl border border-gray-200 p-4"
      >
        <div className="flex flex-col gap-2 max-h-100 overflow-y-auto">
          {filteredHistory.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              لا يوجد سجل
            </p>
          ) : (
            filteredHistory.map((record, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border border-gray-100 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      record.status === "present" ? "bg-green-50" : "bg-red-50"
                    }`}
                  >
                    <Check
                      size={16}
                      className={
                        record.status === "present"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    />
                  </div>
                  <div>
                    <span className="text-sm font-bold block items-center gap-1.5">
                      <CalendarDays size={14} className="text-gray-400" />
                      {new Date(record.attendance_date).toLocaleDateString(
                        "ar-EG",
                        { day: "numeric", month: "long", year: "numeric" },
                      )}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Clock size={12} className="text-gray-400" />
                      {record.attendance_time || ""} {record.method || ""}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-full ${
                    record.status === "present"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {record.status === "present" ? "حاضر" : "غائب"}
                </span>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.section>
  );
};

export default Attendance;
