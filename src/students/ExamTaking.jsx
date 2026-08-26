import {
  Clock,
  AlertCircle,
  Loader2,
  Send,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { startStudentExam, submitStudentExam } from "../api/student/actions";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const ExamTaking = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [examData, setExamData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [message, setMessage] = useState(null);
  const autoSubmittedRef = useRef(false);
  const submittingRef = useRef(false);

  // examInfo from examId (نحتاج نجيبها من الـ available exams)
  const [examInfo, setExamInfo] = useState(null);

  useEffect(() => {
    const fetchExamInfo = async () => {
      // جيب معلومات الامتحان من الـ available exams
      const { fetchAvailableExams } = await import("../api/student/actions");
      const result = await fetchAvailableExams();
      if (result.success) {
        const exam = result.data.find((e) => e.exam_id === parseInt(examId));
        setExamInfo(exam);
      }
    };
    fetchExamInfo();
    startExam();
  }, [examId]);

  const startExam = async () => {
    setLoading(true);
    const result = await startStudentExam(examId);

    if (result.success) {
      setExamData(result.data);
      setQuestions(result.data.questions || []);

      const startedAt = new Date(result.data.started_at);
      const now = new Date();
      const elapsedSeconds = Math.floor((now - startedAt) / 1000);
      const totalSeconds = (examInfo?.duration_minutes || 60) * 60;
      setTimeLeft(Math.max(0, totalSeconds - elapsedSeconds));

      setLoading(false);
    } else {
      setMessage({ type: "error", text: result.error });
      setLoading(false);
      setTimeout(() => navigate("/student/exams"), 3000);
    }
  };

  useEffect(() => {
    if (timeLeft <= 0 || loading || autoSubmittedRef.current) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!autoSubmittedRef.current) {
            autoSubmittedRef.current = true;
            handleAutoSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours > 0 ? `${hours}:` : ""}${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const buildAnswerArray = () => {
    return Object.entries(answers).map(([questionId, optionId]) => ({
      question_id: parseInt(questionId),
      option_id: parseInt(optionId),
    }));
  };

  const handleAutoSubmit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    const answerArray = buildAnswerArray();
    const result = await submitStudentExam(examData.attempt_id, answerArray);

    if (result.success) {
      alert("انتهى الوقت! تم تسليم الامتحان تلقائياً");
      navigate("/student/exams");
    } else {
      alert(result.error || "حدث خطأ");
      navigate("/student/exams");
    }
  };

  const handleSubmitExam = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setShowConfirmSubmit(false);

    const answerArray = buildAnswerArray();
    const result = await submitStudentExam(examData.attempt_id, answerArray);
    setSubmitting(false);

    if (result.success) {
      alert("تم التسليم بنجاح!");
      navigate("/student/exams");
    } else {
      submittingRef.current = false;
      alert(result.error || "حدث خطأ في التسليم");
      navigate("/student/exams");
    }
  };

  const selectAnswer = (questionId, optionId) => {
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercentage =
    questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin ml-2" size={24} />
        <span className="text-gray-500">جاري تحميل الامتحان...</span>
      </div>
    );
  }

  if (message && !examData) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-gray-50"
        dir="rtl"
      >
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-3" />
          <p className="text-gray-700 font-bold">{message.text}</p>
          <p className="text-gray-400 text-sm mt-2">
            جاري التحويل للصفحة الرئيسية...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col min-h-screen"
      dir="rtl"
    >
      <motion.div
        variants={itemVariants}
        className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm"
      >
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-3">
            <div>
              <h1 className="text-base sm:text-xl font-bold text-gray-900">
                {examInfo?.exam_title || "الامتحان"}
              </h1>
              <span className="text-[10px] sm:text-xs text-gray-500">
                {examInfo?.full_mark || 0} درجة
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-sm sm:text-lg flex items-center gap-1.5 sm:gap-2 ${
                  timeLeft <= 60
                    ? "bg-red-50 text-red-600 animate-pulse"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                <Clock size={16} />
                {formatTime(timeLeft)}
              </div>

              <div className="text-xs sm:text-sm text-gray-600">
                {answeredCount}/{questions.length}
              </div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mt-2 sm:mt-3">
            <div
              className="bg-blue-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="max-w-4xl mx-auto w-full px-3 sm:px-4 py-3 sm:py-4 flex-1"
      >
        <div className="flex gap-3 sm:gap-4">
          <div className="hidden md:block w-40 lg:w-48 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-3 sticky top-24">
              <h3 className="font-bold text-xs mb-2 text-gray-700">الأسئلة</h3>
              <div className="grid grid-cols-4 gap-1.5">
                {questions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`p-1.5 rounded text-xs font-bold transition-colors ${
                      answers[q.id]
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    } ${currentIndex === index ? "ring-2 ring-blue-500" : ""}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-xs sm:text-sm text-gray-500 font-medium">
                  سؤال {currentIndex + 1} من {questions.length}
                </span>
                <span className="text-[10px] sm:text-xs text-gray-400">
                  اختر الإجابة الصحيحة
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6 leading-relaxed">
                {questions[currentIndex]?.question_text}
              </h2>

              <div className="flex flex-col gap-2 sm:gap-3">
                {questions[currentIndex]?.options?.map((opt, optIndex) => (
                  <button
                    key={opt.id}
                    onClick={() =>
                      selectAnswer(questions[currentIndex].id, opt.id)
                    }
                    className={`p-3 sm:p-4 rounded-xl text-right border-2 transition-all ${
                      answers[questions[currentIndex].id] === opt.id
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex items-center gap-2 sm:gap-3">
                      <span
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 ${
                          answers[questions[currentIndex].id] === opt.id
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {String.fromCharCode(65 + optIndex)}
                      </span>
                      <span className="text-xs sm:text-sm font-medium">
                        {opt.option_text}
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  onClick={goToPrev}
                  disabled={currentIndex === 0}
                  className="flex-1 py-2.5 sm:py-3 border border-gray-200 rounded-lg text-xs sm:text-sm font-bold text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                >
                  <ChevronRight size={14} />
                  السابق
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={goToNext}
                    className="flex-1 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                  >
                    التالي
                    <ChevronLeft size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirmSubmit(true)}
                    className="flex-1 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
                  >
                    <Send size={14} />
                    تسليم الامتحان
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {showConfirmSubmit && (
        <div className="fixed inset-0 z-9999 bg-black/60 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 sm:p-6">
            <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3">
              تأكيد التسليم
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              أنت على وشك تسليم الامتحان. تأكد من إجاباتك.
              {answeredCount < questions.length && (
                <span className="block mt-1 text-orange-500 font-bold">
                  تنبيه: لديك {questions.length - answeredCount} سؤال غير مجاب
                </span>
              )}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm font-bold text-gray-500"
              >
                رجوع
              </button>
              <button
                onClick={handleSubmitExam}
                disabled={submitting}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-xs sm:text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-1.5 sm:gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    جاري التسليم...
                  </>
                ) : (
                  "تأكيد التسليم"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
};

export default ExamTaking;
