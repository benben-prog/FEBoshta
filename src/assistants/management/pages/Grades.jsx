import { Download, FileText, GraduationCap, Upload, Plus, Users, Edit, Trash, RotateCcw, School, DollarSign, TrendingUp, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
    fetchAllGrades,
    createNewGrade,
    updateGradeInfo,
    removeGrade
} from "../../../api/assistant/actions";

const Grades = () => {
    const [grades, setGrades] = useState([]);
    const [grade, setGrade] = useState({
        id: "",
        name: "",
        monthlyPrice: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleDownloadTemplate = () => { };
    const handleImportExcel = () => { };
    const handleExportPdf = () => { };

    const calculateStats = (gradesData) => {
        const prices = gradesData?.map(g => Number(g.monthly_price) || 0) || [];
        const validPrices = prices.filter(p => p > 0);

        return {
            total: gradesData?.length || 0,
            avgPrice: validPrices.length > 0 ? Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length) : 0,
            maxPrice: validPrices.length > 0 ? Math.max(...validPrices) : 0,
            minPrice: validPrices.length > 0 ? Math.min(...validPrices) : 0,
        };
    };

    async function loadGrades() {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchAllGrades();

            if (result.success) {
                const data = Array.isArray(result.data) ? result.data : [];
                const filteredData = data.filter(item => item.name && item.name.trim() !== "");
                setGrades(filteredData);
            } else {
                setError(result.error || "حدث خطأ في تحميل البيانات");
                setGrades([]);
            }
        } catch (error) {
            console.error("Error loading grades:", error);
            setError("حدث خطأ في تحميل البيانات");
            setGrades([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadGrades();
    }, []);

    const stats = calculateStats(grades);

    async function saveGrade() {
        setError(null);
        setSuccessMessage(null);

        if (!grade.name || grade.name.trim() === "") {
            setError("يرجى إدخال اسم الصف");
            return;
        }

        if (!grade.monthlyPrice || Number(grade.monthlyPrice) <= 0) {
            setError("يرجى إدخال المصاريف الشهرية");
            return;
        }

        try {
            const gradeData = {
                name: grade.name.trim(),
                monthlyPrice: Number(grade.monthlyPrice)
            };

            let result;
            if (isEditing && grade.id) {
                result = await updateGradeInfo(grade.id, gradeData);
                if (result.success) {
                    setSuccessMessage("تم تحديث الصف بنجاح");
                    await loadGrades();
                }
            } else {
                result = await createNewGrade(gradeData);
                if (result.success) {
                    setSuccessMessage("تم إضافة الصف بنجاح");
                    await loadGrades();
                }
            }

            if (!result?.success) {
                setError(result?.error || "حدث خطأ في حفظ البيانات");
            }
        } catch (error) {
            console.error("Error saving grade:", error);
            setError(error.message || "حدث خطأ في حفظ البيانات");
        }

        setIsEditing(false);
        setGrade({ id: "", name: "", monthlyPrice: "" });
        setTimeout(() => setSuccessMessage(null), 3000);
    }

    async function removeGradeById(id) {
        if (!id) return;

        if (!confirm("هل أنت متأكد من حذف هذا الصف؟")) return;

        setError(null);
        setSuccessMessage(null);

        try {
            const result = await removeGrade(id);
            if (result.success) {
                setSuccessMessage("تم حذف الصف بنجاح");
                await loadGrades();
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                setError(result.error || "حدث خطأ في حذف الصف");
            }
        } catch (error) {
            console.error("Error deleting grade:", error);
            setError("حدث خطأ في حذف الصف");
        }
    }

    function editGrade(gradeData) {
        setGrade({
            id: gradeData.id,
            name: gradeData.name || "",
            monthlyPrice: gradeData.monthly_price || 0,
        });
        setIsEditing(true);
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
            }
        }
    };

    const rowVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-500">جاري تحميل الصفوف...</p>
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
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center justify-between">
                    <span>{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="text-red-500 hover:text-red-700"
                    >
                        ✕
                    </button>
                </div>
            )}
            {successMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
                    {successMessage}
                </div>
            )}

            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
            >
                <div className="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-primary rounded-2xl shadow-lg shadow-primary/30">
                                <GraduationCap size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                    الصفوف الدراسية
                                </h1>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    إدارة الصفوف والأسعار
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleDownloadTemplate}
                            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                        >
                            <Download size={16} /> قالب Excel
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleImportExcel}
                            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                        >
                            <Upload size={16} /> رفع Excel
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleExportPdf}
                            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                        >
                            <FileText size={16} /> كشف Pdf
                        </motion.button>
                    </div>
                </div>

                {/* Stats */}
                <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3"
                >
                    {[
                        { label: 'إجمالي الصفوف', value: stats.total, icon: School, color: 'green' },
                        { label: 'متوسط المصاريف', value: `${stats.avgPrice} ج`, icon: DollarSign, color: 'green' },
                        { label: 'أعلى مصاريف', value: `${stats.maxPrice} ج`, icon: TrendingUp, color: 'amber' },
                        { label: 'أقل مصاريف', value: `${stats.minPrice} ج`, icon: Award, color: 'amber' },
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
                                <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.header>

            {/* Add/Edit Form */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mb-6"
            >
                <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="bg-primary px-4 sm:px-6 py-4">
                        <h2 className="text-white font-bold text-lg flex items-center gap-2">
                            {isEditing ? <RotateCcw size={20} /> : <Plus size={20} />}
                            {isEditing ? 'تعديل الصف' : 'إضافة صف جديد'}
                        </h2>
                    </div>

                    <div className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <School size={18} className="text-primary" />
                                    اسم المرحلة
                                </label>
                                <input
                                    type="text"
                                    value={grade.name}
                                    onChange={(e) => setGrade({ ...grade, name: e.target.value })}
                                    placeholder="مثال: الصف الاول الثانوي"
                                    className="w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 transition-all duration-200 hover:border-blue-300"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <DollarSign size={18} className="text-primary" />
                                    المصاريف الشهرية (ج)
                                </label>
                                <input
                                    type="number"
                                    value={grade.monthlyPrice}
                                    onChange={(e) => setGrade({ ...grade, monthlyPrice: e.target.value })}
                                    placeholder="200"
                                    className="w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 border-2 border-gray-200 rounded-xl py-3 px-4 transition-all duration-200 hover:border-blue-300"
                                    required
                                />
                            </div>

                            <div className="flex items-end gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={saveGrade}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all"
                                >
                                    {isEditing ? <RotateCcw size={18} /> : <Plus size={18} />}
                                    {isEditing ? 'تحديث' : 'إضافة'}
                                </motion.button>
                                {isEditing && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setIsEditing(false);
                                            setGrade({ id: "", name: "", monthlyPrice: "" });
                                        }}
                                        className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all"
                                    >
                                        إلغاء
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Grades List */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
                <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-3">
                        <Users size={20} className="text-primary" />
                        <h2 className="text-lg font-bold text-gray-800">قائمة الصفوف</h2>
                    </div>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {grades?.length || 0} صف
                    </span>
                </div>

                <div className="max-h-[500px] overflow-x-auto overflow-y-auto custom-scrollbar">
                    {grades && grades.length > 0 ? (
                        <table className="w-full min-w-[500px]">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 sticky top-0 z-10">
                                <tr>
                                    <th className="text-right pr-6 py-4 w-[40%]">
                                        <span className="text-gray-600 font-semibold text-sm flex items-center gap-2">
                                            <School size={16} /> الصف
                                        </span>
                                    </th>
                                    <th className="text-right py-4 w-[30%]">
                                        <span className="text-gray-600 font-semibold text-sm flex items-center gap-2">
                                            <DollarSign size={16} /> المصاريف الشهرية
                                        </span>
                                    </th>
                                    <th className="text-right pl-6 py-4 w-[30%]">
                                        <span className="text-gray-600 font-semibold text-sm">الإجراءات</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <AnimatePresence>
                                    {grades.map((item, index) => (
                                        <motion.tr
                                            key={item.id || index}
                                            variants={rowVariants}
                                            initial="hidden"
                                            animate="visible"
                                            transition={{ delay: index * 0.05 }}
                                            className={`hover:bg-blue-50/40 transition-all duration-200 group ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                                        >
                                            <td className="text-right pr-6 py-4">
                                                <span className="inline-flex items-center gap-2">
                                                    <span className="font-medium text-gray-800">{item.name}</span>
                                                </span>
                                            </td>
                                            <td className="text-right py-4">
                                                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
                                                    <DollarSign size={14} />
                                                    {Number(item.monthly_price) || 0} ج
                                                </span>
                                            </td>
                                            <td className="text-left pl-0 py-4">
                                                <div className="flex gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => editGrade(item)}
                                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-md"
                                                        title="تعديل"
                                                    >
                                                        <Edit size={18} />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => removeGradeById(item.id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:shadow-md"
                                                        title="حذف"
                                                    >
                                                        <Trash size={18} />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            <School size={48} className="mx-auto text-gray-200 mb-2" />
                            <p className="text-sm">لا توجد صفوف دراسية</p>
                            <p className="text-xs text-gray-300">أضف صفاً جديداً من الأعلى</p>
                        </div>
                    )}
                </div>
            </motion.div>

        </motion.section>
    );
}

export default Grades;