import { BarChart3, Hash, Printer, X, Calendar, Clock, Phone, Barcode, User, GraduationCap, Users } from "lucide-react";
import { useState } from "react";
import { LoadingState } from "./Spinner";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../../../motion";

const ARABIC_MONTHS = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

const formatDate = (d) => {
    if (!d) return "-";
    const date = new Date(d);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatTime = (t) => {
    if (!t) return "-";
    return t.slice(0, 5);
};

const getInitial = (name) => {
    if (!name) return "؟";
    return name.trim()[0] || "؟";
};

const StudentCard = ({ 
    student = {}, 
    stats = null,
    onClose = () => {} 
}) => {
    const [loading] = useState(false);

    // استخراج البيانات من الـ student و stats
    const {
        id,
        barcode,
        full_name,
        phone,
        parent_phone,
        grade_name,
        group_name,
        notes,
        parent_token,
        profile_image
    } = student;

    // إحصائيات الطالب
    const attendancePct = stats?.attendance_percentage ? Number(stats.attendance_percentage) : 0;
    const presentDays = Number(stats?.present_days) || 0;
    const totalDays = Number(stats?.total_attendance_days) || 0;
    const avgScore = stats?.avg_paper_degree ? Number(stats.avg_paper_degree) : 0;
    const avgOnlineScore = stats?.avg_online_score ? Number(stats.avg_online_score) : 0;
    const totalPaid = Number(stats?.total_paid) || 0;
    const totalRequired = Number(stats?.total_required) || 0;
    const remainingBalance = Number(stats?.remaining_balance) || 0;
    const paidThisMonth = totalPaid > 0 && totalRequired > 0 && totalPaid >= totalRequired;

    const initial = getInitial(full_name);

    // بيانات وهمية للحضور والنتائج والمدفوعات (لأن الـ API مش بترجعهم في الـ stats)
    // في الحقيقة هتجيليهم من API تانية
    const attendanceData = [];
    const resultsData = [];
    const paymentsData = [];

    return (
        <motion.div 
            variants={pageVariants} 
            initial="hidden" 
            animate="show" 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" 
            onClick={onClose}
        >
            <motion.div 
                variants={itemVariants}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-[900px] max-h-[92vh] overflow-y-auto p-4 sm:p-6 space-y-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                            {initial}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">{full_name || "طالب"}</h2>
                            <p className="text-xs text-slate-500">
                                {grade_name || "-"} • {group_name || "-"}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Basic info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 bg-slate-50 rounded-2xl p-4 text-sm text-slate-700 space-y-2">
                        <div className="flex items-center gap-2">
                            <Barcode size={14} className="text-slate-400" />
                            <span className="text-slate-500">الباركود:</span>
                            <span className="font-mono">{barcode || "-"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone size={14} className="text-slate-400" />
                            <span className="text-slate-500">الهاتف:</span>
                            <span dir="ltr">{phone || "-"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone size={14} className="text-slate-400" />
                            <span className="text-slate-500">ولي الأمر:</span>
                            <span dir="ltr">{parent_phone || "-"}</span>
                        </div>
                        {parent_token && (
                            <div className="flex items-center gap-2">
                                <Hash size={14} className="text-slate-400" />
                                <span className="text-slate-500">كود ولي الأمر:</span>
                                <span className="font-mono bg-slate-200 px-2 py-0.5 rounded text-xs">{parent_token}</span>
                            </div>
                        )}
                        {notes && (
                            <div className="flex items-start gap-2">
                                <span className="text-slate-500">ملاحظات:</span>
                                <span className="text-slate-700">{notes}</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-3 flex flex-col items-center justify-between">
                        <div className="text-xs text-slate-400 mb-1">باركود الطالب</div>
                        <svg width="140" height="50" className="bg-white rounded-lg p-1">
                            {/* هنا يتم رسم الباركود */}
                            <text x="70" y="30" textAnchor="middle" fontSize="12" fill="#333">
                                {barcode || "NO BARCODE"}
                            </text>
                        </svg>
                        <button
                            onClick={() => {}}
                            className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors text-sm"
                        >
                            <Printer size={14} /> طباعة الباركود
                        </button>
                    </div>
                </div>

                {/* Stats */}
                {loading ? (
                    <LoadingState label="جاري تحميل بيانات الطالب..." />
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div className="bg-slate-50 rounded-2xl p-4">
                                <div className="text-xs text-slate-500 mb-1 text-right">نسبة الحضور</div>
                                <div className="text-2xl font-bold text-slate-900">{attendancePct}%</div>
                                <div className="text-xs text-slate-400">{presentDays} / {totalDays} يوم</div>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-4">
                                <div className="flex items-center justify-end gap-1 text-xs text-slate-500 mb-1">
                                    <span>متوسط الدرجات</span><BarChart3 size={14} />
                                </div>
                                <div className="text-2xl font-bold text-slate-900">{avgScore}</div>
                                <div className="text-xs text-slate-400">من 100</div>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-4">
                                <div className="flex items-center justify-end gap-1 text-xs text-slate-500 mb-1">
                                    <span>المدفوعات</span><Hash size={14} />
                                </div>
                                <div className="text-xl font-bold text-green-600">{totalPaid} ج.م</div>
                                <div className="text-xs text-slate-400">المطلوب: {totalRequired} ج.م</div>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-4">
                                <div className="flex items-center justify-end gap-1 text-xs text-slate-500 mb-1">
                                    <span>الاشتراك الحالي</span><Calendar size={14} />
                                </div>
                                <div className="text-lg font-bold" style={{ color: paidThisMonth ? "#10b981" : "#ef4444" }}>
                                    {paidThisMonth ? "✅ مدفوع" : "❌ غير مدفوع"}
                                </div>
                                <div className="text-xs text-slate-400">
                                    {paidThisMonth ? "تم سداد هذا الشهر" : `المتبقي: ${remainingBalance} ج.م`}
                                </div>
                            </div>
                        </div>

                        {/* Attendance history - placeholder */}
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
                            <div className="px-4 py-2 border-b border-slate-200 font-bold text-sm flex items-center gap-2">
                                <Calendar size={16} className="text-primary" />
                                سجل الحضور
                            </div>
                            <div className="max-h-40 overflow-y-auto p-4 text-center text-slate-400 text-sm">
                                يتم جلب بيانات الحضور...
                            </div>
                        </div>

                        {/* Exam results - placeholder */}
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
                            <div className="px-4 py-2 border-b border-slate-200 font-bold text-sm flex items-center gap-2">
                                <BarChart3 size={16} className="text-primary" />
                                نتائج الاختبارات
                            </div>
                            <div className="max-h-40 overflow-y-auto p-4 text-center text-slate-400 text-sm">
                                يتم جلب نتائج الاختبارات...
                            </div>
                        </div>

                        {/* Payments - placeholder */}
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
                            <div className="px-4 py-2 border-b border-slate-200 font-bold text-sm flex items-center gap-2">
                                <Hash size={16} className="text-primary" />
                                سجل المدفوعات
                            </div>
                            <div className="max-h-40 overflow-y-auto p-4 text-center text-slate-400 text-sm">
                                يتم جلب بيانات المدفوعات...
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
};

export default StudentCard;