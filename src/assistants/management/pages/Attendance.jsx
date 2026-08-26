import {
  CalendarCheck,
  Search,
  ScanLine,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  UserX,
  BarChart3,
  Play,
  Square,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
} from "lucide-react";
import { memo, useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchAllGroups,
  fetchAllGrades,
  fetchActiveSession,
  startAttendanceSession,
  scanStudentBarcode,
  lockAttendanceSession,
  toggleMakeupMode,
  fetchGroupAttendanceByDate,
  fetchAttendanceSummary,
} from "../../../api/assistant/actions";

const PAGE_SIZE = 50;

const AttendanceRow = memo(function AttendanceRow({
  student,
  index,
  record,
  sessionActive,
  onMarkPresent,
  isLoading,
}) {
  const statusLabel = record
    ? record.status === "present"
      ? "حاضر"
      : "غائب"
    : "غير مسجل";

  const isPresent = record?.status === "present";
  const isAbsent = record?.status === "absent";

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3) }}
      className="hover:bg-blue-50/40 transition-all duration-200 group"
    >
      <td className="px-5 py-3 font-medium text-gray-800">
        {student.full_name}
      </td>
      <td className="px-5 py-3 text-sm font-mono text-gray-500">
        {student.barcode}
      </td>
      <td className="px-5 py-3">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            isPresent
              ? "bg-green-100 text-green-700"
              : isAbsent
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-500"
          }`}
        >
          {isPresent && <CheckCircle size={12} />}
          {isAbsent && <XCircle size={12} />}
          {!record && <AlertCircle size={12} />}
          {statusLabel}
        </span>
      </td>
      <td className="px-5 py-3 text-sm text-gray-500">
        {record?.attendance_time
          ? new Date(
              `1970-01-01T${String(record.attendance_time).slice(0, 5)}:00`,
            ).toLocaleTimeString("ar-EG", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-"}
      </td>
      <td className="px-5 py-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => onMarkPresent(student)}
          disabled={!sessionActive || isPresent || isLoading}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm text-white font-medium hover:shadow-lg hover:shadow-primary/30 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none transition-all"
        >
          <UserCheck size={14} />
          تسجيل حضور
        </motion.button>
      </td>
    </motion.tr>
  );
});

const Attendance = () => {
  const [grades, setGrades] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessionLocked, setSessionLocked] = useState(false);
  const [isMakeupEnabled, setIsMakeupEnabled] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [summary, setSummary] = useState({
    total: 0,
    present: 0,
    absent: 0,
    notMarked: 0,
  });

  const barcodeInputRef = useRef(null);

  async function loadData() {
    setLoading(true);
    try {
      const [gradesResult, groupsResult] = await Promise.all([
        fetchAllGrades(),
        fetchAllGroups(),
      ]);

      if (gradesResult.success) {
        const data = Array.isArray(gradesResult.data) ? gradesResult.data : [];
        setGrades(data.filter((g) => g.name && g.name.trim() !== ""));
      }

      if (groupsResult.success) {
        const data = Array.isArray(groupsResult.data) ? groupsResult.data : [];
        setGroups(
          data.filter((g) => g.deleted === 0 || g.deleted === undefined),
        );
      }
    } catch (error) {
      console.error("Error loading data:", error);
      showMessage("حدث خطأ في تحميل البيانات", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedGroup) {
      checkActiveSession();
    }
  }, [selectedGroup]);

  useEffect(() => {
    loadData();
  }, []);

  function showMessage(text, type = "info") {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(""), 5000);
  }

  async function checkActiveSession() {
    if (!selectedGroup) return;
    try {
      const result = await fetchActiveSession(selectedGroup);
      if (result.success && result.data) {
        setSessionActive(true);
        setSessionId(result.data.id);
        setIsMakeupEnabled(result.data.is_makeup_enabled === 1);
        setSessionLocked(result.data.status === "locked");
        showMessage("توجد جلسة نشطة لهذه المجموعة", "info");
        await loadAttendanceRecords();
      } else {
        setSessionActive(false);
        setSessionId(null);
        setAttendanceRecords({});
      }
    } catch (error) {
      console.error("Error checking session:", error);
      setSessionActive(false);
    }
  }

  async function loadAttendanceRecords() {
    if (!selectedGroup) return;
    try {
      const today = new Date().toISOString().split("T")[0];
      const result = await fetchGroupAttendanceByDate(selectedGroup, today);
      if (result.success && Array.isArray(result.data)) {
        const records = {};
        result.data.forEach((record) => {
          records[record.student_id] = record;
        });
        setAttendanceRecords(records);
        updateSummary(records);
      }
    } catch (error) {
      console.error("Error loading attendance:", error);
    }
  }

  function updateSummary(records) {
    const total = students.length;
    const present = Object.values(records).filter(
      (r) => r.status === "present",
    ).length;
    const absent = Object.values(records).filter(
      (r) => r.status === "absent",
    ).length;
    const notMarked = total - Object.keys(records).length;
    setSummary({ total, present, absent, notMarked });
  }

  async function startSession() {
    if (!selectedGroup || !selectedGrade) {
      showMessage("يرجى اختيار المرحلة والمجموعة أولاً", "error");
      return;
    }

    setSubmitting(true);
    try {
      const sessionData = {
        group_id: Number(selectedGroup),
        grade_id: Number(selectedGrade),
        lock_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      };

      const result = await startAttendanceSession(sessionData);
      if (result.success) {
        setSessionActive(true);
        setSessionId(result.data.id);
        setIsMakeupEnabled(result.data.is_makeup_enabled === 1);
        showMessage("تم بدء الجلسة بنجاح!", "success");
        barcodeInputRef.current?.focus();
      } else {
        showMessage(result.error || "حدث خطأ في بدء الجلسة", "error");
      }
    } catch (error) {
      console.error("Error starting session:", error);
      showMessage("حدث خطأ في بدء الجلسة", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function endSession() {
    if (!sessionId || !selectedGroup) {
      showMessage("لا توجد جلسة نشطة", "error");
      return;
    }

    if (
      !confirm(
        "هل أنت متأكد من إنهاء الجلسة؟ سيتم تسجيل الطلاب غير المسجلين كغائبين",
      )
    ) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await lockAttendanceSession(
        sessionId,
        Number(selectedGroup),
      );
      if (result.success) {
        setSessionActive(false);
        setSessionLocked(true);
        showMessage("تم إنهاء الجلسة وتسجيل الغائبين", "success");
        await loadAttendanceRecords();
      } else {
        showMessage(result.error || "حدث خطأ في إنهاء الجلسة", "error");
      }
    } catch (error) {
      console.error("Error ending session:", error);
      showMessage("حدث خطأ في إنهاء الجلسة", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleMakeup() {
    if (!sessionId) return;
    try {
      const result = await toggleMakeupMode(sessionId);
      if (result.success) {
        setIsMakeupEnabled(!isMakeupEnabled);
        showMessage(
          `تم ${isMakeupEnabled ? "إلغاء" : "تفعيل"} الحضور التعويضي`,
          "success",
        );
      }
    } catch (error) {
      console.error("Error toggling makeup:", error);
      showMessage("حدث خطأ في تبديل وضع الحضور التعويضي", "error");
    }
  }

  async function handleBarcodeSubmit(e) {
    e.preventDefault();
    const code = barcode.trim();
    if (!code) return;
    if (!sessionActive) {
      showMessage("الجلسة غير نشطة، يرجى بدء جلسة أولاً", "error");
      return;
    }

    setSubmitting(true);
    try {
      const scanData = {
        barcode: code,
        group_id: Number(selectedGroup),
        grade_id: Number(selectedGrade),
        session_id: sessionId,
      };

      const result = await scanStudentBarcode(scanData);
      if (result.success) {
        const student = result.data.student;
        const attendance = result.data.attendance;

        setAttendanceRecords((prev) => ({
          ...prev,
          [student.id]: attendance,
        }));

        setStudents((prev) => {
          if (!prev.find((s) => s.id === student.id)) {
            return [...prev, student];
          }
          return prev;
        });

        updateSummary({
          ...attendanceRecords,
          [student.id]: attendance,
        });

        showMessage(`تم تسجيل حضور ${student.full_name} بنجاح!`, "success");
        setBarcode("");
        barcodeInputRef.current?.focus();
      } else {
        showMessage(result.error || "لم يتم العثور على الطالب", "error");
      }
    } catch (error) {
      console.error("Error scanning barcode:", error);
      showMessage("حدث خطأ في مسح الباركود", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function markPresent(student) {
    if (!sessionActive) {
      showMessage("الجلسة غير نشطة، يرجى بدء جلسة أولاً", "error");
      return;
    }

    setSubmitting(true);
    try {
      const attendanceData = {
        student_id: student.id,
        group_id: Number(selectedGroup),
        grade_id: Number(selectedGrade),
        attendance_date: new Date().toISOString().split("T")[0],
        status: "present",
      };

      const result = await scanStudentBarcode({
        barcode: student.barcode,
        group_id: Number(selectedGroup),
        grade_id: Number(selectedGrade),
        session_id: sessionId,
      });

      if (result.success) {
        const attendance = result.data.attendance;
        setAttendanceRecords((prev) => ({
          ...prev,
          [student.id]: attendance,
        }));
        updateSummary({
          ...attendanceRecords,
          [student.id]: attendance,
        });
        showMessage(`تم تسجيل حضور ${student.full_name}`, "success");
      } else {
        showMessage(result.error || "حدث خطأ في تسجيل الحضور", "error");
      }
    } catch (error) {
      console.error("Error marking present:", error);
      showMessage("حدث خطأ في تسجيل الحضور", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function loadGroupStudents() {
    if (!selectedGroup) return;
    setLoading(true);
    try {
      const { fetchStudentsByGroup } =
        await import("../../../api/assistant/actions");
      const result = await fetchStudentsByGroup(selectedGroup);
      if (result.success) {
        const data = Array.isArray(result.data) ? result.data : [];
        setStudents(data);
        await loadAttendanceRecords();
      }
    } catch (error) {
      console.error("Error loading students:", error);
      showMessage("حدث خطأ في تحميل الطلاب", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedGroup) {
      loadGroupStudents();
    } else {
      setStudents([]);
      setAttendanceRecords({});
    }
  }, [selectedGroup]);

  const filteredStudents = students.filter((s) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      s.full_name?.toLowerCase().includes(query) ||
      s.barcode?.toLowerCase().includes(query)
    );
  });

  const groupsForSelectedGrade = selectedGrade
    ? groups.filter((g) => String(g.grade_id) === String(selectedGrade))
    : groups;

  const attendanceRate =
    summary.total > 0 ? Math.round((summary.present / summary.total) * 100) : 0;

  const todayLabel = new Date().toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
  };

  if (loading && !students.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-primary rounded-2xl shadow-lg shadow-primary/30">
                <CalendarCheck size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  تسجيل الحضور والغياب
                </h1>
                <p className="text-sm text-gray-500 flex flex-wrap items-center gap-2">
                  <span>{todayLabel}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span
                    className={`inline-flex items-center gap-1 ${sessionActive ? "text-green-600" : "text-gray-400"}`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${sessionActive ? "bg-green-500 animate-pulse" : "bg-gray-300"}`}
                    ></span>
                    {sessionActive
                      ? "جلسة نشطة"
                      : sessionLocked
                        ? "جلسة مغلقة"
                        : "جلسة غير نشطة"}
                  </span>
                  {isMakeupEnabled && sessionActive && (
                    <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-xs">
                      <RefreshCw size={12} />
                      تعويضي
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {selectedGroup && students.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl shadow-lg border border-gray-100"
            >
              <Users size={18} className="text-blue-500" />
              <span className="text-sm font-medium text-gray-700">
                {groups.find((g) => String(g.id) === String(selectedGroup))
                  ?.name || "-"}
              </span>
              <div className="w-px h-6 bg-gray-200"></div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">الحضور</span>
                <span className="text-sm font-bold text-green-600">
                  {summary.present}
                </span>
                <span className="text-xs text-gray-400">/</span>
                <span className="text-xs text-gray-500">{summary.total}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Stats */}
        {selectedGroup && students.length > 0 && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            {[
              {
                label: "إجمالي الطلاب",
                value: summary.total,
                icon: Users,
                color: "green",
              },
              {
                label: "حاضر",
                value: summary.present,
                icon: UserCheck,
                color: "green",
              },
              {
                label: "غائب",
                value: summary.absent,
                icon: UserX,
                color: "red",
              },
              {
                label: "نسبة الحضور",
                value: `${attendanceRate}%`,
                icon: BarChart3,
                color: "amber",
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                  <stat.icon size={16} className={`text-${stat.color}-600`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-800">
                    {stat.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Panel - Session Controls */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-1"
        >
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-100 shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary rounded-xl">
                <Play size={18} className="text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">إعداد الجلسة</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  المرحلة الدراسية
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => {
                    setSelectedGrade(e.target.value);
                    setSelectedGroup("");
                  }}
                  disabled={sessionActive}
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 transition-all"
                >
                  <option value="">اختر المرحلة</option>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  المجموعة
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  disabled={sessionActive}
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 transition-all"
                >
                  <option value="">اختر المجموعة</option>
                  {groupsForSelectedGrade.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={startSession}
                  disabled={!selectedGroup || sessionActive || submitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 shadow-lg disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                >
                  <Play size={18} />
                  بدء الجلسة
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={endSession}
                  disabled={!sessionActive || submitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 text-white font-medium hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-500/30 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none transition-all"
                >
                  <Square size={18} />
                  إنهاء الجلسة
                </motion.button>
              </div>

              {sessionActive && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={toggleMakeup}
                  disabled={submitting}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-white font-medium transition-all duration-300 ${
                    isMakeupEnabled
                      ? "bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-500/30"
                      : "bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-400/30"
                  } disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none`}
                >
                  <RefreshCw size={18} />
                  {isMakeupEnabled
                    ? "إلغاء الحضور التعويضي"
                    : "تفعيل الحضور التعويضي"}
                </motion.button>
              )}

              <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
                <div className="flex items-start gap-2">
                  <AlertCircle
                    size={18}
                    className="text-primary mt-0.5 flex-shrink-0"
                  />
                  <div className="text-sm text-gray-700 space-y-1">
                    <p className="font-semibold text-primary">تنبيهات الجلسة</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• ابدأ الجلسة لتسجيل الحضور</li>
                      <li>• استخدم الباركود أو الزر لتسجيل الحضور</li>
                      <li>• عند إنهاء الجلسة، يُسجل الباقي كغائبين</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Panel - Attendance Management */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 space-y-4"
        >
          {/* Barcode Scanner */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-100 shadow-lg p-4 sm:p-5 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-xl">
                  <ScanLine size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">
                    تسجيل سريع بالباركود
                  </h3>
                  <p className="text-xs text-gray-400">
                    امسح باركود الطالب لتسجيل الحضور
                  </p>
                </div>
              </div>
              <div
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  sessionActive
                    ? "bg-green-100 text-green-700"
                    : sessionLocked
                      ? "bg-gray-100 text-gray-500"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {sessionActive
                  ? "جلسة مفتوحة"
                  : sessionLocked
                    ? "تم الإغلاق"
                    : "غير نشطة"}
              </div>
            </div>

            <form
              onSubmit={handleBarcodeSubmit}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1 relative">
                <ScanLine
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  ref={barcodeInputRef}
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  disabled={!sessionActive || submitting}
                  placeholder="امسح الباركود أو اكتبه يدوياً"
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 pr-12 pl-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 transition-all"
                  dir="ltr"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!sessionActive || submitting}
                className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 shadow-lg disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
              >
                {submitting ? "جاري..." : "تسجيل"}
              </motion.button>
            </form>
          </motion.div>

          {/* Search */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-100 shadow-lg p-4 sm:p-5 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <Search size={18} className="text-primary" />
              <div>
                <span className="font-bold text-gray-800">
                  بحث بين طلاب المجموعة
                </span>
                <p className="text-xs text-gray-400">ابحث بالاسم أو الباركود</p>
              </div>
            </div>
            <div className="relative">
              <Search
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={!selectedGroup}
                placeholder="ابحث بالاسم أو الباركود..."
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 pr-12 pl-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 transition-all"
              />
            </div>
          </motion.div>

          {/* Students Table */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            <div className="p-4 sm:p-5 border-b border-gray-100">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Users size={18} className="text-primary" />
                    قائمة الطلاب
                    {selectedGroup && (
                      <span className="text-sm font-normal text-gray-500">
                        -{" "}
                        {
                          groups.find(
                            (g) => String(g.id) === String(selectedGroup),
                          )?.name
                        }
                      </span>
                    )}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    الكل: {summary.total}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    حاضر: {summary.present}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    غائب: {summary.absent}
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
              {!selectedGroup ? (
                <div className="text-center py-12 text-gray-400">
                  <Users size={32} className="mx-auto text-gray-300 mb-2" />
                  <p>اختر المجموعة أولاً لعرض الطلاب</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Users size={32} className="mx-auto text-gray-300 mb-2" />
                  <p>
                    {search
                      ? "لا يوجد طلاب مطابقين للبحث"
                      : "لا يوجد طلاب في هذه المجموعة"}
                  </p>
                </div>
              ) : (
                <table className="w-full text-right min-w-[600px]">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 sticky top-0 z-10">
                    <tr>
                      <th className="px-5 py-3 text-sm font-semibold text-gray-600">
                        الاسم
                      </th>
                      <th className="px-5 py-3 text-sm font-semibold text-gray-600">
                        الباركود
                      </th>
                      <th className="px-5 py-3 text-sm font-semibold text-gray-600">
                        الحالة
                      </th>
                      <th className="px-5 py-3 text-sm font-semibold text-gray-600">
                        الوقت
                      </th>
                      <th className="px-5 py-3 text-sm font-semibold text-gray-600">
                        إجراء
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <AnimatePresence>
                      {filteredStudents.map((student, index) => (
                        <AttendanceRow
                          key={student.id || index}
                          student={student}
                          index={index}
                          record={attendanceRecords[student.id]}
                          sessionActive={sessionActive}
                          onMarkPresent={markPresent}
                          isLoading={submitting}
                        />
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>

          {/* Message Display */}
          <AnimatePresence>
            {msg && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`rounded-xl p-4 ${
                  msgType === "success"
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : msgType === "error"
                      ? "bg-red-50 border border-red-200 text-red-700"
                      : "bg-blue-50 border border-blue-200 text-blue-700"
                }`}
              >
                {msg}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Attendance;
