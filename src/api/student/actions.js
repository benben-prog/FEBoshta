import * as studentServices from "./services";

// Dashboard
const fetchStudentDashboard = async () => {
  try {
    const data = await studentServices.getDashboard();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Profile
const fetchStudentProfile = async () => {
  try {
    const data = await studentServices.getProfile();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchStudentStats = async () => {
  try {
    const data = await studentServices.getQuickStats();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updateStudentProfileImage = async (formData) => {
  try {
    const data = await studentServices.updateProfileImage(formData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const deleteStudentProfileImage = async () => {
  try {
    const data = await studentServices.deleteProfileImage();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const changeStudentPassword = async (
  oldPassword,
  newPassword,
  confirmPassword,
) => {
  try {
    const response = await studentServices.updatePassword(
      oldPassword,
      newPassword,
      confirmPassword,
    );
    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Attendance
const fetchAttendanceHistory = async (month = "", page = 1) => {
  try {
    const response = await studentServices.getAttendanceHistory(month, page);
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchMonthlyAttendance = async () => {
  try {
    const data = await studentServices.getMonthlyAttendance();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchConsecutiveAbsences = async () => {
  try {
    const data = await studentServices.getConsecutiveAbsences();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Paper Exams
const fetchPaperExams = async (month = "", page = 1) => {
  try {
    const response = await studentServices.getPaperExams(month, page);
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchPaperExamById = async (examId) => {
  try {
    const data = await studentServices.getPaperExamById(examId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchExamResults = async (month = "", page = 1) => {
  try {
    const response = await studentServices.getExamResults(month, page);
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Online Exams
const fetchAvailableExams = async (page = 1) => {
  try {
    const data = await studentServices.getAvailableExams(page);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchExamHistory = async (month = "", page = 1) => {
  try {
    const response = await studentServices.getExamHistory(month, page);
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchOnlineExamById = async (attemptId) => {
  try {
    const data = await studentServices.getOnlineExamById(attemptId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const startStudentExam = async (examId) => {
  try {
    const attempt = await studentServices.startExam(examId);
    
    if (!attempt || !attempt.id) {
      throw new Error("فشل بدء الامتحان");
    }

    const questions = await studentServices.getQuestionsByExam(examId);

    const questionsWithOptions = await Promise.all(
      questions.map(async (question) => {
        const options = await studentServices.getOptionsByQuestion(question.id);
        return { ...question, options };
      }),
    );

    return {
      success: true,
      data: {
        attempt_id: attempt.id,
        exam_id: attempt.exam_id,
        started_at: attempt.started_at,
        questions: questionsWithOptions,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const submitStudentExam = async (attemptId, answers) => {
  try {
    let correctCount = 0;
    let totalQuestions = 0;

    for (const answer of answers) {
      const question = await studentServices.getQuestionById(answer.question_id);
      
      if (question.type === "mcq" || question.type === "true_false") {
        totalQuestions++;
        const options = await studentServices.getOptionsByQuestion(question.id);
        const correctOption = options.find((opt) => opt.is_correct === 1);
        
        if (correctOption && correctOption.id === answer.option_id) {
          correctCount++;
        }
      }
    }

    const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    const result = await studentServices.submitExam(attemptId, Math.round(score));

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};


const submitStudentAnswer = async (examId, questionId, selectedOptionId) => {
  try {
    const data = await studentServices.answerQuestion(
      examId,
      questionId,
      selectedOptionId,
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const submitStudentEssayAnswer = async (examId, questionId, file) => {
  try {
    const data = await studentServices.submitEssayAnswer(
      examId,
      questionId,
      file,
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Assignments
const fetchAssignments = async (month = "", page = 1) => {
  try {
    const response = await studentServices.getAssignments(month, page);
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchAssignmentById = async (assignmentId) => {
  try {
    const data = await studentServices.getAssignmentById(assignmentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const downloadAssignmentFile = async (assignmentId) => {
  try {
    const data = await studentServices.downloadAssignment(assignmentId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const submitStudentAssignment = async (assignmentId, file) => {
  try {
    const data = await studentServices.submitAssignment(assignmentId, file);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updateStudentAssignment = async (assignmentId, file) => {
  try {
    const data = await studentServices.updateAssignmentSubmission(
      assignmentId,
      file,
    );
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchSubmissions = async (month = "", page = 1) => {
  try {
    const response = await studentServices.getSubmissions(month, page);
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Videos & Playlists
const fetchPlaylists = async () => {
  try {
    const data = await studentServices.getPlaylists();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchPlaylistVideos = async (playlistId) => {
  try {
    const data = await studentServices.getPlaylistVideos(playlistId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Payments
const fetchPaymentHistory = async (month = "", page = 1) => {
  try {
    const response = await studentServices.getPaymentHistory(month, page);
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchRemainingBalance = async () => {
  try {
    const data = await studentServices.getRemainingBalance();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const fetchCurrentSubscription = async () => {
  try {
    const data = await studentServices.getCurrentSubscription();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export {
  fetchStudentDashboard,
  fetchStudentProfile,
  fetchStudentStats,
  updateStudentProfileImage,
  deleteStudentProfileImage,
  changeStudentPassword,
  fetchAttendanceHistory,
  fetchMonthlyAttendance,
  fetchConsecutiveAbsences,
  fetchPaperExams,
  fetchPaperExamById,
  fetchExamResults,
  fetchAvailableExams,
  fetchExamHistory,
  fetchOnlineExamById,
  startStudentExam,
  submitStudentExam,
  submitStudentAnswer,
  submitStudentEssayAnswer,
  fetchAssignments,
  fetchAssignmentById,
  downloadAssignmentFile,
  submitStudentAssignment,
  updateStudentAssignment,
  fetchSubmissions,
  fetchPlaylists,
  fetchPlaylistVideos,
  fetchPaymentHistory,
  fetchRemainingBalance,
  fetchCurrentSubscription,
};
