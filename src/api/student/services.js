import {
  httpGet,
  httpPost,
  httpPut,
  httpDelete,
  httpPostFormData,
  httpPutFormData,
} from "../http";

// Dashboard
const getDashboard = async () => {
  const response = await httpGet("/student/dashboard");
  return response.data;
};

// Profile
const getProfile = async () => {
  const response = await httpGet("/student/profile");
  return response.data;
};

const getQuickStats = async () => {
  const response = await httpGet("/student/stats");
  return response.data;
};

const updateProfileImage = async (formData) => {
  const response = await httpPutFormData("/student/profile-image", formData);
  return response.data;
};

const deleteProfileImage = async () => {
  const response = await httpPut("/student/profile-image", null);
  return response.data;
};

const updatePassword = async (oldPassword, newPassword, confirmPassword) => {
  const response = await httpPut("/student/password", {
    oldPassword,
    password: newPassword,
    confirmPassword,
  });
  return response;
};

// Attendance
const getAttendanceHistory = async (month = "", page = 1) => {
  const params = new URLSearchParams();
  if (month) params.append("month", month);
  params.append("page", page);
  const response = await httpGet(`/student/attendance?${params.toString()}`);
  return response;
};

const getMonthlyAttendance = async () => {
  const response = await httpGet("/student/attendance/monthly");
  return response.data;
};

const getConsecutiveAbsences = async () => {
  const response = await httpGet("/student/attendance/consecutive");
  return response.data;
};

// Paper Exams
const getPaperExams = async (month = "", page = 1) => {
  const params = new URLSearchParams();
  if (month) params.append("month", month);
  params.append("page", page);
  const response = await httpGet(`/student/exams/paper?${params.toString()}`);
  return response;
};

const getPaperExamById = async (examId) => {
  const response = await httpGet(`/student/exams/paper/${examId}`);
  return response.data;
};

const getExamResults = async (month = "", page = 1) => {
  const params = new URLSearchParams();
  if (month) params.append("month", month);
  params.append("page", page);
  const response = await httpGet(`/student/exams/results?${params.toString()}`);
  return response;
};

// Online Exams
const getAvailableExams = async (page = 1) => {
  const response = await httpGet(
    `/student/exams/online/available?page=${page}`,
  );
  return response.data;
};

const getExamHistory = async (month = "", page = 1) => {
  const params = new URLSearchParams();
  if (month) params.append("month", month);
  params.append("page", page);
  const response = await httpGet(
    `/student/exams/online/history?${params.toString()}`,
  );
  return response;
};

const getOnlineExamById = async (attemptId) => {
  const response = await httpGet(`/student/exams/online/${attemptId}`);
  return response.data;
};

const startExam = async (examId) => {
  const response = await httpPost(`/student/exams/online/${examId}/start`);
  return response.data;
};

const submitExam = async (attemptId, score) => {
  const response = await httpPut(`/student/exams/online/${attemptId}/submit`, {
    score,
  });
  return response.data;
};

const answerQuestion = async (examId, questionId, selectedOptionId) => {
  const response = await httpPost(`/student/exams/online/${examId}/answer`, {
    question_id: questionId,
    selected_option_id: selectedOptionId,
  });
  return response.data;
};

const submitEssayAnswer = async (examId, questionId, file) => {
  const formData = new FormData();
  formData.append("question_id", questionId);
  formData.append("file", file);
  const response = await httpPostFormData(
    `/student/exams/online/${examId}/essay`,
    formData,
  );
  return response.data;
};

// Assignments
const getAssignments = async (month = "", page = 1) => {
  const params = new URLSearchParams();
  if (month) params.append("month", month);
  params.append("page", page);
  const response = await httpGet(`/student/assignments?${params.toString()}`);
  return response;
};

const getAssignmentById = async (assignmentId) => {
  const response = await httpGet(`/student/assignments/${assignmentId}`);
  return response.data;
};

const downloadAssignment = async (assignmentId) => {
  const response = await httpGet(
    `/student/assignments/${assignmentId}/download`,
  );
  return response;
};

const submitAssignment = async (assignmentId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await httpPostFormData(
    `/student/assignments/${assignmentId}/submit`,
    formData,
  );
  return response.data;
};

const updateAssignmentSubmission = async (assignmentId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await httpPutFormData(
    `/student/assignments/${assignmentId}/update`,
    formData,
  );
  return response.data;
};

const getSubmissions = async (month = "", page = 1) => {
  const params = new URLSearchParams();
  if (month) params.append("month", month);
  params.append("page", page);
  const response = await httpGet(`/student/submissions?${params.toString()}`);
  return response;
};

// Videos & Playlists
const getPlaylists = async () => {
  const response = await httpGet("/student/playlists");
  return response.data;
};

const getPlaylistVideos = async (playlistId) => {
  const response = await httpGet(`/student/playlists/${playlistId}/videos`);
  return response.data;
};

// Payments
const getPaymentHistory = async (month = "", page = 1) => {
  const params = new URLSearchParams();
  if (month) params.append("month", month);
  params.append("page", page);
  const response = await httpGet(`/student/payments?${params.toString()}`);
  return response;
};

const getRemainingBalance = async () => {
  const response = await httpGet("/student/payments/balance");
  return response.data;
};

const getCurrentSubscription = async () => {
  const response = await httpGet("/student/payments/current-subscription");
  return response.data;
};
// Exam Questions
const getQuestionsByExam = async (examId) => {
  const response = await httpGet(`/student/exams/online/${examId}/questions`);
  return response.data;
};

const getOptionsByQuestion = async (questionId) => {
  const response = await httpGet(`/student/options/question/${questionId}`);
  return response.data;
};

const getQuestionById = async (questionId) => {
  const response = await httpGet(`/student/exams/online/question/${questionId}`);
  return response.data;
};
export {
  getDashboard,
  getProfile,
  getQuickStats,
  updateProfileImage,
  deleteProfileImage,
  updatePassword,
  getAttendanceHistory,
  getMonthlyAttendance,
  getOptionsByQuestion,
  getConsecutiveAbsences,
  getQuestionById,
  getPaperExams,
  getPaperExamById,
  getExamResults,
  getAvailableExams,
  getExamHistory,
  getOnlineExamById,
  startExam,
  submitExam,
  answerQuestion,
  submitEssayAnswer,
  getAssignments,
  getAssignmentById,
  downloadAssignment,
  submitAssignment,
  updateAssignmentSubmission,
  getSubmissions,
  getPlaylists,
  getPlaylistVideos,
  getPaymentHistory,
  getRemainingBalance,
  getCurrentSubscription,
};
