import { Users, Search, X, ChevronRight, ChevronLeft, Eye } from "lucide-react";
import React, { memo, useEffect, useMemo, useState } from "react";
import { fetchAssistants } from "../api/teacher/actions";
import { motion } from "framer-motion";

const PAGE_SIZE = 10;

const AssistantRow = memo(function AssistantRow({ assistant, index, onView }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3) }}
      className="hover:bg-blue-50/40 transition-all duration-200 group"
    >
      <td className="text-right pr-6 py-4">
        <span className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg text-sm font-mono text-gray-600 group-hover:bg-blue-100 transition-colors">
          {assistant.id}
        </span>
      </td>
      <td className="text-right py-4 font-medium text-gray-800">
        {assistant.full_name}
      </td>
      <td className="text-right py-4">
        <span className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm">
          {assistant.phone}
        </span>
      </td>
      <td className="text-right py-4">
        <span
          className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-lg ${
            assistant.is_active === 1
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {assistant.is_active === 1 ? "نشط" : "موقوف"}
        </span>
      </td>
      <td className="text-right pr-6 py-4">
        <div className="flex items-center gap-1.5">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onView(assistant)}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-md"
            title="عرض البيانات"
          >
            <Eye size={18} />
          </motion.button>
        </div>
      </td>
    </motion.tr>
  );
});

const Assistants = () => {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewing, setViewing] = useState(null);
  const [page, setPage] = useState(1);

  const loadAssistants = async () => {
    setLoading(true);
    const result = await fetchAssistants();
    if (result.success) {
      setAssistants(result.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAssistants();
  }, []);

  const filteredAssistants = useMemo(() => {
    if (searchQuery.trim() === "") return assistants;
    return assistants.filter(
      (assistant) =>
        assistant.full_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        assistant.phone?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [assistants, searchQuery]);

  const total = filteredAssistants.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedAssistants = useMemo(
    () =>
      filteredAssistants.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      ),
    [filteredAssistants, currentPage],
  );

  const firstRowNumber = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastRowNumber = Math.min(currentPage * PAGE_SIZE, total);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-5 w-full min-h-screen" dir="rtl">
      {/* Header */}
      <header className="w-full flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            المساعدون
          </h1>
          <span className="text-sm sm:text-base text-gray-500">
            {assistants.length} مساعد في المنصة
          </span>
        </div>
      </header>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 w-full sm:w-72">
        <Search size={15} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="بحث بالاسم أو الهاتف..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
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

      {/* Table */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl overflow-hidden"
      >
        <div className="px-3 sm:px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-[#009966]" />
            <h2 className="text-lg font-bold text-gray-800">قائمة المساعدين</h2>
          </div>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {total} مساعد
          </span>
        </div>

        <div className="max-h-125 overflow-y-auto overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-175">
            <thead className="bg-linear-to-r from-gray-50 to-gray-100/50 sticky top-0 z-10">
              <tr>
                <th className="text-right px-4 py-4 text-sm font-semibold text-gray-600 w-24">
                  #
                </th>
                <th className="text-right px-4 py-4 text-sm font-semibold text-gray-600">
                  الاسم
                </th>
                <th className="text-right px-4 py-4 text-sm font-semibold text-gray-600">
                  الهاتف
                </th>
                <th className="text-right px-4 py-4 text-sm font-semibold text-gray-600">
                  الحالة
                </th>
                <th className="text-right px-4 py-4 text-sm font-semibold text-gray-600 w-24">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedAssistants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <Users size={48} className="text-gray-300" />
                      <p className="text-gray-400 font-medium">
                        {searchQuery
                          ? "لا يوجد مساعدين مطابقين للبحث"
                          : "لا يوجد مساعدين"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedAssistants.map((item, index) => (
                  <AssistantRow
                    key={item.id}
                    assistant={item}
                    index={index}
                    onView={setViewing}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-6 py-3 border-t border-gray-100 bg-gray-50/50 text-sm">
            <span className="text-gray-600">
              عرض {firstRowNumber} - {lastRowNumber} من {total}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
              <span className="text-sm">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* View Modal */}
      {viewing && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setViewing(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900">
                بيانات المساعد
              </h3>
              <button
                onClick={() => setViewing(null)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-primary">
                  <Users size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">
                    {viewing.full_name}
                  </h4>
                  <span className="text-xs text-gray-500">{viewing.phone}</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 flex justify-between">
                <span className="text-sm text-gray-500">الحالة</span>
                <span
                  className={`text-sm font-bold ${
                    viewing.is_active === 1 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {viewing.is_active === 1 ? "نشط" : "موقوف"}
                </span>
              </div>
              <button
                onClick={() => setViewing(null)}
                className="w-full py-2.5 rounded-lg text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Assistants;
