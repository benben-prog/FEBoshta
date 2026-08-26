import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Monitor, Clock, ArrowRight } from "lucide-react";
import { fetchAllExams } from "../api/teacher/actions";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const Exams = () => {
  const navigate = useNavigate();
  const [paperExams, setPaperExams] = useState([]);
  const [onlineExams, setOnlineExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExams = async () => {
      const result = await fetchAllExams();
      if (result.success) {
        setPaperExams(result.data.paperExams || []);
        setOnlineExams(result.data.onlineExams || []);
      }
      setLoading(false);
    };
    loadExams();
  }, []);

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
      className="flex flex-col gap-6 items-center w-full min-h-screen"
      dir="rtl"
    >
      <motion.header variants={itemVariants} className="w-full">
        <h1 className="text-3xl font-bold">الامتحانات</h1>
        <span className="text-lg text-gray-500">جدول وإدارة الامتحانات</span>
      </motion.header>

      <motion.div
        variants={itemVariants}
        className="w-full grid grid-cols-1 lg:grid-cols-2 gap-5"
      >
        {/* Paper Exams */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            الامتحانات الورقية ({paperExams.length})
          </h2>
          <div className="flex flex-col gap-3">
            {paperExams.length === 0 ? (
              <p className="text-gray-400 text-center py-8">لا توجد امتحانات</p>
            ) : (
              paperExams.map((exam) => (
                <div
                  key={exam.id}
                  onClick={() => navigate(`/teacher/exams/paper/${exam.id}`)}
                  className="flex justify-between items-center bg-gray-50 border border-gray-200 p-4 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition"
                >
                  <div>
                    <span className="font-bold">{exam.title}</span>
                    <span className="text-sm text-gray-500 block">
                      {exam.grade_name} |{" "}
                      {new Date(exam.exam_date).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-blue-600">
                      {exam.total_degree} درجة
                    </span>
                    <ArrowRight size={16} className="text-gray-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Online Exams */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Monitor size={20} className="text-purple-600" />
            الامتحانات الإلكترونية ({onlineExams.length})
          </h2>
          <div className="flex flex-col gap-3">
            {onlineExams.length === 0 ? (
              <p className="text-gray-400 text-center py-8">لا توجد امتحانات</p>
            ) : (
              onlineExams.map((exam) => (
                <div
                  key={exam.id}
                  onClick={() => navigate(`/teacher/exams/online/${exam.id}`)}
                  className="flex justify-between items-center bg-purple-50 border border-purple-200 p-4 rounded-xl cursor-pointer hover:border-purple-300 hover:bg-purple-100/50 transition"
                >
                  <div>
                    <span className="font-bold">{exam.title}</span>
                    <span className="text-sm text-gray-500 block">
                      {exam.grade_name} | {exam.duration_minutes} دقيقة
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-purple-600">
                      {exam.full_mark} درجة
                    </span>
                    <ArrowRight size={16} className="text-gray-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default Exams;
