import {
  Search,
  ChevronRight,
  ChevronLeft,
  X,
  Phone,
  Download,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllStudents, fetchStudentFilters } from "../api/teacher/actions";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [grades, setGrades] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadStudents();
  }, [page, selectedGrade, selectedGroup]);

  const loadFilters = async () => {
    const result = await fetchStudentFilters();
    if (result.success) {
      setGrades(result.data?.grades || []);
      setGroups(result.data?.groups || []);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    const result = await fetchAllStudents(
      page,
      searchQuery,
      selectedGrade,
      selectedGroup,
    );
    if (result.success) {
      setStudents(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
      setTotalStudents(result.pagination?.total || result.data.length);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setPage(1);
    loadStudents();
  };

  const handleStudentClick = (student) => {
    navigate(`/teacher/students/${student.id}`);
  };

  const filteredGroups = selectedGrade
    ? groups.filter((group) => group.grade_id === parseInt(selectedGrade))
    : groups;

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-3 sm:gap-4 w-full min-h-screen"
      dir="rtl"
    >
      {/* Header */}
      <motion.header
        variants={itemVariants}
        className="w-full flex flex-col gap-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              الطلاب
            </h1>
            <span className="text-xs sm:text-sm text-gray-500">
              {totalStudents} طالب
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2.5 py-2 w-full">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="بحث بالاسم أو الباركود..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="bg-transparent focus:outline-none text-xs sm:text-sm w-full"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setPage(1);
                loadStudents();
              }}
              className="text-gray-400 shrink-0"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 flex-wrap">
          <select
            value={selectedGrade}
            onChange={(e) => {
              setSelectedGrade(e.target.value);
              setSelectedGroup("");
              setPage(1);
            }}
            className="flex-1 min-w-30 p-2 rounded-lg border border-gray-200 text-xs sm:text-sm outline-none bg-white"
          >
            <option value="">كل الصفوف</option>
            {grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
          <select
            value={selectedGroup}
            onChange={(e) => {
              setSelectedGroup(e.target.value);
              setPage(1);
            }}
            className="flex-1 min-w-30 p-2 rounded-lg border border-gray-200 text-xs sm:text-sm outline-none bg-white"
            disabled={!selectedGrade}
          >
            <option value="">كل المجموعات</option>
            {filteredGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </motion.header>

      {/* Mobile Cards */}
      <motion.div variants={itemVariants} className="sm:hidden">
        {loading ? (
          <p className="text-center text-gray-400 text-sm py-8">
            جاري التحميل...
          </p>
        ) : students.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">لا يوجد طلاب</p>
        ) : (
          <div className="flex flex-col gap-2">
            {students.map((student) => (
              <div
                key={student.id}
                onClick={() => handleStudentClick(student)}
                className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-blue-50/50 transition"
              >
                <div className="flex justify-between items-start">
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
                <div className="flex gap-3 mt-2 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <Phone size={10} />
                    {student.phone || "-"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone size={10} />
                    {student.parent_phone || "-"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Desktop Table */}
      <motion.div
        variants={itemVariants}
        className="hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-800 text-sm">قائمة الطلاب</h2>
          <span className="text-xs text-gray-500">{totalStudents} طالب</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-150">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "الباركود",
                  "الاسم",
                  "الصف",
                  "المجموعة",
                  "الهاتف",
                  "ولي الأمر",
                ].map((header, idx) => (
                  <th
                    key={idx}
                    className="text-right py-3 px-4 text-xs font-semibold text-gray-600 whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-gray-400 text-sm"
                  >
                    جاري التحميل...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-gray-400 text-sm"
                  >
                    لا يوجد طلاب
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr
                    key={student.id}
                    onClick={() => handleStudentClick(student)}
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 text-xs">{student.barcode}</td>
                    <td className="py-3 px-4 font-medium text-xs">
                      {student.full_name}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {student.grade_name || "-"}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {student.group_name || "-"}
                    </td>
                    <td className="py-3 px-4 text-xs" dir="ltr">
                      {student.phone || "-"}
                    </td>
                    <td className="py-3 px-4 text-xs" dir="ltr">
                      {student.parent_phone || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 px-3 py-2.5 flex items-center justify-between flex-wrap gap-2">
          <span className="text-[10px] sm:text-xs text-gray-500">
            صفحة {page} من {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1.5 sm:p-2 border border-gray-200 rounded-md disabled:opacity-30"
            >
              <ChevronRight size={13} />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-1.5 sm:p-2 border border-gray-200 rounded-md disabled:opacity-30"
            >
              <ChevronLeft size={13} />
            </button>
          </div>
        </div>
      )}
    </motion.section>
  );
};

export default Students;
