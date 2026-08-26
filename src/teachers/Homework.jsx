import { FileText, Search, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllHomework } from "../api/teacher/actions";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const Homeworks = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadAssignments = async () => {
      const result = await fetchAllHomework();
      if (result.success) {
        setAssignments(result.data || []);
      }
      setLoading(false);
    };
    loadAssignments();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (assignment) => {
    if (assignment.is_closed === 1) {
      return { text: "مغلق", bg: "bg-gray-100 text-gray-600" };
    }
    if (assignment.deadline && new Date(assignment.deadline) < new Date()) {
      return { text: "منتهي", bg: "bg-red-100 text-red-600" };
    }
    return { text: "مفتوح", bg: "bg-green-100 text-green-600" };
  };

  const filteredAssignments = assignments.filter(
    (assignment) =>
      searchQuery.trim() === "" ||
      assignment.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.grade_name?.toLowerCase().includes(searchQuery.toLowerCase()),
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
      className="flex flex-col gap-8 min-h-screen font-sans"
      dir="rtl"
    >
      {/* Header */}
      <header className="w-full flex flex-col gap-8 lg:flex-row lg:justify-between lg:items-center">
        <div className="flex flex-col gap-1 items-start">
          <h1 className="text-3xl font-bold text-gray-900">
            الواجبات المنزلية
          </h1>
          <span className="text-base text-gray-500">
            متابعة وإدارة الواجبات ({assignments.length})
          </span>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 w-full lg:w-72">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="بحث عن واجب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent focus:outline-none text-sm w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-gray-400 hover:text-gray-600 shrink-0"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </header>

      {/* Assignments Grid */}
      {filteredAssignments.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText size={48} className="text-gray-200 mx-auto mb-2" />
          <p className="text-sm">لا توجد واجبات</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {filteredAssignments.map((assignment) => {
            const status = getStatusBadge(assignment);

            return (
              <motion.div
                key={assignment.id}
                variants={itemVariants}
                className="bg-white w-full flex flex-col gap-4 border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] transition-all duration-100 rounded-2xl p-5 shadow-[5px_2px_0_#009966]"
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-bold text-gray-900 truncate">
                      {assignment.title}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {assignment.description || "-"}
                    </p>
                    <span className="text-xs text-gray-400 mt-1">
                      {assignment.grade_name || "-"}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm text-gray-400 font-medium">
                      {formatDate(assignment.deadline)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.bg}`}
                    >
                      {status.text}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-gray-800">الدرجة</span>
                    <span className="text-gray-800">
                      {assignment.full_mark} درجة
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100">
                  <button
                    onClick={() =>
                      navigate(`/teacher/assignments/${assignment.id}`)
                    }
                    className="w-full text-center text-sm font-semibold text-gray-600 hover:text-[#009966] transition-colors"
                  >
                    التفاصيل
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.section>
  );
};

export default Homeworks;
