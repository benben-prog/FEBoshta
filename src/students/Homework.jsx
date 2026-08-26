import { BookIcon, ClipboardCheck, ClipboardList, Clock3 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";
import { fetchAssignments } from "../api/student/actions";
import { useNavigate } from "react-router-dom";

const Homework = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    const result = await fetchAssignments();
    if (result.success) {
      setAssignments(result.data || []);
    }
    setLoading(false);
  };

  // حسب الحالة
  const pendingAssignments = assignments.filter(
    (a) => a.assignment_status === "pending",
  );
  const submittedAssignments = assignments.filter(
    (a) =>
      a.assignment_status === "submitted" || a.assignment_status === "graded",
  );
  const overdueAssignments = assignments.filter(
    (a) => a.assignment_status === "overdue",
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8 items-center"
      dir="rtl"
    >
      {/* Header */}
      <header className="w-full flex flex-col items-start gap-2">
        <h1 className="text-4xl font-bold">الواجبات المنزلية</h1>
        <span className="text-lg text-gray-500">متابعة وإدارة الواجبات</span>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-15 w-full">
        <div className="bg-white w-full flex flex-col gap-4 items-center border-2 border-transparent hover:border-[#3E7AFD] hover:translate-y-1 hover:shadow-[8px_5px_0_#3E7AFD] rounded-2xl p-5 shadow-[5px_2px_0_#3E7AFD] duration-100 transition-all">
          <ClipboardList className="text-[#3E7AFD]" size={40} />
          <span className="text-4xl">{pendingAssignments.length}</span>
          <span className="font-bold text-3xl">واجبات مطلوبة</span>
        </div>

        <div className="bg-white w-full flex flex-col gap-4 items-center border-2 border-transparent hover:border-[#009966] hover:translate-y-1 hover:shadow-[8px_5px_0_#009966] rounded-2xl p-5 shadow-[5px_2px_0_#009966] duration-100 transition-all">
          <ClipboardCheck className="text-[#00A63E]" size={40} />
          <span className="text-4xl">{submittedAssignments.length}</span>
          <span className="font-bold text-3xl">واجبات مسلمة</span>
        </div>

        <div className="bg-white w-full flex flex-col gap-4 items-center border-2 border-transparent hover:border-[#E17100] hover:translate-y-1 hover:shadow-[8px_5px_0_#E17100] rounded-2xl p-5 shadow-[5px_2px_0_#E17100] duration-100 transition-all">
          <Clock3 className="text-[#E17100]" size={40} />
          <span className="text-4xl">{overdueAssignments.length}</span>
          <span className="font-bold text-3xl">واجبات متاخرة</span>
        </div>
      </div>

      {/* واجبات قادمة */}
      <div className="bg-white w-full rounded-2xl border border-gray-500/50 flex flex-col gap-5 p-6">
        <div className="w-full flex items-start">
          <span className="text-3xl font-bold">واجبات قادمة</span>
        </div>

        {pendingAssignments.length === 0 ? (
          <p className="text-gray-400 text-center py-8">لا توجد واجبات قادمة</p>
        ) : (
          pendingAssignments.map((assignment) => (
            <div
              key={assignment.assignment_id}
              className="bg-linear-to-br from-[#f8faff] to-[#eff6ff] border border-[#dbeafe] rounded-2xl p-6 flex flex-col gap-8 lg:flex-row lg:justify-between lg:items-center"
            >
              <div className="flex gap-5 items-center">
                <div className="w-12 rounded-2xl p-3 bg-linear-to-br from-[#fff7ed] to-[#ffedd5] border-[1.5px] border-[#fed7aa]">
                  <BookIcon className="text-[#ea580c]" />
                </div>
                <span className="text-xl font-bold">{assignment.title}</span>
                <span className="text-sm text-gray-500">
                  {new Date(assignment.deadline).toLocaleDateString("ar-EG")}
                </span>
              </div>
              <div>
                <button
                  onClick={() =>
                    navigate(`/student/assignments/${assignment.assignment_id}`)
                  }
                  className="bg-[#001EFE]/86 text-white py-2 px-5 rounded-2xl"
                >
                  تسليم
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* واجبات منتهية */}
      <div className="bg-white w-full rounded-2xl border border-gray-500/50 flex flex-col gap-5 p-6">
        <div className="w-full flex items-start">
          <span className="text-3xl font-bold">واجبات منتهية</span>
        </div>

        {submittedAssignments.length === 0 &&
        overdueAssignments.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            لا توجد واجبات منتهية
          </p>
        ) : (
          [...submittedAssignments, ...overdueAssignments].map((assignment) => (
            <div
              key={assignment.assignment_id}
              className="bg-linear-to-br from-[#f8faff] to-[#eff6ff] border border-[#dbeafe] rounded-2xl p-6 flex justify-between items-center"
            >
              <div className="flex flex-col lg:flex-row gap-5 lg:items-center">
                <div className="w-12 rounded-2xl p-3 bg-linear-to-br from-[#fff7ed] to-[#ffedd5] border-[1.5px] border-[#fed7aa]">
                  <BookIcon className="text-[#ea580c]" />
                </div>
                <span className="text-xl font-bold">{assignment.title}</span>
                <span className="text-sm text-gray-500">
                  {new Date(assignment.deadline).toLocaleDateString("ar-EG")}
                </span>
              </div>
              <div className="flex flex-col gap-8 lg:flex-row lg:gap-60">
                <span className="font-bold">
                  <span className="text-[#017850] text-3xl">
                    {assignment.submission_score || 0}
                  </span>
                  /{assignment.full_mark}
                </span>
                <button className="bg-[#34C759] text-white py-2 px-5 rounded-2xl">
                  {assignment.assignment_status === "graded" ? "مصحح" : "منتهي"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.section>
  );
};

export default Homework;
