import { useState } from "react";
import {
  User,
  Phone,
  GraduationCap,
  Camera,
  X,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import getUser from "../utils/getUser";
import {
  changeTeacherPassword,
  updateTeacherProfileImageAction,
  deleteTeacherProfileImageAction,
} from "../api/teacher/actions";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const Profile = () => {
  const user = getUser();
  const [profileImage, setProfileImage] = useState(user?.profile_image || null);
  const [showImageOptions, setShowImageOptions] = useState(false);

  // Password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const roleName =
    user?.role === "assistant"
      ? "مساعد"
      : user?.role === "teacher"
        ? "معلم"
        : user?.role;

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // ✅ استخدم FormData
      const formData = new FormData();
      formData.append("image", file);

      const result = await updateTeacherProfileImageAction(formData);

      if (result.success) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setProfileImage(e.target.result);
          setShowImageOptions(false);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemoveImage = async () => {
    const result = await deleteTeacherProfileImageAction();
    if (result.success) {
      setProfileImage(null);
      setShowImageOptions(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMessage(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: "error", text: "يرجى ملء جميع الحقول" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "كلمة السر الجديدة غير متطابقة",
      });
      return;
    }

    setPasswordLoading(true);
    const result = await changeTeacherPassword(
      oldPassword,
      newPassword,
      confirmPassword,
    );
    setPasswordLoading(false);

    if (result.success) {
      setPasswordMessage({ type: "success", text: "تم تغيير كلمة السر بنجاح" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setPasswordMessage({ type: "error", text: result.error });
    }
  };

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="p-8 font-sans"
      dir="rtl"
    >
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-gray-200 shadow overflow-hidden"
      >
        {/* Header مع الصورة */}
        <div className="px-7 py-5 border-b border-gray-100 flex items-center gap-4">
          <div className="relative group">
            <div
              className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-[#009966] overflow-hidden border-2 border-green-200 cursor-pointer"
              onClick={() => setShowImageOptions(true)}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={28} />
              )}

              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
                <Camera size={18} className="text-white" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-[15px] font-bold text-gray-900">
              المعلومات الشخصية
            </h2>
            <p className="text-[12px] text-gray-400">بيانات المعلم</p>
          </div>
        </div>

        {/* بيانات المعلم */}
        <div className="p-7 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-[12px] font-bold text-gray-400 mb-2">
              <User size={16} className="text-[#009966]" />
              الاسم
            </label>
            <div className="p-2.5 rounded-lg text-[14px] bg-gray-50 border border-gray-100">
              {user?.full_name || "غير معروف"}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-[12px] font-bold text-gray-400 mb-2">
              <Phone size={16} className="text-[#009966]" />
              رقم الهاتف
            </label>
            <div
              className="p-2.5 rounded-lg text-[14px] bg-gray-50 border border-gray-100"
              dir="ltr"
            >
              {user?.phone || "-"}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-[12px] font-bold text-gray-400 mb-2">
              <GraduationCap size={16} className="text-[#009966]" />
              الدور
            </label>
            <div className="p-2.5 rounded-lg text-[14px] bg-gray-50 border border-gray-100">
              {roleName}
            </div>
          </div>
        </div>

        {/* تغيير كلمة السر */}
        <div className="px-7 py-5 border-t border-gray-100">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Lock size={18} className="text-[#009966]" />
            تغيير كلمة السر
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                placeholder="كلمة السر القديمة"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#009966] transition-colors pl-10"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <input
              type={showPasswords ? "text" : "password"}
              placeholder="كلمة السر الجديدة"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="p-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#009966] transition-colors"
            />
            <input
              type={showPasswords ? "text" : "password"}
              placeholder="تأكيد كلمة السر"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="p-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#009966] transition-colors"
            />
          </div>
          {passwordMessage && (
            <p
              className={`mt-3 text-sm font-bold ${passwordMessage.type === "success" ? "text-green-600" : "text-red-600"}`}
            >
              {passwordMessage.text}
            </p>
          )}
          <button
            onClick={handleChangePassword}
            disabled={passwordLoading}
            className="mt-4 px-7 py-2.5 rounded-lg text-[14px] font-bold bg-[#009966] text-white hover:bg-[#157e5b] transition-colors disabled:opacity-50"
          >
            {passwordLoading ? "جاري التغيير..." : "تغيير كلمة السر"}
          </button>
        </div>
      </motion.div>

      {/* Modal لخيارات الصورة */}
      {showImageOptions && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageOptions(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900">
                صورة الملف الشخصي
              </h3>
              <button
                onClick={() => setShowImageOptions(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center text-[#009966] overflow-hidden border-2 border-green-200">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={40} />
                  )}
                </div>
              </div>

              <label className="w-full py-3 rounded-lg text-sm font-bold bg-[#009966] text-white hover:bg-[#157e5b] transition-colors cursor-pointer text-center">
                {profileImage ? "تغيير الصورة" : "إضافة صورة"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {profileImage && (
                <button
                  onClick={handleRemoveImage}
                  className="w-full py-3 rounded-lg text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                >
                  حذف الصورة
                </button>
              )}

              <button
                onClick={() => setShowImageOptions(false)}
                className="w-full py-3 rounded-lg text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
};

export default Profile;
