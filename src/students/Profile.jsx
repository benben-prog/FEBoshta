import { useState, useEffect } from "react";
import {
  User,
  Phone,
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  Camera,
  X,
} from "lucide-react";
import {
  changeStudentPassword,
  updateStudentProfileImage,
  deleteStudentProfileImage,
  fetchStudentProfile,
} from "../api/student/actions";
import getUser from "../utils/getUser";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const Profile = () => {
  const user = getUser();
  const [profile, setProfile] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [profileImage, setProfileImage] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const result = await fetchStudentProfile();
    if (result.success) {
      setProfile(result.data);
      setProfileImage(result.data.profile_image || null);
    }
  };

  const handleChangePassword = async () => {
    setMessage(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "يرجى ملء جميع الحقول" });
      return;
    }

    if (newPassword.length < 4) {
      setMessage({
        type: "error",
        text: "كلمة السر يجب أن تكون 4 أحرف على الأقل",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "كلمة السر الجديدة غير متطابقة" });
      return;
    }

    setLoading(true);
    const result = await changeStudentPassword(
      oldPassword,
      newPassword,
      confirmPassword,
    );
    setLoading(false);

    if (result.success) {
      setMessage({ type: "success", text: "تم تغيير كلمة السر بنجاح" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setMessage({ type: "error", text: result.error });
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);

      const result = await updateStudentProfileImage(formData);
      if (result.success) {
        setProfileImage(result.data.profile_image || URL.createObjectURL(file));
        setShowImageOptions(false);
      }
    }
  };

  const handleRemoveImage = async () => {
    const result = await deleteStudentProfileImage();
    if (result.success) {
      setProfileImage(null);
      setShowImageOptions(false);
    }
  };

  return (
    <motion.section
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="w-full min-h-screen"
      dir="rtl"
    >
      <motion.div
        variants={itemVariants}
        className="max-w-xl mx-auto flex flex-col gap-4"
      >
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            الملف الشخصي
          </h1>
          <span className="text-gray-500 text-sm">بيانات الطالب</span>
        </header>

        {/* Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="relative group">
              <div
                className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-primary overflow-hidden border-2 border-green-200 cursor-pointer relative"
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
                  <Camera size={20} className="text-white" />
                </div>
              </div>
            </div>
            <div>
              <h2 className="font-bold text-base text-gray-900">
                {profile?.full_name || user?.full_name || "غير معروف"}
              </h2>
              <span className="text-xs text-gray-500">طالب</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-500 block mb-1">
                رقم الهاتف
              </span>
              <div className="flex items-center gap-1.5">
                <Phone size={14} className="text-primary" />
                <span className="font-bold text-sm" dir="ltr">
                  {profile?.phone || user?.phone || "غير معروف"}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-500 block mb-1">الصف</span>
              <div className="flex items-center gap-1.5">
                <GraduationCap size={14} className="text-primary" />
                <span className="font-bold text-sm">
                  {profile?.grade_name || "غير معروف"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2">
            <Lock size={16} className="text-primary" />
            تغيير كلمة السر
          </h3>
          <div className="flex flex-col gap-3">
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                placeholder="كلمة السر القديمة"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary pl-10"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                placeholder="كلمة السر الجديدة"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary pl-10"
              />
            </div>
            <div className="relative">
              <input
                type={showPasswords ? "text" : "password"}
                placeholder="تأكيد كلمة السر"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary pl-10"
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg text-sm font-bold ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
              >
                {message.text}
              </div>
            )}

            <button
              onClick={handleChangePassword}
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "جاري التغيير..." : "تغيير كلمة السر"}
            </button>
          </div>
        </div>
      </motion.div>

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
                <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center text-primary overflow-hidden border-2 border-green-200">
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

              <label className="w-full py-3 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors cursor-pointer text-center">
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
