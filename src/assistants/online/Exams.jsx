import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../../motion";
import {
  BookIcon,
  Plus,
  Trash2,
  Pencil,
  X,
  CheckCircle,
  PlusCircle,
  Lock,
  FileText,
  Eye,
  Users,
  CheckCircle2,
  Award,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  fetchAllOnlineExams,
  createNewOnlineExam,
  updateOnlineExamInfo,
  removeOnlineExam,
  fetchAllGrades,
  fetchGroupsByGrade,
  fetchQuestionsByExam,
  createNewQuestion,
  fetchOptionsByQuestion,
  createNewOption,
  removeQuestion,
  updateQuestionInfo,
  removeOption,
  updateOptionInfo,
  fetchOnlineExamStats,
  fetchStudentExams,
} from "../../api/assistant/actions";

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [grades, setGrades] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [examAttemptsMap, setExamAttemptsMap] = useState({});

  const [showBuilder, setShowBuilder] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState([]);
  const [deletedOptionIds, setDeletedOptionIds] = useState([]);

  const [examInfo, setExamInfo] = useState({
    title: "",
    description: "",
    gradeId: "",
    groupId: "",
    durationMinutes: "",
    startAt: "",
    endAt: "",
    fullMark: "",
  });

  const [questions, setQuestions] = useState([]);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examStats, setExamStats] = useState(null);
  const [examStudents, setExamStudents] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    loadExams();
    loadGrades();
  }, []);

  const isExamEnded = (exam) => {
    if (!exam.end_at) return false;
    return new Date(exam.end_at) < new Date();
  };

  const isExamActive = (exam) => {
    if (!exam.start_at || !exam.end_at) return true;
    const now = new Date();
    return new Date(exam.start_at) <= now && now <= new Date(exam.end_at);
  };

  const loadGrades = async () => {
    const result = await fetchAllGrades();
    if (result.success) setGrades(result.data);
  };

  const loadExams = async () => {
    const result = await fetchAllOnlineExams();
    if (result.success) {
      setExams(result.data);
      const attemptsMap = {};
      for (const exam of result.data) {
        const statsRes = await fetchOnlineExamStats(exam.id);
        if (statsRes.success) {
          attemptsMap[exam.id] = statsRes.data?.students_attempted || 0;
        }
      }
      setExamAttemptsMap(attemptsMap);
    }
    setLoading(false);
  };

  const handleGradeChange = async (gradeId) => {
    setExamInfo((prev) => ({ ...prev, gradeId, groupId: "" }));
    if (gradeId) {
      const result = await fetchGroupsByGrade(gradeId);
      if (result.success) setGroups(result.data);
    } else {
      setGroups([]);
    }
  };

  const openExamDetails = async (exam) => {
    setSelectedExam(exam);
    setShowDetailsModal(true);
    setDetailsLoading(true);

    const [statsRes, studentsRes] = await Promise.all([
      fetchOnlineExamStats(exam.id),
      fetchStudentExams(exam.id),
    ]);

    if (statsRes.success) setExamStats(statsRes.data);
    if (studentsRes.success) setExamStudents(studentsRes.data || []);
    setDetailsLoading(false);
  };

  const openBuilder = async (exam = null) => {
    setDeletedQuestionIds([]);
    setDeletedOptionIds([]);

    if (exam) {
      const attemptsCount = examAttemptsMap[exam.id] || 0;
      if (attemptsCount > 0) {
        alert("لا يمكن تعديل هذا الامتحان - يوجد طلاب قد دخلوه بالفعل");
        return;
      }

      setEditingExam(exam);
      setExamInfo({
        title: exam.title || "",
        description: exam.description || "",
        gradeId: exam.grade_id || exam.gradeId || "",
        groupId: exam.group_id || exam.groupId || "",
        durationMinutes: exam.duration_minutes || exam.durationMinutes || "",
        startAt: (exam.start_at || exam.startAt || "")?.slice(0, 16),
        endAt: (exam.end_at || exam.endAt || "")?.slice(0, 16),
        fullMark: exam.full_mark || exam.fullMark || "",
      });

      await handleGradeChange(exam.grade_id || exam.gradeId);

      const qResult = await fetchQuestionsByExam(exam.id);
      const questionsWithOptions = [];

      if (qResult.success && Array.isArray(qResult.data)) {
        for (const q of qResult.data) {
          const oResult = await fetchOptionsByQuestion(q.id);
          questionsWithOptions.push({
            ...q,
            questionText: q.question_text || q.questionText || "",
            type: q.type || "mcq",
            options:
              oResult.success && Array.isArray(oResult.data)
                ? oResult.data.map((opt) => ({
                    ...opt,
                    optionText: opt.option_text || opt.optionText || "",
                  }))
                : [],
          });
        }
      }

      setQuestions(questionsWithOptions);
    } else {
      setEditingExam(null);
      setExamInfo({
        title: "",
        description: "",
        gradeId: "",
        groupId: "",
        durationMinutes: "",
        startAt: "",
        endAt: "",
        fullMark: "",
      });
      setQuestions([]);
    }
    setShowBuilder(true);
  };

  const addQuestion = (type = "mcq") => {
    let newQuestion = {
      id: Date.now() + Math.random(),
      isNew: true,
      questionText: "",
      type: type,
      order: questions.length + 1,
      options: [],
    };

    if (type === "mcq") {
      newQuestion.options = [
        {
          id: Date.now() + 1,
          isNew: true,
          optionText: "",
          isCorrect: 0,
          order: 1,
        },
        {
          id: Date.now() + 2,
          isNew: true,
          optionText: "",
          isCorrect: 0,
          order: 2,
        },
      ];
    } else if (type === "true_false") {
      newQuestion.options = [
        {
          id: Date.now() + 1,
          isNew: true,
          optionText: "صح",
          isCorrect: 0,
          order: 1,
        },
        {
          id: Date.now() + 2,
          isNew: true,
          optionText: "خطأ",
          isCorrect: 0,
          order: 2,
        },
      ];
    }

    setQuestions([...questions, newQuestion]);
  };

  const updateQuestionText = (questionId, text) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, questionText: text } : q,
      ),
    );
  };

  const addOption = (questionId) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: [
              ...q.options,
              {
                id: Date.now() + Math.random(),
                isNew: true,
                optionText: "",
                isCorrect: 0,
                order: q.options.length + 1,
              },
            ],
          };
        }
        return q;
      }),
    );
  };

  const updateOptionText = (questionId, optionId, text) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.map((o) =>
              o.id === optionId ? { ...o, optionText: text } : o,
            ),
          };
        }
        return q;
      }),
    );
  };

  const setCorrectOption = (questionId, optionId) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.map((o) =>
              o.id === optionId
                ? { ...o, isCorrect: 1 }
                : { ...o, isCorrect: 0 },
            ),
          };
        }
        return q;
      }),
    );
  };

  const removeQuestionFromList = (questionId) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
    if (!String(questionId).includes(".")) {
      setDeletedQuestionIds([...deletedQuestionIds, questionId]);
    }
  };

  const removeOptionFromList = (questionId, optionId) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.filter((o) => o.id !== optionId),
          };
        }
        return q;
      }),
    );
    if (!String(optionId).includes(".")) {
      setDeletedOptionIds([...deletedOptionIds, optionId]);
    }
  };

  const saveExam = async () => {
    setMessage(null);

    if (
      !examInfo.title ||
      !examInfo.gradeId ||
      !examInfo.durationMinutes ||
      !examInfo.fullMark
    ) {
      setMessage({ type: "error", text: "يرجى ملء جميع الحقول المطلوبة" });
      return;
    }

    if (parseFloat(examInfo.fullMark) <= 0) {
      setMessage({
        type: "error",
        text: "الدرجة الكلية يجب أن تكون أكبر من صفر",
      });
      return;
    }

    if (parseInt(examInfo.durationMinutes) <= 0) {
      setMessage({ type: "error", text: "المدة يجب أن تكون أكبر من صفر" });
      return;
    }

    if (examInfo.startAt && examInfo.endAt) {
      if (new Date(examInfo.endAt) <= new Date(examInfo.startAt)) {
        setMessage({
          type: "error",
          text: "وقت النهاية يجب أن يكون بعد وقت البداية",
        });
        return;
      }
    }

    if (questions.length === 0) {
      setMessage({ type: "error", text: "يجب إضافة سؤال واحد على الأقل" });
      return;
    }

    for (const q of questions) {
      if (!q.questionText) {
        setMessage({ type: "error", text: "جميع الأسئلة يجب أن يكون لها نص" });
        return;
      }

      if (q.type === "mcq" && q.options.length < 2) {
        setMessage({
          type: "error",
          text: "كل سؤال اختيار من متعدد يحتاج اختيارين على الأقل",
        });
        return;
      }

      if (q.type !== "essay" && !q.options.some((o) => o.isCorrect === 1)) {
        setMessage({ type: "error", text: "كل سؤال يحتاج إجابة صحيحة واحدة" });
        return;
      }

      for (const o of q.options) {
        if (!o.optionText) {
          setMessage({
            type: "error",
            text: "جميع الخيارات يجب أن يكون لها نص",
          });
          return;
        }
      }
    }

    const examData = {
      title: examInfo.title,
      description: examInfo.description,
      gradeId: parseInt(examInfo.gradeId),
      groupId: examInfo.groupId ? parseInt(examInfo.groupId) : null,
      durationMinutes: parseInt(examInfo.durationMinutes),
      startAt: examInfo.startAt,
      endAt: examInfo.endAt,
      fullMark: parseFloat(examInfo.fullMark),
      randomizeQuestions: 0,
    };

    let examId = editingExam?.id;

    if (editingExam) {
      const result = await updateOnlineExamInfo(examId, examData);
      if (!result.success) {
        setMessage({ type: "error", text: result.error });
        return;
      }

      for (const deletedId of deletedQuestionIds) {
        await removeQuestion(deletedId);
      }

      for (const deletedOptId of deletedOptionIds) {
        await removeOption(deletedOptId);
      }

      for (const q of questions) {
        if (q.isNew) {
          const qResult = await createNewQuestion({
            examId: examId,
            questionText: q.questionText,
            type: q.type,
            order: q.order,
          });
          if (qResult.success) {
            const questionId = qResult.data.id;
            for (const o of q.options) {
              await createNewOption({
                questionId: questionId,
                optionText: o.optionText,
                isCorrect: o.isCorrect,
                order: o.order,
              });
            }
          }
        } else {
          await updateQuestionInfo(q.id, {
            examId: examId,
            questionText: q.questionText,
            type: q.type,
            order: q.order,
          });

          for (const o of q.options) {
            if (o.isNew) {
              await createNewOption({
                questionId: q.id,
                optionText: o.optionText,
                isCorrect: o.isCorrect,
                order: o.order,
              });
            } else {
              await updateOptionInfo(o.id, {
                questionId: q.id,
                optionText: o.optionText,
                isCorrect: o.isCorrect,
                order: o.order,
              });
            }
          }
        }
      }
    } else {
      const result = await createNewOnlineExam(examData);
      if (!result.success) {
        setMessage({ type: "error", text: result.error });
        return;
      }
      examId = result.data.id;

      for (const q of questions) {
        const qResult = await createNewQuestion({
          examId: examId,
          questionText: q.questionText,
          type: q.type,
          order: q.order,
        });
        if (qResult.success) {
          const questionId = qResult.data.id;
          for (const o of q.options) {
            await createNewOption({
              questionId: questionId,
              optionText: o.optionText,
              isCorrect: o.isCorrect,
              order: o.order,
            });
          }
        }
      }
    }

    setMessage({
      type: "success",
      text: editingExam ? "تم تحديث الامتحان بنجاح" : "تم إضافة الامتحان بنجاح",
    });
    setShowBuilder(false);
    loadExams();
  };

  const handleDelete = async (examId) => {
    const exam = exams.find((e) => e.id === examId);
    if (!exam) return;

    const attemptsCount = examAttemptsMap[examId] || 0;
    const ended = isExamEnded(exam);

    if (attemptsCount > 0 && !ended) {
      alert("لا يمكن حذف الامتحان - لسه فيه طلاب بيمتحنوا");
      return;
    }

    let confirmMessage = "حذف هذا الامتحان؟";
    if (attemptsCount > 0 && ended) {
      confirmMessage = `تحذير: هذا الامتحان فيه ${attemptsCount} طالب.\nحذف الامتحان سيحذف كل الدرجات.\nهل أنت متأكد؟`;
    }

    if (confirm(confirmMessage)) {
      const result = await removeOnlineExam(examId);
      if (result.success) {
        setMessage({ type: "success", text: "تم حذف الامتحان" });
        loadExams();
      } else {
        setMessage({ type: "error", text: result.error });
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-gray-500">
        جاري التحميل...
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4 w-full min-h-screen" dir="rtl">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            إدارة الامتحانات
          </h1>
          <span className="text-gray-500 text-sm">
            إنشاء وإدارة الامتحانات الإلكترونية
          </span>
        </div>
        <button
          onClick={() => openBuilder(null)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition"
        >
          <Plus size={16} />
          إضافة امتحان
        </button>
      </header>

      {message && (
        <div
          className={`w-full p-3 rounded-lg text-sm font-bold ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {showDetailsModal && selectedExam && (
        <div
          className="fixed inset-0 z-9999 bg-black/60 flex items-center justify-center p-3"
          dir="rtl"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-lg text-gray-900">
                  {selectedExam.title}
                </h2>
                <span className="text-xs text-gray-500">
                  {selectedExam.grade_name || ""} |{" "}
                  {selectedExam.duration_minutes} دقيقة |{" "}
                  {selectedExam.full_mark} درجة
                </span>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {examStats && (
              <div className="shrink-0 px-5 py-4 bg-gray-50 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="bg-white rounded-xl p-3">
                  <Users size={20} className="text-blue-600 mx-auto mb-1" />
                  <span className="font-bold text-lg text-blue-600 block">
                    {examStats.students_attempted || 0}
                  </span>
                  <span className="text-xs text-gray-500">دخلوا</span>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <CheckCircle2
                    size={20}
                    className="text-green-600 mx-auto mb-1"
                  />
                  <span className="font-bold text-lg text-green-600 block">
                    {examStats.students_submitted || 0}
                  </span>
                  <span className="text-xs text-gray-500">خلصوا</span>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <Award size={20} className="text-purple-600 mx-auto mb-1" />
                  <span className="font-bold text-lg text-purple-600 block">
                    {examStats.average_score || 0}
                  </span>
                  <span className="text-xs text-gray-500">المتوسط</span>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <TrendingUp
                    size={20}
                    className="text-orange-600 mx-auto mb-1"
                  />
                  <span className="font-bold text-lg text-orange-600 block">
                    {examStats.highest_score || 0}
                  </span>
                  <span className="text-xs text-gray-500">أعلى</span>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <TrendingDown
                    size={20}
                    className="text-red-600 mx-auto mb-1"
                  />
                  <span className="font-bold text-lg text-red-600 block">
                    {examStats.lowest_score || 0}
                  </span>
                  <span className="text-xs text-gray-500">أقل</span>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-5">
              {detailsLoading ? (
                <p className="text-center text-gray-400 py-8">
                  جاري التحميل...
                </p>
              ) : examStudents.length === 0 ? (
                <p className="text-center text-gray-400 py-8">
                  لا يوجد طلاب دخلوا هذا الامتحان بعد
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {examStudents.map((student) => (
                    <div
                      key={student.id}
                      className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                          <Users size={18} className="text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-sm block truncate">
                            {student.student_name || student.full_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            باركود: {student.barcode}
                          </span>
                          <span className="text-xs text-gray-400 block">
                            بدأ: {formatTime(student.started_at)} | سلم:{" "}
                            {formatTime(student.submitted_at)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            student.status === "submitted"
                              ? "bg-green-100 text-green-600"
                              : "bg-yellow-100 text-yellow-600"
                          }`}
                        >
                          {student.status === "submitted" ? "خلص" : "جاري"}
                        </span>
                        <span className="font-bold text-lg text-gray-800">
                          {student.score != null
                            ? `${student.score}/${selectedExam.full_mark}`
                            : "-"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showBuilder && (
        <div
          className="fixed inset-0 z-9999 bg-black/40 flex items-center justify-center p-3"
          dir="rtl"
          onClick={() => setShowBuilder(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-base">
                {editingExam ? "تعديل الامتحان" : "إضافة امتحان"}
              </h2>
              <button
                onClick={() => setShowBuilder(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="عنوان الامتحان *"
                  value={examInfo.title}
                  onChange={(e) =>
                    setExamInfo({ ...examInfo, title: e.target.value })
                  }
                  className="p-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#9224EB] sm:col-span-2"
                />
                <select
                  value={examInfo.gradeId}
                  onChange={(e) => handleGradeChange(e.target.value)}
                  className="p-2 rounded-lg border border-gray-200 text-sm bg-white outline-none"
                >
                  <option value="">الصف *</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.name}
                    </option>
                  ))}
                </select>
                <select
                  value={examInfo.groupId}
                  onChange={(e) =>
                    setExamInfo({ ...examInfo, groupId: e.target.value })
                  }
                  className="p-2 rounded-lg border border-gray-200 text-sm bg-white outline-none"
                >
                  <option value="">كل المجموعات</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="المدة (دقائق) *"
                  value={examInfo.durationMinutes}
                  onChange={(e) =>
                    setExamInfo({
                      ...examInfo,
                      durationMinutes: e.target.value,
                    })
                  }
                  className="p-2 rounded-lg border border-gray-200 text-sm outline-none"
                />
                <input
                  type="number"
                  placeholder="الدرجة الكلية *"
                  value={examInfo.fullMark}
                  onChange={(e) =>
                    setExamInfo({ ...examInfo, fullMark: e.target.value })
                  }
                  className="p-2 rounded-lg border border-gray-200 text-sm outline-none"
                />
                <input
                  type="datetime-local"
                  value={examInfo.startAt}
                  onChange={(e) =>
                    setExamInfo({ ...examInfo, startAt: e.target.value })
                  }
                  className="p-2 rounded-lg border border-gray-200 text-sm outline-none"
                />
                <input
                  type="datetime-local"
                  value={examInfo.endAt}
                  onChange={(e) =>
                    setExamInfo({ ...examInfo, endAt: e.target.value })
                  }
                  className="p-2 rounded-lg border border-gray-200 text-sm outline-none"
                />
              </div>

              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-[#9224EB] text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder={`السؤال ${idx + 1}`}
                      value={q.questionText}
                      onChange={(e) => updateQuestionText(q.id, e.target.value)}
                      className="flex-1 p-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#9224EB]"
                    />
                    <select
                      value={q.type}
                      onChange={(e) => {
                        const type = e.target.value;
                        setQuestions(
                          questions.map((item) =>
                            item.id === q.id
                              ? {
                                  ...item,
                                  type,
                                  options:
                                    type === "true_false"
                                      ? [
                                          {
                                            id: Date.now() + 1,
                                            isNew: true,
                                            optionText: "صح",
                                            isCorrect: 0,
                                            order: 1,
                                          },
                                          {
                                            id: Date.now() + 2,
                                            isNew: true,
                                            optionText: "خطأ",
                                            isCorrect: 0,
                                            order: 2,
                                          },
                                        ]
                                      : type === "essay"
                                        ? []
                                        : item.options,
                                }
                              : item,
                          ),
                        );
                      }}
                      className="p-2 rounded-lg border border-gray-200 text-xs bg-white outline-none"
                    >
                      <option value="mcq">اختيارات</option>
                      <option value="true_false">صح/خطأ</option>
                      <option value="essay">مقالي</option>
                    </select>
                    <button
                      onClick={() => removeQuestionFromList(q.id)}
                      className="p-1 text-red-400 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {q.type === "essay" ? (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <FileText size={14} />
                      سؤال مقالي - الطالب سيرفع ملف الإجابة
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {q.options.map((opt, optIdx) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <button
                            onClick={() => setCorrectOption(q.id, opt.id)}
                            className={`shrink-0 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                              opt.isCorrect === 1
                                ? "bg-green-500 border-green-500"
                                : "border-gray-300"
                            }`}
                          >
                            {opt.isCorrect === 1 && (
                              <CheckCircle size={12} className="text-white" />
                            )}
                          </button>
                          <input
                            type="text"
                            placeholder={`اختيار ${optIdx + 1}`}
                            value={opt.optionText}
                            onChange={(e) =>
                              updateOptionText(q.id, opt.id, e.target.value)
                            }
                            className="flex-1 p-2 rounded-lg border border-gray-200 text-xs outline-none focus:border-[#9224EB]"
                          />
                          {q.options.length > 2 && (
                            <button
                              onClick={() => removeOptionFromList(q.id, opt.id)}
                              className="text-red-400"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                      {q.type === "mcq" && (
                        <button
                          onClick={() => addOption(q.id)}
                          className="flex items-center gap-1 text-[#9224EB] text-xs font-bold w-fit"
                        >
                          <PlusCircle size={12} /> اختيار
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex gap-2">
                <button
                  onClick={() => addQuestion("mcq")}
                  className="flex-1 py-2.5 border-2 border-dashed border-primary text-primary rounded-lg text-xs font-bold hover:bg-purple-50"
                >
                  + اختيارات
                </button>
                <button
                  onClick={() => addQuestion("true_false")}
                  className="flex-1 py-2.5 border-2 border-dashed border-blue-500 text-blue-500 rounded-lg text-xs font-bold hover:bg-blue-50"
                >
                  + صح/خطأ
                </button>
                <button
                  onClick={() => addQuestion("essay")}
                  className="flex-1 py-2.5 border-2 border-dashed border-orange-500 text-orange-500 rounded-lg text-xs font-bold hover:bg-orange-50"
                >
                  + مقالي
                </button>
              </div>
            </div>

            <div className="shrink-0 px-4 py-3 border-t border-gray-100 flex gap-2">
              <button
                onClick={saveExam}
                className="flex-1 bg-primary text-white py-2.5 rounded-lg font-bold text-sm hover:bg-primary/90"
              >
                {editingExam ? "تحديث" : "حفظ"}
              </button>
              <button
                onClick={() => setShowBuilder(false)}
                className="px-4 border border-gray-200 rounded-lg text-sm font-semibold text-gray-500"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {exams.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
            لا توجد امتحانات
          </div>
        ) : (
          exams.map((exam) => {
            const attemptsCount = examAttemptsMap[exam.id] || 0;
            const ended = isExamEnded(exam);
            const isEditLocked = attemptsCount > 0;
            const isDeleteLocked = attemptsCount > 0 && !ended;

            return (
              <motion.div
                variants={pageVariants}
                initial="hidden"
                animate="show"
                key={exam.id}
                onClick={() => openExamDetails(exam)}
                className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3 hover:border-[#9224EB] hover:shadow-md transition cursor-pointer"
              >
                <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-2"
                >
                  <BookIcon className="text-[#9224EB] w-5 h-5 shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm truncate">{exam.title}</h3>
                    <span className="text-xs text-gray-500">
                      {exam.duration_minutes} دقيقة | {exam.full_mark} درجة
                    </span>
                  </div>
                </motion.div>

                {(exam.start_at || exam.end_at) && (
                  <div className="text-[11px] text-gray-500 flex flex-col gap-0.5">
                    {exam.start_at && (
                      <span>
                        يبدأ: {formatDate(exam.start_at)}{" "}
                        {formatTime(exam.start_at)}
                      </span>
                    )}
                    {exam.end_at && (
                      <span>
                        ينتهي: {formatDate(exam.end_at)}{" "}
                        {formatTime(exam.end_at)}
                      </span>
                    )}
                  </div>
                )}

                {attemptsCount > 0 && !ended && (
                  <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 text-xs font-bold px-2.5 py-1.5 rounded-lg">
                    <Lock size={12} />
                    {attemptsCount} طالب بيمتحنوا دلوقتي
                  </div>
                )}

                {attemptsCount > 0 && ended && (
                  <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1.5 rounded-lg">
                    <CheckCircle2 size={12} />
                    الامتحان خلص - {attemptsCount} طالب دخلوا
                  </div>
                )}

                <motion.div
                  variants={itemVariants}
                  className="flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => openExamDetails(exam)}
                    className="flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 bg-green-50 text-green-600 hover:bg-green-100"
                  >
                    <Eye size={12} /> تفاصيل
                  </button>
                  <button
                    onClick={() => openBuilder(exam)}
                    disabled={isEditLocked}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${
                      isEditLocked
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    }`}
                  >
                    <Pencil size={12} /> تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(exam.id)}
                    disabled={isDeleteLocked}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 ${
                      isDeleteLocked
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-red-50 text-red-600 hover:bg-red-100"
                    }`}
                  >
                    <Trash2 size={12} /> حذف
                  </button>
                </motion.div>
              </motion.div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default Exams;
